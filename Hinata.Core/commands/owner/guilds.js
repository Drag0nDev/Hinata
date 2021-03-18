const config = require("../../../config.json")
const {Permissions} = require('../../misc/tools');
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'guilds',
    category: 'owner',
    description: 'Displaying all joined guilds with their respective member count',
    usage: '[command | alias]',
    ownerOnly: true,
    run: async (bot, message) => {
        let embed = new MessageEmbed().setTitle('Guilds').setColor(bot.embedColors.normal);
        let servers = [];

        bot.guilds.cache.forEach(guild => {
            servers.push(guild);
        });

        for (let i = 0; i < servers.length && i < 9; i++) {
            let server = servers[i];

            embed.addField(server.name, `Member count: ${server.memberCount}` + '\n' +
                `Server ID: ${server.id}`, true);
        }

        messageEditor(bot, message, embed, servers);
    }
}

function messageEditor(bot, message, embed, servers) {
    message.channel.send(embed)
        .then(async messageBot => {
            await messageBot.react('◀');
            await messageBot.react('▶');
            let page = 0;

            const filter = (reaction, user) => {
                return (reaction.emoji.name === '◀' || reaction.emoji.name === '▶') && user.id === message.author.id;
            };

            const collector = messageBot.createReactionCollector(filter, {time: 60000});

            collector.on('collect', async (reaction, user) => {
                let editEmbed = new MessageEmbed()
                    .setTitle('Guilds')
                    .setColor(bot.embedColors.normal);

                if (reaction.emoji.name === '▶') {
                    page++;
                    await pageSwitch(message, page, servers, editEmbed);
                } else if (reaction.emoji.name === '◀') {
                    page--;
                    if (page < 0)
                        return;
                    await pageSwitch(message, page, servers, editEmbed);
                }

                if (editEmbed.fields.length !== 0) {
                    await messageBot.edit(editEmbed);
                }
            });

            collector.on('end', collected => {
                messageBot.reactions.removeAll();
            });
        });
}

async function pageSwitch(message, page, servers, editEmbed) {
    for (let i = 9 * page; (i < 9 + (9 * page)) && (i < servers.length); i++) {
        let server = servers[i];

        editEmbed.addField(server.name, `Member count: ${server.memberCount}` + '\n' +
            `Server ID: ${server.id}`, true);
    }
}