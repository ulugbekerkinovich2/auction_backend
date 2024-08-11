const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/admin/login", adminController.adminLogin);

module.exports = router;
