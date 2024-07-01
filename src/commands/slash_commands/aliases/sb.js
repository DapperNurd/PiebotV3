const { SlashCommandBuilder } = require('discord.js');
const { currentTriviaSeason } = require('../../../extra.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sb')
        .setDescription('View the top players for trivia!')
        .addIntegerOption(option =>
            option.setName('season')
                .setMinValue(1)
                .setMaxValue(currentTriviaSeason)
                .setDescription('Shows the scores from the previous trivia season!')
        ),
    async execute(interaction, client, promisePool) {
        client.commands.get('scoreboard').execute(interaction, client, promisePool);
    }
}