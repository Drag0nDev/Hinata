const config = require("../../config.json");
const Snooper = require('reddit-snooper');
const {MessageEmbed} = require('discord.js');
const {Autofeeds} = require('./dbObjects');
const logger = require("log4js").getLogger();

const link = new RegExp('.(jpeg|jpg|png|gif)$');

const snooper = new Snooper({
    username: config.reddit.username,
    password: config.reddit.password,
    api_secret: config.reddit.secret,
    api_id: config.reddit.appId,

    automatic_retries: true,
    api_requests_per_minuite: 60
});

module.exports = {
    run: async function (bot, subreddit) {
        snooper.watcher.getPostWatcher(subreddit)
            .on('post', async post => {
                const {
                    data
                } = post;

                const embed = new MessageEmbed()
                    .setAuthor(`Author: u/${data.author}`)
                    .setTitle(`Post link`)
                    .setURL(`https://www.reddit.com${data.permalink}`)
                    .setColor(bot.embedColors.embeds.normal)
                    .setDescription(data.title)
                    .setFooter(data.subreddit)
                    .setTimestamp();

                let autofeeds = await Autofeeds.findAll({
                    where: {
                        subreddit: data.subreddit
                    }
                })

                for (let autofeed in autofeeds) {
                    let server;
                    let channel;

                    server = await bot.guilds.cache.get(autofeed.serverId);

                    if (!server) return;

                    channel = await server.channels.cache.get(autofeed.channel);

                    if (channel) {
                        if (post.data.subreddit === autofeed.subreddit) {
                            if (link.test(post.data.url)) {
                                if (data.over_18) {
                                    if (channel.nsfw) {
                                        embed.setImage(data.url);
                                    }
                                } else {
                                    embed.setImage(data.url);
                                }

                                embed.setColor(bot.embedColors.logs.logChange);
                            } else if (post.data.url) {
                                embed.addField('​', data.url)
                                    .setColor(bot.embedColors.logs.logChange);
                            } else if (data.selftext !== '') {
                                let content
                                if (data.selftext.length > 1018) {
                                    content = `${data.selftext.substring(0, 1018)} \`...\``;
                                } else {
                                    content = data.selftext;
                                }

                                embed.addField('​', content)
                                    .setColor(bot.embedColors.logs.logAdd);
                            }

                            server.fetchWebhooks()
                                .then(async webhooks => {
                                    const webhook = webhooks.get(autofeed.webhookId);

                                    if (webhook) {
                                        await webhook.send(embed);
                                    } else {
                                        await Autofeeds.destroy({
                                            where: {
                                                id: autofeed.id
                                            }
                                        });
                                    }
                                }).catch(err => {});
                        }
                    }
                }
            }).on('error', error => {
                if (error === 'Requested too many items (reddit does not keep this large of a listing)')
                    return;

                logger.error(error);
            });
    }
}
