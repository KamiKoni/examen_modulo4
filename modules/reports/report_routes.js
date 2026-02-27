const router = require("express").Router();
const controller = require("./report_controller");

router.get("/revenue", controller.getRevenueReport);

module.exports = router;