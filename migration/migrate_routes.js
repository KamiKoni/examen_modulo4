const express = require("express");
const multer = require("multer");
const router = express.Router();
const migrateController = require("./migrate_controller");

const upload = multer({ dest: "uploads/" });

// POST /api/migration/upload
router.post("/upload", upload.single("file"), migrateController.importData);

module.exports = router;