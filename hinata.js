const {Client, Collection} = require('discord.js');
const fs = require('fs');
const config = require("./config.json");
const colors = require("./Hinata.Core/misc/colors.json");
const reactions = require('./Hinata.Core/misc/reactions.json')
const log4js = require('log4js');
const topgg = require('@top-gg/sdk');

const bot = new Client();
bot.commands = new Collection();
bot.aliases = new Collection();
bot.embedColors = new Collection();
bot.reactions = new Collection();
bot.testingEmbed = new Collection();
bot.subreddits = [];

bot.categories = fs.readdirSync("./Hinata.Core/commands/");
bot.embedColors = colors;
bot.reactions = reactions;
bot.testing = config.testing;
bot.currencyEmoji = config.currencyEmoji;

let debug = config.debug !== undefined && config.debug;

log4js.configure({
    appenders: {
        consoleLog: {
            type: "console"
        },
        fileLog: {
            type: "dateFile",
            filename: "logs/Hinata-log.log",
            pattern: "-yyyy-MM-dd",
            keepFileExt: true
        }
    },
    categories: {
        default: {
            appenders: ["consoleLog", "fileLog"],
            level: debug ? "debug" : "info"
        }
    }
});

const logger = log4js.getLogger();

//load commands
fs.readdir('./Hinata.Core/commands/', (err, dir) => {
    if (err) {
        logger.error(err);
        return;
    }

    dir.forEach(dir => {
        fs.readdir(`./Hinata.Core/commands/${dir}`, async (err, files) => {
            if (err) {
                logger.error(err);
                return;
            }
            logger.info(`Loading category: '${dir}'`)
            files.forEach(file => {
                if (!file.endsWith('.js')) return;

                let props = require(`./Hinata.Core/commands/${dir}/${file}`);
                let cmdName = props.name.toLowerCase();

                bot.commands.set(cmdName, props);
                logger.info(`Loaded command '${cmdName}'.`);

                //loading all the aliasses
                if (bot.commands.get(cmdName).aliases && Array.isArray(bot.commands.get(cmdName).aliases)) {
                    bot.commands.get(cmdName).aliases.forEach(alias => {
                        bot.aliases.set(alias, cmdName);
                    });
                }
            });
            logger.info(`Loaded category: '${dir}'\n`);
        });
    });
});

//load events used by discord
fs.readdir('./Hinata.Core/events', (err, files) => {
    if (err) {
        logger.error(err);
        return;
    }

    files.forEach(file => {
        if (!file.endsWith('.js')) return;

        const evt = require(`./Hinata.Core/events/${file}`);
        let evtName = file.split('.')[0];

        logger.info(`Loaded event '${evtName}'.`);
        bot.on(evtName, evt.bind(null, bot));
    });
    logger.info('All discord events loaded!\n');
});

//bot connection to discord
bot.login(config.token)
    .then(bot => {
        logger.info('Logging in the bot');
    }).catch(err => {
        logger.error(err)
    });

//error handling
process.on('unhandledRejection', error => {
    if (error.message === 'Missing Access')
        return;

    logger.error(error);
});

process.on('DiscordAPIError', error => {
    const messages = ['Cannot send an empty message', 'Missing Permissions'];

    if (messages.includes(error.message))
        return;

    logger.error(error);
    logger.error(error.message)
})