const {MessageEmbed} = require('discord.js');
const config = require("../../config.json");
const logger = require("log4js").getLogger();
const {User, ServerUser, Rewards, ServerSettings} = require('../misc/dbObjects');
const pm = require('parse-ms');
const {Minor, Levels, Roles, Servers} = require('../misc/tools');

module.exports = async (bot, message) => {
    const guild = bot.guilds.cache.get('645047329141030936');

    //check if the new message is from a bot or webhook
    if (message.author.bot) return;
    if (message.webhookID) return;

    try {
        //check the global level of the user and if it already exists
        await checkUser(message);
        await globalLevel(message);

        //check the server level of the user
        await checkServerUser(message);
        await serverLevel(bot, message);
    } catch (err) {
        logger.error(err);
    }


    //check if the bot is in test mode
    if (await checkPrefix(message)) return;
    if (bot.testing && message.author.id !== config.owner) {
        await Minor.testing(bot, message);
        return;
    }


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
            let invite;
            await guild.fetchInvites().then(async invites => {
                try {
                    invite = invites.first();
                    if (!invite)
                        await createNew(guild).then(inv => {
                            invite = inv;
                        }).catch(error => {
                            logger.error(error);
                        });
                } catch (error) {
                    logger.error(error);
                }
            });
            let embed = new MessageEmbed()
                .setColor(bot.embedColors.error)
                .setTitle('An error occurred')
                .setDescription(`An error occurred and the command stopped executing.\n` +
                    `Please report this to the bot developer in the **[support server](${invite})**`)
                .setTimestamp();

            await message.channel.send(embed);

            logger.error(err);
        }
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

async function serverLevel(bot, message) {
    let member
    await Servers.getMember(message, []).then(memberPromise => {
        member = memberPromise;
    });
    let settings;

    settings = await ServerSettings.findOne({
        where: {
            serverId: message.guild.id
        }
    });

    await ServerUser.findOne({
        where: {
            userId: message.author.id,
            guildId: message.guild.id
        }
    }).then(async serverUser => {
        if (settings.noXpRole !== null)
            if (member._roles.includes(settings.noXpRole))
                return;

        let now = new Date();

        if (serverUser.lastMessageDate !== '0') {
            const diff = pm(now.getTime() - parseInt(serverUser.lastMessageDate));

            if (diff.minutes < 1 && diff.hours === 0)
                return;
        }

        serverUser.xp += 5;
        serverUser.lastMessageDate = message.createdTimestamp;

        serverUser.save();

        await checkLevelUp(bot, message, serverUser);
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

    for (let i of prefix) {
        if (message.content.toLowerCase().indexOf(i) === 0)
            return false;
    }
    return true;
}

async function trimPrefix(message) {
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

    for (let i of prefix) {
        if (message.content.toLowerCase().indexOf(i) === 0) {
            return message.content.slice(i.length).trim().split(/ +/g);
        }
    }
}

async function createNew(guild) {
    let channel = guild.channels.cache.find(channel => channel.type === 'text');

    return await channel.createInvite();
}

async function checkLevelUp(bot, message, serverUser) {
    try {
        Rewards.findOne({
            where: {
                serverId: message.guild.id,
                xp: serverUser.xp
            }
        }).then(async reward => {
                await ServerSettings.findOne({
                    where: {
                        serverid: message.guild.id
                    }
                }).then(async serverSetting => {
                    let user = message.guild.members.cache.get(message.author.id);
                    let guild = message.guild;
                    let xp = serverUser.xp
                    let lvlXp = config.levelXp;
                    let level = 0;
                    let nextLvlXp = 0;

                    do {
                        nextLvlXp = lvlXp + ((lvlXp / 2) * level);

                        if (xp >= nextLvlXp) {
                            level++;
                            xp -= nextLvlXp;
                        }
                    } while (xp > nextLvlXp);

                    if ((!reward || user._roles.includes(reward.roleId) || !serverSetting.levelUpRoleMessage)) {
                        if (xp === 0) {
                            if (serverSetting.levelUpMessage)
                                await Levels.levelUp(message, serverSetting.levelUpMessage, level);
                        }
                        return;
                    }

                    let role = message.guild.roles.cache.get(reward.roleId);

                    if (!role) {
                        reward.destroy();
                        return;
                    }

                    await Levels.levelUpRole(message, serverSetting.levelUpRoleMessage, level, reward.roleId);

                    await Roles.giveRole(user, role);
                });
            }
        );
    } catch
        (err) {
        logger.error(err)
    }
}