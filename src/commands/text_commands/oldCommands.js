const exclamationCommands = [ "!brownie", "!cake", "!chocolate", "!fish", "!icecream", "!muffin", "!pasta", "!pie", "!potato", "!sandwich", "!help", "!menu", "!stats", "!roll", "!getme", "!ask", "!coinflip", "!server", "!global", "!trash"  ];
const periodCommands = [ ".brownie", ".cake", ".chocolate", ".fish", ".icecream", ".muffin", ".pasta", ".pie", ".potato", ".sandwich", ".help", ".menu", ".stats", ".roll", ".getme", ".ask", ".coinflip", ".server", ".global", ".trash"  ];

module.exports = {
    name: 'oldCommands',
    description: 'Code for when someone tries to use a command the old way',
    async run(message, client) {
        const firstWord = message.content.split(" ")[0]; // Returns the first word, as separated by spaces
        if(!exclamationCommands.includes(firstWord) && !periodCommands.includes(firstWord)) return; // Skips if it does not include any of the commands from the two arrays
        message.channel.send("All piebot commands are now done through Discord's built in Slash Commands. Type a / to begin.").then(msg => { setTimeout(() => msg.delete(), 30_000) }) // Sends message and deletes after 30 seconds
            .catch(console.log(`Notified user ${message.author.username} of new command system...`));
    }
}