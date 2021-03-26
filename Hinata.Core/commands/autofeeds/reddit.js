const {Permissions}= require('../../misc/tools');
const {MessageEmbed} = require("discord.js");
const Snooper = require('reddit-snooper');
const config = require("../../../config.json");
const {Autofeeds} = require('../../misc/dbObjects');
const redditFeed = require('../../misc/redditAutofeed');

let neededPermissions = ['MANAGE_WEBHOOKS'];

const snooper = new Snooper({
    username: config.reddit.username,
    password: config.reddit.password,
    api_secret: config.reddit.secret,
    api_id: config.reddit.appId,

    automatic_retries: true,
    api_requests_per_minuite: 60
});

module.exports = {
    name: 'reddit',
    category: 'autofeeds',
    description: 'Command to set or remove reddit autofeeds to discord (only new posts in the subreddit).\n' +
        'If the subreddit is an NSFW subreddit then also make the channel NSFW.\n' +
        'Use this command in the channel you want to get the autofeed.\n' +
        'Note: subreddit name is case sensitive and the remove works in any channel for any followed subreddit.',
    usage: '[command | alias] [add/remove] [subreddit] [channel]',
    neededPermissions: neededPermissions,
    run: async (bot, message, args) => {
        const reddit = {
            send: async function (msg) {
                return message.channel.send(msg);
            },
            server: message.guild,
            channel: message.channel,
            embed: new MessageEmbed().setTitle('Reddit')
        };

        if (!args[0] || (args[0].toLowerCase() !== 'add' && args[0].toLowerCase() !== 'remove')) {
            reddit.embed.setDescription('Please provide the action you want to do. `add` or `remove`.')
                .setColor(bot.embedColors.embeds.error);

            return reddit.send(reddit.embed);
        }

        reddit.action = args[0].toLowerCase();

        if (!args[1]) {
            reddit.embed.setDescription('Please provide a subreddit to add (case sensitive).')
                .setColor(bot.embedColors.embeds.error);

            return reddit.send(reddit.embed);
        }

        reddit.subreddit = args[1];

        switch (reddit.action) {
            case 'add':
                reddit.autofeeds = await Autofeeds.findOne({
                    where: {
                        serverId: reddit.server.id,
                        subreddit: reddit.subreddit
                    }
                });

                if (reddit.autofeeds !== null){
                    reddit.embed.setDescription(`You already have an autofeed for **${reddit.subreddit}**`)
                        .setColor(bot.embedColors.embeds.error);
                    break;
                }

                await reddit.channel.createWebhook(reddit.subreddit, {
                    avatar: 'https://logodownload.org/wp-content/uploads/2018/02/reddit-logo-16.png'
                }).then(hook => {
                    reddit.webhookId = hook.id;
                });

                Autofeeds.create({
                    serverId: reddit.server.id,
                    webhookId: reddit.webhookId,
                    subreddit: reddit.subreddit,
                    channel: reddit.channel.id
                });

                if (!bot.subreddits.includes(reddit.subreddit)){
                    await redditFeed.run(bot, reddit.subreddit);
                    bot.subreddits.push(reddit.subreddit);
                }

                reddit.embed.setDescription(`Subreddit **${reddit.subreddit}** added in this channel.`)
                    .setColor(bot.embedColors.embeds.normal);

                break;
            case 'remove':
                await Autofeeds.findOne({
                    where: {
                        subreddit: reddit.subreddit,
                        serverId: reddit.server.id
                    }
                }).then(async autofeed => {
                    let server = bot.guilds.cache.get(autofeed.serverId);
                    await server.fetchWebhooks()
                        .then(async webhooks => {
                            let webhook = webhooks.get(autofeed.webhookId);

                            await webhook.delete();
                        }).catch(err => {
                            logger.error(err);
                        });
                    Autofeeds.destroy({
                        where: {
                            id: autofeed.id
                        }
                    });

                    reddit.embed.setDescription(`Subreddit **${reddit.subreddit}** was removed from this server.`)
                        .setColor(bot.embedColors.embeds.normal);
                });
                break;
        }

        await reddit.send(reddit.embed);
    }
}