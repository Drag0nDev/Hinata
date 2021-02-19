const Discord = require('discord.js');
const {promisify} = require('util');
const Canvas = require('canvas');
const {User, ServerUser} = require('../../misc/dbObjects');
const config = require("../../../config.json");
const {Servers} = require('../../misc/tools');
const fs = require('fs');

const readdir = promisify(fs.readdir);

module.exports = {
    name: 'profile',
    aliases: ['p'],
    category: 'profile',
    description: 'Show the profile card of yourself or a server member',
    usage: '[command | alias] <mention/ID>',
    examples: ['h!xp', 'h!xp 418037700751261708', 'h!xp @Drag0n#6666'],
    run: async (bot, message, args) => {
        const profile = {
            userListId: []
        };

        profile.member = await Servers.getMember(message, args);

        profile.users = await User.findAll({
            order: [['level', 'DESC'], ['xp', 'DESC']]
        });

        profile.users.forEach(user => {
            profile.userListId.push(user.userId);
        });

        profile.user = getGlobal(profile.users[profile.userListId.indexOf(profile.member.user.id)]);

        let globalRank = profile.userListId.indexOf(profile.member.user.id) + 1;

        if (profile.user.color === null)
            profile.color = bot.embedColors.normal;
        else
            profile.color = profile.user.color;

        const canvas = Canvas.createCanvas(2048, 2048);

        const ctx = canvas.getContext('2d');
        ctx.font = '50px Dosis';

        //look for the background
        if (profile.user.background === 'custom') {
            //look for custom background
            let files = await readdir('./Hinata.Core/misc/images/custom');

            profile.userbg = files[files.indexOf(`${profile.member.user.id}.png`)];

            if (!profile.userbg)
                profile.background = await Canvas.loadImage('./Hinata.Core/misc/images/inventory/default_xp.jpg');
            else
                profile.background = await Canvas.loadImage(`./Hinata.Core/misc/images/custom/${profile.userbg}`);
        } else {
            //look for shop background
            let files = await readdir('./Hinata.Core/misc/images/inventory');

            profile.userbg = files[files.indexOf(profile.user.background)];

            if (!profile.userbg)
                profile.background = await Canvas.loadImage('./Hinata.Core/misc/images/inventory/default_xp.jpg');
            else
                profile.background = await Canvas.loadImage(`./Hinata.Core/misc/images/inventory/${profile.userbg}`);
        }

        ctx.drawImage(profile.background, 0, 0, canvas.width, canvas.height/2);

        /*
        draw the filling of the bottom empty space
        and make it go over with a nice gradient
         */

        ctx.beginPath();
        let grd = ctx.createLinearGradient(canvas.width/2,0,canvas.width/2, canvas.height);
        grd.addColorStop(0, 'rgba(68,70,77,0)');
        grd.addColorStop(0.5, '#44464d');
        ctx.fillStyle = grd;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = bot.embedColors.normal;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        //draw global xp bar
        //draw bar
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = profile.color;
        ctx.fillStyle = '#ffffff';
        ctx.strokeRect(100, 500, canvas.width - 200, 50);
        ctx.fillRect(100, 500, canvas.width - 200, 50);

        //fill the bar according to the xp
        ctx.beginPath();
        ctx.fillStyle = profile.color;
        const globalWidth = (canvas.width - 200) - ((canvas.width - 200) * (1 - profile.user.percentage));
        ctx.fillRect(100, 500, globalWidth, 50);

        //draw word "Global"
        ctx.fillStyle = '#fff';
        ctx.fillText('Global', 100, 475);

        //draw the level
        ctx.fillText(`Level ${profile.user.level}`, (canvas.width / 2) - (ctx.measureText(`Level ${profile.user.level}`).width / 2), 475);

        //draw the global position
        ctx.fillText(`#${globalRank}`, canvas.width - (100 + ctx.measureText(`#${globalRank}`).width), 475);

        //draw current xp
        ctx.fillText(profile.user.xp, 100, 600);

        //draw needed xp
        ctx.fillText(profile.user.neededXp.toString(), canvas.width - (100 + ctx.measureText(profile.user.neededXp.toString()).width), 600);

        //draw user tag
        ctx.font = applyText(canvas, profile.member.user.tag);
        ctx.fillText(profile.member.user.tag, 360, 260);

        //draw user avatar
        ctx.beginPath();
        ctx.arc(225, 225, 125, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await Canvas.loadImage(profile.member.user.displayAvatarURL({format: 'png', size: 4096}));
        ctx.drawImage(avatar, 100, 100, 250, 250);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), `profile.png`);

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
        xp: user.xp,
        color: user.color,
        background: user.background
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