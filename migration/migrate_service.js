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
  const isCSV = originalName.toLowerCase().endsWith(".csv") || originalName.includes(".csv");
  console.log("File type detection - originalName:", originalName, "isCSV:", isCSV);
  
  if (isCSV) {
    // Parse CSV file
    console.log("Detected CSV format, parsing...");
    const csvData = fs.readFileSync(filePath, "utf-8");
    const records = parseCSV(csvData, { columns: true });
    console.log("CSV records:", records.length);

    // maps for unique insertion
    const customersMap = new Map();
    const suppliersMap = new Map();
    const productsMap = new Map();

    records.forEach(record => {
      // Customers
      if (record.customer_email) {
        const key = record.customer_email;
        if (!customersMap.has(key)) {
          customersMap.set(key, {
            customer_name: record.customer_name,
            customer_email: record.customer_email,
            customer_direction: record.customer_direction,
            customer_phone: record.customer_phone
          });
        }
      }

      // Suppliers
      if (record.supplier_name || record.supplier_email) {
        const key = record.supplier_email || record.supplier_name;
        if (!suppliersMap.has(key)) {
          suppliersMap.set(key, {
            supplier_name: record.supplier_name,
            supplier_email: record.supplier_email
          });
        }
      }

      // Products
      if (record.product_sku) {
        const key = record.product_sku;
        if (!productsMap.has(key)) {
          productsMap.set(key, {
            product_sku: record.product_sku,
            supplier_ref: record.supplier_email || record.supplier_name,
            product_name: record.product_name,
            product_category: record.product_category,
            unit_price: parseFloat(record.unit_price) || null
          });
        }
      }

      // Transactions
      if (record.product_sku && record.customer_email) {
        transactions.push({
          product_sku: record.product_sku,
          customer_email: record.customer_email,
          quantity: parseInt(record.quantity, 10) || 0,
          date: record.date
        });
      }
    });

    customers = Array.from(customersMap.values());
    suppliers = Array.from(suppliersMap.values());
    products = Array.from(productsMap.values());

    console.log(
      "Extracted - Customers:", customers.length,
      "Suppliers:", suppliers.length,
      "Products:", products.length,
      "Transactions:", transactions.length
    );
  } else {
    // Parse Excel file
    console.log("Detected Excel format, parsing...");
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    console.log("Importing sheets:", sheetNames);

    // simple helpers
    const toJson = (sheet) => xlsx.utils.sheet_to_json(sheet, { defval: "" });

    // process customers sheet
    if (sheetNames.includes("customers")) {
      customers = toJson(workbook.Sheets["customers"]);
    }

    // process suppliers sheet
    if (sheetNames.includes("suppliers")) {
      suppliers = toJson(workbook.Sheets["suppliers"]);
    }

    // process products sheet
    if (sheetNames.includes("products")) {
      products = toJson(workbook.Sheets["products"]);
    }

    // process transactions sheet (optional)
    if (sheetNames.includes("transactions")) {
      transactions = toJson(workbook.Sheets["transactions"]);
    }
  }

  // Now process customers, suppliers, products and transactions
  console.log("Processing", customers.length, "customers...");
  for (const c of customers) {
    const { customer_name, customer_email, customer_direction, customer_phone } = c;
    if (!customer_email) continue;
    try {
      await pool.query(
        `INSERT INTO customers (customer_name,customer_email,customer_direction,customer_phone)
         VALUES (?,?,?,?)
         ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name), customer_direction=VALUES(customer_direction), customer_phone=VALUES(customer_phone)`,
        [customer_name, customer_email, customer_direction, customer_phone]
      );
      console.log("Inserted customer:", customer_email);
    } catch (err) {
      console.error("Error inserting customer", customer_email, ":", err.message);
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
        [supplier_name, supplier_email || null]
      );
      console.log("Inserted supplier:", supplier_name);
    } catch (err) {
      console.error("Error inserting supplier", supplier_name, ":", err.message);
      throw err;
    }
  }

  // helper lookup functions
  const findSupplierId = async (ref) => {
    if (!ref) return null;
    const [rows] = await pool.query(
      `SELECT id_supplier FROM suppliers WHERE supplier_email=? OR supplier_name=? LIMIT 1`,
      [ref, ref]
    );
    return rows[0]?.id_supplier || null;
  };

  const findCustomerId = async (email) => {
    if (!email) return null;
    const [rows] = await pool.query(
      `SELECT id_customer FROM customers WHERE customer_email=? LIMIT 1`,
      [email]
    );
    return rows[0]?.id_customer || null;
  };

  console.log("Processing", products.length, "products...");
  for (const p of products) {
    const { product_sku, supplier_ref, product_name, product_category, unit_price } = p;
    if (!product_sku) continue;
    try {
      const supplierId = await findSupplierId(supplier_ref);
      await pool.query(
        `INSERT INTO products (product_sku,id_supplier,product_name,product_category,unit_price)
         VALUES (?,?,?,?,?)
         ON DUPLICATE KEY UPDATE id_supplier=VALUES(id_supplier), product_name=VALUES(product_name), product_category=VALUES(product_category), unit_price=VALUES(unit_price)`,
        [product_sku, supplierId, product_name || null, product_category || null, unit_price]
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
        [product_sku, customerId, date, quantity]
      );
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO transactions (product_sku,id_customer,quantity,date)
           VALUES (?,?,?,?)`,
          [product_sku, customerId, quantity, date]
        );
        console.log("Inserted transaction for customer:", customer_email);
      }
    } catch (err) {
      console.error("Error inserting transaction for", customer_email, ":", err.message);
      throw err;
    }
  }

  return { message: "import completed" };
};
