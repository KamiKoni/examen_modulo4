const router = require("express").Router();
const controller = require("./transactions_controller");

// CRUD
router.get("/", controller.gettransactions);
router.get("/:id", controller.getTransactionById);
router.post("/", controller.createtransaction);
router.put("/:id", controller.updatetransaction);    // UPDATE by id_transaction
router.delete("/:id", controller.deletetransaction);

module.exports = router;