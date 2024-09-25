// app.js
const { sequelize } = require('./database/login'); // Ensure this path is correct
// const { User, Thread } = require('./models/assistion'); // Import models with associations

async function syncDatabase() {
  try {
    await sequelize.sync({ force: false }); // Sync models with the database
    console.log('Database & tables created!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

syncDatabase();
