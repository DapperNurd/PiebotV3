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

        // No input scenario handling
        if(!interaction.options.getString("question")) { // If there is no question asked (an empty command)
            return await interaction.reply({
                content: "What are you asking?",
                ephemeral: true
            });
        }

        // Response rarity calculation and assigning
        const randomNum = Math.floor(Math.random() * (100 - 1) + 1); // generates a number from 1 to 100 ... Math.floor(Math.random() * (max - min) + min)
        if (randomNum < 80)         response = yesOrNoResponses[Math.floor(Math.random() * yesOrNoResponses.length)];  // 79% chance
        else if (randomNum < 92)    response = middleResponses[Math.floor(Math.random() * middleResponses.length)];    // 12% chance
        else if (randomNum <= 100)  response = oddResponses[Math.floor(Math.random() * oddResponses.length)];          // 9% chance
        else                        response = yesOrNoResponses[Math.floor(Math.random() * yesOrNoResponses.length)];  // Should never run, but just in case

        // Building the final message
        const msg = `**|**  *${interaction.options.getString("question")}*\n${response}` // Formatting for the final message, including the question asked

        // Sending the final message
        await interaction.reply({
            content: msg
        });
    }
}