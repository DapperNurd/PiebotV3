require('events').EventEmitter.defaultMaxListeners = 20;

module.exports = {
    name: 'ok',
    description: 'Code for when someone says "ok"',
    run: async (message, client) => {
        var random = Math.floor(Math.random() * (17 - 7)) + 7; // it's weird but basically this makes it so piebot will send a message after a random number of messages that aren't piebot
                                                                   // from 7 to 17, though I'm not sure how much the 17 max actually affects it
        message.channel.messages.fetch({ limit: random }).then(messages => {

            var authorIDs = [];
            for (let value of messages.values()) {
                authorIDs.push(value.author.id)
            }

            var botID = authorIDs.find(function (element) {
                return element == "762880889817530368"
            });

            if (!botID) {
                var msg = (Math.ceil(Math.random() * 10) == 1) ? "Ok" : "ok"; // 1 in 10 chance to send "Ok" instead of "ok"
                message.channel.send(msg);
            }
            
        });
    }
}