const service = require("./product_service");

exports.getProducts = async (req, res, next) => {
  try {
    const q = req.query.q || null;
    const data = await service.getProducts(q);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getProductBySku = async (req, res, next) => {
  try {
    const data = await service.getProductBySku(req.params.sku);
    if (!data) return res.status(404).json({ message: "product not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const data = await service.createProduct(req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const data = await service.updateProduct(req.params.sku, req.body);
    if (!data) return res.status(404).json({ message: "product not found" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const data = await service.updateProduct(req.params.sku, req.body);
    if (!data) return res.status(404).json({ message: "product not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const data = await service.deleteProduct(req.params.sku);
    if (!data) return res.status(404).json({ message: "product not found" });
    res.status(200).json(data);
  } catch (err) {
    if (err.code === "FK_CONSTRAINT") {
      return res.status(409).json({ message: err.message });
    }
    next(err);
  }
};
