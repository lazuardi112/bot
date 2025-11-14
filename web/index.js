// Import necessary libraries
const express = require('express');
const path = require('path');
const db = require('../data/database.js'); // Import the database connection
const { initializeBots, startBot, stopBot } = require('../bot_runner.js');

// Create a new Express app
const app = express();
const port = process.env.PORT || 5001;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---

// GET /api/bots - Get all bots for a user
app.get('/api/bots', (req, res) => {
  // TODO: Replace with actual user ID from session/auth
  const userId = 1;
  db.all('SELECT id, bot_username, is_active FROM bots WHERE user_id = ?', [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ bots: rows });
  });
});

// POST /api/bots - Add a new bot
app.post('/api/bots', (req, res) => {
  const { botToken } = req.body;
  if (!botToken) {
    return res.status(400).json({ error: 'Bot token is required' });
  }

  // TODO: Add logic to verify the bot token with Telegram API
  // For now, we'll just add it to the database with a placeholder username
  const botUsername = 'Pending...';
  const userId = 1; // TODO: Replace with actual user ID

  db.run('INSERT INTO bots (user_id, bot_token, bot_username) VALUES (?, ?, ?)', [userId, botToken, botUsername], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, bot_username: botUsername, is_active: 0 });
  });
});

// PUT /api/bots/:id/toggle - Toggle bot status (on/off)
app.put('/api/bots/:id/toggle', (req, res) => {
  const botId = parseInt(req.params.id, 10);
  db.get('SELECT * FROM bots WHERE id = ?', [botId], (err, bot) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const newStatus = !bot.is_active;
    db.run('UPDATE bots SET is_active = ? WHERE id = ?', [newStatus, botId], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        if (newStatus) {
            startBot(bot);
        } else {
            stopBot(botId);
        }
        res.sendStatus(200);
    });
  });
});

// DELETE /api/bots/:id - Delete a bot
app.delete('/api/bots/:id', (req, res) => {
    const botId = parseInt(req.params.id, 10);
    stopBot(botId); // Stop the bot if it's running
    db.run('DELETE FROM bots WHERE id = ?', [botId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.sendStatus(204);
    });
});

// --- Reply Management API Routes ---
app.get('/api/bots/:bot_id/replies', (req, res) => {
    const { bot_id } = req.params;
    db.all('SELECT * FROM replies WHERE bot_id = ?', [bot_id], (err, replies) => {
        if (err) return res.status(500).json({ error: err.message });

        const promises = replies.map(reply =>
            new Promise((resolve, reject) => {
                db.all('SELECT * FROM buttons WHERE reply_id = ?', [reply.id], (err, buttons) => {
                    if (err) return reject(err);
                    reply.buttons = buttons;
                    resolve(reply);
                });
            })
        );

        Promise.all(promises)
            .then(results => res.json({ replies: results }))
            .catch(error => res.status(500).json({ error: error.message }));
    });
});
app.post('/api/bots/:bot_id/replies', (req, res) => {
    const { bot_id } = req.params;
    const { keyword, replyText, buttons = [] } = req.body;

    if (!keyword || !replyText) {
        return res.status(400).json({ error: 'Keyword and reply text are required.' });
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION;');
        const stmt = db.prepare('INSERT INTO replies (bot_id, keyword, reply_text) VALUES (?, ?, ?)');
        stmt.run(bot_id, keyword, replyText, function(err) {
            if (err) {
                db.run('ROLLBACK;');
                return res.status(500).json({ error: err.message });
            }
            const replyId = this.lastID;
            const buttonStmt = db.prepare('INSERT INTO buttons (reply_id, text, url) VALUES (?, ?, ?)');
            buttons.forEach(btn => {
                buttonStmt.run(replyId, btn.text, btn.url);
            });

            buttonStmt.finalize(err => {
                if (err) {
                    db.run('ROLLBACK;');
                    return res.status(500).json({ error: err.message });
                }
                db.run('COMMIT;');
                res.status(201).json({ id: replyId, keyword, reply_text: replyText, buttons });
            });
        });
        stmt.finalize();
    });
});
app.delete('/api/replies/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM replies WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.sendStatus(204);
    });
});
// --- End of API Routes ---


// Start the server
app.listen(port, () => {
  console.log(`Web app is running on http://localhost:${port}`);
  initializeBots();
});
