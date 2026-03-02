const API_URL = "http://localhost:3001/api";

// ============ CUSTOMERS ============
document.getElementById("customer-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    const res = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    showOutput("customers-output", result);
    e.target.reset();
    listCustomers();
  } catch (err) {
    showOutput("customers-output", { error: err.message });
  }
});

document.getElementById("list-customers").addEventListener("click", () => listCustomers());
document.getElementById("search-customers").addEventListener("click", () => {
  const term = document.getElementById("customer-search").value.trim();
  listCustomers(term);
});

async function listCustomers(search) {
  const params = search ? `?q=${encodeURIComponent(search)}` : "";
  try {
    const res = await fetch(`${API_URL}/customers${params}`);
    const customers = await res.json();
    const tbody = document.getElementById("customers-tbody");
    tbody.innerHTML = "";

    customers.forEach((customer) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${customer.customer_name || ""}</td>
        <td>${customer.customer_email || ""}</td>
        <td>${customer.customer_phone || ""}</td>
        <td>${customer.customer_direction || ""}</td>
        <td class="actions">
          <button onclick="editCustomerModal('${customer.id}', '${escapeQuotes(customer.customer_name)}', '${customer.customer_email}', '${customer.customer_phone}', '${escapeQuotes(customer.customer_direction)}')">Edit</button>
          <button class="danger" onclick="deleteCustomer('${customer.id}', '${escapeQuotes(customer.customer_name)}')">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    document.getElementById("customers-table").style.display = "table";
    showOutput("customers-output", { count: customers.length, message: "customers loaded" });
  } catch (err) {
    showOutput("customers-output", { error: err.message });
  }
}

function editCustomerModal(id, name, email, phone, direction) {
  const newName = prompt("Customer name:", name);
  if (!newName) return;
  const newEmail = prompt("Email:", email);
  if (!newEmail) return;
  const newPhone = prompt("Phone:", phone);
  if (!newPhone) return;
  const newDirection = prompt("Address/Direction:", direction);
  if (!newDirection) return;

  updateCustomer(id, newName, newEmail, newPhone, newDirection);
}

async function updateCustomer(id, customer_name, customer_email, customer_phone, customer_direction) {
  try {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_name, customer_email, customer_phone, customer_direction }),
    });
    const result = await res.json();
    showOutput("customers-output", { message: "customer updated", result });
    listCustomers();
  } catch (err) {
    showOutput("customers-output", { error: err.message });
  }
}

async function deleteCustomer(id, name) {
  if (!confirm(`Delete customer "${name}"?`)) return;

  try {
    const res = await fetch(`${API_URL}/customers/${id}`, { method: "DELETE" });
    const result = await res.json();
    showOutput("customers-output", { message: "customer deleted", result });
    listCustomers();
  } catch (err) {
    showOutput("customers-output", { error: err.message });
  }
}

// ============ SUPPLIERS ============
document.getElementById("supplier-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    const res = await fetch(`${API_URL}/suppliers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    showOutput("suppliers-output", result);
    e.target.reset();
    listSuppliers();
  } catch (err) {
    showOutput("suppliers-output", { error: err.message });
  }
});

document.getElementById("list-suppliers").addEventListener("click", () => listSuppliers());
document.getElementById("search-suppliers").addEventListener("click", () => {
  const term = document.getElementById("supplier-search").value.trim();
  listSuppliers(term);
});

