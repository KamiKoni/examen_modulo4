const router = require("express").Router();
const ctrl = require("./product_controller");

router.get("/", ctrl.getProducts);
router.get("/:sku", ctrl.getProductBySku);
router.post("/", ctrl.createProduct);
router.put("/:sku", ctrl.updateProduct);
router.delete("/:sku", ctrl.deleteProduct);

module.exports = router;
