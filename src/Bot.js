const config = require('../config.json');
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const autoeat = require('mineflayer-auto-eat');
const bloodhoundPlugin = require('mineflayer-bloodhound')(mineflayer);
const mineflayerViewer = require('prismarine-viewer').mineflayer;
const { logToFile } = require('../index');
const { registerBot, loginBot } = require('./Login');

function startBot()
{
    if (config.debug) log(`<src/Bot.js> starting bot`);
    logToFile('<src/Bot.js> Starting bot', dir);
    return new Promise((resolve, reject) =>
    {
        const bot = mineflayer.createBot({
            host: config.server.host,
            port: config.server.port ? config.server.port: 25565,
            username: config.afkbot.username ? config.afkbot.username: 'AFKBot',
            password: config.afkbot.password ? config.afkbot.password: null,
            auth: config.afkbot['auth-method'] ? config.afkbot['auth-method']: 'mojang',
        });

        bot.on('error', (err) => reject(err));
        bot.on('kicked', (reason) => reject(reason));

        bot.once('spawn', () =>
        {
            logToFile('<src/Bot.js> Bot spawned', dir);
            const mcData = require('minecraft-data')(bot.version);
            bot.loadPlugin(pathfinder);
            bot.loadPlugin(pvp);
            bot.loadPlugin(autoeat);
            bot.loadPlugin(bloodhoundPlugin);

            const defaultMove = new Movements(bot, mcData);
            bot.pathfinder.setMovements(defaultMove);
            bot.pathfinder.movements.maxDropDown = config.pathfind['max-dropdown-blocks'];
            bot.pvp.followRange = 10000;
            bot.pvp.attackRange = 5;
            bot.bloodhound.yaw_correlation_enabled = true;

            bot.chatAddPattern(/(register)/ig, 'registerPattern', 'On register');
            bot.chatAddPattern(/(login)/ig, 'loginPattern', 'On login');

            bot.on('registerPattern', registerBot);
            bot.on('loginPattern', loginBot);

            module.exports = {
                bot,
                mcData,
                goals,
                mineflayerViewer,
                startBot
            };

            logToFile('<src/Bot.js> Initializing BotFunctions', dir);
            const { startBotFunctions } = require('./BotFunctions');
            startBotFunctions();
            return resolve(bot);
        });
    });
};

module.exports = {
    startBot
};