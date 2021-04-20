const {MessageEmbed} = require('discord.js');
const config = require("../../config.json");
const logger = require("log4js").getLogger();
const {User, ServerUser, Rewards, ServerSettings, Server} = require('../misc/dbObjects');
const pm = require('parse-ms');
const {Minor, Levels, Roles, Servers} = require('../misc/tools');

let recentlyRan = [];
const timeReg = new RegExp('\\d+$');

module.exports = async (bot, message) => {
    const support = bot.guilds.cache.get('645047329141030936');

    //check if the new message is from a bot or webhook
    if (message.author.bot) return;
    if (message.webhookID) return;

    try {
        //check if the server is in the database
        await checkServer(message);

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

            let logging = `------------------------------\n` +
                `Command: '${name}'\n` +
                `Arguments: '${args.join(' ')}'\n` +
                `User: '${message.author.tag}'\n` +
                `User ID: '${message.author.id}'` +
                `Server: '${message.guild.name}'\n` +
                `Server ID: '${message.guild.id}'\n` +
                `Channel: '${message.channel.name}'`;

            logger.info(logging);
            
            if (ownerOnly && message.author.id !== config.owner)
                return message.channel.send(new MessageEmbed().setColor(bot.embedColors.embeds.error)
                    .setDescription('This command is only for the owner of the bot'));

            for (const permission of neededPermissions) {
                //check user permissions
                if (!message.member.hasPermission(permission)) {
                    return message.channel.send(new MessageEmbed().setColor(bot.embedColors.embeds.error)
                        .setDescription(`You don't have the required permission to run this command\n` +
                            `**Missing requirements:** ${permission}`));
                }

                //check bot permissions
                if (!message.guild.me.hasPermission(permission)) {
                    return message.channel.send(new MessageEmbed().setColor(bot.embedColors.embeds.error)
                        .setDescription(`I don't have the required permission to run this command\n` +
                            `**Missing requirements:** ${permission}`));
                }
            }

            //format guildId-userId-commandName
            let cooldownString = `${message.guild.id}-${message.author.id}-${name}-${message.createdTimestamp}`;

            for (let index = 0; index < recentlyRan.length; index++) {
                let recentlyRanStr = recentlyRan[index];
                if (recentlyRanStr.substr(0, `${message.guild.id}-${message.author.id}-${name}-`.length) === `${message.guild.id}-${message.author.id}-${name}-` && cooldown > 0) {
                    let expiration = new Date(parseInt(timeReg.exec(recentlyRanStr)[0]));
                    let now = new Date();

                    expiration.setSeconds(expiration.getSeconds() + cooldown);

                    const timeleft = pm(expiration.getTime() - now.getTime());

                    return message.channel.send(new MessageEmbed()
                        .setColor(bot.embedColors.embeds.error)
                        .setDescription(`You cannot use that command for ${timeleft.seconds} seconds.`));
                }
            }
            // set cooldown timer
            if (cooldown > 0) {
                recentlyRan.push(cooldownString);

                setTimeout(() => {

                    recentlyRan = recentlyRan.filter((string) => {
                        return string !== cooldownString;
                    });

                }, 1000 * cooldown);
            }

            await run(bot, message, args);
        }
            // if something went wrong while running a command send an error embed with a link to the support server
        catch (err) {
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
                .setColor(bot.embedColors.embeds.error)
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

async function checkServer(message){
    const member = await message.guild.members.cache.get(message.author.id);
    const server = message.guild;

    await User.findOrCreate({
        where: {
            userId: member.user.id
        },
        defaults: {
            userTag: `${member.user.username}#${member.user.discriminator}`
        }
    });
    await Server.findOrCreate({
        where: {
            serverId: server.id
        },
        defaults: {
            serverName: server.name
        }
    });
    await ServerSettings.findOrCreate({
        where: {
            serverId: server.id
        }
    });
    await ServerUser.findOrCreate({
        where: {
            userId: member.user.id,
            guildId: member.guild.id
        }
    });
}

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
    let member;
    let user;
    await Servers.getMember(message, []).then(memberPromise => {
        member = memberPromise;
    });
    let settings;

    settings = await ServerSettings.findOne({
        where: {
            serverId: message.guild.id
        }
    });

    user = await ServerUser.findOne({
        where: {
            userId: message.author.id,
            guildId: message.guild.id
        }
    });

    if (settings.noXpRole !== null)
        if (member._roles.includes(settings.noXpRole))
            return;

    let now = new Date();

    if (user.lastMessageDate !== '0') {
        const diff = pm(now.getTime() - parseInt(user.lastMessageDate));

        if (diff.minutes < 1 && diff.hours === 0)
            return;
    }

    user.xp += 5;
    user.lastMessageDate = message.createdTimestamp;

    await user.save();

    await checkLevelUp(bot, message, user);
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
        let reward;
        let settings;

        reward = await Rewards.findOne({
            where: {
                serverId: message.guild.id,
                xp: serverUser.xp
            }
        });

        settings = await ServerSettings.findOne({
            where: {
                serverid: message.guild.id
            }
        });

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

        try {
            if ((!reward || user._roles.includes(reward.roleId) || !settings.levelUpRoleMessage)) {
                if (xp === 0) {
                    if (settings.levelUpMessage)
                        await Levels.levelUp(message, settings.levelUpMessage, level);
                }
                return;
            }
        } catch (e) {
            return;
        }

        let role = await message.guild.roles.cache.get(reward.roleId);

        if (!role) {
            reward.destroy();
            return;
        }

        await Levels.levelUpRole(message, settings.levelUpRoleMessage, level, reward.roleId);

        await Roles.giveRole(user, role);
    } catch (err) {
        logger.error(err)
    }
}