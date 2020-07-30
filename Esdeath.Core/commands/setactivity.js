const config = {
    owner: process.env.OWNER
};

exports.run = (bot, message, args) => {
    if(!(message.member.id === config.owner.toString())){
        message.channel.send(`${message.author} this is a command only for my creator!`);
    }else{
        //splitting in to parts
        const type = args.shift().toUpperCase();
        if(type === 'STREAMING'){
            const name = args.pop();
            console.log(args)
            const link = args;

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

exports.help = {
    name: 'setactivity'
}