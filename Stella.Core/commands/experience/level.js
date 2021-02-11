const Discord = require('discord.js');
const {promisify} = require('util');
const Canvas = require('canvas');
const {User, ServerUser} = require('../../misc/dbObjects');
const config = require("../../../config.json");
const {Servers} = require('../../misc/tools');
const fs = require('fs');

const readdir = promisify(fs.readdir);

module.exports = {
    name: 'level',
    aliases: ['lvl', 'xp'],
    category: 'experience',
    description: 'Show the level card of yourself or a server member',
    usage: '[command | alias] <mention/ID>',
    examples: ['s!xp', 's!xp 418037700751261708', 's!xp @Drag0n#6666'],
    run: async (bot, message, args) => {
        let member;
        let users;
        let userbg;
        let user;
        let background;
        let serverUser;
        let serverUsers;
        let userListId = [];
        let userServerListId = [];

        await Servers.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        users = await User.findAll({
            order: [['level', 'DESC'], ['xp', 'DESC']]
        });

        serverUsers = await ServerUser.findAll({
            order: [['xp', 'DESC']],
            where: {
                guildId: message.guild.id
            }
        });

        users.forEach(user => {
            userListId.push(user.userId);
        });

        serverUsers.forEach(userServer => {
            userServerListId.push(userServer.userId);
        });

        user = getGlobal(users[userListId.indexOf(member.user.id)]);
        serverUser = getServer(serverUsers[userServerListId.indexOf(member.user.id)]);

        let globalRank = userListId.indexOf(member.user.id) + 1;
        let serverRank = userServerListId.indexOf(member.user.id) + 1;

        const canvas = Canvas.createCanvas(2048, 1024);

        const ctx = canvas.getContext('2d');
        ctx.font = '50px Dosis';

        //look for custom background
        let files = await readdir('./Stella.Core/misc/images');

        userbg = files[files.indexOf(`${member.user.id}.png`)];

        if (!userbg)
            background = await Canvas.loadImage('./Stella.Core/misc/images/default_xp.jpg');
        else
            background = await Canvas.loadImage(`./Stella.Core/misc/images/${userbg}`);

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = bot.embedColors.normal;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        //draw global xp bar
        //draw bar
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = bot.embedColors.normal;
        ctx.fillStyle = '#fff';
        ctx.strokeRect(100, 500, canvas.width - 200, 50);
        ctx.fillRect(100, 500, canvas.width - 200, 50);

        //fill the bar according to the xp
        ctx.beginPath();
        ctx.fillStyle = bot.embedColors.normal;
        const globalWidth = (canvas.width - 200) - ((canvas.width - 200) * (1 - user.percentage));
        ctx.fillRect(100, 500, globalWidth, 50);

        //draw word "Global"
        ctx.fillStyle = '#fff';
        ctx.fillText('Global', 100, 475);

        //draw the level
        ctx.fillText(`Level ${user.level}`, (canvas.width / 2) - (ctx.measureText(`Level ${user.level}`).width / 2), 475);

        //draw the global position
        ctx.fillText(`#${globalRank}`, canvas.width - (100 + ctx.measureText(`#${globalRank}`).width), 475);

        //draw current xp
        ctx.fillText(user.xp, 100, 600);

        //draw needed xp
        ctx.fillText(user.neededXp.toString(), canvas.width - (100 + ctx.measureText(user.neededXp.toString()).width), 600);

        //draw the server xp bar
        //draw bar
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = bot.embedColors.normal;
        ctx.fillStyle = '#fff';
        ctx.strokeRect(100, 800, canvas.width - 200, 50);
        ctx.fillRect(100, 800, canvas.width - 200, 50);

        //fill the bar according to the xp
        ctx.beginPath();
        ctx.fillStyle = bot.embedColors.normal;
        const serverWidth = (canvas.width - 200) - ((canvas.width - 200) * (1 - serverUser.percentage));
        ctx.fillRect(100, 800, serverWidth, 50);

        //draw word "Server"
        ctx.fillStyle = '#fff';
        ctx.fillText('Server', 100, 775);

        //draw the level
        ctx.fillText(`Level ${serverUser.level}`, (canvas.width / 2) - (ctx.measureText(`Level ${serverUser.level}`).width / 2), 775);

        //draw the global position
        ctx.fillText(`#${serverRank}`, canvas.width - (100 + ctx.measureText(`#${serverRank}`).width), 775);

        //draw current xp
        ctx.fillText(serverUser.currentxp, 100, 900);

        //draw needed xp
        ctx.fillText(serverUser.neededxp.toString(), canvas.width - (100 + ctx.measureText(serverUser.neededxp.toString()).width), 900);

        //draw user tag
        ctx.font = applyText(canvas, member.user.tag);
        ctx.fillText(member.user.tag, 360, 260);

        //draw user avatar
        ctx.beginPath();
        ctx.arc(225, 225, 125, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({format: 'png', size: 4096}));
        ctx.drawImage(avatar, 100, 100, 250, 250);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'test.png');

        await message.channel.send(attachment);
    }
}

const getGlobal = (user) => {
    let levelXp = config.levelXp;

    let num = user.xp / (levelXp + ((levelXp / 2) * user.level))

    return {
        percentage: Math.round((num + Number.EPSILON) * 100) / 100,
        neededXp: levelXp + ((levelXp / 2) * user.level),
        level: user.level,
        xp: user.xp
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

const applyText = (canvas, text) => {
    const ctx = canvas.getContext('2d');

    let fontSize = 100;

    do {
        ctx.font = `${fontSize -= 10}px Dosis`;
    } while (ctx.measureText(text).width > canvas.width - 300);

    return ctx.font;
};