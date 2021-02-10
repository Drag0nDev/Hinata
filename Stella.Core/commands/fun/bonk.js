const config = require("../../../config.json");
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'bonk',
    category: 'fun',
    description: 'Bonk a user',
    usage: '[command | alias] [mention user]',
    examples: ['s!bonk 418037700751261708', 's!bonk @Drag0n#6666'],
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('bonk')
            .setTimestamp()
            .setColor(bot.embedColors.normal);

        if (!args[0]) {
            embed.setDescription('Please mention a user or give his/her id!');
            return await message.channel.send(embed);
        }


        const members = getMentions(bot, message, args);
        if (members !== ''){
            embed.setDescription(`${members} <a:bonk:735549944814895115>`);

            await message.channel.send(embed);
        }
    }
}

function getMentions(bot, message, input) {
    let members = '';

    if (message.mentions.users.size > 0) {
        message.mentions.users.forEach(user => {
            if (user.id !== `${config.owner}`)
                members += `<@!${user.id}> `
            else {
                let embed = new MessageEmbed().setTitle('bonk')
                    .setTimestamp()
                    .setColor(bot.embedColors.normal)
                    .setDescription(`${message.author} <a:bonk:735549944814895115>, don't bonk my master!`);
                message.channel.send(embed);
            }
        });
    } else {
        input.forEach(id => {
            if (id !== `${config.owner}`)
                members += `<@!${id}> `
            if (isNaN(parseInt(id))) {
            } else {
                let embed = new MessageEmbed().setTitle('bonk')
                    .setTimestamp()
                    .setColor(bot.embedColors.normal)
                    .setDescription(`${message.author} <a:bonk:735549944814895115>, don't bonk my master!`);
                message.channel.send(embed);
            }
        });
    }

    return members;
}