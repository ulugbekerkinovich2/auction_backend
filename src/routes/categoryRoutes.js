const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const isAuth = require("../middleware/is-auth.middleware");
// Route to create a new category
router.post("/", isAuth, categoryController.createCategory);

// Route to get all categories
router.get("/", categoryController.getAllCategories);

// Route to get a category by ID
router.get("/:categoryId", categoryController.getCategoryById);

// Route to update a category by ID
router.put("/:categoryId", isAuth, categoryController.updateCategory);

// Route to delete a category by ID
router.delete("/:categoryId", isAuth, categoryController.deleteCategory);

module.exports = router;
