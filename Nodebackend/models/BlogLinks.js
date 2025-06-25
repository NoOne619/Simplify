// This file defines the BlogLinks model for the database using Sequelize ORM.
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BlogLinks = sequelize.define('BlogLinks', {
  BlogLinkID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  URL: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  websiteID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'BlogLinks',
  timestamps: false,
});

module.exports = BlogLinks;
