
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING(50), // Match simplify.sql's username length
    primaryKey: true, // Make name the primary key
  },
  email: {
    type: DataTypes.STRING(100), // Match simplify.sql
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255), // Match simplify.sql
    allowNull: false,
  },
}, {
  tableName: 'User', // Match simplify.sql
  timestamps: false, // Avoid createdAt/updatedAt
});

module.exports = User;