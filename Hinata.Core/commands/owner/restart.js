const config = require("../../../config.json");
const Discord = require('discord.js');
const {Permissions} = require('../../misc/tools');
const logger = require("log4js").getLogger();
const shell = require('shelljs');

module.exports = {
    name: 'restart',
    category: 'owner',
    description: 'Update and restart the bot',
    usage: '[command | alias]',
    run: async (bot, message) => {
        let embed = new Discord.MessageEmbed()
            .setColor(bot.embedColors.normal)
            .setTitle("Restart")
            .setDescription("I am updating and restarting myself")
            .setTimestamp();

        if (message.author.id !== config.owner) {
            Permissions.ownerOnly(bot, message.channel)
            return;
        }

        await message.channel.send(embed)
            .then(msg => bot.destroy());

        if (shell.exec('bash restart.sh').code !== 0) {
            logger.error('restart.sh failed to run');
            shell.exit(1);
        }
    }
}