const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const prisma = new PrismaClient();

// Create a new bid
exports.createBid = async (req, res) => {
  // Validate the incoming request body
  const schema = Joi.object({
    productId: Joi.string().required(),
    bidAmount: Joi.number().integer().min(0).required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const userData = req.user;

    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: value.productId },
    });

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userData.id },
    });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Check if the user has already placed an order for this product
    const findOrder = await prisma.bid.findFirst({
      where: {
        productId: value.productId,
        userId: userData.id,
      },
    });

    if (findOrder) {
      return res
        .status(400)
        .send("You have already placed an order for this product.");
    }

    // Create a new bid
    const bid = await prisma.bid.create({
      data: {
        productId: value.productId,
        userId: userData.id,
        bidAmount: value.bidAmount,
      },
    });

    res.status(201).send(bid);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Failed to create bid",
      error: err.message,
    });
  }
};

// Get all bids
exports.getAllBids = async (req, res) => {
  try {
    const userID = req.user.id;
    console.log(userID);

    const bids = await prisma.bid.findMany({
      where: { userId: userID }, // Corrected to use userId
      include: {
        product: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    res.status(200).send(bids);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch bids",
      error: error.message,
    });
  }
};

exports.getUserAllBids = async (req, res) => {
  try {
    const bids = await prisma.bid.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    res.status(200).send(bids);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch bids",
      error: error.message,
    });
  }
};
// Get a bid by ID
exports.getBidById = async (req, res) => {
  const { bidId } = req.params;

  try {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        product: true,
        user: true,
      },
    });
    if (!bid) {
      return res.status(404).send("Bid not found.");
    }

    res.status(200).send(bid);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch bid",
      error: error.message,
    });
  }
};

exports.getUserBidById = async (req, res) => {
  const { bidId } = req.params;

  try {
    const bid = await prisma.bid.findUnique({
      where: {
        id: bidId,
        userId: req.user.id,
      },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    if (!bid) {
      return res.status(404).send("Bid not found.");
    }

    res.status(200).send(bid);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch bid",
      error: error.message,
    });
  }
};

// Update a bid by ID
exports.updateBid = async (req, res) => {
  const { bidId } = req.params;
  const schema = Joi.object({
    bidAmount: Joi.number().integer().min(0).optional(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const existingBid = await prisma.bid.findUnique({
      where: { id: bidId },
    });
    if (!existingBid) {
      return res.status(404).send("Bid not found.");
    }

    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: value,
      include: {
        product: true,
        user: true,
      },
    });

    res.status(200).send(updatedBid);
  } catch (err) {
    res.status(500).send({
      message: "Failed to update bid",
      error: err.message,
    });
  }
};

// Delete a bid by ID
exports.deleteBid = async (req, res) => {
  const { bidId } = req.params;

  try {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
    });
    if (!bid) {
      return res.status(404).send("Order not found.");
    }

    await prisma.bid.delete({
      where: { id: bidId },
    });

    res.status(204).send(); // No content to return upon successful deletion
  } catch (err) {
    res.status(500).send({
      message: "Failed to delete Order",
      error: err.message,
    });
  }
};

exports.getUserBidsOnOwnProducts = async (req, res) => {
  try {
    // Fetch bids on the logged-in user's products by other users
    // console.log(req.user);
    // console.log("keldi");

    const userBids = await prisma.bid.findMany({
      where: {
        product: {
          userId: req.user.id, // Ensure the product belongs to the logged-in user
        },
        userId: {
          not: req.user.id, // Ensure the bid was made by other users
        },
      },
      include: {
        product: true, // Include product details
        user: true, // Include the bidding user details
      },
    });
    console.log(userBids);

    // If no bids found
    if (userBids.length === 0) {
      return res.status(404).json({
        message: "No bids found on your products from other users.",
      });
    }

    res.status(200).json(userBids);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch user bids", error: err.message });
  }
};
