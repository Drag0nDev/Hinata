const config = require("../../config.json");
const logger = require("log4js").getLogger();
const {User, ServerUser, Server, ServerSettings} = require('../misc/dbObjects');
const pm = require('parse-ms');
const tools = require('../misc/tools');

module.exports = async (bot, message) => {

    //check if the new message is from a bot
    if (message.author.bot) return;

    //check the global level of the user and if it already exists
    await checkUser(message);
    await globalLevel(message);

    //check the server level of the user
    await checkServerUser(message);
    await serverLevel(message);

    //check if the bot is in test mode
    if (await checkPrefix(message)) return;
    if (bot.testing && message.author.id !== config.owner) {
        await tools.testing(bot, message);
        return;
    }

    try {
        //extractions of the command
        const args = await trimPrefix(message);
        const command = args.shift().toLowerCase();

        //find the command
        let cmd = bot.commands.get(command);
        if (!cmd) cmd = bot.commands.get(bot.aliases.get(command));

        //enter in the logger
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
                logger.error(err);
            }
        }
    } catch (error) {
        logger.error(error);
    }

};

function globalLevel(message) {
    const lvlxp = config.levelXp;

    User.findOne({
        where: {
            userId: message.author.id
        }
    }).then(user => {
        if (user.isBanned === 1) return;

        let now = new Date();

        if (user.lastMessageDate !== '0') {
            const diff = pm(now.getTime() - parseInt(user.lastMessageDate));

            if (diff.minutes < 1 && diff.hours === 0)
                return;
        }

        user.xp += 5;
        user.lastMessageDate = message.createdTimestamp;

        let nextLvlXp = lvlxp + ((lvlxp / 2) * user.level);

        if (user.xp >= nextLvlXp) {
            user.level++;
            user.xp -= nextLvlXp;
            user.balance += 10;
        }

        user.save();
    });
}

async function checkUser(message) {
    await User.findOrCreate({
        where: {
            userId: message.author.id
        },
        defaults: {
            userTag: `${message.author.username}#${message.author.discriminator}`
        }
    });
}

function serverLevel(message) {
    ServerUser.findOne({
        where: {
            userId: message.author.id,
            guildId: message.guild.id
        }
    }).then(serverUser => {
        let now = new Date();

        if (serverUser.lastMessageDate !== '0') {
            const diff = pm(now.getTime() - parseInt(serverUser.lastMessageDate));

            if (diff.minutes < 1 && diff.hours === 0)
                return;
        }

        serverUser.xp += 5;
        serverUser.lastMessageDate = message.createdTimestamp;

        serverUser.save();
    });
}

async function checkServerUser(message) {
    await ServerUser.findOrCreate({
        where: {
            userId: message.author.id,
            guildId: message.guild.id
        }
    });
}

async function checkPrefix(message) {
    let prefix = [];

    for (let i of config.prefix) {
        prefix.push(i);
    }

    await ServerSettings.findOne({
        where: {
            serverId: message.guild.id
        }
    }).then(server => {
        if (!server.prefix) return;

        prefix.push(server.prefix);
    })

    for (let i of prefix){
        if(message.content.toLowerCase().indexOf(i) === 0)
            return false;

    }
    return true;
}

async function trimPrefix(message) {
    let prefix = [];

    for (let i of config.prefix) {
        prefix.push(i);
    }

    await Server.findOne({
        where: {
            serverId: message.guild.id
        }
    }).then(server => {
        if (!server.prefix) return;

        prefix.push(server.prefix);
    })

    for (let i of prefix){
        if(message.content.toLowerCase().indexOf(i) === 0){
            return message.content.slice(i.length).trim().split(/ +/g);
        }
    }
}