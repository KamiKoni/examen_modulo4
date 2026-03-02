const service = require("./transactions_service");

exports.gettransactions = async (req, res, next) => {
  try {
    const q = req.query.q || null;
    const data = await service.gettransactions(q);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    const data = await service.getTransactionById(req.params.id);
    if (!data) return res.status(404).json({ message: "transaction not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createtransaction = async (req, res, next) => {
  try {
    const data = await service.createtransaction(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.updatetransaction = async (req, res, next) => {
  try {
    const data = await service.updatetransaction(req.params.id, req.body);
    if (!data) return res.status(404).json({ message: "transaction not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.deletetransaction = async (req, res, next) => {
  try {
    const data = await service.deletetransaction(req.params.id);
    if (!data) return res.status(404).json({ message: "transaction not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};