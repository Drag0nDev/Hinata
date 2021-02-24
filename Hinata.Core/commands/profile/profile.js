const Discord = require('discord.js');
const {promisify} = require('util');
const Canvas = require('canvas');
const {User, Inventory, Shop} = require('../../misc/dbObjects');
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
    examples: ['h!profile', 'h!profile 418037700751261708', 'h!profile @Drag0n#6666'],
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

        ctx.drawImage(profile.background, 0, 0, canvas.width, canvas.height / 2);

        ctx.beginPath();
        let grd = ctx.createLinearGradient(canvas.width / 2, 0, canvas.width / 2, canvas.height);
        grd.addColorStop(0, 'rgba(68,70,77,0)');
        grd.addColorStop(0.5, '#44464d');
        ctx.fillStyle = grd;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = bot.embedColors.normal;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        //draw text above xp bar
        ctx.font = '500 80px Dosis';
        ctx.fillStyle = '#fff';
        ctx.fillText('xp', 331 - (ctx.measureText('xp').width / 2), 500);
        ctx.fillText('lvl', 793 - (ctx.measureText('lvl').width / 2), 500);
        ctx.fillText('Balance', 1255 - (ctx.measureText('Balance').width / 2), 500);
        ctx.fillText('Rank', 1717 - (ctx.measureText('Rank').width / 2), 500);
        ctx.fillStyle = profile.color;
        ctx.fillText(profile.user.xp, 331 - (ctx.measureText(profile.user.xp).width / 2), 625);
        ctx.fillText(profile.user.level, 793 - (ctx.measureText(profile.user.level).width / 2), 625);
        ctx.fillText(profile.user.balance, 1255 - (ctx.measureText(profile.user.balance).width / 2), 625);
        ctx.fillText(globalRank.toString(), 1717 - (ctx.measureText(globalRank.toString()).width / 2), 625);

        //draw global xp bar
        //draw bar
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = profile.color;
        ctx.fillStyle = '#fff';
        ctx.strokeRect(100, 800, canvas.width - 200, 50);
        ctx.fillRect(100, 800, canvas.width - 200, 50);

        //fill the bar according to the xp
        ctx.beginPath();
        ctx.fillStyle = profile.color;
        const globalWidth = (canvas.width - 200) - ((canvas.width - 200) * (1 - profile.user.percentage));
        ctx.fillRect(100, 800, globalWidth, 50);

        //draw user tag
        ctx.fillStyle = '#fff';
        ctx.font = applyText(canvas, profile.member.user.tag);
        ctx.fillText(profile.member.user.tag, 360, 260);

        //draw the badges
        for (let i = 0; i < profile.user.badges.length; i++) {
            const badge = profile.user.badges[i];
            if (badge) {
                ctx.beginPath();
                let image = await Canvas.loadImage(await findBadge(profile.member, badge));
                const badgeWidthHeight = 400;

                switch (i){
                    case 0:
                        ctx.drawImage(image, 216, 1000, badgeWidthHeight, badgeWidthHeight);
                        break;
                    case 1:
                        ctx.drawImage(image, 832, 1000, badgeWidthHeight, badgeWidthHeight);
                        break;
                    case 2:
                        ctx.drawImage(image, 1448, 1000, badgeWidthHeight, badgeWidthHeight);
                        break;
                    case 3:
                        ctx.drawImage(image, 216, 1500, badgeWidthHeight, badgeWidthHeight);
                        break;
                    case 4:
                        ctx.drawImage(image, 832, 1500, badgeWidthHeight, badgeWidthHeight);
                        break;
                    case 5:
                        ctx.drawImage(image, 1448, 1500, badgeWidthHeight, badgeWidthHeight);
                        break;
                }
            }
        }

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
    let xp = user.xp;
    let level = user.level;
    let previousLvlXp = 0;

    let num = user.xp / (levelXp + ((levelXp / 2) * user.level));

    for (; level > 0; level--) {
        previousLvlXp = levelXp + ((levelXp / 2) * (level - 1));
        xp += previousLvlXp;
    }

    return {
        percentage: Math.round((num + Number.EPSILON) * 100) / 100,
        neededXp: levelXp + ((levelXp / 2) * user.level),
        level: user.level,
        xp: xp,
        color: user.color,
        background: user.background,
        balance: user.balance,
        badges: [user.badge1, user.badge2, user.badge3,
            user.badge4, user.badge5, user.badge6]
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

const findBadge = async (member, badge) => {
    let inventory;
    inventory = await Inventory.findOne({
        where: {
            userId: member.user.id,
            invId: badge
        },
        include: [Shop]
    });

    return `Hinata.Core/misc/images/inventory/${inventory.Shop.image}`;
}