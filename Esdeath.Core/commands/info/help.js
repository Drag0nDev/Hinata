const {MessageEmbed} = require('discord.js');
const config = require("../../../config.json");

module.exports = {
    name: 'help',
    aliases: ['h'],
    category: 'info',
    description: 'A function to show all commands',
    usage: '[command | alias]',
    run: (bot, message, args) => {
        if(args[0])
            return getCmd(bot, message, args[0]);
        else
            return getAll(bot, message);
    }
}

function getAll(bot, message){
    const commands = (category) => {
        return bot.commands
            .filter(cmd => cmd.category === category)
            .map(cmd => `${cmd.name}`)
            .join("\n");
    }

    //embed creation
    const embed = new MessageEmbed()
        .setColor('#85C1E9')
        .setTitle('Help')
        .setURL('https://discord.gg/ReBJ4AB')
        .setThumbnail('https://i.imgur.com/SgO68RV.png')
        .setTimestamp()
        .setFooter(`For more help type esdeath help [command]`);

    bot.categories.forEach(cat => {
        if(message.member.id !== config.OWNER && cat === 'owner')
            return;
        const _name = cat;
        const _value = commands(cat);
        embed.addField(_name, _value, true);
    });

    return message.channel.send(embed);
}

function getCmd(bot, message, input){
    const embed = new MessageEmbed();
    //info string default is the error message
    let info = `No information is found for command **${input.toLowerCase()}**`;

    //look for command
    let cmd = bot.commands.get(input.toLowerCase());
    if (!cmd) cmd = bot.commands.get(bot.aliases.get(input.toLowerCase()));

    //check if command exists
    if(!cmd){
        embed.setColor('#ff0000')
            .setTitle('No command found')
            .setDescription(info)
            .setTimestamp()
            .setFooter('Maybe you typed it wrong?');

        return message.channel.send(embed);
    }

    embed.setColor('#85C1E9').setTimestamp();

    //add all cmd info
    if(cmd.name){
        embed.setTitle(cmd.name);
        embed.addField(`Command name:`, cmd.name, false);
    }
    if(cmd.aliases)
        embed.addField('Aliases:', cmd.aliases.map(a => `\`${a}\``).join(", "), false);
    if (cmd.description)
        embed.addField('Description:', cmd.description, false);
    if(cmd.usage){
        embed.addField('Usage:', cmd.usage, false);
        embed.setFooter(`Syntax: [] = required, <> = optional`);
    }

    return message.channel.send(embed);
}