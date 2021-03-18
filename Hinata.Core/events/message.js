const {MessageEmbed} = require('discord.js');
const config = require("../../config.json");
const logger = require("log4js").getLogger();
const {User, ServerUser, Rewards, ServerSettings} = require('../misc/dbObjects');
const pm = require('parse-ms');
const {Minor, Levels, Roles, Servers} = require('../misc/tools');

let recentlyRan = [];

module.exports = async (bot, message) => {
    const support = bot.guilds.cache.get('645047329141030936');

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
            const {
                name,
                run,
                cooldown = -1,
                neededPermissions = [],
                ownerOnly = false
            } = cmd;

            if (ownerOnly && message.author.id !== config.owner) {
                return message.channel.send(new MessageEmbed().setColor(bot.embedColors.error)
                    .setDescription('This command is only for the owner of the bot'));
            }

            for (const permission of neededPermissions) {
                //check user permissions
                if (!message.member.hasPermission(permission)) {
                    return message.channel.send(new MessageEmbed().setColor(bot.embedColors.error)
                        .setDescription(`You don't have the required permission to run this command\n` +
                            `**Missing requirements:** ${permission}`));
                }

                //check bot permissions
                if (!message.guild.me.hasPermission(permission)) {
                    return message.channel.send(new MessageEmbed().setColor(bot.embedColors.error)
                        .setDescription(`I don't have the required permission to run this command\n` +
                            `**Missing requirements:** ${permission}`));
                }
            }

            let cooldownString = `${message.guild.id}-${message.author.id}-${name}`;

            if (cooldown > 0 && recentlyRan.includes(cooldownString)) {
                message.reply('You cannot use that command so soon, please wait.');
                return;
            }

            let logging = `------------------------------\n` +
                `Command: '${name}'\n` +
                `Arguments: '${args.join(' ')}'\n` +
                `User: '${message.author.tag}'\n` +
                `Server: '${message.guild.name}'\n` +
                `Guild ID: '${message.guild.id}'\n` +
                `Channel: '${message.channel.name}'`;

            logger.info(logging);

            if (cooldown > 0) {
                recentlyRan.push(cooldownString);

                setTimeout(() => {

                    recentlyRan = recentlyRan.filter((string) => {
                        return string !== cooldownString;
                    });

                }, 1000 * cooldown);
            }

            await run(bot, message, args);
        } catch (err) {
            let invite;
            await support.fetchInvites().then(async invites => {
                try {
                    invite = invites.first();
                    if (!invite)
                        await createNew(support).then(inv => {
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

            message.channel.stopTyping();
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
    }).catch(err => {
        logger.error('Error:', err,
            '\nServer:', message.guild.name,
            '\nUser:', message.author.tag);
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
    }).catch(err => {
        logger.error('Error:', err,
            '\nserver:', message.guild.name);
    });

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