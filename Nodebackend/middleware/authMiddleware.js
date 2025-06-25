const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Hardcoded JWT secret for signing/verifying
const JWT_SECRET = '8f9a7b3c2d5e4f1a9b8c7d6e3f2a1b9c8d7e6f5a4b3c2d1e9f8a7b6c5d4e3f';

const verifyToken = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('No token provided or invalid format:', authHeader);
    return res.status(401).json({ message: 'No token provided or invalid format' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify token signature
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: false });
    console.log('Token signature verified. Decoded:', decoded);

    // Check if user exists
    const user = await User.findOne({ where: { name: decoded.userId } });
    if (!user) {
      console.warn(`User not found for userId: ${decoded.userId}`);
      return res.status(401).json({ message: `User not found: ${decoded.userId}` });
    }

    req.user = { name: user.name };
    console.log(`Token verified successfully for user: ${user.name}`);
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ message: 'Invalid token: ' + error.message });
  }
};

module.exports = verifyToken;