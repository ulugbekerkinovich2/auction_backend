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
  console.log(user);

  if (!user) return res.status(403).send("User authentication failed.1");

  try {
    const { role } = user;
    if (role !== "ADMIN" && role !== "USER") {
      return res.status(403).send("User authentication failed.2");
    }
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
  const { name } = req.query; // Get the product name from the query parameters

  try {
    const products = await prisma.product.findMany({
      where: name
        ? {
            name: {
              contains: name, // Filter by product name using the 'contains' operator
              mode: "insensitive", // Case-insensitive search
            },
          }
        : {}, // If no name is provided, return all products
      include: {
        categories: {
          select: {
            category: {
              select: {
                name: true,
                id: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Transform the categories array to remove the nesting
    const transformedProducts = products.map((product) => ({
      ...product,
      categories: product.categories.map((c) => c.category), // Flattening the category structure
    }));

    res.status(200).send(transformedProducts);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get Products by Category ID
exports.getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    // Check if the category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).send("Category not found.");
    }

    // Fetch products that belong to the specified category
    const products = await prisma.product.findMany({
      where: {
        categories: {
          some: {
            categoryId: categoryId,
          },
        },
      },
      include: {
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch products by category",
      error: error.message,
    });
  }
};

exports.getUserAllProducts = async (req, res) => {
  try {
    const { id, role } = req.user;
    console.log(11, id, role);

    if (role !== "USER" && role !== "ADMIN") {
      return res.status(403).send("User authentication failed.1");
    }

    if (role == "USER") {
      const products = await prisma.product.findMany({
        where: { userId: id },
        include: {
          categories: {
            select: {
              category: true, // Include category information
            },
          },
        },
      });
      res.status(200).send(products);
    }
    if (role == "ADMIN") {
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
    }
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
exports.getUserOneProduct = async (req, res) => {
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

  // Validation schema
  const schema = Joi.object({
    name: Joi.string().optional(),
    cost: Joi.number().integer().min(0).optional(),
    categoryId: Joi.string().optional(), // Allow category update
    isBuyed: Joi.boolean().optional(),
    isSelled: Joi.boolean().optional(),
  });

  // Validate the request body
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Find the existing product
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!existingProduct) {
    return res.status(404).send("Product not found.");
  }

  // Get user information and role
  const userData = req.user;
  const role = userData.role;
  if (role !== "ADMIN" && role !== "USER") {
    return res.status(403).send("User authentication failed.");
  }

  // Handle image upload if provided
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
    // Prepare the updated product data
    const updatedProductData = {
      name: value.name || existingProduct.name,
      cost: value.cost || existingProduct.cost,
      image: photoName,
      isBuyed: value.isBuyed || existingProduct.isBuyed,
      isSelled: value.isSelled || existingProduct.isSelled,
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

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updatedProductData,
      include: {
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            }, // Include category information
          },
        },
      },
    });

    res.status(200).send(updatedProduct);
  } catch (err) {
    console.error(err);
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
    const userData = req.user;
    const { role } = userData.role;
    if (role !== "ADMIN" || role !== "USER") {
      return res.status(403).send("User authentication failed.");
    }
    const product = await prisma.product.findFirst({
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
