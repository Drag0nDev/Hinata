const {MessageEmbed} = require('discord.js');
const config = require("../../../config.json");
const AsciiTable = require('ascii-table');

module.exports = {
    name: 'help',
    aliases: ['h'],
    category: 'info',
    description: 'A function to show one of the following:\n' +
        '- All commands and categories.\n' +
        '- A category with all its commands and explanation of the command.\n' +
        '- A command and all the info of the command',
    usage: '[command | alias] <categoryname/commandname>',
    run: async (bot, message, args) => {
        const embed = new MessageEmbed();

        if (args[0]) {
            //info string default is the error message
            let info = `No information is found for command/category **${args[0].toLowerCase()}**`;
            //look for category
            let cat = bot.categories.includes(args.join(' ').toLowerCase());
            let catVal = args.join(' ').toLowerCase();

            //look for command
            let cmd = bot.commands.get(args[0].toLowerCase());
            if (!cmd) cmd = bot.commands.get(bot.aliases.get(args[0].toLowerCase()));

            if (cmd)
                return await getCmd(bot, message, cmd);
            if (cat)
                return await getCat(bot, message, catVal);
            else {
                embed.setColor(bot.embedColors.error)
                    .setTitle('No command found')
                    .setDescription(info)
                    .setTimestamp()
                    .setFooter('Maybe you typed it wrong?');

                return message.channel.send(embed);
            }
        }
        else
            return await getAll(bot, message);
    }
}

function getAll(bot, message) {
    const commands = (category) => {
        return bot.commands
            .filter(cmd => cmd.category === category)
            .map(cmd => `${cmd.name}`)
            .join("\n");
    }

    //embed creation
    const embed = new MessageEmbed()
        .setColor(bot.embedColors.normal)
        .setTitle('Help')
        .setURL('https://discord.gg/ReBJ4AB')
        .setThumbnail(bot.user.avatarURL())
        .setTimestamp()
        .setFooter(`For more help type esdeath help [command]`);

    bot.categories.forEach(cat => {
        if (message.member.id !== config.owner && cat === 'owner')
            return;
        const _name = cat;
        const _value = commands(cat);
        embed.addField(`__${_name}__`, `${_value}`, true);
    });

    return message.channel.send(embed);
}

function getCmd(bot, message, input) {
    const embed = new MessageEmbed();

    //look for command
    let cmd = bot.commands.get(input.toLowerCase());
    if (!cmd) cmd = bot.commands.get(bot.aliases.get(input.toLowerCase()));

    embed.setColor(bot.embedColors.normal).setTimestamp();

    //add all cmd info
    if (cmd.name) {
        embed.setTitle(cmd.name);
        embed.addField(`Command name:`, cmd.name, false);
    }
    if (cmd.category)
        embed.addField('Category', cmd.category, false);
    if (cmd.aliases)
        embed.addField('Aliases:', cmd.aliases.map(a => `\`${a}\``).join(", "), false);
    if (cmd.description)
        embed.addField('Description:', cmd.description, false);
    if (cmd.usage) {
        embed.addField('Usage:', cmd.usage, false);
        embed.setFooter(`Syntax: [] = required, <> = optional`);
    }
    if (cmd.neededPermissions) {
        let table = new AsciiTable('Permissions')
            .setHeading('Permission', 'Bot', 'You');

        cmd.neededPermissions.forEach(permission => {
            let checkBot = message.guild.me.hasPermission(permission) ? '✔️' : '❌';
            let checkUser = message.member.hasPermission(permission) ? '✔️' : '❌';

            table.addRow(permission, checkBot, checkUser);
        });

        embed.addField('Needed permissions', `\`${table}\``, false);
    }


    return message.channel.send(embed);
}

function getCat(bot, message, input) {
    const embed = new MessageEmbed()

    embed.setColor(bot.embedColors.normal).setTimestamp();

    const commands = (category) => {
        return bot.commands
            .filter(cmd => cmd.category === input);
    }

    embed.setTitle(`Module: ${input}`);

    commands(input).forEach(cmd => {
        embed.addField(cmd.name, cmd.description, false);
    })

    return message.channel.send(embed);
}