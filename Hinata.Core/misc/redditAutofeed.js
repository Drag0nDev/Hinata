const config = require("../../config.json");
const Snooper = require('reddit-snooper');
const {MessageEmbed} = require('discord.js');
const {Autofeeds} = require('./dbObjects');
const logger = require("log4js").getLogger();

module.exports = {
    run: async function (bot) {
        const snooper = new Snooper({
            username: config.reddit.username,
            password: config.reddit.password,
            api_secret: config.reddit.secret,
            api_id: config.reddit.appId,

            automatic_retries: true,
            api_requests_per_minuite: 60
        });

        snooper.watcher.getPostWatcher('all')
            .on('post', post => {
                const embed = new MessageEmbed()
                    .setColor("RANDOM")
                    .setTitle(`Author: ${post.data.author}`)
                    .setDescription(`[Post link](https://www.reddit.com${post.data.permalink})\n` + post.data.title)
                    .setFooter(post.data.subreddit);

                Autofeeds.findAll({
                    where: {
                        subreddit: post.data.subreddit
                    }
                }).then(autofeeeds => {
                    autofeeeds.forEach(async autofeed => {
                            let server = await bot.guilds.cache.get(autofeed.serverId);
                            let channel = await server.channels.cache.get(autofeed.channel);

                            if (channel) {

                                if (post.data.subreddit === autofeed.subreddit) {
                                    if (post.data.url !== '')
                                        if (post.data.over_18 && channel.nsfw) {
                                            embed.setImage(post.data.url);
                                        } else {
                                            embed.setImage(post.data.url);
                                        }

                                    server.fetchWebhooks()
                                        .then(async webhooks => {
                                            const webhook = webhooks.get(autofeed.webhookId);

                                            if (webhook) {
                                                await webhook.send(embed);
                                                logger.info(`new reddit post from ${post.data.subreddit} posted`);
                                            } else {
                                                await Autofeeds.destroy({
                                                    where: {
                                                        id: autofeed.id
                                                    }
                                                });
                                            }
                                        }).catch(err => {
                                        logger.error(`error in: ${server.name}\n`, err);
                                    });
                                }
                            }
                        }
                    );
                });
            })
            .on('error', error => {
                if (error !== 'Requested too many items (reddit does not keep this large of a listing)')
                    logger.error(error);
            });
    }
}
