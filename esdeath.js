//<editor-fold defaultstate="collapsed" desc="imports">
const {Client, Collection} = require('discord.js');
const fs = require('fs');
const Enmap = require('enmap');
const config = require("./config.json");
const colors = require("./colors.js");
const reactions = require('./reactions.json')
const log4js = require("log4js");
const Sequelize = require('sequelize');
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="variables">
const bot = new Client();
bot.commands = new Collection();
bot.aliases = new Collection();
bot.embedColors = new Collection();
bot.reactions = new Collection();
bot.testingFile = new Collection();

bot.categories = fs.readdirSync("./Esdeath.Core/commands/");
bot.embedColors = colors;
bot.reactions = reactions;
bot.testing = config.testing;
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="logger">
let debug = config.debug !== undefined && config.debug;

log4js.configure({
    appenders: {
        consoleLog: {
            type: "console"
        },
        fileLog: {
            type: "dateFile",
            filename: "logs/esdeath-log.log",
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
//</editor-fold>

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

//<editor-fold defaultstate="collapsed" desc="command loader">
fs.readdir('./Esdeath.Core/commands/', (err, dir) => {
    if (err) {
        logger.error(err);
        return;
    }

    dir.forEach(dir => {
        fs.readdir(`./Esdeath.Core/commands/${dir}`, async (err, files) => {
            if (err) {
                logger.error(err);
                return;
            }
            logger.info(`Loading category: '${dir}'`)
            files.forEach(file => {
                if (!file.endsWith('.js')) return;

                let props = require(`./Esdeath.Core/commands/${dir}/${file}`);
                let cmdName = props.name.toLowerCase();

                bot.commands.set(cmdName, props);
                logger.info(`Loaded command '${cmdName}'.`);

                //loading all the aliasses
                if (bot.commands.get(cmdName).aliases && Array.isArray(bot.commands.get(cmdName).aliases)) {
                    bot.commands.get(cmdName).aliases.forEach(alias => {
                        bot.aliases.set(alias, cmdName);
                        logger.info(`alias "${alias}" set for command "${cmdName}"`);
                    });
                }
            });
            logger.info(`Loaded category: '${dir}'\n`);
        });
    });
});
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="event loader">
fs.readdir('./Esdeath.Core/events/', (err, files) => {
    if (err) {
        logger.error(err);
        return;
    }

    files.forEach(file => {
        if (!file.endsWith('.js')) return;

        const evt = require(`./Esdeath.Core/events/${file}`);
        let evtName = file.split('.')[0];

        logger.info(`Loaded event '${evtName}'.`);
        bot.on(evtName, evt.bind(null, bot));
    });
    logger.info('All events loaded!\n');
});
//</editor-fold>

//set the testing error file
let props = require(`./Esdeath.Core/testing/testing.js`);
let testing = props.name.toLowerCase();

bot.testingFile.set(testing, props);
logger.info(`Loaded '${testing}'.`);

//bot connection to discord
bot.login(config.token)
    .then(bot => {
        logger.info('Logging in the bot');
    }).catch(err => {
        logger.error(err)
    }
);

/*
TODO: delete voice-, text, categorychannel
TODO: Make all moderation commands
 */