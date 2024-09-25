// models/associations.js
const User = require('./user'); // Ensure this path is correct
const Thread = require('./threads_table'); // Ensure this path is correct

// Define associations
User.hasMany(Thread, { foreignKey: 'user_id', as: 'threads' }); // Use a different alias, e.g., 'threads'
Thread.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { User, Thread };
