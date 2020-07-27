const { Client } = require('discord.js');
const fs = require('fs');
const Enmap = require('Enmap');
require('dotenv-flow').config();

const client = new Client();
client.commands = new Enmap();

//command loader
fs.readdir('./Esdeath.Core/commands/', async (err, files) => {
    if(err) return console.error;
    files.forEach(file => {
        if(!file.endsWith('.js')) return;
        let props = require(`./Esdeath.Core/commands/${file}`);
        let cmdName = file.split('.')[0];
        console.log(`Loaded command ${cmdName}.`);
        client.commands.set(cmdName, props);
    });
});

//event loader
fs.readdir('./Esdeath.Core/events/', (err, files) => {
   if(err)return console.error;
    files.forEach(file => {
        if(!file.endsWith('.js')) return;
        const evt = require(`./Esdeath.Core/events/${file}`);
        let  evtName = file.split('.')[0];
        console.log(`Loaded command ${evtName}.`);
        client.on(evtName, evt.bind(null, client));
    });
});

client.login();