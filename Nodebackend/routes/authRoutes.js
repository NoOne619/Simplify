const express = require('express');
const router = express.Router();
const { registerUser, loginUser,verifyUser } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify', verifyToken, verifyUser);


module.exports = router;
