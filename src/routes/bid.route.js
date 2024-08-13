const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidController");
const isAuth = require("../middleware/is-auth.middleware");
// Create a new bid
router.post("/", isAuth, bidController.createBid);

// Get all bids
router.get("/", isAuth, bidController.getAllBids);
router.get("/user", isAuth, bidController.getUserAllBids);
router.get(
  "/user/sales",
  isAuth,
  bidController.getUserBidsOnOwnProducts
);

// Get a bid by ID
router.get("/:bidId", bidController.getBidById);
router.get("/user/:bidId", isAuth, bidController.getUserBidById);

// Update a bid by ID
router.put("/:bidId", isAuth, bidController.updateBid);

// Delete a bid by ID
router.delete("/:bidId", isAuth, bidController.deleteBid);

module.exports = router;
