const {MessageEmbed} = require('discord.js');
const {Shop, Category, User, Inventory} = require('../../misc/dbObjects');

module.exports = {
    name: 'buy',
    category: 'market',
    description: 'Buy an item from the shop',
    usage: '[command | alias] [id]',
    examples: ['h!shop 5'],
    run: async (bot, message, args) => {
        const shop = {
            embed: new MessageEmbed().setTitle('Buy')
                .setTimestamp()
                .setColor(bot.embedColors.normal),
        };
        const checkID = new RegExp('^\\d+$');

        if (!checkID.test(args[0])) {
            shop.embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid ID!');

            return await message.channel.send(shop.embed);
        }

        shop.id = checkID.exec(args[0])[0];

        shop.db = await Shop.findOne({
            where: {
                id: shop.id
            },
            include: [Category]
        });

        shop.user = await User.findOne({
            where: {
                userId: message.author.id
            }
        });

        if (shop.db === null) {
            shop.embed.setColor(bot.embedColors.normal)
                .setDescription(`No item with ID **${shop.id}** found!`);

            return await message.channel.send(shop.embed);
        }

        if (shop.db.Category.name === 'hidden') {
            shop.embed.setColor(bot.embedColors.normal)
                .setDescription('This ID is not linked to an item that is buyable!');

            return await message.channel.send(shop.embed);
        }

        if (shop.db.price > shop.user.balance) {
            shop.embed.setDescription('You do not have enough balance to buy this item')
                .addField('Name', shop.db.name, true)
                .addField('Category', shop.db.Category.name, true)
                .addField('Price', `${shop.db.price} ${bot.currencyEmoji}`, true);

            if (shop.db.image !== null) {
                shop.imagePath = `./Hinata.Core/misc/images/inventory/${shop.db.image}`
                shop.embed.attachFiles([{attachment: shop.imagePath, name: 'item.png'}])
                    .setImage('attachment://item.png');
            }

            await message.channel.send(shop.embed);
        } else {
            //check if user already has the item in his inventory
            shop.already = false;
            shop.inventory = await Inventory.findAll({
                where: {
                    userId: message.author.id
                }
            });

            shop.inventory.forEach(item => {
                if (item.shopId === shop.db.id) {
                    shop.embed.setDescription('You already have this item in your inventory!')
                        .addField('Name', shop.db.name, true)
                        .addField('Category', shop.db.Category.name, true)
                        .addField('Price', `${shop.db.price} ${bot.currencyEmoji}`, true);

                    if (shop.db.image !== null) {
                        shop.imagePath = `./Hinata.Core/misc/images/inventory/${shop.db.image}`
                        shop.embed.attachFiles([{attachment: shop.imagePath, name: 'item.png'}])
                            .setImage('attachment://item.png');
                    }

                    message.channel.send(shop.embed);

                    shop.already = true;
                }
            });

            if (!shop.already) {
                shop.embed.setDescription('Do you want to buy this item?\n' +
                    'Type `yes` to confirm.')
                    .addField('Name', shop.db.name, true)
                    .addField('Category', shop.db.Category.name, true)
                    .addField('Price', `${shop.db.price} ${bot.currencyEmoji}`, true);

                if (shop.db.image !== null) {
                    shop.imagePath = `./Hinata.Core/misc/images/inventory/${shop.db.image}`
                    shop.embed.attachFiles([{attachment: shop.imagePath, name: 'item.png'}])
                        .setImage('attachment://item.png');
                }

                await message.channel.send(shop.embed).then(async msg => {
                    const embed = new MessageEmbed().setTitle('Buy')
                        .setTimestamp()
                        .setColor(bot.embedColors.normal);
                    const filter = m => m.author.id === message.author.id;

                    msg.channel.awaitMessages(filter, {max: 1, time: 60000, errors: ['time']})
                        .then(collected => {
                            const collect = collected.first();

                            if (collect.content.toLowerCase() !== 'yes') {
                                embed.setDescription('The purchase has been canceled');

                                return msg.channel.send(embed);
                            }

                            Inventory.create({
                                userId: message.author.id,
                                shopId: shop.db.id,
                                categoryId: shop.db.category
                            });

                            User.remove(shop.user, shop.db.price);

                            embed.setDescription('Purchase successful.\n' +
                                `Your new balance is **${shop.user.balance} ${bot.currencyEmoji}**.`);

                            return msg.channel.send(embed);
                        }).catch(collected => {
                        embed.setDescription('You failed to reply within the given timeframe.\n' +
                            'The purchase has been canceled!');

                        return msg.channel.send(embed)
                    });
                });
            }
        }
    }
}