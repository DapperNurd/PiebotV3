const { SlashCommandBuilder, bold, italic } = require('discord.js');

var yesOrNoResponses = ["Yep.", "Yes, definitely.", "Without a doubt.", "I believe so.", "Mhmm.",
    "I wouldn't count on it.", "I don't think so.", "No way.", "Nah.", "Doubting it."]

var middleResponses = ["Could you repeat that?", "I'm not sure...", "idk", "Can't answer right now.", "One more time?", "🤔"]

var oddResponses = ["I'll let you know later.", "You know the answer to that already.", "Go bother someone else."]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Ask me a question!')
        .addStringOption(option =>
            option.setName('question')
                  .setDescription('What do you want to know?')
                  .setRequired(true)
                  .setMaxLength(50)
        ),
    async execute(interaction, client) {

        if(!interaction.options.getString("question")) { // If there is no question asked (an empty command)
            return await interaction.reply({
                content: "What?",
                ephemeral: true
            });
        }

        // Math.floor(Math.random() * (max - min) + min)
        const randomNum = Math.floor(Math.random() * (100 - 1) + 1); // generates a number from 1 to 100

        switch (true) {
            case (randomNum < 80): // ~79% chance
                response = yesOrNoResponses[Math.floor(Math.random() * yesOrNoResponses.length)];
                break;
            case (randomNum < 92): // ~12% chance
                response = middleResponses[Math.floor(Math.random() * middleResponses.length)];
                break;
            case (randomNum <= 100): // 9% chance
                response = oddResponses[Math.floor(Math.random() * oddResponses.length)];
                break;
            default: // Should never run, but just in case
                response = yesOrNoResponses[Math.floor(Math.random() * yesOrNoResponses.length)];
        }

        const msg = `**|**  *${interaction.options.getString("question")}*\n\n${response}` // Formatting for the final message, including the question asked

        await interaction.reply({
            content: msg
        });
    }
}