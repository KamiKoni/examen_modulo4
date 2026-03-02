# SaludPlus Backend

Simple Express/MySQL API for managing inventory: customers, suppliers, products and transactions.

## Setup

1. Clone repository and go into folder:
   ```bash
   cd /home/coders/Documentos/Logitech Solutions
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```env
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster/yourdb
   PORT=3000
   ```
5. Ensure MySQL database is running and contains the following normalized tables (3NF) for inventory management:
   ```sql
   -- customers table
   CREATE TABLE customers (
     id_customer INT AUTO_INCREMENT PRIMARY KEY,
     customer_name VARCHAR(255) NOT NULL,
     customer_email VARCHAR(255) UNIQUE,
     customer_direction VARCHAR(255),
     customer_phone VARCHAR(50)
   );

   -- suppliers table
   CREATE TABLE suppliers (
     id_supplier INT AUTO_INCREMENT PRIMARY KEY,
     supplier_name VARCHAR(255) NOT NULL,
     supplier_email VARCHAR(255) UNIQUE
   );

   -- products table
   CREATE TABLE products (
     product_sku VARCHAR(50) PRIMARY KEY,
     id_supplier INT NOT NULL,
     product_name VARCHAR(255),
     product_category VARCHAR(100),
     unit_price DECIMAL(10,2),
     FOREIGN KEY (id_supplier) REFERENCES suppliers(id_supplier)
   );

   -- transactions table (records stock movements)
   CREATE TABLE transactions (
     id_transaction INT AUTO_INCREMENT PRIMARY KEY,
     product_sku VARCHAR(50) NOT NULL,
     id_customer INT NOT NULL,
     quantity INT NOT NULL,
     date DATE,
     FOREIGN KEY (product_sku) REFERENCES products(product_sku),
     FOREIGN KEY (id_customer) REFERENCES customers(id_customer)
   );
   ```

5. Run the server:
   ```bash
   npm run dev   # uses nodemon
   ```

The API listens on `http://localhost:3001` (or the port set in `.env`).

## Endpoints

### Customers
- `GET /api/customers` – list customers; optionally `?q=` to search name, email or direction.
- `GET /api/customers/:id` – retrieve one customer
- `POST /api/customers` – create (body: `customer_name,customer_email,customer_direction,customer_phone`)
- `PUT /api/customers/:id` – update
- `DELETE /api/customers/:id` – delete

### Suppliers
- `GET /api/suppliers` – list suppliers; supports `?q=` search by name or email.
- `GET /api/suppliers/:id` – get supplier
- `POST /api/suppliers` – create (`supplier_name,supplier_email`)
- `PUT /api/suppliers/:id` – update
- `DELETE /api/suppliers/:id` – delete (will respond with **409 Conflict** if the supplier still has products in the catalog due to foreign-key constraints)

### Products
- `GET /api/products` – list products; optional `?q=` to search by name or SKU.
- `GET /api/products/:sku` – get product details
- `POST /api/products` – create (`product_sku,id_supplier,product_name,product_category,unit_price`)
- `PUT /api/products/:sku` – update
- `DELETE /api/products/:sku` – remove

### Transactions
- `GET /api/transactions` – list stock movements; `?q=` can search customer or product names.
- `GET /api/transactions/:id` – fetch a single transaction
- `POST /api/transactions` – create (`product_sku,id_customer,quantity,date`)
- `PUT /api/transactions/:id` – update
- `DELETE /api/transactions/:id` – delete

### Migration
- `POST /api/migration/upload` – upload an Excel/CSV file with sheets named `customers`, `suppliers`, `products` and optionally `transactions`. Field names should match column names.
  The service inserts rows into MySQL and avoids duplicates via `ON DUPLICATE KEY` checks.

## Business Intelligence / Advanced Queries

The operations manager can obtain analytical reports via Postman using the following requests:

- **Supplier analysis**
   Determine which suppliers have sold us the most products (number of items) and the total value of inventory associated with each.
    ```sql
    SELECT s.supplier_name,
           SUM(t.quantity) AS total_items,
           SUM(t.quantity * p.unit_price) AS inventory_value
    FROM suppliers s
    JOIN products p ON p.id_supplier = s.id_supplier
    JOIN transactions t ON t.product_sku = p.product_sku
    GROUP BY s.id_supplier;
    ```

- **Customer behavior**
  -  View the purchase history for a specific customer, detailing products, dates, and total spent per transaction.
    ```sql
    SELECT t.date,
           p.product_name,
           t.quantity,
           t.quantity * p.unit_price AS total_spent
    FROM transactions t
    JOIN products p ON p.product_sku = t.product_sku
    WHERE t.id_customer = ?
    ORDER BY t.date;
    ```

- **Top products**
  - List the best-selling products within a specific category, ordered by revenue generated.
    ```sql
    SELECT p.product_name,
           SUM(t.quantity) AS total_items,
           SUM(t.quantity * p.unit_price) AS total_revenue
    FROM products p
    JOIN transactions t ON t.product_sku = p.product_sku
    WHERE p.product_category = ?
    GROUP BY p.product_sku
    ORDER BY total_revenue DESC;
    ```

## Frontend

A very small static frontend is served from `/public/index.html` that lets you hit the API end-to-end. Open `http://localhost:3000/` in your browser.


