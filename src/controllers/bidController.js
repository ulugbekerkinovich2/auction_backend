const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const prisma = new PrismaClient();

// Create a new bid
exports.createBid = async (req, res) => {
  const schema = Joi.object({
    productId: Joi.string().required(),
    userId: Joi.string().required(),
    bidAmount: Joi.number().integer().min(0).required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: value.productId },
    });
    if (!product) {
      return res.status(404).send("Product not found.");
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: value.userId },
    });
    if (!user) {
      return res.status(404).send("User not found.");
    }

    const bid = await prisma.bid.create({
      data: {
        productId: value.productId,
        userId: value.userId,
        bidAmount: value.bidAmount,
      },
    });

    res.status(201).send(bid);
  } catch (err) {
    res.status(500).send({
      message: "Failed to create bid",
      error: err.message,
    });
  }
};

// Get all bids
exports.getAllBids = async (req, res) => {
  try {
    const bids = await prisma.bid.findMany({
      include: {
        product: true,
        user: true,
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
      return res.status(404).send("Bid not found.");
    }

    await prisma.bid.delete({
      where: { id: bidId },
    });

    res.status(204).send(); // No content to return upon successful deletion
  } catch (err) {
    res.status(500).send({
      message: "Failed to delete bid",
      error: err.message,
    });
  }
};
