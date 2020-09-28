const config = require("../../../config.json");

exports.run = (bot, message, args) => {
    if(message.member.id === config.OWNER){
        bot.user.setUsername(args.toString());
        message.channel.send('Username changed successfully!');
    }else{
        message.channel.send(`${message.author} this is a command only for my creator!`);
    }
}

exports.help = {
    name: 'setName'
}