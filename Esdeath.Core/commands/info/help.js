const {MessageEmbed} = require('discord.js');
const config = require("../../../config.json");

module.exports = {
    name: 'help',
    aliases: ['h'],
    category: 'info',
    description: 'A function to show all commands',
    usage: '[command | alias]',
    run: (bot, message, args) => {
        const commands = (category) => {
            return bot.commands
                .filter(cmd => cmd.category === category)
                .map(cmd => `${cmd.name}`)
                .join("\n");
        }

        console.log(bot.categories[2])
        console.log(commands(bot.categories[2]))

        //embed creation
        const embed = new MessageEmbed()
            .setColor('#2f4fd2')
            .setTitle('Help')
            .setURL('https://discord.gg/ReBJ4AB')
            .setThumbnail('https://i.imgur.com/SgO68RV.png')
            .setTimestamp()
            .setFooter(`For more help type esdeath help [command]`);

        bot.categories.forEach(cat => {
            const _name = cat;
            const _value = commands(cat);
            embed.addField(_name, _value, true);
        });

        return message.channel.send(embed);
    }
}