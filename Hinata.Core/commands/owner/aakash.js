const config = require("../../../config.json");
const {Permissions} = require('../../misc/tools');
module.exports = {
    name: 'aakash',
    category: 'owner',
    description: 'Dragon bonks aakash',
    usage: '[command | alias]',
    run: async (bot, message) => {
        if (message.author.id !== config.owner) {
            Permissions.ownerOnly(bot, message.channel)
            return;
        }

        await message.delete();
        await message.channel.send('<@462968651713216522> <a:bonk:735549944814895115>');
        await message.channel.send('Get bonked noob!');
    }
}