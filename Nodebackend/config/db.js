// This file is responsible for connecting to the MySQL database using Sequelize ORM.
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('simplify', 'root', 'Burhan4800@', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected');
    await sequelize.sync();
    console.log('Database synced');
  } catch (error) {
    console.error('MySQL connection or sync error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
