// Import necessary libraries
const express = require('express');
const path = require('path');
const db = require('../data/database.js'); // Import the database connection

// Create a new Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---

// Example API route to get all users
app.get('/api/users', (req, res) => {
  db.all('SELECT id, telegram_id, username FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ users: rows });
  });
});

// Add more API routes here for managing bots, messages, etc.

// --- End of API Routes ---


// Start the server
app.listen(port, () => {
  console.log(`Web app is running on http://localhost:${port}`);
});
