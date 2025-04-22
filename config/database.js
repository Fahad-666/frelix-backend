const { Sequelize } = require('sequelize');

const DB_USERNAME = 'root';
const DB_HOST = '127.0.0.1';
const DB_PORT = '3306';
const DB_NAME = 'frelix';

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
