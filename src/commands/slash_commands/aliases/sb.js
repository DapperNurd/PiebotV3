const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sb')
        .setDescription('View the top players for trivia!')
        .addBooleanOption(option =>
            option.setName('previous')
                .setDescription('Shows the scores from the previous trivia season!')
        ),
    async execute(interaction, client, promisePool) {
        client.commands.get('scoreboard').execute(interaction, client, promisePool);
    }
}