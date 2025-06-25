// This file defines the Summaries_BlogLinks model for the Sequelize ORM.
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Summaries_BlogLinks = sequelize.define('Summaries_BlogLinks', {
  summary_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  BlogLinkID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  tableName: 'Summaries_BlogLinks',
  timestamps: false,
});

module.exports = Summaries_BlogLinks;