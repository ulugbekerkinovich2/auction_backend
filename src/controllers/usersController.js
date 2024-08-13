const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require("joi");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "ADMIN") {
      return res.status(403).json({ message: "Permission denied" });
    }
    const users = await prisma.user.findMany();
    res.status(200).json({ data: users, count: users.length });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

// Get one user by ID
exports.getOneUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const { role } = req.user;
    if (role !== "ADMIN") {
      return res.status(403).json({ message: "Permission denied" });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
};

// Update user by ID
exports.updateUser = async (req, res) => {
  const { role } = req.user;
  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Permission denied" });
  }
  const { userId } = req.params;
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).optional(),
    password: Joi.string().min(5).optional(),
    role: Joi.string().valid("ADMIN", "USER", "MODERATOR").optional(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the password is being updated, hash it
    if (value.password) {
      const salt = await bcrypt.genSalt(10);
      value.password = await bcrypt.hash(value.password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: value,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  const { role } = req.user;
  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Permission denied" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(204).send(); // No content to return upon successful deletion
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};
