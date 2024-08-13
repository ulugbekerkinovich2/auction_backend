const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");
const isAuth = require("../middleware/is-admin.middleware");
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/admin/login", adminController.adminLogin);
router.get("/products", isAuth, productController.getUserAllProducts);

module.exports = router;
