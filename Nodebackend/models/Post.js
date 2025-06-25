const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Post = sequelize.define('Post', {
  post_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  topic: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: 'Post',
  timestamps: false,
});

module.exports = Post;