const { SlashCommandBuilder, ChannelType } = require('discord.js');

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

        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        if(interaction.user.id !== author.id) {
            return await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true
            });
        }

        // Sends a reply just to validate the interaction
        await interaction.reply({
            content: "Sent!",
            ephemeral: true
        });

        // Sends message to channel
        return await interaction.options.getChannel('channel').send(interaction.options.getString('text')).catch(err => console.log('Error stats embed!'));

    }
}