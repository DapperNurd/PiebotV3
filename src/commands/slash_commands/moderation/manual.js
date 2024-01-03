const { SlashCommandBuilder } = require('discord.js');
const { GetRandomInt } = require("../../../extra.js");

var yesOrNoResponses = ["Yep.", "Yes, definitely.", "Without a doubt.", "I believe so.", "Mhmm.",
    "I wouldn't count on it.", "I don't think so.", "No way.", "Nah.", "Doubting it."]

var middleResponses = ["Could you repeat that?", "I'm not sure...", "idk", "Can't answer right now.", "One more time?", "🤔"]

var oddResponses = ["I'll let you know later.", "You know the answer to that already.", "Go bother someone else."]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('manual')
        .setDescription('[OWNER] Force Piebot to send a message to a given channel')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('Channel to send the message to')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('text')
            .setDescription('The text to send')
            .setRequired(true)
        ),
    async execute(interaction, client, promisePool) {

        // There is no checking if the options were inputted, because they are both required

        // Sends message
        return await interaction.options.getChannel('channel').send(interaction.getString(text)).catch(err => console.log('Error stats embed!'));

    }
}