// routes/userStatistics.js

const express = require("express");
const router = express.Router();
const {
  getUserRegistrationStatistics,
} = require("../controllers/statistics.Controller");
const isAdmin = require("../middleware/is-admin.middleware");
// GET /api/user-statistics
router.get("/registrations", isAdmin, getUserRegistrationStatistics);

module.exports = router;
