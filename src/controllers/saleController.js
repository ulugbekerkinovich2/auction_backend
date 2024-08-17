const Joi = require("joi");
const { PrismaClient } = require("@prisma/client");
const { tr } = require("@faker-js/faker");
const prisma = new PrismaClient();

// Validation Schema
const saleSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  selledUserId: Joi.string().uuid().required(),
  boughtedUserId: Joi.string().uuid().required(),
});

exports.createSale = async (req, res) => {
  const { productId, selledUserId, boughtedUserId } = req.body;

  // Validate input data
  const { error } = saleSchema.validate({
    productId,
    selledUserId,
    boughtedUserId,
  });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    // Check if product exists and is not already sold
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.isSelled) {
      return res
        .status(400)
        .json({ message: "Product has already been sold." });
    }

    // Check if the selledUserId and boughtedUserId are valid users
    const selledUser = await prisma.user.findUnique({
      where: { id: selledUserId },
    });
    const boughtedUser = await prisma.user.findUnique({
      where: { id: boughtedUserId },
    });

    if (!selledUser) {
      return res.status(404).json({ message: "Seller not found." });
    }

    if (!boughtedUser) {
      return res.status(404).json({ message: "Buyer not found." });
    }

    // Create the sale
    const sale = await prisma.sales.create({
      data: {
        productId,
        selledUserId,
        boughtedUserId,
      },
      include: {
        product: true,
        selledUser: true,
        boughtedUser: true,
      },
    });

    // Update the product and users
    await prisma.product.update({
      where: { id: productId },
      data: {
        isSelled: true,
      },
    });

    await prisma.user.update({
      where: { id: selledUserId },
      data: {
        products: {
          updateMany: {
            where: { id: productId },
            data: { isSelled: true },
          },
        },
      },
    });

    await prisma.user.update({
      where: { id: boughtedUserId },
      data: {
        products: {
          updateMany: {
            where: { id: productId },
            data: { isBuyed: true },
          },
        },
      },
    });
    await prisma.bid.updateMany({
      where: {
        productId,
        userId: boughtedUserId,
      },
      data: {
        amIboughtProduct: true,
      },
    });
    res.status(201).json(sale);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create sale", error: err.message });
  }
};

// Other CRUD functions remain unchanged but follow the same error handling and response pattern
exports.getAllSales = async (req, res) => {
  try {
    console.log("getAllSales");
    const userId = req.user.id;
    const allSales = await prisma.sales.findMany({
      where: { selledUserId: userId },
      include: {
        product: true,
        selledUser: true,
        boughtedUser: true,
      },
    });

    res.status(200).json(allSales);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch sales", error: err.message });
  }
};

// exports.getUserAllSales = async (req, res) => {
//   try {
//     const sales = await prisma.sales.findMany({
//       include: {
//         product: true,
//         selledUser: true,
//         boughtedUser: true,
//       },
//     });
//     res.status(200).json(sales);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Failed to fetch sales", error: err.message });
//   }
// };

exports.getSaleById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const sale = await prisma.sales.findUnique({
      // where: { id: id, user: userId },
      where: {
        id: id,
        AND: {
          selledUserId: userId,
        },
      },
      include: {
        product: true,
        selledUser: {
          select: {
            id: true,
            username: true,
            createdAt: true,
          },
        },
        boughtedUser: {
          select: {
            id: true,
            username: true,
            createdAt: true,
          },
        },
      },
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found." });
    }

    res.status(200).json(sale);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch sale", error: err.message });
  }
};

exports.updateSale = async (req, res) => {
  const { id } = req.params;
  const { productId, selledUserId, boughtedUserId } = req.body;

  try {
    const updatedSale = await prisma.sales.update({
      where: { id },
      data: {
        productId,
        selledUserId,
        boughtedUserId,
      },
      include: {
        product: true,
        selledUser: true,
        boughtedUser: true,
      },
    });

    res.status(200).json(updatedSale);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update sale", error: err.message });
  }
};

exports.deleteSale = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.sales.delete({
      where: { id },
    });
    res.status(204).json({ message: "Sale deleted successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete sale", error: err.message });
  }
};
