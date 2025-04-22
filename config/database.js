const { Sequelize } = require('sequelize');

const DB_USERNAME = 'superb-dream-457615-r0:us-central1:frelix';
const DB_HOST = '104.154.245.120';
const DB_PORT = '3306';
const DB_NAME = 'frelix';
const DB_PASSWORD = 'Fahad@2008';

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
