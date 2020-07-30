const config = {
    owner: process.env.OWNER
};

exports.run = (client, message, args) => {
    if(message.member.id !== config.owner.toString())
        return;

    message.delete();
    message.channel.send('<@462968651713216522> <a:bonk:735549944814895115>');
}

exports.help = {
    name: 'aakash'
}