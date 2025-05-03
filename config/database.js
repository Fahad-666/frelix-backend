const { Sequelize } = require('sequelize');

{/*const DB_USERNAME = 'root';
const DB_HOST = 'mysql.railway.internal';
const DB_PORT = '3306';
const DB_NAME = 'railway';
const DB_PASSWORD = 'CfCtjJwSbmaUBguXxaRzNUveQqAIFKTh';*/}
const DB_URL = 'mysql://root:CfCtjJwSbmaUBguXxaRzNUveQqAIFKTh@interchange.proxy.rlwy.net:12936/railway';

const sequelize = new Sequelize(DB_URL, {
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;