const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/login'); // Ensure this path is correct

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isConfirmed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // Default value as false for unconfirmed accounts
  },
}, {
  timestamps: true,
});

module.exports = User;
