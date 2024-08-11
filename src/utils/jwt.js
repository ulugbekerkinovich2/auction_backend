const jwt = require('jsonwebtoken');
require("dotenv").config()
const secretKey = process.env.TOKEN_SECRET
// Replace with your actual secret key

// Function to generate a token
function generateToken(payload) {
    return jwt.sign(payload, secretKey, { expiresIn: '10h' });
}

// Function to verify a token
function verifyToken(token) {
    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        throw new Error('Invalid token');
    }
}

// Middleware to check if the token is valid
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Assuming token is in "Bearer <token>" format

    if (!token) {
        return res.status(401).json({ message: 'Access denied, no token provided' });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded; // Attach the decoded payload to the request object
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
}

module.exports = {
    generateToken,
    verifyToken,
    authenticateToken
};
