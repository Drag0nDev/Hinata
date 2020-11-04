const config = require("../../config.json");
const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {User} = require('../../dbObjects');
const pm = require('parse-ms');

module.exports = async (bot, message) => {

    if (message.author.bot) return;

    await check(message);
    level(message);

    if (message.content.toLowerCase().indexOf(config.prefix) !== 0) return;
    if (bot.testing && message.author.id !== config.owner) {
        let testing = bot.testingFile.get('testing');
        testing.run(bot, message)
        return;
    }

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    let cmd = bot.commands.get(command);
    if (!cmd) cmd = bot.commands.get(bot.aliases.get(command));

    if (cmd) {
        try {
            let logging = `------------------------------\n` +
                `Command: '${cmd.name}'\n` +
                `Arguments: '${args.join(' ')}'\n` +
                `User: '${message.author.tag}'\n` +
                `Server: '${message.guild.name}'\n` +
                `Guild ID: '${message.guild.id}'\n` +
                `Channel: '${message.channel.name}'`;

            logger.info(logging);
            await cmd.run(bot, message, args);
        } catch (err) {
            logger.error(err)
        }
    }
};

function level(message) {
    const lvlxp = 30;

    User.findOne({
        where: {
            userId: message.author.id
        }
    }).then(user => {
        let now = new Date();
        let embed = new MessageEmbed();

        if (user.lastMessageDate !== '0'){
            const diff = pm(now.getTime() - parseInt(user.lastMessageDate));

            if (diff.minutes < 1 && diff.hours === 0)
                return;
        }

        user.xp++;
        user.lastMessageDate = message.createdTimestamp;

        let nextLvlXp = lvlxp + (lvlxp * user.level);

        if (user.xp >= nextLvlXp) {
            user.level++;
            user.xp -= nextLvlXp;
        }

        user.save();
    });
}

async function check(message) {
    await User.findOrCreate({
        where: {
            userId: message.author.id
        }
    });
}