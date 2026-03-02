const router = require("express").Router();
const ctrl = require("./supplier_controller");

router.get("/", ctrl.getSuppliers);
router.get("/:id", ctrl.getSupplierById);
router.post("/", ctrl.createSupplier);
router.put("/:id", ctrl.updateSupplier);
router.delete("/:id", ctrl.deleteSupplier);

module.exports = router;