async function listSuppliers(search) {
  const params = search ? `?q=${encodeURIComponent(search)}` : "";
  try {
    const res = await fetch(`${API_URL}/suppliers${params}`);
    const suppliers = await res.json();
    const tbody = document.getElementById("suppliers-tbody");
    tbody.innerHTML = "";

    suppliers.forEach((supplier) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${supplier.supplier_name || ""}</td>
        <td>${supplier.supplier_email || ""}</td>
        <td class="actions">
          <button onclick="editSupplierModal('${supplier.id_supplier}', '${escapeQuotes(supplier.supplier_name)}', '${supplier.supplier_email}')">Edit</button>
          <button class="danger" onclick="deleteSupplier('${supplier.id_supplier}', '${escapeQuotes(supplier.supplier_name)}')">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    document.getElementById("suppliers-table").style.display = "table";
    showOutput("suppliers-output", { count: suppliers.length, message: "suppliers loaded" });
  } catch (err) {
    showOutput("suppliers-output", { error: err.message });
  }
}

function editSupplierModal(id, name, email) {
  const newName = prompt("Supplier name:", name);
  if (!newName) return;
  const newEmail = prompt("Email:", email);
  if (!newEmail) return;

  updateSupplier(id, newName, newEmail);
}

async function updateSupplier(id, supplier_name, supplier_email) {
  try {
    const res = await fetch(`${API_URL}/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplier_name, supplier_email }),
    });
    const result = await res.json();
    showOutput("suppliers-output", { message: "supplier updated", result });
    listSuppliers();
  } catch (err) {
    showOutput("suppliers-output", { error: err.message });
  }
}

async function deleteSupplier(id, name) {
  if (!confirm(`Delete supplier "${name}"?`)) return;

  try {
    const res = await fetch(`${API_URL}/suppliers/${id}`, { method: "DELETE" });
    const result = await res.json();
    showOutput("suppliers-output", { message: "supplier deleted", result });
    listSuppliers();
  } catch (err) {
    showOutput("suppliers-output", { error: err.message });
  }
}

// ============ PRODUCTS ============
document.getElementById("product-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    showOutput("products-output", result);
    e.target.reset();
    listProducts();
  } catch (err) {
    showOutput("products-output", { error: err.message });
  }
});

document.getElementById("list-products").addEventListener("click", () => listProducts());
document.getElementById("search-products").addEventListener("click", () => {
  const term = document.getElementById("product-search").value.trim();
  listProducts(term);
});

async function listProducts(search) {
  const params = search ? `?q=${encodeURIComponent(search)}` : "";
  try {
    const res = await fetch(`${API_URL}/products${params}`);
    const products = await res.json();
    const tbody = document.getElementById("products-tbody");
    tbody.innerHTML = "";

    products.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.product_sku || ""}</td>
        <td>${product.id_supplier || ""}</td>
        <td>${product.product_name || ""}</td>
        <td>${product.product_category || ""}</td>
        <td>$${parseFloat(product.unit_price || 0).toFixed(2)}</td>
        <td class="actions">
          <button onclick="editProductModal('${product.product_sku}', '${product.id_supplier}', '${escapeQuotes(product.product_name)}', '${escapeQuotes(product.product_category)}', '${product.unit_price}')">Edit</button>
          <button class="danger" onclick="deleteProduct('${product.product_sku}', '${escapeQuotes(product.product_name)}')">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    document.getElementById("products-table").style.display = "table";
    showOutput("products-output", { count: products.length, message: "products loaded" });
  } catch (err) {
    showOutput("products-output", { error: err.message });
  }
}

function editProductModal(sku, supplierId, name, category, price) {
  const newSupplierId = prompt("Supplier ID:", supplierId);
  if (!newSupplierId) return;
  const newName = prompt("Product name:", name);
  if (!newName) return;
  const newCategory = prompt("Category:", category);
  if (!newCategory) return;
  const newPrice = prompt("Unit Price:", price);
  if (!newPrice) return;

  updateProduct(sku, newSupplierId, newName, newCategory, newPrice);
}

async function updateProduct(product_sku, id_supplier, product_name, product_category, unit_price) {
  try {
    const res = await fetch(`${API_URL}/products/${product_sku}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_supplier, product_name, product_category, unit_price }),
    });
    const result = await res.json();
    showOutput("products-output", { message: "product updated", result });
    listProducts();
  } catch (err) {
    showOutput("products-output", { error: err.message });
  }
}

