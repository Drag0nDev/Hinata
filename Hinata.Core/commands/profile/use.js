const {MessageEmbed} = require('discord.js');
const {Inventory, Shop, Category, User, ServerUser} = require('../../misc/dbObjects');
const Canvas = require('canvas');
const config = require("../../../config.json");

module.exports = {
    name: 'use',
    category: 'profile',
    description: 'Set the background for your xp card!',
    usage: '[command | alias] [id]',
    examples: ['h!use 5'],
    run: async (bot, message, args) => {
        const item = {
            send: async function (msg) {
                await message.channel.send(msg);
            },
            normal: bot.embedColors.normal,
            error: bot.embedColors.error,
            embed: new MessageEmbed()
                .setTimestamp()
                .setColor(bot.embedColors.normal),
            idReg: new RegExp('^\\d+$')
        };

        if (!item.idReg.test(args[0])) {
            item.embed.setDescription('Please provide a valid id!')
                .setColor(item.error);

            return await item.send(item.embed);
        }

        item.id = item.idReg.exec(args[0])[0];

        //find in the inventory
        item.inventory = await Inventory.findOne({
            where: {
                userId: message.author.id,
                invId: item.id
            },
            include: [Shop, Category]
        });

        if (item.inventory === null) {
            item.embed.setColor(item.error)
                .setDescription('Please provide a valid id!');

            return await item.send(item.embed);
        }

        item.embed.setTitle(`Use ${item.inventory.Category.name}`);

        //get image
        switch (item.inventory.Category.name) {
            case 'background':
                item.image = `./Hinata.Core/misc/images/inventory/${item.inventory.Shop.image}`;

                await showXpCard(bot, message, item);

                await message.channel.send(item.embed).then(msg => {
                    const embed = new MessageEmbed().setTitle('set background')
                        .setTimestamp()
                        .setColor(item.normal);
                    const filter = m => m.author.id === message.author.id;

                    msg.channel.awaitMessages(filter, {max: 1, time: 60000, errors: ['time']})
                        .then(async collected => {
                            const collect = collected.first();

                            if (collect.content.toLowerCase() !== 'yes') {
                                embed.setDescription('The purchase has been canceled');

                                return item.send(embed);
                            }

                            item.user = await User.findOne({
                                where: {
                                    userId: message.author.id
                                }
                            });

                            User.setBg(item.user, item.inventory.Shop.image);

                            embed.setDescription('Your background has been changed successfully');

                            return item.send(embed);
                        }).catch(collected => {
                        embed.setDescription('You failed to reply within the given timeframe.\n' +
                            'The purchase has been canceled!');

                        item.send(embed)
                    });
                });

                break;
            case 'custom':
                item.image = `./Hinata.Core/misc/images/custom/${item.inventory.Shop.image}`;

                await showXpCard(bot, message, item);

                await message.channel.send(item.embed).then(msg => {
                    const embed = new MessageEmbed().setTitle('set background')
                        .setTimestamp()
                        .setColor(item.normal);
                    const filter = m => m.author.id === message.author.id;

                    msg.channel.awaitMessages(filter, {max: 1, time: 60000, errors: ['time']})
                        .then(async collected => {
                            const collect = collected.first();

                            if (collect.content.toLowerCase() !== 'yes') {
                                embed.setDescription('The purchase has been canceled');

                                return item.send(embed);
                            }

                            item.user = await User.findOne({
                                where: {
                                    userId: message.author.id
                                }
                            });

                            User.setBg(item.user, 'custom');

                            embed.setDescription('Your background has been changed successfully');

                            return item.send(embed);
                        }).catch(collected => {
                        embed.setDescription('You failed to reply within the given timeframe.\n' +
                            'The purchase has been canceled!');

                        item.send(embed)
                    });
                });

                break;
            default:
                item.embed.setDescription('There is no use for this category/item at the moment!\n' +
                    'Use for the item will be added soon!');

                await item.send(item.embed);
                break;
        }
    }
}

