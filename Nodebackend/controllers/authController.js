
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Load JWT secret from .env or use default
const JWT_SECRET =  '8f9a7b3c2d5e4f1a9b8c7d6e3f2a1b9c8d7e6f5a4b3c2d1e9f8a7b6c5d4e3f';

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const payload = { userId: user.name }; // Use name as primary key
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // Return token and user data
    res.status(201).json({
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.name },
        JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Generated token:', token);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyUser = async (req, res) => {
  try {
    const user = await User.findOne({ where: { name: req.user.name } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Token is valid', user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { registerUser, loginUser, verifyUser };
