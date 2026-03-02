const pool = require("../config/mysql");
const xlsx = require("xlsx");
const fs = require("fs");
const { parse: parseCSV } = require("csv-parse/sync");

// this service reads an Excel or CSV file, then inserts inventory data into MySQL
exports.importExcel = async (filePath, originalName = "") => {
  let customers = [];
  let suppliers = [];
  let products = [];
  let transactions = [];

  // Detect file type from original filename (since multer doesn't preserve extension)
  const isCSV =
    originalName.toLowerCase().endsWith(".csv") ||
    originalName.includes(".csv");
  console.log(
    "File type detection - originalName:",
    originalName,
    "isCSV:",
    isCSV,
  );

  if (isCSV) {
    // ...existing code...
  } else {
    // Parse Excel file
    console.log("Detected Excel format, parsing...");
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    console.log("Importing sheets:", sheetNames);

    // Helper: try to map sheet names to expected types
    const sheetTypeMap = {
      customers: ["customers", "customer", "Clients", "Sheet1"],
      suppliers: ["suppliers", "supplier", "Providers"],
      products: ["products", "product", "Items"],
      transactions: ["transactions", "transaction", "Sales", "Orders"],
    };
    const toJson = (sheet) => xlsx.utils.sheet_to_json(sheet, { defval: "" });

    // Find best match for each type
    function findSheet(type) {
      const candidates = sheetTypeMap[type];
      for (const name of candidates) {
        if (sheetNames.includes(name)) return name;
      }
      // fallback: first sheet
      return sheetNames[0];
    }

    // Customers
    const customerSheet = findSheet("customers");
    customers = toJson(workbook.Sheets[customerSheet] || {});

    // Suppliers
    const supplierSheet = findSheet("suppliers");
    suppliers = toJson(workbook.Sheets[supplierSheet] || {});

    // Products
    const productSheet = findSheet("products");
    products = toJson(workbook.Sheets[productSheet] || {});

    // Transactions
    const transactionSheet = findSheet("transactions");
    transactions = toJson(workbook.Sheets[transactionSheet] || {});

    // Map columns if needed (try to auto-detect common names)
    function normalizeCustomer(row) {
      return {
        customer_name: row.customer_name || row.name || row.ClientName || row.Nombre || "",
        customer_email: row.customer_email || row.email || row.Correo || "",
        customer_direction: row.customer_direction || row.address || row.Direccion || "",
        customer_phone: row.customer_phone || row.phone || row.Telefono || "",
      };
    }
    customers = customers.map(normalizeCustomer).filter(c => c.customer_email);

    function normalizeSupplier(row) {
      return {
        supplier_name: row.supplier_name || row.name || row.ProviderName || row.Nombre || "",
        supplier_email: row.supplier_email || row.email || row.Correo || "",
      };
    }
    suppliers = suppliers.map(normalizeSupplier).filter(s => s.supplier_name);

    function normalizeProduct(row) {
      return {
        product_sku: row.product_sku || row.sku || row.Codigo || "",
        supplier_ref: row.supplier_email || row.supplier_name || row.Provider || "",
        product_name: row.product_name || row.name || row.Nombre || "",
        product_category: row.product_category || row.category || row.Categoria || "",
        unit_price: parseFloat(row.unit_price || row.price || row.Precio || 0) || null,
      };
    }
    products = products.map(normalizeProduct).filter(p => p.product_sku);

    function normalizeTransaction(row) {
      // Convert Excel serial date to YYYY-MM-DD if needed
      let dateValue = row.date || row.Fecha || "";
      if (/^\d{5}$/.test(String(dateValue))) {
        // Excel serial date
        const excelEpoch = new Date(1899, 11, 30);
        const d = new Date(excelEpoch.getTime() + (parseInt(dateValue, 10) * 86400000));
        dateValue = d.toISOString().slice(0, 10);
      }
      return {
        product_sku: row.product_sku || row.sku || row.Codigo || "",
        customer_email: row.customer_email || row.email || row.Cliente || "",
        quantity: parseInt(row.quantity || row.qty || row.Cantidad || 0, 10) || 0,
        date: dateValue,
      };
    }
    transactions = transactions.map(normalizeTransaction).filter(t => t.product_sku && t.customer_email);

    console.log(
      "Extracted - Customers:",
      customers.length,
      "Suppliers:",
      suppliers.length,
      "Products:",
      products.length,
      "Transactions:",
      transactions.length,
    );
  }

  // Now process customers, suppliers, products and transactions
  console.log("Processing", customers.length, "customers...");
  for (const c of customers) {
    const {
      customer_name,
      customer_email,
      customer_direction,
      customer_phone,
    } = c;
    if (!customer_email) continue;
    try {
      await pool.query(
        `INSERT INTO customers (customer_name,customer_email,customer_direction,customer_phone)
         VALUES (?,?,?,?)
         ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name), customer_direction=VALUES(customer_direction), customer_phone=VALUES(customer_phone)`,
        [customer_name, customer_email, customer_direction, customer_phone],
      );
      console.log("Inserted customer:", customer_email);
    } catch (err) {
      console.error(
        "Error inserting customer",
        customer_email,
        ":",
        err.message,
      );
      throw err;
    }
  }

  console.log("Processing", suppliers.length, "suppliers...");
  for (const s of suppliers) {
    const { supplier_name, supplier_email } = s;
    if (!supplier_name) continue;
    try {
      await pool.query(
        `INSERT INTO suppliers (supplier_name,supplier_email)
         VALUES (?,?)
         ON DUPLICATE KEY UPDATE supplier_name=VALUES(supplier_name), supplier_email=VALUES(supplier_email)`,
        [supplier_name, supplier_email || null],
      );
      console.log("Inserted supplier:", supplier_name);
    } catch (err) {
      console.error(
        "Error inserting supplier",
        supplier_name,
        ":",
        err.message,
      );
      throw err;
    }
  }

  // helper lookup functions
  const findSupplierId = async (ref) => {
    if (!ref) return null;
    const [rows] = await pool.query(
      `SELECT id_supplier FROM suppliers WHERE supplier_email=? OR supplier_name=? LIMIT 1`,
      [ref, ref],
    );
    return rows[0]?.id_supplier || null;
  };

  const findCustomerId = async (email) => {
    if (!email) return null;
    const [rows] = await pool.query(
      `SELECT id_customer FROM customers WHERE customer_email=? LIMIT 1`,
      [email],
    );
    return rows[0]?.id_customer || null;
  };

  console.log("Processing", products.length, "products...");
  for (const p of products) {
    const {
      product_sku,
      supplier_ref,
      product_name,
      product_category,
      unit_price,
    } = p;
    if (!product_sku) continue;
    try {
      const supplierId = await findSupplierId(supplier_ref);
      await pool.query(
        `INSERT INTO products (product_sku,id_supplier,product_name,product_category,unit_price)
         VALUES (?,?,?,?,?)
         ON DUPLICATE KEY UPDATE id_supplier=VALUES(id_supplier), product_name=VALUES(product_name), product_category=VALUES(product_category), unit_price=VALUES(unit_price)`,
        [
          product_sku,
          supplierId,
          product_name || null,
          product_category || null,
          unit_price,
        ],
      );
      console.log("Inserted product:", product_sku);
    } catch (err) {
      console.error("Error inserting product", product_sku, ":", err.message);
      throw err;
    }
  }

  console.log("Processing", transactions.length, "transactions...");
  for (const t of transactions) {
    const { product_sku, customer_email, quantity, date } = t;
    if (!product_sku || !customer_email) continue;
    try {
      const customerId = await findCustomerId(customer_email);
      if (!customerId) continue;
      // avoid duplicates by checking qty/date/product/customer
      const [existing] = await pool.query(
        `SELECT id_transaction FROM transactions
         WHERE product_sku=? AND id_customer=? AND date=? AND quantity=? LIMIT 1`,
        [product_sku, customerId, date, quantity],
      );
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO transactions (product_sku,id_customer,quantity,date)
           VALUES (?,?,?,?)`,
          [product_sku, customerId, quantity, date],
        );
        console.log("Inserted transaction for customer:", customer_email);
      }
    } catch (err) {
      console.error(
        "Error inserting transaction for",
        customer_email,
        ":",
        err.message,
      );
      throw err;
    }
  }

  return { message: "import completed" };
};
