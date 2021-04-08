const {MessageEmbed} = require('discord.js');
const {Shop, Category} = require('../../misc/dbObjects');
const {Minor} = require('../../misc/tools');
const {Op} = require('sequelize');

module.exports = {
    name: 'shop',
    category: 'market',
    description: 'Add an item to the shop.\n',
    usage: '[command | alias] <sortstyle> <name>',
    examples: ['h!shop -n diamond ring -c badge '],
    cooldown: 10,
    run: async (bot, message, args) => {
        let shop = {
            item: {
                name: '',
                category: '',
            },
            embed: new MessageEmbed().setTitle('Shop'),
            nameReg: new RegExp('-n', 'i'),
            catReg: new RegExp('-c', 'i'),
            str: args.join(' '),
            array: []
        };

        if (shop.nameReg.test(shop.str))
            shop.array.push(shop.nameReg.exec(shop.str));
        if (shop.catReg.test(shop.str))
            shop.array.push(shop.catReg.exec(shop.str));

        for (let i = 0; i < shop.array.length; i++) {
            let input = shop.array[i];

            if (input !== null)
                switch (input[0]) {
                    case '-n':
                        shop.item.name = Minor.getValue(shop.str, input, shop.nameReg, shop.array, i);
                        break;
                    case '-c':
                        shop.item.category = Minor.getValue(shop.str, input, shop.catReg, shop.array, i);
                        break;
                }
        }

        if (shop.item.name === '' && shop.item.category === '') {
            await shopMenu(bot, message, shop);
        } else if (shop.item.name !== '' && shop.item.category === '') {
            await shopByName(bot, message, shop);
        } else if (shop.item.name === '' && shop.item.category !== '') {
            await shopByCategory(bot, message, shop);
        } else {
            await shopByNameAndCat(bot, message, shop);
        }
    }
}

async function shopMenu(bot, message, shop) {
    shop.categoryDb = await Category.findAll();
    shop.str = '';

    for (let cat of shop.categoryDb) {
        if (cat.name !== 'hidden' && cat.name !== 'custom')
            shop.str += '- ' + cat.name + '\n';
    }

    await shop.embed.setDescription('**Select a category to view its content.\n' +
        'h!shop -c <category>**\n\n' + shop.str)
        .setColor(bot.embedColors.normal)
        .setTimestamp();

    await message.channel.send(shop.embed);
}

async function shopByName(bot, message, shop) {
    shop.db = await Shop.findAll({
        where: {
            name: {
                [Op.substring]: shop.item.name
            }
        },
        include: [Category],
        order: [
            ['category', 'ASC'],
            ['id', 'ASC']
        ]
    });

    await shop.embed.setColor(bot.embedColors.embeds.embeds.normal)
        .setTimestamp();

    if (shop.db.length === 0) {
        await shop.embed.setDescription(`No items found with name **${shop.item.name}**!`)
            .setColor(bot.embedColors.embeds.error);

        return message.channel.send(shop.embed);
    }

    for (let i = 0; i < 10 && i < shop.db.length; i++) {
        let item = shop.db[i];

        if (item.Category.name !== 'hidden' && item.Category.name !== 'custom') {
            if (item.image !== null) {
                shop.embed.addField(item.name,
                    `**Shop ID:** ${item.id}\n` +
                    `**Category:** ${item.Category.name}\n` +
                    `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                    `**Is image:** Yes`,
                    true)
                    .setFooter('Page 0');
            } else {
                shop.embed.addField(item.name,
                    `**Shop ID:** ${item.id}\n` +
                    `**Category:** ${item.Category.name}\n` +
                    `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                    `**Is image:** No`,
                    true)
                    .setFooter('Page 0');
            }
        }
    }

    messageEditor(bot, message, shop);
}

