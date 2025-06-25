
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PostLinks = sequelize.define('PostLinks', {
    post_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'Post',
        key: 'post_id',
      },
    },
    url: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
  }, {
    tableName: 'PostLinks',
    timestamps: false,
  });
  
  module.exports = PostLinks;