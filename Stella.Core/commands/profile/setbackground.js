const {MessageEmbed} = require('discord.js');
const config = require('../../../config.json');
const {User} = require('../../misc/dbObjects');
const download = require('image-downloader');

module.exports = {
    name: 'setbackground',
    aliases: ['sbg'],
    category: 'profile',
    description: 'Change the background of your xp card to a custom image.\n' +
        'Everything will be converted to a `.PNG` format.',
    cost: `5000 ${config.currencyEmoji}`,
    usage: '[command | alias] <image link/image attachment>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.normal)
            .setTitle('Set background');
        const urlReg = new RegExp('.(jpeg|jpg|png)');
        let url;
        let user;
        user = await User.findOne({
            where: {
                userId: message.author.id
            }
        });

        if (user.balance < 5000)
            return await message.channel.send(embed.setDescription('You do not have enough balance to pay for this action!')
                .addField('Your balance', `${user.balance} ${bot.currencyEmoji}`, true)
                .addField('Background change price', `5000 ${bot.currencyEmoji}`, true)
                .setColor(bot.embedColors.error));

        //detect if link or attachment
        if (message.attachments.size > 0 && !urlReg.test(args[0])) {
            let file = message.attachments.first();
            url = file.url;
        } else if (message.attachments.size === 0 && urlReg.test(args[0])) {
            url = args[0];
        } else if (message.attachments.size === 0 && !urlReg.test(args[0])) {
            return await message.channel.send(embed.setDescription('Please provide a valid image link/attachment!').setColor(bot.embedColors.error));
        } else {
            return await message.channel.send(embed.setDescription('Please provide only an image link/attachment!').setColor(bot.embedColors.error));
        }

        const path = `./Stella.Core/misc/images/custom/${message.author.id}.png`;
        const options = {
            url: url,
            dest: path
        };

        await download.image(options)
            .then(({filename}) => {
                message.channel.send(
                    embed.setDescription('Your new background is')
                        .attachFiles([filename])
                        .setImage(`attachment://${message.author.id}.png`)
                );
            })
            .catch((err) => console.error(err));

        User.remove(user, 5000);
    }
}