async function deleteProduct(sku, name) {
  if (!confirm(`Delete product "${name}"?`)) return;

  try {
    const res = await fetch(`${API_URL}/products/${sku}`, { method: "DELETE" });
    const result = await res.json();
    showOutput("products-output", { message: "product deleted", result });
    listProducts();
  } catch (err) {
    showOutput("products-output", { error: err.message });
  }
}

// ============ TRANSACTIONS ============
document.getElementById("transaction-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    const res = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    showOutput("transactions-output", result);
    e.target.reset();
    listTransactions();
  } catch (err) {
    showOutput("transactions-output", { error: err.message });
  }
});

document.getElementById("list-transactions").addEventListener("click", () => listTransactions());
document.getElementById("search-transactions").addEventListener("click", () => {
  const term = document.getElementById("transaction-search").value.trim();
  listTransactions(term);
});

async function listTransactions(search) {
  const params = search ? `?q=${encodeURIComponent(search)}` : "";
  try {
    const res = await fetch(`${API_URL}/transactions${params}`);
    const transactions = await res.json();
    const tbody = document.getElementById("transactions-tbody");
    tbody.innerHTML = "";

    transactions.forEach((transaction) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${transaction.id_transaction || ""}</td>
        <td>${transaction.product_sku || ""}</td>
        <td>${transaction.customer_name || ""}</td>
        <td>${transaction.quantity || ""}</td>
        <td>${transaction.date ? new Date(transaction.date).toLocaleDateString() : ""}</td>
        <td class="actions">
          <button onclick="editTransactionModal('${transaction.id_transaction}', '${transaction.product_sku}', '${transaction.id_customer}', '${transaction.quantity}', '${transaction.date}')">Edit</button>
          <button class="danger" onclick="deleteTransaction('${transaction.id_transaction}')">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    document.getElementById("transactions-table").style.display = "table";
    showOutput("transactions-output", { count: transactions.length, message: "transactions loaded" });
  } catch (err) {
    showOutput("transactions-output", { error: err.message });
  }
}

function editTransactionModal(id, sku, customerId, quantity, date) {
  const newSku = prompt("Product SKU:", sku);
  if (!newSku) return;
  const newCustomerId = prompt("Customer ID:", customerId);
  if (!newCustomerId) return;
  const newQuantity = prompt("Quantity:", quantity);
  if (!newQuantity) return;
  const newDate = prompt("Date (YYYY-MM-DD):", date);
  if (!newDate) return;

  updateTransaction(id, newSku, newCustomerId, newQuantity, newDate);
}

async function updateTransaction(id_transaction, product_sku, id_customer, quantity, date) {
  try {
    const res = await fetch(`${API_URL}/transactions/${id_transaction}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_sku, id_customer, quantity, date }),
    });
    const result = await res.json();
    showOutput("transactions-output", { message: "transaction updated", result });
    listTransactions();
  } catch (err) {
    showOutput("transactions-output", { error: err.message });
  }
}

async function deleteTransaction(id) {
  if (!confirm(`Delete transaction "${id}"?`)) return;

  try {
    const res = await fetch(`${API_URL}/transactions/${id}`, { method: "DELETE" });
    const result = await res.json();
    showOutput("transactions-output", { message: "transaction deleted", result });
    listTransactions();
  } catch (err) {
    showOutput("transactions-output", { error: err.message });
  }
}

// ============ MIGRATION ============
document.getElementById("migration-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    const res = await fetch(`${API_URL}/migration/upload`, {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    showOutput("migration-output", result);
    e.target.reset();
  } catch (err) {
    showOutput("migration-output", { error: err.message });
  }
});

// ============ HELPERS ============

function showOutput(elementId, data) {
  const el = document.getElementById(elementId);
  el.textContent = JSON.stringify(data, null, 2);
  el.classList.add("show");
}

function escapeQuotes(str) {
  return String(str || "").replace(/'/g, "\\'").replace(/"/g, '\\"');
}
