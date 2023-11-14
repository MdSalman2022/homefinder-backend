const express = require("express");
const productsController = require("../controller/productsController");
const router = express.Router();

router.get("/getProducts", productsController.getProducts);
router.post("/searchProducts", productsController.searchProducts);

module.exports = router;
