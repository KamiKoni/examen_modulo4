const service = require("./customer_service");

exports.getcustomers = async (req, res, next) => {
  try {
    const search = req.query.q || null;
    const address = req.query.address || null;
    const data = await service.getcustomers(search, address);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getcustomerById = async (req, res, next) => {
  try {
    const data = await service.getcustomerById(req.params.id);
    if (!data) return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createcustomer = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is missing" });
    }
    const result = await service.createcustomer(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updatecustomer = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is missing" });
    }
    const result = await service.updatecustomer(req.params.id, req.body);
    if (!result) return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletecustomer = async (req, res, next) => {
  try {
    const result = await service.deletecustomer(req.params.id);
    if (!result) return res.status(404).json({ message: "Customer not found" });
    res.status(200).json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};