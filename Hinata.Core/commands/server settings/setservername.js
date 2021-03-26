const {MessageEmbed} = require('discord.js');
let neededPerm = ['MANAGE_GUILD'];

module.exports = {
    name: 'setservername',
    aliases: ['ssn', 'servername'],
    category: 'server settings',
    description: 'Set a new server name',
    usage: '[command | alias] [new name]',
    examples: ['h!ssn Totally awesome server'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.embeds.normal);

        //simplify the guild
        let guild = message.guild;

        //check if new name is given
        if(!args[0])
            return message.channel.send(
                embed.setDescription('Please give a new name for the server')
                    .setColor(bot.embedColors.embeds.error)
            );

        //new server name
        let newName = args.join(' ');

        //save the old server name
        let oldName = message.guild.name;

        guild.setName(newName)
            .then(updated => {
                embed.setTitle(guild.name)
                    .setThumbnail(guild.iconURL())
                    .setDescription(`Successfully changed the name from **${oldName}** to **${updated.name}**`)
                    .setColor(bot.embedColors.embeds.normal);
                message.channel.send(embed);
            })
            .catch(err => {
                embed.setDescription(err.message.toString().replace("Invalid Form Body\n", ""))
                    .setColor(bot.embedColors.embeds.error);
                message.channel.send(embed);
            });
    }
}