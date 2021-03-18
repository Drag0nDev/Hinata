const {MessageEmbed} = require('discord.js');
const {Shop, Category} = require('../../misc/dbObjects');
const {Minor} = require('../../misc/tools');
const {Op} = require('sequelize');

/*
This command doesnt remove the item from the actual shop but instead hides it from visibility.
This is done so that if items are of events they can still be seen in the inventory of the people who obtained it.
 */

module.exports = {
    name: 'removeshop',
    aliases: ['rshop'],
    category: 'ownershop',
    description: 'Remove an item from the shop.\n',
    usage: '[command | alias] [id]',
    examples: ['h!rshop 10'],
    ownerOnly: true,
    run: async (bot, message, args) => {
        let shop = {
            embed: new MessageEmbed().setTitle('Remove shop')
                .setTimestamp(),
            idReg: new RegExp('^\\d+$'),
        };
        if (shop.idReg.test(args[0]))
            shop.id = shop.idReg.exec(args[0])[0];
        else {
            shop.embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid id!');

            return message.channel.send(shop.embed);
        }

        shop.categoryDb = await Category.findOne({
            where: {
                name: 'hidden'
            }
        });

        shop.item = await Shop.findOne({
            where: {
                id: shop.id
            }
        });

        if (shop.item === null) {
            shop.embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid id!');

            return message.channel.send(shop.embed);
        }

        shop.item.category = shop.categoryDb.id;
        shop.item.save();

        shop.embed.setColor(bot.embedColors.normal)
            .setDescription(`Item **${shop.item.name}** has been removed from the shop display.`);

        await message.channel.send(shop.embed)
    }
}