const { Telegraf, Markup } = require('telegraf');
const db = require('./data/database.js');

const runningBots = new Map();

/**
 * Sets up message handlers for a bot based on configured replies.
 * @param {Telegraf} bot The Telegraf instance.
 * @param {number} botId The ID of the bot.
 */
const setupHandlers = (bot, botId) => {
    const query = `
        SELECT r.id, r.keyword, r.reply_text, b.text as button_text, b.url as button_url
        FROM replies r
        LEFT JOIN buttons b ON r.id = b.reply_id
        WHERE r.bot_id = ?
    `;

    db.all(query, [botId], (err, rows) => {
        if (err) {
            console.error(`[BotRunner] Error fetching replies for bot ${botId}:`, err);
            return;
        }

        const repliesMap = new Map();
        for (const row of rows) {
            const keyword = row.keyword.toLowerCase();
            if (!repliesMap.has(keyword)) {
                repliesMap.set(keyword, {
                    text: row.reply_text,
                    buttons: []
                });
            }
            if (row.button_text && row.button_url) {
                repliesMap.get(keyword).buttons.push({
                    text: row.button_text,
                    url: row.button_url
                });
            }
        }

        bot.on('text', async (ctx) => {
            const reply = repliesMap.get(ctx.message.text.toLowerCase());
            if (reply) {
                const extra = reply.buttons.length > 0
                    ? Markup.inlineKeyboard(
                        reply.buttons.map(btn => Markup.button.url(btn.text, btn.url))
                      )
                    : {};
                await ctx.reply(reply.text, extra);
            }
        });

        bot.start((ctx) => ctx.reply('Bot is running.'));
    });
};

/**
 * Starts a single bot instance.
 * @param {object} botData The bot data from the database.
 */
const startBot = (botData) => {
    if (!botData || !botData.bot_token) {
        console.error(`[BotRunner] Invalid bot data provided for bot ID ${botData.id}.`);
        return;
    }
    if (runningBots.has(botData.id)) return;

    console.log(`[BotRunner] Starting bot ${botData.id}...`);
    const bot = new Telegraf(botData.bot_token);
    setupHandlers(bot, botData.id);
    bot.launch();
    runningBots.set(botData.id, bot);
};

/**
 * Stops a single bot instance.
 * @param {number} botId The ID of the bot to stop.
 */
const stopBot = (botId) => {
    if (runningBots.has(botId)) {
        console.log(`[BotRunner] Stopping bot ${botId}...`);
        runningBots.get(botId).stop('SIGTERM');
        runningBots.delete(botId);
    }
};

/**
 * Initializes all active bots from the database on startup.
 */
const initializeBots = () => {
    console.log('[BotRunner] Initializing active bots...');
    db.all('SELECT * FROM bots WHERE is_active = 1', [], (err, activeBots) => {
        if (err) {
            console.error('[BotRunner] Failed to fetch active bots:', err);
            return;
        }
        activeBots.forEach(startBot);
    });
};

module.exports = { initializeBots, startBot, stopBot };
