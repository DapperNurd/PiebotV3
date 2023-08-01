const exclamationCommands = [ "!brownie", "!cake", "!chocolate", "!fish", "!icecream", "!muffin", "!pasta", "!pie", "!potato", "!sandwich", "!help", "!menu", "!stats", "!roll", "!getme", "!ask", "!coinflip", "!server", "!global", "!trash"  ];
const periodCommands = [ ".brownie", ".cake", ".chocolate", ".fish", ".icecream", ".muffin", ".pasta", ".pie", ".potato", ".sandwich", ".help", ".menu", ".stats", ".roll", ".getme", ".ask", ".coinflip", ".server", ".global", ".trash"  ];

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if(message.author.bot) return;

        // Running message commands directly in this file as opposed to in separate files because
        // very few commands will be handled directly via message and not via slash commands

        // Custom emoji handling
        const thonkEmoji = client.emojis.cache.find(emoji => emoji.id == '983576552488984586');
        const woweeEmoji = client.emojis.cache.find(emoji => emoji.id == '758396947769196575');
        
        // ok message handling
        if(message.content.toLowerCase() == 'ok') {
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
        // Thonk Emoji reacting handling
        else if(message.content.toLowerCase().includes('hmm') || message.content.toLowerCase().includes('thonk')) {
            message.react(thonkEmoji);
        }
        // Wowee Emoji reacting handling
        else if(message.content.toLowerCase().includes('wowee')) { 
            message.react(woweeEmoji);
        }
        // Slash Command Notifier handling
        else if(message.content.startsWith("!") || message.content.startsWith(".")) { // If someone tries to use a command using the old way.
            const firstWord = message.content.split(" ")[0]; // Returns the first word, as separated by spaces
            if(!exclamationCommands.includes(firstWord) && !periodCommands.includes(firstWord)) return; // Skips if it does not include any of the commands from the two arrays
            message.channel.send("All piebot commands are now done through Discord's built in Slash Commands. Type a / to begin.").then(msg => { setTimeout(() => msg.delete(), 30_000) }) // Sends message and deletes after 30 seconds
                .catch(console.log(`Notified user ${message.author.username} of new command system...`));
        }
    },
};