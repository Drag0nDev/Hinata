const { Client } = require('discord.js');
const fs = require('fs');
const Enmap = require('enmap');
require('dotenv-flow').config()

const bot = new Client();
bot.commands = new Enmap();

//get token from .env
const config = {
    token: process.env.TOKEN
}

bot.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

//command loader
fs.readdir('./Esdeath.Core/commands/', async (err, files) => {
    if(err) return console.error;
    files.forEach(file => {
        if(!file.endsWith('.js')) return;
        let props = require(`./Esdeath.Core/commands/${file}`);
        let cmdName = file.split('.')[0];
        console.log(`Loaded command '${cmdName}'.`);
        bot.commands.set(cmdName, props);
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
bot.login(config.token.toString());