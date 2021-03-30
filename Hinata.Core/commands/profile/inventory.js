const {MessageEmbed} = require('discord.js');
const {Inventory, Shop, Category} = require('../../misc/dbObjects');
const {Permissions, Minor, Compare, Servers, Dates, Roles, Levels, Logs} = require('../../misc/tools');
const logger = require("log4js").getLogger();
const {Op} = require('sequelize');

module.exports = {
    name: 'inventory',
    aliases: ['inv'],
    category: 'profile',
    description: 'Shows your own profile',
    usage: '[command | alias]',
    cooldown: 5,
    run: async (bot, message, args) => {
        const inventory = {
            item: {
                name: '',
                category: '',
            },
            embed: new MessageEmbed().setTitle('Inventory')
                .setTimestamp()
                .setColor(bot.embedColors.embeds.normal),
            nameReg: new RegExp('-n', 'i'),
            catReg: new RegExp('-c', 'i'),
            str: args.join(' '),
            array: []
        }

        if (inventory.nameReg.test(inventory.str))
            inventory.array.push(inventory.nameReg.exec(inventory.str));
        if (inventory.catReg.test(inventory.str))
            inventory.array.push(inventory.catReg.exec(inventory.str));

        for (let i = 0; i < inventory.array.length; i++) {
            let input = inventory.array[i];

            if (input !== null)
                switch (input[0]) {
                    case '-n':
                        inventory.item.name = getValue(inventory.str, input, inventory.nameReg, inventory.array, i);
                        break;
                    case '-c':
                        inventory.item.category = getValue(inventory.str, input, inventory.catReg, inventory.array, i);
                        break;
                }
        }

        if (inventory.item.name === '' && inventory.item.category === '') {
            await inventoryAll(bot, message, inventory);
        } else if (inventory.item.name !== '' && inventory.item.category === '') {
            await inventoryByName(bot, message, inventory);
        } else if (inventory.item.name === '' && inventory.item.category !== '') {
            await inventoryByCategory(bot, message, inventory);
        } else {
            await inventoryByNameAndCat(bot, message, inventory);
        }
    }
}

async function inventoryAll(bot, message, inventory) {
    inventory.embed.setDescription(`All your items`);

    inventory.db = await Inventory.findAll({
        where: {
            userId: message.author.id
        },
        order: [
            ['categoryId', 'ASC'],
        ],
        include: [Shop, Category]
    });

    for (let i = 0; i < inventory.db.length && i < 10; i++) {
        let item = inventory.db[i];
        let name = item.Shop.name === `${message.author.id}_custom_background` ? 'Custom background' : item.Shop.name;

        if (item.Shop.image !== null) {
            inventory.embed.addField(name,
                `**ID:** ${item.invId}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Is image:** Yes`,
                true);
        } else {
            inventory.embed.addField(name,
                `**ID:** ${item.invId}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Is image:** No`,
                true);
        }
    }

    messageEditor(bot, message, inventory);
}

async function inventoryByName(bot, message, inventory) {
    inventory.db = await Inventory.findAll({
        include: [{
            model: Category,
            required: true
        }, {
            model: Shop,
            required: true,
            where: {
                name: {
                    [Op.substring]: inventory.item.name
                }
            }
        }],
        order: [
            ['categoryId', 'ASC'],
            ['shopId', 'ASC']
        ]
    });

    inventory.embed.setColor(bot.embedColors.embeds.normal)
        .setTimestamp();

    if (inventory.db.length === 0) {
        inventory.embed.setDescription(`No items found with name **${inventory.item.name}**!`);

        return message.channel.send(inventory.embed);
    }

    for (let i = 0; i < 10 && i < inventory.db.length; i++) {
        let item = inventory.db[i];
        let name = item.Shop.name === `${message.author.id}_custom_background` ? 'Custom background' : item.Shop.name;

        if (item.image !== null) {
            inventory.embed.addField(name,
                `**ID:** ${item.invId}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Is image:** Yes`,
                true)
                .setFooter('Page 0');
        } else {
            inventory.embed.addField(name,
                `**ID:** ${item.invId}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Is image:** No`)
                .setFooter('Page 0');
        }
    }

    messageEditor(bot, message, inventory);
}

