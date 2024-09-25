// models/thread.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/login'); // Ensure this path is correct
const User = require('./user'); // Ensure this path is correct

const Thread = sequelize.define('Thread_manager', {
  thread_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  user_email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thread_content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});



module.exports = Thread;
