const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('wowee')
        .setDescription('wow wow'),
    async execute(interaction, client, promisePool) {

        // Sends the embed message
        await interaction.reply({
            content: '<:nurdThonk:983576552488984586>',
            ephemeral: true
        });
    }
}