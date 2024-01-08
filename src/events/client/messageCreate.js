module.exports = {
    name: 'messageCreate',
    async execute(message, client, promisePool) {
        if(message.author.bot) return;

        async function runCommand(command, bypassBan) { // command is the command to run, bypassBan is TRUE if it ignores banned status
            if(!bypassBan) {
                let [rows, fields] = await promisePool.execute(`SELECT * FROM Discord.banned_user WHERE userID = '${message.author.id}'`);
                if(rows.length > 0) return; // if there is a row including the message author's id in the banned_users table
            }
            try {
                await client.textCommands.get(command).run(message, client, promisePool);
            } catch (err) {
                console.error(err);
            }
        }

        // Code for most of the commands here (aside from single line reactions) are handled in separate files in the text_commands folder

        // ChatGPT integration handling
        // if(message.guild.id == '347828515858546688' && ((message.mentions.repliedUser && message.mentions.repliedUser.id == client.user.id) || message.content.includes(`<@${client.user.id}>`))) { // if the activated message was a reply AND it replied to the bot, OR the message mentions the bot (and, for now, in the Nurds server)
        if((message.mentions.repliedUser && message.mentions.repliedUser.id == client.user.id) || message.content.includes(`<@${client.user.id}>`)) { // if the activated message was a reply AND it replied to the bot, OR the message mentions the bot (and, for now, in the Nurds server)
            runCommand('piebotGPT', false);
        }
        // "ok" handling
        else if(message.content.toLowerCase() == 'ok') {
            runCommand('ok', true);
        }
        // Thonk Emoji reacting handling
        else if(message.content.toLowerCase().includes('hmm') || message.content.toLowerCase().includes('thonk')) {
            const thonkEmoji = await client.emojis.cache.find(emoji => emoji.id == '983576552488984586');
            if(message.channel.id != '312815511887151105') message.react(thonkEmoji).catch(err => { return console.log(`Error reacting to ${message}\n${err}`) }); // reacts if not in announcement channel
        }
        // Wowee Emoji reacting handling
        else if(message.content.toLowerCase().includes('wowee')) { 
            const woweeEmoji = await client.emojis.cache.find(emoji => emoji.id == '758396947769196575');
            if(message.channel.id != '312815511887151105') message.react(woweeEmoji).catch(err => { return console.log(`Error reacting to ${message}\n${err}`) });; // reacts if not in announcement channel
        }
        // Slash Command Notifier handling
        else if(message.content.startsWith("!") || message.content.startsWith(".")) { // If someone tries to use a command using the old way.
            runCommand('oldCommands', true);
        }
    },
};