const BannedUser = require('../../schemas/bannedUsers')

async function runCommand(command, bypassBan) { // command is the command to run, bypassBan is TRUE if it ignores banned status
    if(!bypassBan) {
        let bannedUsersProfile = await BannedUser.findOne({ userID: interaction.user.id }); // Searches database for a userID matching the command user's id
        if(bannedUsersProfile) return;
    }
    client.commands.get(command).run(message, client);
}

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if(message.author.bot) return;

        // Code for most of the commands here (aside from single line reactions) are handled in separate files in the text_commands folder

        // ChatGPT integration handling
        if((message.mentions.repliedUser && message.mentions.repliedUser.id == client.user.id) || message.content.includes(`<@${client.user.id}>`)) { // if the activated message was a reply AND it replied to the bot, OR the message mentions the bot
            runCommand('piebotGPT', false);
        }
        // "ok" handling
        else if(message.content.toLowerCase() == 'ok') {
            runCommand('ok', true);
        }
        // Thonk Emoji reacting handling
        else if(message.content.toLowerCase().includes('hmm') || message.content.toLowerCase().includes('thonk')) {
            const thonkEmoji = client.emojis.cache.find(emoji => emoji.id == '983576552488984586');
            message.react(thonkEmoji);
        }
        // Wowee Emoji reacting handling
        else if(message.content.toLowerCase().includes('wowee')) { 
            const woweeEmoji = client.emojis.cache.find(emoji => emoji.id == '758396947769196575');
            message.react(woweeEmoji);
        }
        // Slash Command Notifier handling
        else if(message.content.startsWith("!") || message.content.startsWith(".")) { // If someone tries to use a command using the old way.
            runCommand('oldCommands', true);
        }
    },
};