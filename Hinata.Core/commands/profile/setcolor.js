const Discord = require('discord.js');
const {User} = require('../../misc/dbObjects');
const Canvas = require('canvas');

module.exports = {
    name: 'setcolor',
    category: 'profile',
    description: 'Set the color for the bars on your xp card!\n' +
        'use `default` if u want to reset it back to the default color!',
    usage: '[command | alias]',
    examples: ['h!setcolor #BE4F70', 'h!setcolor default'],
    run: async (bot, message, args) => {
        let user;
        let embed = new Discord.MessageEmbed().setTitle('Sec custom color')
            .setTimestamp();
        const hex = new RegExp('^#[[0-9|a-f]{6}', 'i');
        let color;

        user = await User.findOne({
            where: {
                userId: message.author.id
            }
        });

        if (hex.test(args[0]))
            color = hex.exec(args[0])[0];
        else if (args[0] === 'default')
            color = bot.embedColors.normal;
        else {
            embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid hex color code!');
            return message.channel.send(embed);
        }

        const canvas = Canvas.createCanvas(128, 128);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'color.png');

        embed.setColor(color)
            .setDescription(`Your custom color is set to **${color}**.\n` +
                '__**Preview**__:')
            .attachFiles([attachment])
            .setImage('attachment://color.png');

        User.changeColor(user, color);

        await message.channel.send(embed);
    }
}