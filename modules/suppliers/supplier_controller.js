const service = require("./supplier_service");

exports.getSuppliers = async (req, res, next) => {
  try {
    const q = req.query.q || null;
    const data = await service.getSuppliers(q);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getSupplierById = async (req, res, next) => {
  try {
    const data = await service.getSupplierById(req.params.id);
    if (!data) return res.status(404).json({ message: "supplier not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createSupplier = async (req, res, next) => {
  try {
    const data = await service.createSupplier(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const data = await service.updateSupplier(req.params.id, req.body);
    if (!data) return res.status(404).json({ message: "supplier not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const data = await service.deleteSupplier(req.params.id);
    if (!data) return res.status(404).json({ message: "Supplier not found" });
    res.status(200).json(data);
  } catch (err) {
    if (err.code === "FK_CONSTRAINT") {
      return res.status(409).json({ message: err.message });
    }
    next(err);
  }
};
