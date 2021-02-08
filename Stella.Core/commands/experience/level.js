const {MessageEmbed} = require('discord.js');
const {User, ServerUser} = require('../../misc/dbObjects');
const config = require("../../../config.json");
const {Servers} = require('../../misc/tools');

module.exports = {
    name: 'level',
    aliases: ['lvl', 'xp'],
    category: 'experience',
    description: 'Show the level card of yourself or a server member',
    usage: '[command | alias] <mention/ID>',
    examples: ['s!xp', 's!xp 418037700751261708', 's!xp @Drag0n#6666'],
    run: async (bot, message, args) => {
        const levelXp = config.levelXp;
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let member;
        let users;
        let user;
        let serverUser;
        let serverUsers;
        let userListId = [];
        let userServerListId = [];

        await Servers.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        users = await User.findAll({
            order: [['level', 'DESC'], ['xp', 'DESC']]
        });

        serverUsers = await ServerUser.findAll({
            order: [['xp', 'DESC']],
            where: {
                guildId: message.guild.id
            }
        });

        users.forEach(user => {
            userListId.push(user.userId);
        });

        serverUsers.forEach(userServer => {
            userServerListId.push(userServer.userId);
        });

        user = users[userListId.indexOf(member.user.id)];
        serverUser = serverUsers[userServerListId.indexOf(member.user.id)];

        let globalRank = userListId.indexOf(member.user.id) + 1;
        let serverRank = userServerListId.indexOf(member.user.id) + 1;

        embed.setTitle(`${member.user.username}#${member.user.discriminator}`)
            .setThumbnail(member.user.avatarURL({dynamic: true}))
            .addField(`Global level`, user.level, true)
            .addField(`Global xp`, `${user.xp}/${levelXp + ((levelXp / 2) * user.level)}`, true)
            .addField('Global rank', globalRank, true)
            .setFooter('This embed is but a placeholder. There will be a picture format level card later');

        let xp = serverUser.xp;
        let lvlXp = levelXp;
        let level = 0;
        let nextLvlXp = 0;

        do {
            nextLvlXp = lvlXp + ((lvlXp / 2) * level);

            if (xp >= nextLvlXp) {
                level++;
                xp -= nextLvlXp;
            }
        } while (xp > nextLvlXp)

        embed.addField('Server level', level, true)
            .addField('Server xp', `${xp}/${levelXp + ((levelXp / 2) * level)}`, true)
            .addField('Server rank', serverRank, true);

        await message.channel.send(embed);
    }
}