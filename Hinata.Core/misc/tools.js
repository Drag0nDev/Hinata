const {User, ServerUser, Server, ServerSettings} = require('./dbObjects');
const {MessageEmbed} = require('discord.js');
const logger = require("log4js").getLogger();
const config = require("../../config.json");
const Snooper = require('reddit-snooper');

const user = new RegExp('%user%', 'g');
const server = new RegExp('%server%', 'g');
const membercount = new RegExp('%members%', 'g');
const usermention = new RegExp('%mention%', 'g');
const avatar = new RegExp('%avatar%', 'g');
const level = new RegExp('%level%', 'g');
const role = new RegExp('%role%', 'g');
const icon = new RegExp('%icon%', 'g');
const roleId = new RegExp('\\d+');

const reglist = [user, server, membercount, usermention, avatar, level, role, icon];

const snooper = new Snooper({
    username: config.reddit.username,
    password: config.reddit.password,
    api_secret: config.reddit.secret,
    api_id: config.reddit.appId,

    automatic_retries: true,
    api_requests_per_minuite: 60
});

const Minor = {
    testing: async function (bot, message) {
        let embed = new MessageEmbed().setTitle('Currently out of order!')
            .setColor(bot.embedColors.embeds.error)
            .setFooter('Try again later')
            .setDescription('**__I am sorry but currently I am either one of both:__**\n' +
                '**1.** I am locked down because a major bug has appeared that could lead to unwanted behaviour.\n' +
                '**2.** I am under maintenance.\n\n' +
                'I hope you can understand this.\n' +
                'If you want to know when I am back to normal, then join my [support server!](https://discord.gg/ReBJ4AB)')
            .setTimestamp()
            .setThumbnail(bot.user.avatarURL());

        await message.channel.send(embed);
    },
    dbAdd: async function (member, server) {
        await ServerUser.findOrCreate({
            where: {
                userId: member[1].user.id,
                guildId: member[1].guild.id
            }
        });
        await User.findOrCreate({
            where: {
                userId: member[1].user.id
            },
            defaults: {
                userTag: `${member[1].user.username}#${member[1].user.discriminator}`
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
    },
    addPageArrows: async function (message) {
        await message.react('◀');
        await message.react('▶');
    },
    getHex: function (role) {
        let result = Number(role.color).toString(16);

        for (let i = result.length; i < 6; i++) {
            result = '0' + result;
        }

        result = '#' + result;

        return result;
    },
    getValue: function (str, input, reg, array, i) {
        if (array[i + 1])
            return str.substring(input.index, array[i + 1].index).replace(reg, '').trim();
        else
            return str.substring(input.index).replace(reg, '').trim();
    }
}

const Compare = {
    compareRoles: function (author, member) {
        let roleArrayAuth = [];
        let roleArrayMemb = [];

        //get all the roles and their objects in an array
        author._roles.forEach(roleId => {
            roleArrayAuth.push(member.guild.roles.cache.get(roleId));
        });

        member._roles.forEach(roleId => {
            roleArrayMemb.push(member.guild.roles.cache.get(roleId));
        });

        roleArrayAuth.sort((a, b) => b.position - a.position);
        roleArrayMemb.sort((a, b) => b.position - a.position);

        if (!roleArrayMemb[0] && roleArrayAuth[0]) {
            return true;
        } else if (!roleArrayAuth[0] && roleArrayMemb[0]) {
            return false;
        } else {
            return roleArrayAuth[0].position > roleArrayMemb[0].position;
        }
    },
    arrayEquals: function (a, b) {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val) => b.includes(val));
    }
}

const Roles = {
    giveRole: async function (member, role) {
        await member.roles.add(role);
    },
    removeRole: async function (member, role) {
        await member.roles.remove(role);
    },
    getRoles: function (member) {
        let roleList = ``;
        let roleArray = [];
        let amount = 0;

        //get all the roles and their objects in an array
        if (member._roles.length === 0) {
            roleList = '\u200B';
        } else {
            member._roles.forEach(roleId => {
                roleArray.push(member.guild.roles.cache.get(roleId));
            });

            roleArray.sort((a, b) => b.position - a.position);

            for (let role of roleArray) {

                if (amount === 10) {
                    roleList += '``...``';
                    break;
                }
                roleList += `<@&${role.id}>\n`;
                amount++;
            }
        }

        return roleList;
    },
    getRole: async function (message, args) {
        if (roleId.test(args[0])){
            return message.guild.roles.cache.get(roleId.exec(args[0])[0]);
        }
    }
}

const Servers = {
    getMember: async function (message, args) {
        return !args[0] ? message.guild.members.cache.get(message.author.id) : message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    },
    getUser: async function (bot, message, args) {
        return message.mentions.members.first() || bot.users.cache.get(args[0]);
    },
    getGuild: async function (message) {
        return message.guild;
    },
    getBots: function (guild) {
        let amount = 0;

        guild.members.cache.forEach(member => {
            if (member.user.bot) amount++;
        });

        return amount;
    },
    getChannelAmount: function (channels, sort) {
        let amount = 0;

        channels.forEach(channel => {
            if (channel.type === sort) amount++;
        });

        return amount;
    },
    getRole: async function (message, args) {
        return !args[0] ? message.guild.roles.cache.get(message.author.id) : message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    },
    getMembers: async function (message, args, userMentions) {
        let checkId = new RegExp('[0-9]+');
        let members = '';

        args.forEach(arg => {
            if (checkId.exec(arg) !== null) {
                if (message.guild.members.cache.get(checkId.exec(arg)[0])) {
                    userMentions.push(checkId.exec(arg)[0]);
                    members += `<@!${checkId.exec(arg)[0]}> `;
                } else if (message.guild.roles.cache.get(checkId.exec(arg)[0])) {
                    members += `<@&${checkId.exec(arg)[0]}> `;
                }
            }
        });

        return members;
    },
}

const Levels = {
    getLevel: function (userXp) {
        let lvlXp = config.levelXp;
        let level = 0;
        let nextLvlXp = 0;

        do {
            nextLvlXp = lvlXp + ((lvlXp / 2) * level);

            if (userXp >= nextLvlXp) {
                level++;
                userXp -= nextLvlXp;
            }
        } while (userXp > nextLvlXp);

        return level;
    },
    levelUp: async function (message, customMessage, newLevel) {
        customMessage = await customReplace(message, customMessage, newLevel);
        let embed = new MessageEmbed();

        try {
            const jsonEmbed = JSON.parse(customMessage.message);

            if (jsonEmbed.color) embed.setColor(jsonEmbed.color);
            if (jsonEmbed.title) embed.setTitle(jsonEmbed.title);
            if (jsonEmbed.description) embed.setDescription(jsonEmbed.description);
            if (jsonEmbed.thumbnail) embed.setThumbnail(jsonEmbed.thumbnail);
            if (jsonEmbed.fields) {
                for (let field of jsonEmbed.fields) {
                    let name = field.name;
                    let value = field.value;
                    let inline;
                    if (field.inline) inline = field.inline;
                    else inline = false;

                    embed.addField(name, value, inline);
                }
            }

            await message.channel.send({embed: embed});
        } catch (err) {
            message.channel.send(customMessage.message);
        }
    },
    levelUpRole: async function (message, customMessage, newLevel, newRoleId) {
        let embed = new MessageEmbed();

        customMessage = await customReplace(message, customMessage, newLevel, newRoleId);

        try {
            const jsonEmbed = JSON.parse(customMessage.message);

            if (jsonEmbed.color) embed.setColor(jsonEmbed.color);
            if (jsonEmbed.title) embed.setTitle(jsonEmbed.title);
            if (jsonEmbed.description) embed.setDescription(jsonEmbed.description);
            if (jsonEmbed.thumbnail) embed.setThumbnail(jsonEmbed.thumbnail);
            if (jsonEmbed.fields) {
                for (let field of jsonEmbed.fields) {
                    let name = field.name;
                    let value = field.value;
                    let inline;
                    if (field.inline) inline = field.inline;
                    else inline = false;

                    embed.addField(name, value, inline);
                }
            }

            await message.channel.send({embed: embed});
        } catch (err) {
            message.channel.send({
                content: customMessage.message,
                allowedMentions: {
                    user: customMessage.user
                }
            });
        }
    },
    customReplace: async function (guild, customMessage, user, newLevel, newRoleId) {
        try {
            reglist.forEach(reg => {
                if (customMessage.match(reg)) {
                    switch (reg.exec(customMessage)[0]) {
                        case '%user%':
                            customMessage = customMessage.replace(reg, `${user.user.username}#${user.user.discriminator}`);
                            break;
                        case '%server%':
                            customMessage = customMessage.replace(reg, guild.name);
                            break;
                        case '%members%':
                            customMessage = customMessage.replace(reg, guild.memberCount);
                            break;
                        case '%mention%':
                            customMessage = customMessage.replace(reg, `<@!${user.user.id}>`);
                            break;
                        case '%avatar%':
                            let avatarURL = user.user.avatarURL({
                                dynamic: true
                            });

                            if (avatarURL === null){
                                avatarURL = `https://cdn.discordapp.com/embed/avatars/${user.user.discriminator % 5}.png`;
                            }

                            customMessage = customMessage.replace(reg, avatarURL);
                            break;
                        case '%role%':
                            customMessage = customMessage.replace(reg, `<@&${newRoleId}>`);
                            break;
                        case '%level%':
                            customMessage = customMessage.replace(reg, newLevel);
                            break;
                        case '%icon%':
                            customMessage = customMessage.replace(reg, guild.iconURL({dynamic: true}));
                            break;
                    }
                }
            });

            return {message: customMessage, user: `<@!${user.user.id}>`};
        } catch (err) {
            logger.error(err);
        }
    }
}

const Logs = {
    modlog: async function (bot, member, embed) {
        await member.guild.fetchWebhooks()
            .then(async webhooks => {
                let webhook = webhooks.get(await getModlogChannel(member.guild.id));

                if (webhook) {
                    if (webhook.name !== bot.user.username)
                        await webhook.edit({
                            name: bot.user.username
                        });
                    if (webhook.avatar !== bot.user.avatar)
                        await webhook.edit({
                            avatar: bot.user.avatarURL({
                                dynamic: true,
                                size: 4096
                            })
                        });
                    await webhook.send(embed).catch(err => {});
                }
            })
            .catch(err => {});
    },
    joinLeaveLog: async function (bot, member, embed) {
        await member.guild.fetchWebhooks()
            .then(async webhooks => {
                const webhook = webhooks.get(await getJoinLeavelogChannel(member.guild.id));

                if (webhook) {
                    if (webhook.name !== bot.user.username)
                        await webhook.edit({
                            name: bot.user.username
                        });
                    if (webhook.avatar !== bot.user.avatar)
                        await webhook.edit({
                            avatar: bot.user.avatarURL({
                                dynamic: true,
                                size: 4096
                            })
                        });
                    await webhook.send(embed).catch(err => {});
                }
            })
            .catch(err => {});
    },
    memberLog: async function (bot, member, embed) {
        await member.guild.fetchWebhooks()
            .then(async webhooks => {
                const webhook = webhooks.get(await getMemberLogChannel(member.guild.id));

                if (webhook) {
                    if (webhook.name !== bot.user.username)
                        await webhook.edit({
                            name: bot.user.username
                        });
                    if (webhook.avatar !== bot.user.avatar)
                        await webhook.edit({
                            avatar: bot.user.avatarURL({
                                dynamic: true,
                                size: 4096
                            })
                        });
                    await webhook.send(embed).catch(err => {});
                }
            })
            .catch(err => {});
    },
    memberLogGuild: async function (bot, guild, embed) {
        await guild.fetchWebhooks()
            .then(async webhooks => {
                const webhook = webhooks.get(await getMemberLogChannel(guild.id));

                if (webhook) {
                    if (webhook.name !== bot.user.username)
                        await webhook.edit({
                            name: bot.user.username
                        });
                    if (webhook.avatar !== bot.user.avatar)
                        await webhook.edit({
                            avatar: bot.user.avatarURL({
                                dynamic: true,
                                size: 4096
                            })
                        });
                    await webhook.send(embed).catch(err => {});
                }
            })
            .catch(err => {});
    },
    messageLog: async function (bot, guild, embed) {
        await guild.fetchWebhooks()
            .then(async webhooks => {
                const webhook = webhooks.get(await getMessageLogChannel(guild.id));

                if (webhook) {
                    if (webhook.name !== bot.user.username)
                        await webhook.edit({
                            name: bot.user.username
                        });
                    if (webhook.avatar !== bot.user.avatar)
                        await webhook.edit({
                            avatar: bot.user.avatarURL({
                                dynamic: true,
                                size: 4096
                            })
                        });
                    await webhook.send(embed).catch(err => {});
                }
            })
            .catch(err => {});
    },
    serverLog: async function (bot, guild, embed) {
        await guild.fetchWebhooks()
            .then(async webhooks => {
                const webhook = webhooks.get(await getServerLogChannel(guild.id));

                if (webhook) {
                    if (webhook.name !== bot.user.username)
                        await webhook.edit({
                            name: bot.user.username
                        });
                    if (webhook.avatar !== bot.user.avatar)
                        await webhook.edit({
                            avatar: bot.user.avatarURL({
                                dynamic: true,
                                size: 4096
                            })
                        });
                    await webhook.send(embed).catch(err => {});
                }
            })
            .catch(err => {});
    },
    voiceLogChannel: async function (bot, guild, embed) {
        await guild.fetchWebhooks()
            .then(async webhooks => {
                const webhook = webhooks.get(await getVoiceLogChannel(guild.id));

                if (webhook) {
                    if (webhook.name !== bot.user.username)
                        await webhook.edit({
                            name: bot.user.username
                        });
                    if (webhook.avatar !== bot.user.avatar)
                        await webhook.edit({
                            avatar: bot.user.avatarURL({
                                dynamic: true,
                                size: 4096
                            })
                        });
                    await webhook.send(embed).catch(err => {});
                }
            })
            .catch(err => {});
    }
}

const Dates = {
    calcExpiration: async function (date, time) {
        let getVal = new RegExp('[smhd]');
        let getTime = new RegExp('[0-9]*');

        let timeVal = getVal.exec(time)[0];
        let $time = getTime.exec(time)[0];

        switch (timeVal) {
            case 's':
                date.setSeconds(date.getSeconds() + parseInt($time));
                break;
            case 'm':
                date.setMinutes(date.getMinutes() + parseInt($time));
                break;
            case 'h':
                date.setHours(date.getHours() + parseInt($time));
                break;
            case 'd':
                date.setDate(date.getDate() + parseInt($time));
                break;
        }
    },
    getTimeval: async function (time) {
        let getVal = new RegExp('[smhd]');

        let timeVal = getVal.exec(time)[0];
        let timeperiod;

        switch (timeVal) {
            case 's':
                timeperiod = 'seconds';
                break;
            case 'm':
                timeperiod = 'minutes';
                break;
            case 'h':
                timeperiod = 'hours';
                break;
            case 'd':
                timeperiod = 'days';
                break;
        }

        return timeperiod;
    },
    getTime: async function (time) {
        let getTime = new RegExp('[0-9]*');

        return getTime.exec(time)[0];
    },
    getDate: function (timestamp) {
        let date = new Date(timestamp);

        let months = date.getMonth() + 1;
        let days = date.getUTCDate();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let ampm = hours >= 12 ? 'PM' : 'AM';

        months = months < 10 ? '0' + months : months;
        days = days < 10 ? '0' + days : days;
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        let time = hours + ':' + minutes + ':' + seconds + ' ' + ampm;

        return `${date.getFullYear()}/${months}/${days}\n${time}`;
    }
}

const Permissions = {
    checkRolePosition: function (bot, message, role, embed) {
        const botUser = message.guild.members.cache.get(bot.user.id);
        let roleArray = [];

        botUser._roles.forEach(roleId => {
            roleArray.push(message.guild.roles.cache.get(roleId));
        });

        roleArray.sort((a, b) => b.position - a.position);

        if (roleArray[0].position < role.position) {
            return embed.setColor(bot.embedColors.embeds.error)
                .setDescription('I can\'t assign this role due to role hierarchy!');
        }
    }
}

//private functions
async function getModlogChannel(serverId) {
    return await ServerSettings.findOne({
        where: {
            serverId: serverId
        }
    }).then(server => {
        return server.modlogChannel;
    }).catch(err => {
        logger.error(err);
    });
}

async function getJoinLeavelogChannel(serverId) {
    return await ServerSettings.findOne({
        where: {
            serverId: serverId
        }
    }).then(server => {
        return server.joinLeaveLogChannel;
    }).catch(err => {
        logger.error(err);
    });
}

async function getMemberLogChannel(serverId) {
    return await ServerSettings.findOne({
        where: {
            serverId: serverId
        }
    }).then(server => {
        return server.memberLogChannel;
    }).catch(err => {
        logger.error(err);
    });
}

async function getMessageLogChannel(serverId) {
    return await ServerSettings.findOne({
        where: {
            serverId: serverId
        }
    }).then(server => {
        return server.messageLogChannel;
    }).catch(err => {
        logger.error(err);
    });
}

async function getVoiceLogChannel(serverId) {
    return await ServerSettings.findOne({
        where: {
            serverId: serverId
        }
    }).then(server => {
        return server.voiceLogChannel;
    }).catch(err => {
        logger.error(err);
    });
}

async function getServerLogChannel(serverId) {
    return await ServerSettings.findOne({
        where: {
            serverId: serverId
        }
    }).then(server => {
        return server.serverLogChannel;
    }).catch(err => {
        logger.error(err);
    });
}

async function customReplace(message, customMessage, newLevel, newRoleId) {
    try {
        reglist.forEach(reg => {
            if (customMessage.match(reg)) {
                switch (reg.exec(customMessage)[0]) {
                    case '%user%':
                        customMessage = customMessage.replace(reg, message.author.username);
                        break;
                    case '%server%':
                        customMessage = customMessage.replace(reg, message.guild.name);
                        break;
                    case '%members%':
                        customMessage = customMessage.replace(reg, message.guild.memberCount);
                        break;
                    case '%mention%':
                        customMessage = customMessage.replace(reg, `<@!${message.author.id}>`);
                        break;
                    case '%avatar%':
                        let avatarURL = message.author.avatarURL({
                            dynamic: true
                        });

                        if (avatarURL === null){
                            avatarURL = `https://cdn.discordapp.com/embed/avatars/${message.member.user.discriminator % 5}.png`;
                        }

                        customMessage = customMessage.replace(reg, avatarURL);
                        break;
                    case '%role%':
                        customMessage = customMessage.replace(reg, `<@&${newRoleId}>`);
                        break;
                    case '%level%':
                        customMessage = customMessage.replace(reg, newLevel);
                        break;
                }
            }
        });

        return {message: customMessage, user: `<@!${message.author.id}>`};
    } catch (err) {
        logger.error(err);
    }
}

module.exports = {Minor, Compare, Roles, Servers, Levels, Logs, Dates, Permissions}