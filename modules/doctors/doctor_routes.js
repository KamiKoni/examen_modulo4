const router = require("express").Router();
const controller = require("./doctor_controller");

router.get("/", controller.getDoctors);
router.get("/:id", controller.getDoctorById);
router.post("/", controller.createDoctor);      // CREATE
router.put("/:id", controller.updateDoctor);
router.delete("/:id", controller.deleteDoctor); // DELETE

module.exports = router;