const express = require('express');
const router = express.Router();
const { createPost, toggleLike, getFeedPosts,getUserPosts,deletePost } = require('../controllers/postController');
const verifyToken = require('../middleware/authMiddleware');


router.post('/', verifyToken, createPost);
router.post('/:postId/like', verifyToken, toggleLike);
router.get('/feed', getFeedPosts);
router.get('/user', verifyToken, getUserPosts);
router.delete('/:postId', verifyToken, deletePost); // New DELETE route

module.exports = router;
