const service = require("./patient_service");

exports.getHistory = async (req, res, next) => {
  try {
    const data = await service.getHistory(req.params.email);
    if (!data) return res.status(404).json({ message: "Patient not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createPatient = async (req, res, next) => {
  try {
    const data = await service.createPatient(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const data = await service.updatePatient(req.params.email, req.body);
    if (!data) return res.status(404).json({ message: "Patient not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.deletePatient = async (req, res, next) => {
  try {
    const data = await service.deletePatient(req.params.email);
    res.json(data);
  } catch (err) {
    next(err);
  }
};