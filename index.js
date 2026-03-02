const express = require("express");
const app = express();
const errorHandler = require("./config/errorHandler");
// serve static frontend files from public directory
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require('cors');

// enable CORS for all origins (adjust as needed)
app.use(cors());

app.use("/api/customers", require("./modules/customers/customer_routes"));
app.use("/api/suppliers", require("./modules/suppliers/supplier_routes"));
app.use("/api/products", require("./modules/products/product_routes"));
app.use("/api/reports", require("./modules/reports/report_routes"));
app.use("/api/transactions", require("./modules/transactions/transactions_routes"));
app.use("/api/migration", require("./migration/migrate_routes"));
app.use("/api/audit", require("./modules/audit/audit_routes"));
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));