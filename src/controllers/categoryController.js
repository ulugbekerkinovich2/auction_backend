const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const prisma = new PrismaClient();

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

  if (findCategory) {
    return res.status(409).send("Category already exists");
  }
  try {
    const category = await prisma.category.create({
      data: {
        name: value.name,
      },
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).send({
      message: "Failed to create category",
      error: err.message,
    });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
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
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).send("Category not found");
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    res.status(204).send(); // No content to return upon successful deletion
  } catch (err) {
    res.status(500).send({
      message: "Failed to delete category",
      error: err.message,
    });
  }
};
