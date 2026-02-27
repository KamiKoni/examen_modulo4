const service = require("./report_service");

exports.getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query; // optional filters
    const data = await service.getRevenueReport(startDate, endDate);
    res.json(data);
  } catch (err) {
    next(err); // centralized error handler
  }
};