const express = require("express");
require("./config/mongo");
const app = express();
const errorHandler = require("./config/errorHandler");

app.use(express.json());
// serve static frontend files from public directory
app.use(express.static("public"));

app.use("/api/doctors", require("./modules/doctors/doctor_routes"));
app.use("/api/reports", require("./modules/reports/report_routes"));
app.use("/api/patients", require("./modules/patients/patient_routes"));
app.use("/api/migration", require("./migration/migrate_routes"));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));