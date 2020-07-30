const config = {
    prefix: process.env.PREFIX,
};

exports.run = (client, message, args) => {
    message.channel.send(`My prefix is **${config.prefix}**.`).catch(console.error);
}

exports.help = {
    name: 'say'
}