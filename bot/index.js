// Import necessary libraries
require('dotenv').config();
const { Telegraf } = require('telegraf');
const db =require('../data/database.js'); // Import the database connection

// Get the bot token from the environment variables
const botToken = process.env.BOT_TOKEN;

// Check if the bot token is provided
if (!botToken) {
  console.error('Error: BOT_TOKEN is not defined in the .env file.');
  process.exit(1);
}

// Create a new Telegraf bot instance
const bot = new Telegraf(botToken);

// The channel to check for membership
const requiredChannel = '@xcreatecode';

// Start command handler
bot.start(async (ctx) => {
  const { id: telegram_id, first_name, last_name, username } = ctx.from;

  try {
    // Save or update user information in the database
    db.run(
      `INSERT INTO users (telegram_id, first_name, last_name, username)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(telegram_id) DO UPDATE SET
         first_name = excluded.first_name,
         last_name = excluded.last_name,
         username = excluded.username`,
      [telegram_id, first_name, last_name, username]
    );

    // Check if the user is a member of the required channel
    const chatMember = await ctx.telegram.getChatMember(requiredChannel, telegram_id);
    const isMember = ['member', 'administrator', 'creator'].includes(chatMember.status);

    if (isMember) {
      // User is a member, welcome them and provide a link to the web app
      ctx.reply(
        'Selamat datang! Anda telah memenuhi syarat untuk membuat bot. ' +
        'Silakan kunjungi aplikasi web kami untuk mulai membuat dan mengelola bot Anda. ' +
        'Klik tombol di bawah ini untuk membuka aplikasi web.',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Buka Aplikasi Web', web_app: { url: process.env.WEB_APP_URL || 'http://localhost:5001' } }],
            ],
          },
        }
      );
    } else {
      // User is not a member, instruct them to join the channel
      ctx.reply(
        `Untuk menggunakan bot ini, Anda harus bergabung dengan saluran kami terlebih dahulu: ${requiredChannel}. ` +
        'Setelah bergabung, silakan coba lagi dengan mengirim /start.'
      );
    }
  } catch (error) {
    console.error('Error checking channel membership:', error);
    ctx.reply('Maaf, terjadi kesalahan saat memeriksa status keanggotaan Anda. Silakan coba lagi nanti.');
  }
});

// Launch the bot
bot.launch(() => {
  console.log('Bot is running...');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
