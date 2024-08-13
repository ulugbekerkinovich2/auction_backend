require("dotenv").config();
const jwt = require("jsonwebtoken");

const isAuthAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Permission denied",
    });
  }

  const token = authHeader.split(" ")[1];
  // console.log(token);
  // console.log(process.env.TOKEN_SECRET);
  try {
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decodedToken;
    // console.log(decodedToken);
    // console.log(111, req.user);
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = isAuthAdmin;
