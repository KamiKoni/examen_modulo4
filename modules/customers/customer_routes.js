const router = require("express").Router();
const controller = require("./customer_controller");

router.get("/", controller.getcustomers);
router.get("/:id", controller.getcustomerById);
router.post("/", controller.createcustomer);      // CREATE
router.put("/:id", controller.updatecustomer);
router.delete("/:id", controller.deletecustomer); // DELETE

module.exports = router;