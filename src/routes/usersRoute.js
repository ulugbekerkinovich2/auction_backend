const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const isAuthAdmin = require("../middleware/is-admin.middleware");

// Get all products
router.get("/", isAuthAdmin, usersController.getAllUsers);

// Get a single product by ID
router.get("/:userId", isAuthAdmin, usersController.getOneUser);

// Update a product by ID (Requires authentication)
router.put("/:userId", isAuthAdmin, usersController.updateUser);

// Delete a product by ID (Requires authentication)
router.delete("/:userId", isAuthAdmin, usersController.deleteUser);

module.exports = router;