async function shopByCategory(bot, message, shop) {
    shop.categoryDb = await Category.findOne({
        where: {
            name: {
                [Op.substring]: shop.item.category
            }
        }
    });

    if (shop.categoryDb === null || shop.categoryDb.name === 'hidden' || shop.categoryDb.name === 'custom') {
        await shop.embed.setDescription(`Category **${shop.item.category}** does not exist!`)
            .setColor(bot.embedColors.embeds.error);

        return message.channel.send(shop.embed);
    }

    shop.db = await Shop.findAll({
        where: {
            category: shop.categoryDb.id
        },
        include: [Category],
        order: [
            ['id', 'ASC']
        ]
    });

    await shop.embed.setColor(bot.embedColors.embeds.normal)
        .setTimestamp();

    if (shop.db.length === 0 || shop.categoryDb.name === 'hidden' || shop.categoryDb.name === 'custom') {
        shop.embed.setDescription(`No items found with category **${shop.item.category}**!`);

        return message.channel.send(shop.embed);
    }

    for (let i = 0; i < 10 && i < shop.db.length; i++) {
        let item = shop.db[i];

        if (item.image !== null) {
            shop.embed.addField(item.name,
                `**Shop ID:** ${item.id}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                `**Is image:** Yes`,
                true)
                .setFooter('Page 0');
        } else {
            shop.embed.addField(item.name,
                `**Shop ID:** ${item.id}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                `**Is image:** No`,
                true)
                .setFooter('Page 0');
        }
    }

    messageEditor(bot, message, shop);
}

async function shopByNameAndCat(bot, message, shop) {
    shop.categoryDb = await Category.findOne({
        where: {
            name: {
                [Op.substring]: shop.item.category
            }
        }
    });

    if (shop.categoryDb === null || shop.categoryDb.name === 'hidden' || shop.categoryDb.name === 'custom') {
        await shop.embed.setDescription(`Category **${shop.item.category}** does not exist!`)
            .setColor(bot.embedColors.error);

        return message.channel.send(shop.embed);
    }

    shop.db = await Shop.findAll({
        where: {
            name: {
                [Op.substring]: shop.item.name
            },
            category: shop.categoryDb.id
        },
        include: [Category],
        order: [
            ['category', 'ASC'],
            ['id', 'ASC']
        ]
    });

    await shop.embed.setColor(bot.embedColors.embeds.normal)
        .setTimestamp();

    if (shop.db.length === 0) {
        shop.embed.setDescription(`No items found with name **${shop.item.name}** and category **${shop.categoryDb.name}**!`);

        return message.channel.send(shop.embed);
    }

    for (let i = 0; i < 10 && i < shop.db.length; i++) {
        let item = shop.db[i];

        if (item.image !== null) {
            shop.embed.addField(item.name,
                `**Shop ID:** ${item.id}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                `**Is image:** Yes`,
                true)
                .setFooter('Page 0');
        } else {
            shop.embed.addField(item.name,
                `**Shop ID:** ${item.id}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                `**Is image:** No`,
                true)
                .setFooter('Page 0');
        }
    }

    messageEditor(bot, message, shop);
}

function messageEditor(bot, message, shop) {
    message.channel.send(shop.embed)
        .then(async messageBot => {
            await Minor.addPageArrows(messageBot);
            shop.page = 0;

            const filter = (reaction, user) => {
                return (reaction.emoji.name === '◀' || reaction.emoji.name === '▶') && user.id === message.author.id;
            };

            const collector = messageBot.createReactionCollector(filter, {time: 120000});

            collector.on('collect', async (reaction, user) => {
                shop.editEmbed = new MessageEmbed()
                    .setTitle(`Shop`)
                    .setColor(bot.embedColors.embeds.normal);

                if (reaction.emoji.name === '▶') {
                    shop.page++;
                    await pageEmbed(bot, message, shop);
                } else if (reaction.emoji.name === '◀') {
                    shop.page--;
                    if (shop.page < 0)
                        return;
                    await pageEmbed(bot, message, shop);
                }

                if (shop.editEmbed.fields.length !== 0) {
                    await messageBot.edit(shop.editEmbed);
                }
            });

            collector.on('end', collected => {
                messageBot.reactions.removeAll();
            });
        });
}

async function pageEmbed(bot, message, shop) {
    for (let i = 10 * shop.page; (i < shop.page * 10) && (i < shop.db.length); i++) {
        let item = shop.db[i];

        if (item.image !== null) {
            shop.embed.addField(item.name,
                `**Shop ID:** ${item.id}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                `**Is image:** Yes`,
                true);
        } else {
            shop.embed.addField(item.name,
                `**Shop ID:** ${item.id}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Price:** ${item.price} ${bot.currencyEmoji}\n` +
                `**Is image:** No`,
                true);
        }
    }

    shop.editEmbed.setFooter(`Page ${shop.page + 1}`);
}