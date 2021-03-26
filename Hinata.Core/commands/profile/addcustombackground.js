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
    cooldown: 60,
    run: async (bot, message, args) => {
        const acb = {
            send: async (msg) => {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setTimestamp()
                .setColor(bot.embedColors.embeds.normal)
                .setTitle('Add custom background'),
            urlReg: new RegExp('.(jpeg|jpg|png)$')
        }

        acb.user = await User.findOne({
            where: {
                userId: message.author.id
            }
        });

        if (acb.user.balance < cost)
            return await message.channel.send(acb.embed.setDescription('You do not have enough balance to pay for this action!')
                .addField('Your balance', `${acb.user.balance} ${bot.currencyEmoji}`, true)
                .addField('Background change price', `${cost} ${bot.currencyEmoji}`, true)
                .setColor(bot.embedColors.embeds.error));

        //detect if link or attachment
        if (message.attachments.size > 0 && !acb.urlReg.test(args[0])) {
            let file = message.attachments.first();
            acb.url = file.url;
        } else if (message.attachments.size === 0 && acb.urlReg.test(args[0])) {
            acb.url = args[0];
        } else if (message.attachments.size === 0 && !acb.urlReg.test(args[0])) {
            return await message.channel.send(embed.setDescription('Please provide a valid image link/attachment!').setColor(bot.embedColors.embeds.error));
        } else {
            return await message.channel.send(embed.setDescription('Please provide only an image link/attachment!').setColor(bot.embedColors.embeds.error));
        }

        const path = `./Hinata.Core/misc/images/custom/${message.author.id}.png`;
        const options = {
            url: acb.url,
            dest: path
        };

        await download.image(options)
            .then(({filename}) => {
                message.channel.send(
                    acb.embed.setDescription('Your new background is')
                        .attachFiles([{
                            attachment: filename,
                            name: 'background.png'
                        }])
                        .setImage(`attachment://background.png`)
                );
            })
            .catch((err) => logger.error(err));

        User.remove(acb.user, cost);
        User.setBg(acb.user, 'custom');
        await changeDb(bot, message);
    }
}

async function changeDb(bot, message) {
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

    let inv;
    inv = await Inventory.findAll({
        where: {
            userId: message.author.id,
        }
    });

    let newId = 0;

    inv.forEach(item => {
        if (item.invId > newId)
            newId = item.invId;
    });

    if (!shop) {
        shop = await Shop.create({
            name: `${message.author.id}_${cat.name}_background`,
            image: `${message.author.id}.png`,
            price: cost,
            category: cat.id
        });

        Inventory.create({
            invId: newId + 1,
            userId: message.author.id,
            shopId: shop.id,
            categoryId: cat.id
        });
    }
}