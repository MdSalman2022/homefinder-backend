const express = require("express");
const shiftingController = require("../controller/shiftingController");
const router = express.Router();

router.get("/getAll", shiftingController.getAllProperties);
router.post("/create", shiftingController.createShifting);

module.exports = router;
