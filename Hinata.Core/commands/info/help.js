const {MessageEmbed} = require('discord.js');
const config = require("../../../config.json");
const AsciiTable = require('ascii-table');
const {Minor} = require('../../misc/tools');
const logger = require("log4js").getLogger();

module.exports = {
    name: 'help',
    aliases: ['h'],
    category: 'info',
    description: 'A function to show one of the following:\n' +
        '- All commands and categories.\n' +
        '- A category with all its commands and explanation of the command.\n' +
        '- A command and all the info of the command',
    usage: '[command | alias] <categoryname/commandname>',
    examples: ['h!help', 'h!help info', 'h!help slum'],
    run: async (bot, message, args) => {
        const embed = new MessageEmbed();

        if (args[0]) {
            //info string default is the error message
            let info = `No information is found for command/category **${args[0].toLowerCase()}**`;
            //look for category
            let cat = bot.categories.includes(args.join(' ').toLowerCase());
            let catVal = args.join(' ').toLowerCase();
            let cmd;

            if (!cat) {
                //look for command
                cmd = bot.commands.get(args[0].toLowerCase());
                if (!cmd) cmd = bot.commands.get(bot.aliases.get(args[0].toLowerCase()));
            }

            if (cmd) {
                if (cmd.category.includes('owner') && message.member.id !== config.owner){
                    embed.setColor(bot.embedColors.embeds.error)
                        .setTitle('Bot owner only command')
                        .setDescription('This command is not available for your use.\n' +
                            'This command can only be used by the bot owner.')
                        .setTimestamp();

                    return message.channel.send(embed);
                }

                return getCmd(bot, message, cmd);
            }
            if (cat){
                if (catVal.includes('owner') && message.member.id !== config.owner){
                    embed.setColor(bot.embedColors.embeds.error)
                        .setTitle('Bot owner only category')
                        .setDescription('This category is not available for your use.\n' +
                            'The commands in this category can only be used by the bot owner.')
                        .setTimestamp();

                    return message.channel.send(embed);
                }

                return getCat(bot, message, catVal);
            }
            else {
                embed.setColor(bot.embedColors.embeds.error)
                    .setTitle('No command found')
                    .setDescription(info)
                    .setTimestamp()
                    .setFooter('Maybe you typed it wrong?');

                return message.channel.send(embed);
            }
        } else
            return getAll(bot, message);
    }
}

function getAll(bot, message) {
    const commands = (category) => {
        return bot.commands
            .filter(cmd => cmd.category === category)
            .map(cmd => `${cmd.name}`)
            .join("\n");
    }
    let categories = bot.categories;

    //embed creation
    const embed = new MessageEmbed()
        .setColor(bot.embedColors.embeds.normal)
        .setTitle('Help')
        .setURL('https://discord.gg/ReBJ4AB')
        .setTimestamp()
        .setFooter(`For more help type Hinata help [command] | Page 1`);

    if (message.member.id !== config.owner) {
        for (let i = 0; i < categories.length; i++) {
            if (categories[i].includes('owner')) {
                categories.splice(i, 1);
                i--;
            }
        }
    }

    for (let i = 0; i < 9 && i < categories.length; i++) {
        let cat = categories[i];
        const name = cat;
        const value = commands(cat);
        embed.addField(`__${name}__`, `${value}`, true);
    }

    messageEditor(bot, message, embed, categories, commands);
}

function getCmd(bot, message, cmd) {
    const embed = new MessageEmbed();

    embed.setColor(bot.embedColors.embeds.normal).setTimestamp();

    //add all cmd info
    if (cmd.name) {
        embed.setTitle(cmd.name);
        embed.addField(`Command name:`, cmd.name, false);
    }
    if (cmd.category)
        embed.addField('Category', cmd.category, true);
    if (cmd.aliases)
        embed.addField('Aliases:', cmd.aliases.map(a => `\`${a}\``).join(", "), true);
    if (cmd.cost)
        embed.addField('Cost:', cmd.cost, true);
    if (cmd.description)
        embed.addField('Description:', cmd.description, false);
    if (cmd.usage) {
        embed.addField('Usage:', cmd.usage, true);
        embed.setFooter(`Syntax: [] = required, <> = optional`);
    }
    if (cmd.examples)
        embed.addField('Examples:', cmd.examples.map(a => `\`${a}\``).join("\n"), true);
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
    if (cmd.cooldown) {
        embed.addField('Cooldown', `${cmd.cooldown} seconds`, true);
    }

    return message.channel.send(embed);
}

function getCat(bot, message, input) {
    const embed = new MessageEmbed()

    embed.setColor(bot.embedColors.embeds.normal).setTimestamp();

    const commands = (category) => {
        return bot.commands
            .filter(cmd => cmd.category === input);
    }

    embed.setTitle(`Module: ${input}`);

    if (input.includes('owner') && message.member.id !== config.owner) {
        embed.setDescription(`You don't have permission to view this category`);
    } else {
        commands(input).forEach(cmd => {
            embed.addField(cmd.name, cmd.description, false);
        });
    }

    return message.channel.send(embed);
}

function messageEditor(bot, message, embed, categories, commands) {
    message.channel.send(embed)
        .then(async messageBot => {
            await Minor.addPageArrows(messageBot);
            let page = 0;

            const filter = (reaction, user) => {
                return (reaction.emoji.name === '◀' || reaction.emoji.name === '▶') && user.id === message.author.id;
            };

            const collector = messageBot.createReactionCollector(filter, {time: 60000});

            collector.on('collect', async (reaction, user) => {
                let editEmbed = new MessageEmbed()
                    .setTitle('Help')
                    .setURL('https://discord.gg/ReBJ4AB')
                    .setColor(bot.embedColors.embeds.normal);

                if (reaction.emoji.name === '▶') {
                    page++;
                    await pageSwitch(message, page, categories, editEmbed, commands);
                } else if (reaction.emoji.name === '◀') {
                    page--;
                    if (page < 0)
                        return;
                    await pageSwitch(message, page, categories, editEmbed, commands);
                }

                if (editEmbed.fields.length !== 0) {
                    await messageBot.edit(editEmbed)
                        .catch(error => {
                            if (error.message === "Missing Permissions") {
                                return;
                            }
                            logger.error(error.message, 'in server', message.guild.name);
                        });
                }
            });

            collector.on('end', collected => {
                messageBot.reactions.removeAll();
            });
        });
}

async function pageSwitch(message, page, categories, editEmbed, commands) {
    for (let i = 9 * page; (i < 9 + (9 * page)) && (i < categories.length); i++) {
        let cat = categories[i];
        const name = cat;
        const value = commands(cat);

        editEmbed.addField(`__${name}__`, `${value}`, true);
    }

    editEmbed.setFooter(`For more help type Hinata help [command] | Page ${page + 1}`);
}