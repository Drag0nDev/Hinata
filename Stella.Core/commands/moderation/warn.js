const neededPerm = ['KICK_MEMBERS'];
const {MessageEmbed} = require("discord.js");
const {Warnings} = require('../../misc/dbObjects');
const tools = require('../../misc/tools');

module.exports = {
    name: 'warn',
    category: 'moderation',
    description: 'Warn a member',
    usage: '[command | alias] [Member mention/id] <reason>',
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed();
        const author = message.guild.members.cache.get(message.author.id);
        let casenr;

        //check member and bot permissions
        let noUserPermission = tools.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = tools.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        //check if there is an argument
        if (!args[0])
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a member to warn!'));

        let member;

        await tools.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        //check if member is in the server
        if (!member) {
            return message.channel.send("No member found with this id/name!");
        }

        if (!tools.compareRoles(message.guild.members.cache.get(message.author.id), member)) {
            return message.channel.send(embed = new MessageEmbed().setTitle('Action not allowed!')
                .setColor(bot.embedColors.error)
                .setDescription(`You can't warn **${member.user.tag}** due to role hierarchy!`));
        }

        await args.shift();
        const reason = args.join(' ');

        await Warnings.findAll({
            where: {
                guildId: message.guild.id
            }
        }).then(async warnings => {
            await Warnings.create({
                casenr: (warnings.length + 1),
                guildId: message.guild.id,
                userId: member.user.id,
                moderatorId: author.user.id,
                reason: reason
            }).then(warning => {
                embed.setColor(bot.embedColors.normal)
                    .setTitle('Warn')
                    .setDescription(`**${member.user.tag}** got warned with reason: **${warning.reason}**!`)
                    .setTimestamp();
                casenr = warning.casenr;
            })
        });

        await member.createDM().then(async dmChannel => {
            await dmChannel.send(`You got warned in **${message.guild.name}** for reason: **${reason}**!`);
        }).catch(error => {
            embed.addField('No DM sent', `${member.user.tag} was warned but could not be DMed!`);
        });

        await message.channel.send(embed);

        const logEmbed = new MessageEmbed().setTitle('User warned')
            .setColor(bot.embedColors.warn)
            .setDescription(`**Member:** ${member.user.tag}\n` +
                `**Reason:** ${reason}\n` +
                `**Responsible Moderator:** ${message.author.tag}\n` +
                `**Case:** ${casenr}`)
            .setFooter(`ID: ${member.user.id}`)
            .setTimestamp();

        await tools.modlog(author, logEmbed);
    }
}