const {MessageEmbed} = require('discord.js');
const {Shop, Category, User, ServerUser} = require('../../misc/dbObjects');
const Canvas = require('canvas');
const config = require("../../../config.json");

module.exports = {
    name: 'shoppreview',
    aliases: ['spreview'],
    category: 'market',
    description: 'Get a preview of how an item from the shop looks like.\n' +
        'This command only works if the item has an image',
    usage: '[command | alias] [id]',
    examples: ['h!shop -n diamond ring -c badge '],
    cooldown: 30,
    run: async (bot, message, args) => {
        let preview = {
            embed: new MessageEmbed().setTitle('Shop preview')
                .setTimestamp(),
            idReg: new RegExp('^\\d+$'),
        };
        if (preview.idReg.test(args[0]))
            preview.id = preview.idReg.exec(args[0])[0];
        else {
            preview.embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid id!');

            return message.channel.send(preview.embed);
        }

        preview.db = await Shop.findOne({
            where: {
                id: preview.id
            },
            include: [Category],
        });

        if (preview.db === null) {
            preview.embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid id!');

            return message.channel.send(preview.embed);
        }

        if (preview.db.Category.name === 'hidden' || preview.db.Category.name === 'custom') {
            preview.embed.setColor(bot.embedColors.error)
                .setDescription(`**${preview.id}** is not a valid id!`);

            return message.channel.send(preview.embed);
        }

        if (preview.db.image === null) {
            preview.embed.setColor(bot.embedColors.normal)
                .setDescription(`the item **${preview.db.name}** has no image to show.`);

            return message.channel.send(preview.embed);
        }

        preview.image = `./Hinata.Core/misc/images/inventory/${preview.db.image}`;

        switch (preview.db.Category.name) {
            case 'background':
                await showXpCard(bot, message, preview);
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
        `**Name:** ${preview.db.name}\n` +
        `**Category:** ${preview.db.Category.name}`)
        .setColor(bot.embedColors.normal)
        .attachFiles([{attachment: preview.canvas.toBuffer(), name: 'preview.png'}])
        .setImage(`attachment://preview.png`);

    await message.channel.send(preview.embed);
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