async function inventoryByCategory(bot, message, inventory) {
    inventory.categoryDb = await Category.findOne({
        where: {
            name: {
                [Op.substring]: inventory.item.category
            }
        }
    });

    if (inventory.categoryDb === null || inventory.categoryDb.name === 'hidden') {
        inventory.embed.setDescription(`Category **${inventory.item.category}** does not exist!`)
            .setColor(bot.embedColors.embeds.error);

        return message.channel.send(inventory.embed);
    }

    inventory.db = await Inventory.findAll({
        where: {
            userId: message.author.id
        },
        include: [{
            model: Category,
            required: true,
            where: {
                name: {
                    [Op.substring]: inventory.item.category
                }
            }
        }, {
            model: Shop,
            required: true
        }],
        order: [
            ['invId', 'ASC']
        ]
    });

    inventory.embed.setColor(bot.embedColors.embeds.normal)
        .setTimestamp();

    if (inventory.db.length === 0 || inventory.categoryDb.name === 'hidden') {
        inventory.embed.setDescription(`No items found with category **${inventory.item.category}**!`);

        return message.channel.send(inventory.embed);
    }

    for (let i = 0; i < 10 && i < inventory.db.length; i++) {
        let item = inventory.db[i];
        let name = item.Shop.name === `${message.author.id}_custom_background` ? 'Custom background' : item.Shop.name;
        console.log(item);

        if (item.image !== null) {
            inventory.embed.addField(name,
                `**ID:** ${item.invId}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Is image:** Yes`,
                true)
                .setFooter('Page 0');
        } else {
            inventory.embed.addField(name,
                `**ID:** ${item.invId}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Is image:** No`,
                true)
                .setFooter('Page 0');
        }
    }

    messageEditor(bot, message, inventory);
}

async function inventoryByNameAndCat(bot, message, inventory) {
    inventory.categoryDb = await Category.findOne({
        where: {
            name: {
                [Op.substring]: inventory.item.category
            }
        }
    });

    if (inventory.categoryDb === null || inventory.categoryDb.name === 'hidden') {
        inventory.embed.setDescription(`Category **${inventory.item.category}** does not exist!`);

        return message.channel.send(inventory.embed);
    }

    inventory.db = await Inventory.findAll({
        include: [{
            model: Category,
            required: true,
            where: {
                name: {
                    [Op.substring]: inventory.item.category
                }
            }
        }, {
            model: Shop,
            required: true,
            where: {
                name: {
                    [Op.substring]: inventory.item.name
                }
            }
        }],
        order: [
            ['categoryId', 'ASC'],
            ['shopId', 'ASC']
        ]
    });

    inventory.embed.setColor(bot.embedColors.embeds.normal)
        .setTimestamp();

    if (inventory.db.length === 0) {
        inventory.embed.setDescription(`No items found with name **${inventory.item.name}** and category **${inventory.categoryDb.name}**!`);

        return message.channel.send(inventory.embed);
    }

    for (let i = 0; i < 10 && i < inventory.db.length; i++) {
        let item = inventory.db[i];
        let name = item.Shop.name === `${message.author.id}_custom_background` ? 'Custom background' : item.Shop.name;

        if (item.image !== null) {
            inventory.embed.addField(name,
                `**ID:** ${item.invId}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Is image:** Yes`,
                true)
                .setFooter('Page 0');
        } else {
            inventory.embed.addField(item.Shop.name,
                `**ID:** ${item.invId}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Is image:** No`)
                .setFooter('Page 0');
        }
    }

    messageEditor(bot, message, inventory);
}

function messageEditor(bot, message, inventory) {
    message.channel.send(inventory.embed)
        .then(async messageBot => {
            await Minor.addPageArrows(messageBot);
            inventory.page = 0;

            const filter = (reaction, user) => {
                return (reaction.emoji.name === '◀' || reaction.emoji.name === '▶') && user.id === message.author.id;
            };

            const collector = messageBot.createReactionCollector(filter, {time: 120000});

            collector.on('collect', async (reaction, user) => {
                inventory.editEmbed = new MessageEmbed()
                    .setTitle(`Shop`)
                    .setColor(bot.embedColors.embeds.normal);

                if (reaction.emoji.name === '▶') {
                    inventory.page++;
                    await pageEmbed(bot, message, inventory);
                } else if (reaction.emoji.name === '◀') {
                    inventory.page--;
                    if (inventory.page < 0)
                        return;
                    await pageEmbed(bot, message, inventory);
                }

                if (inventory.editEmbed.fields.length !== 0) {
                    await messageBot.edit(inventory.editEmbed);
                }
            });

            collector.on('end', collected => {
                messageBot.reactions.removeAll().catch();
            });
        });
}

async function pageEmbed(bot, message, inventory) {
    for (let i = 10 * inventory.page; (i < inventory.page * 10) && (i < inventory.db.length); i++) {
        let item = inventory.db[i];

        if (item.Shop.image !== null) {
            inventory.embed.addField(item.name,
                `**ID:** ${item.invId}\n` +
                `**Name:** ${item.Shop.name}`
                    `**Category:** ${item.Category.name}\n` +
                `**Is image:** Yes`,
                true);
        } else {
            inventory.embed.addField(item.name,
                `**ID:** ${item.invId}\n` +
                `**Category:** ${item.Category.name}\n` +
                `**Is image:** No`,
                true);
        }
    }

    inventory.editEmbed.setFooter(`Page ${inventory.page + 1}`);
}

function getValue(str, input, reg, array, i) {
    if (array[i + 1])
        return str.substring(input.index, array[i + 1].index).replace(reg, '').trim();
    else
        return str.substring(input.index).replace(reg, '').trim();
}