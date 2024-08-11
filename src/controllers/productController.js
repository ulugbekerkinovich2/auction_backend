const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const prisma = new PrismaClient();
const path = require("path");
const { v4: uuid } = require("uuid");

// Create Product
exports.createProduct = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    desc: Joi.string().required(), // Added desc validation
    cost: Joi.number().integer().min(0).required(),
    categoryId: Joi.string().required(), // Added categoryId validation
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const image = req.files?.image;
  if (!image) return res.status(400).send("Image file is required.");

  const user = req.user;
  if (!user) return res.status(403).send("User authentication failed.");

  try {
    // Check if the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userExists) {
      return res.status(404).send("User not found.");
    }

    // Check if the category exists
    const category = await prisma.category.findUnique({
      where: { id: value.categoryId },
    });
    if (!category) {
      return res.status(404).send("Category not found.");
    }

    const photoName = `${uuid()}.${image.mimetype.split("/")[1]}`;
    const uploadPath = path.join(process.cwd(), "uploads", photoName);

    await new Promise((resolve, reject) => {
      image.mv(uploadPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Create the product with the category reference
    const product = await prisma.product.create({
      data: {
        name: value.name,
        desc: value.desc,
        cost: value.cost,
        image: photoName,
        userId: user.id,
        categories: {
          create: {
            categoryId: value.categoryId,
          },
        },
      },
    });

    res.status(201).send(product);
  } catch (err) {
    res.status(500).json({
      message: "Failed to process the request",
      error: err.message,
    });
  }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        categories: {
          select: {
            category: true, // Include category information
          },
        },
      },
    });
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get One Product by ID
exports.getOneProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: {
          select: {
            category: true, // Include category information
          },
        },
      },
    });
    if (!product) {
      return res.status(404).send("Product not found.");
    }
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch the product",
      error: error.message,
    });
  }
};

// Update Product by ID
exports.updateProduct = async (req, res) => {
  const { productId } = req.params;
  const schema = Joi.object({
    name: Joi.string().optional(),
    cost: Joi.number().integer().min(0).optional(),
    categoryId: Joi.string().optional(), // Allow category update
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!existingProduct) {
    return res.status(404).send("Product not found.");
  }

  const image = req.files?.image;
  let photoName = existingProduct.image;

  if (image) {
    photoName = `${uuid()}.${image.mimetype.split("/")[1]}`;
    const uploadPath = path.join(process.cwd(), "uploads", photoName);
    try {
      await new Promise((resolve, reject) => {
        image.mv(uploadPath, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (err) {
      return res.status(500).json({
        message: "Failed to upload new image",
        error: err.message,
      });
    }
  }

  try {
    const updatedProductData = {
      name: value.name || existingProduct.name,
      cost: value.cost || existingProduct.cost,
      image: photoName,
    };

    if (value.categoryId) {
      // Check if the category exists
      const category = await prisma.category.findUnique({
        where: { id: value.categoryId },
      });
      if (!category) {
        return res.status(404).send("Category not found.");
      }
      updatedProductData.categories = {
        deleteMany: {}, // Remove existing categories
        create: {
          categoryId: value.categoryId, // Add the new category
        },
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updatedProductData,
      include: {
        categories: {
          select: {
            category: true, // Include category information
          },
        },
      },
    });
    res.status(200).send(updatedProduct);
  } catch (err) {
    res.status(500).send({
      message: "Failed to update product",
      error: err.message,
    });
  }
};

// Delete Product by ID
exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res.status(404).send("Product not found.");
    }

    await prisma.product.delete({
      where: { id: productId },
    });
    res.status(204).send(); // No content to return upon successful deletion
  } catch (err) {
    res.status(500).send({
      message: "Failed to delete product",
      error: err.message,
    });
  }
};
