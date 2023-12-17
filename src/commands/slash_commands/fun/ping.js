const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Return my ping!'),
    async execute(interaction, client) {

        // Sending a deferred message
        const message = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });

        // Building the message to send
        const newMessage = `*Pong!*\n\`API Latency: ${client.ws.ping}ms\`\n\`Client Ping: ${message.createdTimestamp - interaction.createdTimestamp}ms\``

        // Sending the message by editing the deferred
        await interaction.editReply({
            content: newMessage,
            ephemeral: true
        });
    }
}