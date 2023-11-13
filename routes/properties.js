const express = require("express");
const propertyController = require("../controller/propertyController");
const router = express.Router();

router.get("/getAll", propertyController.getAllProperties);
router.get("/getPropertiesByUID", propertyController.getPropertiesByUID);
router.get("/getPropertiesById", propertyController.getPropertiesByPostedBy);
router.post("/filterProperties", propertyController.filterProperties);
router.put("/propertyReserved", propertyController.propertyReserved);
router.post("/createTable", propertyController.createTable);
router.post("/create", propertyController.createProperty);
router.put("/:id", propertyController.updateProperty);
router.delete("/:id", propertyController.deleteProperty);

module.exports = router;
