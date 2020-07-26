const Discord = require('Discord.js')
const fs = require('fs')
const Enmap = require('enmap')
const client = new Discord.Client()
require('dotenv-flow').config()

const config = {
    token: process.env.token,
    prefix: process.env.prefix
}

const prefix = config.prefix

client.commands = new Enmap()

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)

    client.user.setActivity("YouTube", {type: "WATCHING"})
})

client.on('message', (message) => {
    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ + /g)
    const command = args.shift().toLowerCase()

    const cmd = client.commands.get(command)
    if(!cmd) return;

    cmd.run(client, message, args)

    /*console.log(args)

    switch (command) {
        case 'ping': {
            message.channel.send('pong!');
            break;
        }
        case 'say': {
            const response = args.join(' ');
            message.channel.send(response);
            break;
        }
        default:
            message.channel.send('Command not found')
            break;
    }*/
})

fs.readdir('./Esdeath.Core/commands/', async (err, files) => {
    if(err) return console.error();
    files.forEach(file => {
        if(!file.endsWith('.js')) return
        let props = require(`./Esdeath.Core/commands/${file}`)
        let cmdName = file.split('.')[0];
        console.log(`Loaded command ${cmdName}.`)
        client.commands.set(cmdName, props)
    })
})

client.login(config.token)