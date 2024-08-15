const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const isAuth = require("../middleware/is-auth.middleware");

// Create a new product (Requires authentication)
router.post("/", isAuth, productController.createProduct);

// Get all products
router.get("/", productController.getAllProducts);

// Get a single product by ID
router.get("/user/:productId", isAuth, productController.getUserOneProduct);
router.get("/:productId", productController.getOneProduct);

// Update a product by ID (Requires authentication)
router.put("/user/:productId", isAuth, productController.updateProduct);

// Delete a product by ID (Requires authentication)
router.delete("/:productId", isAuth, productController.deleteProduct);
router.get("/getby/:categoryId", productController.getProductsByCategory);

module.exports = router;
