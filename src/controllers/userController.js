const bcrypt = require("bcrypt");
const Joi = require("joi");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateToken } = require("../utils/jwt");

exports.register = async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(5).required(),
    role: Joi.string().valid("ADMIN", "USER", "MODERATOR").required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const findUser = await prisma.user.findUnique({
    where: {
      username: value.username,
    },
  });

  if (findUser) {
    return res.status(409).json({ message: "Username already exists" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(value.password, salt);

  try {
    const user = await prisma.user.create({
      data: {
        username: value.username,
        password: hashedPassword,
        role: value.role,
      },
    });
    res.status(201).send({ userId: user.id, username: user.username });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.login = async (req, res) => {
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
    if (!user || !(await bcrypt.compare(value.password, user.password))) {
      return res.status(401).send("Invalid credentials");
    }

    // Generate JWT token using your jwt.js module
    const token = generateToken({ id: user.id, role: user.role });

    res.json({ message: "Logged in successfully", token });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
