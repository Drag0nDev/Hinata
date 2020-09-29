const config = require("../../../config.json");

module.exports = {
    name: 'setavatar',
    aliases: ['changeavatar', 'newavatar'],
    category: 'owner',
    description: 'Command to change Esdeaths profilepicture',
    usage: '[command | alias] [link new picture]',
    run: (bot, message, args) => {
        if(message.member.id === config.OWNER){
            bot.user.setAvatar(args.toString());
            message.channel.send('Avatar changed successfully!');
        }else{
            message.channel.send(`${message.author} this is a command only for my creator!`);
        }
    }
}