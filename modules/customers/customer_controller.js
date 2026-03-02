const service = require("./customer_service");

exports.getcustomers = async (req, res, next) => {
  try {
    const q = req.query.q || null;
    const specialty = req.query.specialty || null;
    const data = await service.getcustomers(q, specialty);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getcustomerById = async (req, res, next) => {
  try {
    const data = await service.getcustomerById(req.params.id);
    if (!data) return res.status(404).json({ message: "customer not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createcustomer = async (req, res, next) => {
  try {
    const data = await service.createcustomer(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.updatecustomer = async (req, res, next) => {
  try {
    const data = await service.updatecustomer(req.params.id, req.body);
    if (!data) return res.status(404).json({ message: "customer not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.deletecustomer = async (req, res, next) => {
  try {
    const data = await service.deletecustomer(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};