
// This file defines the Post model for the database using Sequelize ORM.
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Summaries = sequelize.define('Summaries', {
    summary_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      topic: {
        type: DataTypes.STRING(100),
        allowNull: true, // Optional, can be null if not provided
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
      tableName: 'Summaries',
      timestamps: false,
    });
  


module.exports = Summaries;
