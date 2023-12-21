const { PercentTrue } = require("../../extra.js");

module.exports = {
    name: 'ok',
    description: 'Code for when someone says "ok"',
    async run(message, client, promisePool) {

        var random = Math.floor(Math.random() * (17 - 7)) + 7; // it's weird but basically this makes it so piebot will send a message after a random number of messages that aren't piebot
                                                                   // from 7 to 17, though I'm not sure how much the 17 max actually affects it
        const messages = await message.channel.messages.fetch({ limit: random });

        var authorIDs = [];
        for (let value of messages.values()) {
            authorIDs.push(value.author.id)
        }

        var botID = authorIDs.find(function (element) {
            return element == client.user.id;
        });

        if (!botID) {
            var msg = PercentTrue(10) ? "Ok" : "ok"; // 10% chance to send "Ok" instead of "ok"
            message.channel.send(msg);

            if(message.channel.id == "459207634403196938") { // "ok" channel (id) in The Trauma Center
                // Database handling
                const columnName = 'okCount'; // Change this to change what value is read/written
                promisePool.execute(`INSERT INTO Discord.user (userID,userName,${columnName}) VALUES ('${message.author.id}','${message.author.username}',1) ON DUPLICATE KEY UPDATE ${columnName}=${columnName}+1;`);
            }
        }
    }
}