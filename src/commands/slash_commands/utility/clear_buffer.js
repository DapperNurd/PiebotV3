const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear_buffer')
        .setDescription('Clears Piebot\'s previous messages from it\'s memory'),
    async execute(interaction, client, con) {

        let prevMessages = await interaction.channel.messages.fetch({limit: 15});

        prevMessages.forEach((msg) => {
            if(msg.author.id == '549418373130223630' && !msg.content.startsWith('❌')) msg.edit('❌ ' + msg.content); // If it is the bot's own message and does not alreadey start with it, add the '❌' to the front
        });

        // Sends the embed message
        await interaction.reply({
            content: ':thumbsup:',
            ephemeral: true
        });
    }
}