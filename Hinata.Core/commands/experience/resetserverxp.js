const {MessageEmbed} = require("discord.js");
const {ServerUser} = require('../../misc/dbObjects');
const {Permissions} = require('../../misc/tools');
const neededPerm = ['MANAGE_GUILD'];

module.exports = {
    name: 'resetserverxp',
    aliases: ['rsx'],
    category: 'experience',
    description: 'Reset a single member or all members xp',
    usage: '[command | alias] <Member mention/id>',
    examples: ['h!rsx all', 'h!rsx 418037700751261708', 'h!rsx @Drag0n#6666'],
    neededPermissions: neededPerm,
    cooldown: 60,
    run: async (bot, message, args) => {
        const reset = {
            send: async (msg) => {
                return message.channel.send(msg);
            },
            embed: new MessageEmbed(),
            regex: {
                mode: new RegExp('all'),
                id: new RegExp('[0-9]{17,}'),
            }
        }

        try {
            if (reset.regex.mode.exec(args[0])) {
                await resetAll(bot, message, reset);
            } else {
                if (!reset.regex.id.exec(args[0]))
                    return await message.channel.send(reset.embed.setColor(bot.embedColors.embeds.error)
                        .setDescription('Please provide a valid memberid / mention'));

                reset.id = reset.id.exec(args[0])[0];

                await resetServerUser(bot, message, reset);
            }
        } catch (err) {
            await reset.send(reset.embed.setColor(bot.embedColors.embeds.error)
                .setDescription('No valid arguments given.'));
        }
    }
}

async function resetAll(bot, message, reset) {
    reset.users = await ServerUser.findAll({
        where: {
            guildId: message.guild.id
        }
    }).then(users => {
        users.forEach(user => {
            user.xp = 0;
            user.save();
        });

        reset.amount = users.length;
    });

    reset.embed.setColor(bot.embedColors.embeds.normal)
        .setTitle(`Reset server xp`)
        .setDescription(`All **${reset.users.length}** members xp have been reset to 0xp!`)
        .setTimestamp();

    await reset.send(reset.embed);
}

async function resetServerUser(bot, message, reset) {
    reset.user = await ServerUser.findOne({
        where: {
            userId: reset.id
        }
    }).then(user => {
        const member = message.guild.members.cache.get(reset.id);

        user.xp = 0;
        user.save();

        reset.embed.setColor(bot.embedColors.embeds.normal)
            .setTitle(`Reset server xp`)
            .setDescription(`**${member.user.tag}**'s xp has been reset to 0xp!`)
            .setTimestamp();
    }).catch(err => {
        reset.embed.setColor(bot.embedColors.embeds.error)
            .setDescription(`No user with id **${reset.id}** found in the database`)
            .setTimestamp();
    });

    await reset.send(reset.embed);
}