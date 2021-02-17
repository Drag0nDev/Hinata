const {MessageEmbed} = require('discord.js');
const config = require('../../../config.json');
const {User, Category, Inventory, Shop} = require('../../misc/dbObjects');
const download = require('image-downloader');
const logger = require("log4js").getLogger();
const cost = 10000;

module.exports = {
    name: 'addcustombackground',
    aliases: ['acbg'],
    category: 'profile',
    description: 'Change the background of your xp card to a custom image.\n' +
        'Everything will be converted to a `.PNG` format.\n' +
        '**TOS breaking images will be removed without refund!**',
    cost: `${cost} ${config.currencyEmoji}`,
    usage: '[command | alias] <image link/image attachment>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.normal)
            .setTitle('Add custom background');
        const urlReg = new RegExp('.(jpeg|jpg|png)$');
        let url;
        let user;
        let file;
        user = await User.findOne({
            where: {
                userId: message.author.id
            }
        });

        if (user.balance < cost)
            return await message.channel.send(embed.setDescription('You do not have enough balance to pay for this action!')
                .addField('Your balance', `${user.balance} ${bot.currencyEmoji}`, true)
                .addField('Background change price', `${cost} ${bot.currencyEmoji}`, true)
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

        const path = `./Hinata.Core/misc/images/custom/${message.author.id}.png`;
        const options = {
            url: url,
            dest: path
        };

        await download.image(options)
            .then(({filename}) => {
                message.channel.send(
                    embed.setDescription('Your new background is')
                        .attachFiles([{
                            attachment: filename,
                            name: 'background.png'
                        }])
                        .setImage(`attachment://background.png`)
                );
                file = filename;
            })
            .catch((err) => logger.error(err));

        //User.remove(user, cost);
        //User.setBg(user, 'custom');
        await changeDb(bot, message, file);
    }
}

async function changeDb(bot, message, file) {
    let cat;
    cat = await Category.findOne({
        where: {
            name: 'custom'
        }
    });

    let shop;
    shop = await Shop.findOne({
        where: {
            name: `${message.author.id}_${cat.name}_background`,
            category: cat.id
        }
    });

    if (!shop) {
        shop = await Shop.create({
            name: `${message.author.id}_${cat.name}_background`,
            image: `${message.author.id}.png`,
            price: cost,
            category: cat.id
        });

        Inventory.create({
            userId: message.author.id,
            shopId: shop.id,
            categoryId: cat.id
        });
    }
}