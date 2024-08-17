// routes/userStatistics.js

const express = require("express");
const router = express.Router();
const {
  getUserRegistrationStatistics,
} = require("../controllers/statistics.Controller");

// GET /api/user-statistics
router.get("/registrations", getUserRegistrationStatistics);

module.exports = router;
