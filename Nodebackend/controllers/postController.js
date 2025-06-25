  const { Post, Likes, PostLinks } = require('../models');
  const jwt = require('jsonwebtoken');
  const { Op } = require('sequelize');

  // Create a new post with URLs
  const createPost = async (req, res) => {
    const { content, topic, urls } = req.body;
    const userName = req.user.name;

    if (!content || !topic) {
      return res.status(400).json({ message: 'Content and topic are required' });
    }

    if (!Array.isArray(urls)) {
      return res.status(400).json({ message: 'URLs must be an array' });
    }

    try {
      const post = await Post.create({
        content,
        topic,
        name: userName,
        created_at: new Date(),
      });

      // Create PostLinks entries
      const linkPromises = urls.map(url =>
        PostLinks.create({
          post_id: post.post_id,
          url,
        })
      );
      const createdLinks = await Promise.all(linkPromises);

      res.status(201).json({
        post_id: post.post_id,
        topic,
        content,
        name: userName,
        created_at: post.created_at,
        urls: createdLinks.map(link => ({ url: link.url })),
      });
    } catch (error) {
      console.error('Share Post Error:', error);
      res.status(500).json({ message: 'Failed to share post' });
    }
  };

  // Like or unlike a post
  const toggleLike = async (req, res) => {
    const { postId } = req.params;
    const userName = req.user.name;

    try {
      // Check if post exists
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Check if user already liked
      const existingLike = await Likes.findOne({
        where: { name: userName, post_id: postId },
      });

      let isLiked;
      if (existingLike) {
        // Unlike: Remove like
        await existingLike.destroy();
        isLiked = false;
      } else {
        // Like: Add like
        await Likes.create({
          name: userName,
          post_id: postId,
          Like_Date: new Date(),
        });
        isLiked = true;
      }

      // Count total likes
      const likesCount = await Likes.count({ where: { post_id: postId } });

      res.status(200).json({
        postId,
        likes: likesCount,
        isLiked,
      });
    } catch (error) {
      console.error('Like Post Error:', error);
      res.status(500).json({ message: 'Failed to update like' });
    }
  };

  // Get community feed posts
  const getFeedPosts = async (req, res) => {
    try {
      const posts = await Post.findAll({
        order: [['created_at', 'DESC']],
        include: [{ model: PostLinks, attributes: ['url'] }],
      });

      const userName = req.headers.authorization
        ? jwt.verify(req.headers.authorization.split(' ')[1], 'your_jwt_secret', (err, decoded) => {
            if (err) return null;
            return decoded.name;
          })
        : null;

      const feedPosts = await Promise.all(
        posts.map(async (post) => {
          const likesCount = await Likes.count({ where: { post_id: post.post_id } });
          const isLiked = userName
            ? !!(await Likes.findOne({ where: { name: userName, post_id: post.post_id } }))
            : false;

          return {
            id: post.post_id.toString(),
            topic: post.topic,
            summary: post.content,
            sources: post.PostLinks.map(link => ({
              title: link.url, // Use URL as title
              url: link.url,
              website: new URL(link.url).hostname, // Derive website from URL
            })),
            user: {
              name: post.name,
              avatar: post.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(), // e.g., "Abdullah Mehmood" -> "AM"
            },
            likes: likesCount,
            createdAt: post.created_at.toISOString(),
            isLiked,
          };
        })
      );

      res.status(200).json(feedPosts);
    } catch (error) {
      console.error('Get Feed Posts Error:', error);
      res.status(500).json({ message: 'Failed to fetch feed posts' });
    }
  };

  // Get logged-in user's posts
  const getUserPosts = async (req, res) => {
    try {
      const userName = req.user.name;

      const posts = await Post.findAll({
        where: { name: userName },
        order: [['created_at', 'DESC']],
        include: [{ model: PostLinks, attributes: ['url'] }],
      });

      const feedPosts = await Promise.all(
        posts.map(async (post) => {
          const likesCount = await Likes.count({ where: { post_id: post.post_id } });
          const isLiked = !!(await Likes.findOne({ where: { name: userName, post_id: post.post_id } }));

          return {
            id: post.post_id.toString(),
            topic: post.topic,
            summary: post.content,
            sources: post.PostLinks.map(link => ({
              title: link.url, // Use URL as title
              url: link.url,
              website: new URL(link.url).hostname, // Derive website from URL
            })),
            user: {
              name: post.name,
              avatar: post.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(), // e.g., "Abdullah Mehmood" -> "AM"
            },
            likes: likesCount,
            createdAt: post.created_at.toISOString(),
            isLiked,
          };
        })
      );

      res.status(200).json(feedPosts);
    } catch (error) {
      console.error('Get User Posts Error:', error);
      res.status(500).json({ message: 'Failed to fetch user posts' });
    }
  };
  const deletePost = async (req, res) => {
    const { postId } = req.params; // Get postId from URL parameters
    const userName = req.user.name; // Get authenticated user's name
  
    try {
      // Find the post by ID and ensure it belongs to the user
      const post = await Post.findOne({
        where: {
          post_id: postId,
          name: userName,
        },
      });
  
      if (!post) {
        return res.status(404).json({
          message: "Post not found or you do not have permission to delete it.",
        });
      }
  
      // Delete associated Likes
      await Likes.destroy({
        where: {
          post_id: postId,
        },
      });
  
      // Delete associated PostLinks
      await PostLinks.destroy({
        where: {
          post_id: postId,
        },
      });
  
      // Delete the post
      await Post.destroy({
        where: {
          post_id: postId,
        },
      });
  
      res.status(200).json({
        message: "Post and associated data deleted successfully",
        post_id: postId,
      });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ message: "Server error: " + error.message });
    }
  };
  
  module.exports = {
    createPost,
    toggleLike,
    getFeedPosts,
    getUserPosts,
    deletePost,
  };