const {MessageEmbed} = require('discord.js');
let neededPerm = ['MANAGE_GUILD'];

module.exports = {
    name: 'createvoice',
    aliases: ['cv', 'newvoice'],
    category: 'channels',
    description: 'Create a new voice channel',
    usage: '[command | alias] [voice channel name]',
    examples: ['h!cv general'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        const voice = {
            send: async (msg) => {
                message.channel.send(msg);
            },
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal),
            user: message.author,
            name: args.join(' '),
            title: 'Create new voice channel!',
        }

        const channel = message.channel;

        if (!args[0])
            return voice.send(voice.embed.setColor(bot.embedColors.embeds.error)
                .setDescription('Please provide a name!'));

        await message.guild.channels.create(voice.name,
            {
                type: "voice",
                permissionOverwrites: [
                    {
                        id: voice.user.id,
                        allow: ['VIEW_CHANNEL', "MANAGE_CHANNELS"],
                    },
                    {
                        id: bot.user.id,
                        allow: ['VIEW_CHANNEL', "MANAGE_CHANNELS"],
                    },
                    {
                        id: message.guild.roles.everyone,
                        deny: ['VIEW_CHANNEL'],
                    }
                ]
            }).then(newChannel => {

            voice.embed.setTitle(voice.title)
                .setColor(bot.embedColors.embeds.normal)
                .setDescription(`New voice channel created with name **${voice.name}**!`);

            voice.send(voice.embed);
        });
    }
}