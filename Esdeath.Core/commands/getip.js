exports.run = (client, message, args) => {
    message.channel.send('Getting ip ...').then((msg) => {
        setTimeout(function(){
            msg.edit('haha im epic hacker ur ip is 127.0.0.1');
        }, 1250);
    });

}

exports.help = {
    name: 'getip'
}