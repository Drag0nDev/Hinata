const {MessageEmbed} = require('discord.js');
const {Minor, Permissions, Roles} = require('../../misc/tools');
let neededPerm = ['MANAGE_ROLES'];

module.exports = {
    name: 'roledelete',
    aliases: ['rd', 'delrole'],
    category: 'roles',
    description: 'Create a role with the bot through a menu.',
    usage: '[command | alias] [name]',
    examples: ['h!rd awesome role'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        const oldRole = {
            send: async function (msg) {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setTitle('Role delete')
                .setColor(bot.embedColors.normal)
                .setTimestamp(),
            name: args.join(' '),
            colors: {
                normal: bot.embedColors.normal,
                error: bot.embedColors.error
            }
        };
        const guild = message.guild;

        //check permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, oldRole.embed);
        if (noUserPermission)
            return await oldRole.send(oldRole.embed);

        let noBotPermission = Permissions.checkBotPermissions(bot, message, neededPerm, oldRole.embed);
        if (noBotPermission)
            return oldRole.send(oldRole.embed);

        oldRole.role = guild.roles.cache.find(role => role.name === oldRole.name);

        oldRole.role.delete()
            .then(deleted => {
                oldRole.embed.setDescription(`The role **${deleted.name}** has been deleted!`);
                oldRole.send(oldRole.embed);
            });
    }
}