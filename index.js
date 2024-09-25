const express = require('express');
// const { User, Thread } = require('../API/models/assistion');
const { DataTypes } = require('sequelize');
const { User, Thread } = require('../API/models/assistion');

const cors = require('cors'); // Import CORS
const bodyParser = require('body-parser');
const { connectDB, sequelize } = require('../API/database/login');
const { chatWithAssistant } = require('./api');
const authRoutes = require('./routes/auth'); // Import your auth routes

const app = express();
const PORT = process.env.PORT || 5002;

// Enable CORS
app.use(cors());

// Init Middleware
app.use(express.json());
app.use(bodyParser.json());

// Connect Database
connectDB();

sequelize.sync({ }).then(() => {
    console.log('Database & tables created!');
});

// Define Auth Routes
app.use('/api/auth', authRoutes);

// Chat Route
app.post("/chat", async (req, res) => {
  try {
    const { content, userId, userEmail } = req.body;

    if (!content || !userId || !userEmail) {
      console.log("Missing required fields:", { content, userId, userEmail });
      return res.status(400).send("Content, userId, and userEmail are required.");
    }

    const response = await chatWithAssistant(content, userId, userEmail);
    console.log("Assistant response:", response);

    if (response) {
      res.status(200).json({ response });
    } else {
      console.log("Failed to get a valid response from assistant.");
      res.status(500).send("Failed to get a valid response.");
    }
  } catch (error) {
    console.error("Error in /chat route:", error.message);
    res.status(500).send("An error occurred while processing your request.");
  }
});
app.get('/getThreadContent/:user_email', async (req, res) => {
  const user_email = req.params.user_email.trim().toLowerCase(); // Normalize email

  try {
    const thread = await Thread.findOne({ where: { user_email: user_email } });
    console.log("Database query result:", thread);

    if (thread) {
      res.json({ thread_content: thread.thread_content });
    } else {
      console.warn(`Thread not found for email: ${user_email}`);
      res.status(404).json({ error: 'Thread not found' });
    }
  } catch (error) {
    console.error('Error retrieving thread content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
