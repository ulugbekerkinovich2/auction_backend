const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidController");

// Create a new bid
router.post("/", bidController.createBid);

// Get all bids
router.get("/", bidController.getAllBids);

// Get a bid by ID
router.get("/:bidId", bidController.getBidById);

// Update a bid by ID
router.put("/:bidId", bidController.updateBid);

// Delete a bid by ID
router.delete("/:bidId", bidController.deleteBid);

module.exports = router;