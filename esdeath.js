//imports
const { Client, MessageEmbed, Collection } = require('discord.js');
const fs = require('fs');
const Enmap = require('enmap');
const config = require("./config.json");
const log4js = require("log4js");

//variables
const bot = new Client();
bot.commands = new Collection();
bot.aliases = new Collection();

bot.categories = fs.readdirSync("./Esdeath.Core/commands/");

let debug = config.DEBUG !== undefined && config.DEBUG;

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

const logger = log4js.getLogger()

//command loader
fs.readdir('./Esdeath.Core/commands/', (err, dir) => {
    if(err) {
        logger.error(err);
        return;
    }

    dir.forEach(dir => {
        fs.readdir(`./Esdeath.Core/commands/${dir}`, async (err, files) => {
            if(err) {
                logger.error(err);
                return;
            }

            files.forEach(file => {
                if(!file.endsWith('.js')) return;

                let props = require(`./Esdeath.Core/commands/${dir}/${file}`);
                let cmdName = file.split('.')[0];

                logger.debug(`Loaded command '${cmdName}'.`);
                bot.commands.set(cmdName, props);
            });
        });
    });
});

//event loader
fs.readdir('./Esdeath.Core/events/', (err, files) => {
    if(err) {
        logger.error(err);
        return;
    }

    files.forEach(file => {
        if(!file.endsWith('.js')) return;

        const evt = require(`./Esdeath.Core/events/${file}`);
        let  evtName = file.split('.')[0];

        logger.debug(`Loaded event '${evtName}'.`);
        bot.on(evtName, evt.bind(null, bot));
    });
});

//set aliases
fs.readdir('./Esdeath.Core/commands/',  (err, dir) => {
    if(err) {
        logger.error(err);
        return;
    }

    dir.forEach(dir => {
        fs.readdir(`./Esdeath.Core/commands/${dir}`, async (err, files) => {
            if(err) {
                logger.error(err);
                return;
            }

            files.forEach(file => {
                if(!file.endsWith('.js')) return;

                let cmdName = file.split('.')[0];

                if(bot.commands.get(cmdName).aliases && Array.isArray(bot.commands.get(cmdName).aliases)){
                    bot.commands.get(cmdName).aliases.forEach(alias => {
                        bot.aliases.set(alias, cmdName);
                        logger.debug(`alias "${alias}" set for command "${cmdName}"`);
                    });
                }
            });
        });
    });
});

//bot connection to discord
bot.login(config.TOKEN);
