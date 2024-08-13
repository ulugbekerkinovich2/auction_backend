const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const prisma = new PrismaClient();
const path = require("path");
const { v4: uuid } = require("uuid");
// Create a new category
exports.createCategory = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const findCategory = await prisma.category.findFirst({
    where: { name: value.name },
  });
  console.log(findCategory);

  if (findCategory) {
    return res.status(409).send("Category already exists");
  }

  const image = req.files?.image;
  if (!image) return res.status(400).send("Image file is required.");

  try {
    const photoName = `${uuid()}.${image.mimetype.split("/")[1]}`;
    const uploadPath = path.join(process.cwd(), "uploads", photoName);

    await new Promise((resolve, reject) => {
      image.mv(uploadPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log(photoName);

    // Create the category with the image reference
    const category = await prisma.category.create({
      data: {
        name: value.name,
        image: photoName,
      },
    });

    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Failed to create category",
      error: err.message,
    });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        image: true,
      },
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).send({
      message: "Failed to fetch categories",
      error: err.message,
    });
  }
};

// Get a category by ID
exports.getCategoryById = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.status(200).json(category);
  } catch (err) {
    res.status(500).send({
      message: "Failed to fetch category",
      error: err.message,
    });
  }
};

// Update a category by ID
exports.updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const schema = Joi.object({
    name: Joi.string().optional(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).send("Category not found");
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: value,
    });

    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(500).send({
      message: "Failed to update category",
      error: err.message,
    });
  }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const category = await prisma.category.findFirst({
      where: { id: categoryId },
      include: {
        products: true, // Include related products
      },
    });

    if (!category) {
      return res.status(404).send("Category not found");
    }

    // Delete related entries in the ProductCategory table
    await prisma.productCategory.deleteMany({
      where: { categoryId: categoryId },
    });

    // Optionally delete the products themselves if they are not associated with other categories
    await prisma.product.deleteMany({
      where: {
        categories: {
          none: { categoryId: categoryId },
        },
      },
    });

    // Delete the category itself
    await prisma.category.delete({
      where: { id: categoryId },
    });

    res.status(204).json({
      message: "Category and related products deleted successfully",
    }); // No content to return upon successful deletion
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Failed to delete category and related products",
      error: err.message,
    });
  }
};
