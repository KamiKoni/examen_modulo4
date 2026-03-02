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
    next(err);
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
    res.json(data);
  } catch (err) {
    next(err);
  }
};
