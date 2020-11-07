const {User, ServerUser, Server} = require('./dbObjects');

module.exports = {
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

        return roleArrayAuth[0].position > roleArrayMemb[0].position;
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
    },
    getMember: async function (message, args) {
        return !args[0] ? message.guild.members.cache.get(message.author.id) : message.mentions.members.first() || message.guild.members.cache.get(args[0]);
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
    },
}