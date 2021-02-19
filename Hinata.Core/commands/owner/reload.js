const config = require("../../../config.json");
const {MessageEmbed} = require('discord.js');
let fs = require('fs');
const {Permissions} = require('../../misc/tools');
const logger = require("log4js").getLogger();

module.exports = {
    name: 'reload',
    category: 'owner',
    description: 'Command to reload a command/category or all commands',
    usage: '[command | alias] [all/cat/command] <command>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let sort = new RegExp('all|cat');

        if (message.author.id !== config.owner) {
            Permissions.ownerOnly(bot, message.channel)
            return;
        }

        if (sort.exec(args[0])) {
            if (sort.exec(args[0])[0] === 'all') {
                await reloadAll(bot, message, args, embed);
            } else if (sort.exec(args[0])[0] === 'cat') {
                await args.shift();
                await reloadCat(bot, message, args, embed);
            }
        } else {
            await reload(bot, message, args, embed);
        }
    }
}

async function reload(bot, message, args, embed) {
    if (!args.length) return message.reply(`you didn't pass any command to reload!`);
    const commandName = args[0].toLowerCase();
    const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command){
        return message.channel.send(embed.setTitle('Reload command')
            .setColor(bot.embedColors.error)
            .setDescription(`No command with name **${args[0]}** found!`)
            .setTimestamp());
    }
    const category = command.category;

    if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);

    delete require.cache[require.resolve(`../${category}/${command.name}.js`)];

    try {
        const newCommand = require(`../${category}/${command.name}.js`);

        bot.commands.set(newCommand.name, newCommand);

        await message.channel.send(embed.setTitle('Reload command')
            .setDescription(`The command with name **${newCommand.name}** is reloaded!`)
            .setTimestamp());
        logger.info(`The command with name '${newCommand.name}' is reloaded!`);
    } catch (error) {
        logger.error(error);

        await message.channel.send(embed.setTitle('Reload command')
            .setColor(bot.embedColors.error)
            .setDescription(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``)
            .setTimestamp());
    }
}

async function reloadCat(bot, message, args, embed) {
    let cat = args.join(' ');
    if (!args.length) return message.reply(`you didn't pass any category to reload!`);
    if (!bot.categories.includes(cat)) return message.reply(`there is no category with name **${cat}**`);

    for (let command of bot.commands){
        const category = command[1].category;

        if (category === cat) {
            delete require.cache[require.resolve(`../${category}/${command[1].name}.js`)];

            try {
                const newCommand = require(`../${category}/${command[1].name}.js`);

                bot.commands.set(newCommand.name, newCommand);

                logger.info(`The command with name '${newCommand.name}' is reloaded!`);
            } catch (error) {
                logger.error(error);

                await message.channel.send(embed.setTitle('Reload command')
                    .setColor(bot.embedColors.error)
                    .setDescription(`There was an error while reloading a command \`${command[1].name}\`:\n\`${error.message}\``)
                    .setTimestamp());
            }
        }
    }
    await message.channel.send(embed.setTitle('Reload command')
        .setDescription(`All commands in category **${cat}** successfully reloaded`)
        .setTimestamp());
}

async function reloadAll(bot, message, args, embed) {
    for (let command of bot.commands){
        const category = command[1].category;

        delete require.cache[require.resolve(`../${category}/${command[1].name}.js`)];

        try {
            const newCommand = require(`../${category}/${command[1].name}.js`);

            bot.commands.set(newCommand.name, newCommand);

            logger.info(`The command with name '${newCommand.name}' is reloaded!`);
        } catch (error) {
            logger.error(error);

            await message.channel.send(embed.setTitle('Reload command')
                .setColor(bot.embedColors.error)
                .setDescription(`There was an error while reloading a command \`${command[1].name}\`:\n\`${error.message}\``)
                .setTimestamp());
        }
    }
    await message.channel.send(embed.setTitle('Reload command')
        .setDescription(`All commands successfully reloaded`)
        .setTimestamp());
}