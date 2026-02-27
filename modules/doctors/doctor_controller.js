const service = require("./doctor_service");

exports.getDoctors = async (req, res, next) => {
  try {
    const q = req.query.q || null;
    const specialty = req.query.specialty || null;
    const data = await service.getDoctors(q, specialty);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getDoctorById = async (req, res, next) => {
  try {
    const data = await service.getDoctorById(req.params.id);
    if (!data) return res.status(404).json({ message: "Doctor not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createDoctor = async (req, res, next) => {
  try {
    const data = await service.createDoctor(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const data = await service.updateDoctor(req.params.id, req.body);
    if (!data) return res.status(404).json({ message: "Doctor not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.deleteDoctor = async (req, res, next) => {
  try {
    const data = await service.deleteDoctor(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};