async function showXpCard(bot, message, preview) {
    preview.user = getGlobal(await User.findOne({
        where: {
            userId: message.author.id
        }
    }));

    preview.serverUser = getServer(await ServerUser.findOne({
        where: {
            userId: message.author.id,
            guildId: message.guild.id
        }
    }));

    if (preview.user.color === null)
        preview.color = bot.embedColors.normal;
    else
        preview.color = preview.user.color;

    preview.canvas = Canvas.createCanvas(2048, 1024);

    preview.ctx = preview.canvas.getContext('2d');
    preview.ctx.font = '50px Dosis';

    preview.background = await Canvas.loadImage(preview.image)

    preview.ctx.drawImage(preview.background, 0, 0, preview.canvas.width, preview.canvas.height);

    preview.ctx.strokeStyle = bot.embedColors.normal;
    preview.ctx.strokeRect(0, 0, preview.canvas.width, preview.canvas.height);

    //draw global xp bar
    //draw bar
    preview.ctx.beginPath();
    preview.ctx.lineWidth = 10;
    preview.ctx.strokeStyle = preview.color;
    preview.ctx.fillStyle = '#fff';
    preview.ctx.strokeRect(100, 500, preview.canvas.width - 200, 50);
    preview.ctx.fillRect(100, 500, preview.canvas.width - 200, 50);

    //fill the bar according to the xp
    preview.ctx.beginPath();
    preview.ctx.fillStyle = preview.color;
    preview.globalWidth = (preview.canvas.width - 200) - ((preview.canvas.width - 200) * (1 - preview.user.percentage));
    preview.ctx.fillRect(100, 500, preview.globalWidth, 50);

    //draw word "Global"
    preview.ctx.fillStyle = '#fff';
    preview.ctx.fillText('Global', 100, 475);

    //draw the level
    preview.ctx.fillText(`Level ${preview.user.level}`, (preview.canvas.width / 2) - (preview.ctx.measureText(`Level ${preview.user.level}`).width / 2), 475);

    //draw the global position
    preview.ctx.fillText(`#0`, preview.canvas.width - (100 + preview.ctx.measureText(`#0`).width), 475);

    //draw current xp
    preview.ctx.fillText(preview.user.xp, 100, 600);

    //draw needed xp
    preview.ctx.fillText(preview.user.neededXp.toString(), preview.canvas.width - (100 + preview.ctx.measureText(preview.user.neededXp.toString()).width), 600);

    //draw the server xp bar
    //draw bar
    preview.ctx.beginPath();
    preview.ctx.lineWidth = 10;
    preview.ctx.strokeStyle = preview.color;
    preview.ctx.fillStyle = '#fff';
    preview.ctx.strokeRect(100, 800, preview.canvas.width - 200, 50);
    preview.ctx.fillRect(100, 800, preview.canvas.width - 200, 50);

    //fill the bar according to the xp
    preview.ctx.beginPath();
    preview.ctx.fillStyle = preview.color;
    preview.serverWidth = (preview.canvas.width - 200) - ((preview.canvas.width - 200) * (1 - preview.serverUser.percentage));
    preview.ctx.fillRect(100, 800, preview.serverWidth, 50);

    //draw word "Server"
    preview.ctx.fillStyle = '#fff';
    preview.ctx.fillText('Server', 100, 775);

    //draw the level
    preview.ctx.fillText(`Level 0`, (preview.canvas.width / 2) - (preview.ctx.measureText(`Level 0`).width / 2), 775);

    //draw the global position
    preview.ctx.fillText(`#0`, preview.canvas.width - (100 + preview.ctx.measureText(`#0`).width), 775);

    //draw current xp
    preview.ctx.fillText(preview.serverUser.currentxp, 100, 900);

    //draw needed xp
    preview.ctx.fillText(preview.serverUser.neededxp.toString(), preview.canvas.width - (100 + preview.ctx.measureText(preview.serverUser.neededxp.toString()).width), 900);

    //draw user tag
    preview.ctx.font = applyText(preview.canvas, bot.user.tag);
    preview.ctx.fillText(bot.user.tag, 360, 260);

    //draw user avatar
    preview.ctx.beginPath();
    preview.ctx.arc(225, 225, 125, 0, Math.PI * 2, true);
    preview.ctx.closePath();
    preview.ctx.clip();

    preview.avatar = await Canvas.loadImage(bot.user.displayAvatarURL({format: 'png', size: 4096}));
    preview.ctx.drawImage(preview.avatar, 100, 100, 250, 250);

    preview.embed.setDescription(`Preview for:\n` +
        `**Name:** ${preview.inventory.Shop.name}\n` +
        'Do you want to use this background? type `yes` to apply.')
        .setColor(bot.embedColors.normal)
        .attachFiles([{attachment: preview.canvas.toBuffer(), name: 'preview.png'}])
        .setImage(`attachment://preview.png`);
}

const applyText = (canvas, text) => {
    const ctx = canvas.getContext('2d');

    let fontSize = 100;

    do {
        ctx.font = `${fontSize -= 10}px Dosis`;
    } while (ctx.measureText(text).width > canvas.width - 300);

    return ctx.font;
};

const getGlobal = (user) => {
    let levelXp = config.levelXp;

    let num = user.xp / (levelXp + ((levelXp / 2) * user.level))

    return {
        percentage: Math.round((num + Number.EPSILON) * 100) / 100,
        neededXp: levelXp + ((levelXp / 2) * user.level),
        level: user.level,
        xp: user.xp,
        color: user.color
    };
}

const getServer = (user) => {
    let userXp = user.xp
    let lvlXp = config.levelXp;
    let level = 0;
    let nextLvlXp = 100;

    do {


        if (userXp >= nextLvlXp) {
            level++;
            userXp -= nextLvlXp;
        }

        nextLvlXp = lvlXp + ((lvlXp / 2) * level);
    } while (userXp > nextLvlXp);

    let num = userXp / nextLvlXp;

    return {
        level: level,
        currentxp: userXp,
        neededxp: nextLvlXp,
        percentage: Math.round((num + Number.EPSILON) * 100) / 100,
    };
}