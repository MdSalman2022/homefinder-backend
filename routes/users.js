const express = require("express");
const userController = require("../controller/userController");
const router = express.Router();

router.get("/", userController.getAllUsers);
router.get("/getUserById", userController.getUserById);
router.post("/create", userController.createUser);

module.exports = router;
