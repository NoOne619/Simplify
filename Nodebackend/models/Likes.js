
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Likes = sequelize.define('Likes', {
  name: { // Changed from username
    type: DataTypes.STRING(50),
    primaryKey: true,
  },
  post_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  Like_Date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Likes',
  timestamps: false,
});

module.exports = Likes;
