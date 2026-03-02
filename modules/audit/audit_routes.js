const express = require("express");
const router = express.Router();
const service = require("./audit_service");

router.get("/", async (req, res, next) => {
  try {
    const logs = await service.listLogs();
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;