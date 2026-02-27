const router = require("express").Router();
const controller = require("./patient_controller");

// CRUD
router.post("/", controller.createPatient);
router.put("/:email", controller.updatePatient);    // UPDATE
router.delete("/:email", controller.deletePatient);
// Patient history endpoint
router.get("/:email/history", controller.getHistory);

module.exports = router;