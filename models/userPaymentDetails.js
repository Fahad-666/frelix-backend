const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

const UserPaymentDetails = sequelize.define('UserPaymentDetails', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  accountHolderName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  bankName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  cooldownUntil: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'user_payment_details',
  timestamps: false,
});

User.hasMany(UserPaymentDetails, { foreignKey: 'userId' });
UserPaymentDetails.belongsTo(User, { foreignKey: 'userId' });

module.exports = UserPaymentDetails;
