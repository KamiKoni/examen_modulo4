const migrateService = require("./migrate_service");

exports.importData = async (req, res, next) => {
  try {
    const filePath = req.file.path;
    await migrateService.importExcel(filePath); // Reads Excel and migrates to MySQL + Mongo
    res.json({ message: "Migration completed successfully" });
  } catch (err) {
    next(err);
  }
};