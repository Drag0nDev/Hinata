const {MessageEmbed} = require('discord.js');
const {Shop, Category} = require('../../misc/dbObjects');
const config = require("../../../config.json");
const {Permissions} = require('../../misc/tools');
const logger = require("log4js").getLogger();
const download = require('image-downloader');

module.exports = {
    name: 'addshop',
    aliases: ['as'],
    category: 'ownershop',
    description: 'Add an item to the shop.\n',
    usage: '[command | alias] [itemname] [price] [category] <image/link>',
    examples: ['h!as -n diamond ring -p 500 -c badge -im'],
    ownerOnly: true,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('Add shop');
        const name = new RegExp('-n', 'i');
        const price = new RegExp('-p', 'i');
        const category = new RegExp('-c', 'i');
        const image = new RegExp('-im', 'i');
        const format = new RegExp('.(jpeg|jpg|png)$');
        let item = {};
        let str = args.join(' ');
        let db = {};

        //check if the name, price and category are given
        if (!name.test(str) && !price.test(str) && !category.test(str)) {
            embed.setColor(bot.embedColors.embeds.error);

            if (!name.test(str))
                embed.addField('Name', 'Please provide a name!');
            if (!price.test(str))
                embed.addField('Price', 'Please provide a price!')
            if (!category.test(str))
                embed.addField('Category', 'Please provide a category!');

            return await message.channel.send(embed);
        }

        //get name, category, price and image(if given)
        let array = [name.exec(str), price.exec(str), category.exec(str)];

        if (image.test(str))
            array.push(image.exec(str));

        array.sort((a, b) => a.index - b.index);

        for (let i = 0; i < array.length; i++) {
            let input = array[i];

            switch (input[0]) {
                case '-n':
                    if (array[i + 1])
                        item.name = str.substring(input.index, array[i + 1].index).replace(name, '').trim();
                    else
                        item.name = str.substring(input.index).replace(name, '').trim();
                    break;
                case '-p':
                    if (array[i + 1])
                        item.price = str.substring(input.index, array[i + 1].index).replace(price, '').trim();
                    else
                        item.price = str.substring(input.index).replace(price, '').trim();
                    break;
                case '-c':
                    if (array[i + 1])
                        item.category = str.substring(input.index, array[i + 1].index).replace(category, '').trim();
                    else
                        item.category = str.substring(input.index).replace(category, '').trim();
                    break;
                case '-im':
                    if (array[i + 1])
                        item.image = str.substring(input.index, array[i + 1].index).replace(image, '').trim();
                    else
                        item.image = str.substring(input.index).replace(image, '').trim();

                    if (item.image === '') {
                        //detect if link or attachment
                        if (message.attachments.size > 0) {
                            let file = message.attachments.first();
                            item.image = file.url;
                        } else if (message.attachments.size === 0) {
                            return await message.channel.send(embed.setDescription('Please provide a valid image link/attachment!').setColor(bot.embedColors.embeds.error));
                        }
                    } else if (item.image !== '' && message.attachments.size > 0) {
                        return await message.channel.send(embed.setDescription('Please provide only an image link/attachment!').setColor(bot.embedColors.embeds.error));
                    }
                    break;
            }
        }

        //check if category exists
        db.category = await Category.findOne({
            where: {
                name: item.category
            }
        }).catch(err => {
            logger.error(err);
        });

        if (db.category === null) {
            embed.setDescription(`The category **${item.category}** doesn't exist!`)
                .setColor(bot.embedColors.embeds.error);

            return await message.channel.send(embed);
        }

        //check if price is a number
        if (isNaN(parseInt(item.price))) {
            embed.setColor(bot.embedColors.embeds.error)
                .setDescription('Please provide a valid price!');

            return await message.channel.send(embed);
        }

        item.price = parseInt(item.price);

        //check if it is already in the shop
        db.shop = await Shop.findOne({
            where: {
                name: item.name,
                category: db.category.id
            }
        });

        if (db.shop !== null) {
            embed.setDescription(`The item **${item.name}** already exists under the category **${item.category}**!`)
                .setColor(bot.embedColors.embeds.error);

            if (db.shop.image !== null)
                embed.addField('Existing item',
                    `**Name:** ${db.shop.name}\n` +
                    `**Category:** ${db.category.name}\n` +
                    `**Price:** ${db.shop.price} ${bot.currencyEmoji}\n` +
                    `**Image:**`)
                    .attachFiles([{
                        attachment: `./Hinata.Core/misc/images/inventory/${db.shop.image}`,
                        name: 'preview.png'
                    }])
                    .setImage('attachment://preview.png');
            else
                embed.addField('Existing item',
                    `**Name:** ${db.shop.name}\n` +
                    `**Category:** ${db.category.name}\n` +
                    `**Price:** ${db.shop.price} ${bot.currencyEmoji}`);

            return await message.channel.send(embed);
        }

        //check if there is an image
        if (item.image) {
            if (!format.test(item.image)) {
                embed.setColor(bot.embedColors.embeds.error)
                    .setDescription('Please provide a valid image link!');

                return await message.channel.send(embed);
            }

            await Shop.create({
                name: item.name,
                image: `${item.name}_${db.category.name}.png`,
                price: parseInt(item.price),
                category: db.category.id
            });

            const path = `./Hinata.Core/misc/images/inventory/${item.name}_${db.category.name}.png`;
            const options = {
                url: item.image,
                dest: path
            };

            await download.image(options)
                .catch((err) => logger.error(err));

            await embed.setColor(bot.embedColors.logs.logAdd)
                .setDescription('New item added!\n' +
                    '**Values:**')
                .addField('Name:', item.name, true)
                .addField('Category:', item.category, true)
                .addField('Price:', `${item.price} ${bot.currencyEmoji}`, true)
                .addField('Image:', '\u200B')
                .attachFiles([{
                    attachment: `./Hinata.Core/misc/images/inventory/${item.name}_${db.category.name}.png`,
                    name: 'preview.png'
                }])
                .setImage(`attachment://preview.png`);
        } else {
            await Shop.create({
                name: item.name,
                price: parseInt(item.price),
                category: db.category.id
            });

            await embed.setColor(bot.embedColors.logs.logAdd)
                .setDescription('New item added!\n' +
                    '**Values:**')
                .addField('Name:', item.name, true)
                .addField('Category:', item.category, true)
                .addField('Price:', `${item.price} ${bot.currencyEmoji}`, true);
        }

        await message.channel.send(embed);
    }
}