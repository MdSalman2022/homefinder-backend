const express = require("express");
const propertyController = require("../controller/propertyController");
const router = express.Router();

router.get("/getAll", propertyController.getAllProperties);
router.get("/getPropertiesById", propertyController.getPropertiesByPostedBy);
router.post("/createTable", propertyController.createTable);
router.post("/create", propertyController.createProperty);
router.put("/:id", propertyController.updateProperty);
router.delete("/:id", propertyController.deleteProperty);

module.exports = router;