// This file defines the Post model for the database using Sequelize ORM.
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Website = sequelize.define('Website', {
  websiteID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  URL: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'Website',
  timestamps: false,
});

module.exports = Website;
