const config = require("../../../config.json");

module.exports = {
    name: 'setactivity',
    aliases: ['activity'],
    category: 'owner',
    description: 'Change the displayed activity of Esdeath.',
    usage: '[command | alias] [type (streaming|watching|listening)] [text]',
    run: (bot, message, args) => {
        if(!(message.member.id === config.OWNER)){
            message.channel.send(`${message.author} this is a command only for my creator!`);
        }else{
            //splitting in to parts
            const type = args.shift().toUpperCase();
            if(type === 'STREAMING'){
                const link = args.pop();

                const name = args.join(' ');

                bot.user.setActivity({
                    name: `${name}`,
                    type: `${type}`,
                    url: `${link}`
                });
            }else if (type === 'DEFAULT'){
                bot.user.setActivity({
                    name: 'Under construction',
                    type: 'STREAMING',
                    url: 'https://www.twitch.tv/zwoil'
                });
            }else{
                const name = args.join(' ');

                bot.user.setActivity({
                    name: `${name}`,
                    type: `${type}`
                });
            }

            message.channel.send('Activity changed successfully');
        }
    }
}