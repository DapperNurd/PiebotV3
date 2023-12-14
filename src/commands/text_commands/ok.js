const User = require('../../schemas/user');
const Guild = require('../../schemas/guild');
const GlobalCount = require('../../schemas/globalCount');
const { GenerateNewUser, GenerateNewGuild } = require('../../../schemaBuilding.js');

module.exports = {
    name: 'ok',
    description: 'Code for when someone says "ok"',
    async run(message, client) {

        if(message.author.id == '223578917372428288') return; // Skip if it is Trash

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
            var msg = (Math.ceil(Math.random() * 10) == 1) ? "Ok" : "ok"; // 1 in 10 chance to send "Ok" instead of "ok"
            message.channel.send(msg);

            if(message.channel.id == "459207634403196938") { // "ok" channel (id) in The Trauma Center
                let userProfile = await User.findOne({ userID: message.author.id }); // Searches database for a userProfile with a matching userID to id
                if(!userProfile) userProfile = await GenerateNewUser(message.author.id, message.author.displayName); // If no userProfile is found, generate a new one

                if(userProfile.okCount < 0) return; // Banning method for ok count... (set them to -1)

                let guildProfile = await Guild.findOne({ guildID: message.guild.id }); // Searches database for a guildProfile with a matching userID to id
                if(!guildProfile) guildProfile = await GenerateNewGuild(message.guild.id, message.guild.name); // If no guildProfile is found, generate a new one

                let globalProfile = await GlobalCount.findOne({ globalID: "global" }); // Searches database for the globalProfile
                if(!globalProfile) { // Should hopefully never happen... We do not build a new global profile because there is only ever one. Instead we error and intentionally stop.
                    await interaction.reply({ content: `I don't feel so good... something's not right. Where's ${userMention(author.id)}??`, ephemeral: true });
                    return console.error(chalk.red("[Bot Status]: Error finding global database!"));
                }

                await userProfile.updateOne({ okCount: userProfile.okCount+1 });
                await guildProfile.updateOne({ okCount: guildProfile.okCount+1 });
                await globalProfile.updateOne({ okCount: globalProfile.okCount+1 });
            }
        }
    }
}