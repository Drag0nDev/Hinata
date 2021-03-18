const {MessageEmbed} = require('discord.js');
const {Minor, Permissions} = require('../../misc/tools');
let neededPerm = ['MANAGE_ROLES'];

module.exports = {
    name: 'rolecreate',
    aliases: ['rc'],
    category: 'roles',
    description: 'Create a role with the bot.\n' +
        'If the hoisted (-h) is not `yes` or `no` it will be automatically be set to `no`.',
    usage: '[command | alias] [name] <color code> <hoisted>',
    examples: ['h!rc -n awesome role -c #465dfa -h yes'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        const newRole = {
            send: async function (msg) {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setTitle('Role create')
                .setColor(bot.embedColors.normal)
                .setTimestamp(),
            str: args.join(' '),
            colors: {
                normal: bot.embedColors.normal,
                error: bot.embedColors.error
            },
            regs: {
                name: new RegExp('-n', 'i'),
                color: new RegExp('-c', 'i'),
                hoisted: new RegExp('-h', 'i')
            },
            array: [],
            role: {
                name: '',
                color: '#000000',
                hoisted: false
            }
        };
        const guild = message.guild;

        if (newRole.regs.name.test(newRole.str))
            newRole.array.push(newRole.regs.name.exec(newRole.str));
        else {
            newRole.embed.setColor(newRole.colors.error)
                .setDescription('Please provide a name for the role');

            return newRole.send(newRole.embed);
        }
        if (newRole.regs.color.test(newRole.str))
            newRole.array.push(newRole.regs.color.exec(newRole.str));
        if (newRole.regs.hoisted.test(newRole.str))
            newRole.array.push(newRole.regs.hoisted.exec(newRole.str));

        for (let i = 0; i < newRole.array.length; i++) {
            let input = newRole.array[i];

            if (input !== null)
                switch (input[0]) {
                    case '-n':
                        newRole.role.name = Minor.getValue(newRole.str, input, newRole.regs.name, newRole.array, i);
                        break;
                    case '-c':
                        newRole.role.color = Minor.getValue(newRole.str, input, newRole.regs.color, newRole.array, i).replace('#', '0x');
                        break;
                    case '-h':
                        let hoisted = Minor.getValue(newRole.str, input, newRole.regs.hoisted, newRole.array, i);

                        if (hoisted === 'yes' || hoisted === 'y')
                            newRole.role.hoisted = true
                        if (hoisted === 'no' || hoisted === 'n')
                            newRole.role.hoisted = false

                        break;
                }
        }

        guild.roles.create({
            data: {
                name: newRole.role.name,
                color: newRole.role.color,
                hoist: newRole.role.hoisted
            }
        }).then(role => {
            newRole.embed.setDescription(`New role <@&${role.id}> created!`);
            newRole.send(newRole.embed);
        });
    }
}