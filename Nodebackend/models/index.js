const { sequelize } = require('../config/db');
const User = require('./User');
const Post = require('./Post');
const Likes = require('./Likes');
const Summaries = require('./Summaries');
const Website = require('./Website');
const BlogLinks = require('./BlogLinks');
const Summaries_BlogLinks = require('./Summaries_BlogLinks');
const PostLinks = require('./PostLinks');

// Log loaded models
console.log('Loaded models:', {
  User: !!User,
  Post: !!Post,
  Summaries: !!Summaries,
  Likes: !!Likes,
  Website: !!Website,
  BlogLinks: !!BlogLinks,
  Summaries_BlogLinks: !!Summaries_BlogLinks,
  PostLinks: !!PostLinks,
});

// Relationships
Post.belongsTo(User, { foreignKey: 'name' });
User.hasMany(Post, { foreignKey: 'name' });

Summaries.belongsTo(User, { foreignKey: 'name' });
User.hasMany(Summaries, { foreignKey: 'name' });

User.belongsToMany(Post, { through: Likes, foreignKey: 'name' });
Post.belongsToMany(User, { through: Likes, foreignKey: 'post_id' });

BlogLinks.belongsTo(Website, { foreignKey: 'websiteID' });
Website.hasMany(BlogLinks, { foreignKey: 'websiteID' });

Summaries.belongsToMany(BlogLinks, { through: Summaries_BlogLinks, foreignKey: 'summary_id' });
BlogLinks.belongsToMany(Summaries, { through: Summaries_BlogLinks, foreignKey: 'BlogLinkID' });

Post.hasMany(PostLinks, { foreignKey: 'post_id' });
PostLinks.belongsTo(Post, { foreignKey: 'post_id' });

module.exports = {
  sequelize,
  User,
  Post,
  Likes,
  Summaries,
  Website,
  BlogLinks,
  Summaries_BlogLinks,
  PostLinks,
};