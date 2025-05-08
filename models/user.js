const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  created_at: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  accountHolderName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  bankName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  accountNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },
}, {
  tableName: 'users',
  timestamps: false,
});

module.exports = User;
