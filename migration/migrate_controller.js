const migrateService = require("./migrate_service");

exports.importData = async (req, res, next) => {
  try {
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    await migrateService.importExcel(filePath, originalName); // Reads Excel or CSV and migrates to MySQL + Mongo
    res.json({ message: "Migration completed successfully" });
  } catch (err) {
    next(err);
  }
};