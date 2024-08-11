const bcrypt = require("bcrypt");
const Joi = require("joi");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateToken } = require("../utils/jwt");

exports.adminLogin = async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: value.username,
      },
    });

    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(value.password, user.password);
    if (!validPassword) {
      return res.status(401).send("Invalid credentials");
    }

    if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
      return res
        .status(403)
        .send("Access denied. You do not have the required permissions.");
    }

    // Generate JWT token using your jwt.js module
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({ message: "Logged in successfully", token });
  } catch (err) {
    res.status(500).send(err.message);
  }
};


