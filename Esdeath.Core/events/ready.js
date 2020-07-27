module.exports = client => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setActivity("my owner struggle with code", {type: "WATCHING"});
};