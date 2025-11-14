// Import necessary libraries
const sqlite3 = require('sqlite3').verbose();

// Create a new database connection
const db = new sqlite3.Database('./data/bots.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create the tables if they don't exist
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      telegram_id INTEGER UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      username TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bots table
  db.run(`
    CREATE TABLE IF NOT EXISTS bots (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      bot_token TEXT UNIQUE NOT NULL,
      bot_username TEXT,
      is_active BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY,
      bot_id INTEGER NOT NULL,
      chat_id INTEGER NOT NULL,
      message_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bot_id) REFERENCES bots (id)
    )
  `);

  // Replies table
  db.run(`
    CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY,
      bot_id INTEGER NOT NULL,
      keyword TEXT NOT NULL,
      reply_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bot_id) REFERENCES bots (id)
    )
  `);

  // Buttons table
  db.run(`
      CREATE TABLE IF NOT EXISTS buttons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reply_id INTEGER NOT NULL,
          text TEXT NOT NULL,
          url TEXT NOT NULL,
          FOREIGN KEY (reply_id) REFERENCES replies(id) ON DELETE CASCADE
      );
  `);

});

// Export the database connection
module.exports = db;
