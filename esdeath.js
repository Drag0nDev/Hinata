//imports
const { Client, MessageEmbed, Collection } = require('discord.js');
const fs = require('fs');
const Enmap = require('enmap');
const config = require("./config.json");
var log = require('node-schedule');

//variables
const bot = new Client();
bot.commands = new Collection();
bot.categories = fs.readdirSync("./Esdeath.Core/commands/");

//New log file at 12AM
var start = log.scheduleJob('0 0 0 * * *', function () {
    let date = new Date();
    fs.writeFile(`./logs/esdeathlog-${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.txt`, '', function (err) {
        if (err) throw err;
        else {
            console.log(`Log file for ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} created successfully.\n`);
        }
    });
});

//command loader
fs.readdir('./Esdeath.Core/commands/', async (err, dir) => {
    if(err) return console.error;
    dir.forEach(dir => {
        fs.readdir(`./Esdeath.Core/commands/${dir}`, async (err, files) => {
            if(err) return console.error;
            files.forEach(file => {
                if(!file.endsWith('.js')) return;
                let props = require(`./Esdeath.Core/commands/${dir}/${file}`);
                let cmdName = file.split('.')[0];
                console.log(`Loaded command '${cmdName}'.`);
                bot.commands.set(cmdName, props);
            });
        });
    });
});

//event loader
fs.readdir('./Esdeath.Core/events/', (err, files) => {
    if(err)return console.error;
    files.forEach(file => {
        if(!file.endsWith('.js')) return;
        const evt = require(`./Esdeath.Core/events/${file}`);
        let  evtName = file.split('.')[0];
        console.log(`Loaded event '${evtName}'.`);
        bot.on(evtName, evt.bind(null, bot));
    });
});

//bot connection to discord
bot.login(config.TOKEN);
