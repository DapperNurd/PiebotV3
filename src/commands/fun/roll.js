const { SlashCommandBuilder, userMention } = require('discord.js');
const { execute } = require('../../events/client/ready');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a dice!')
        .addIntegerOption(option =>
            option.setName('maximum')
                  .setDescription('The highest possible number to roll.')
                  .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('minimum')
                  .setDescription('The lowest possible number to roll. Default is 1')
        ),
    async execute(interaction, client) {
        
        const min = interaction.options.getInteger("minimum") ?? 1;
        const max = interaction.options.getInteger("maximum") ?? 6;

        const rolledNum = Math.floor(Math.random() * ((max+1) - min) + min);

        const user = userMention(interaction.user.id);

        await interaction.reply({
            content: `${user} rolled a ${rolledNum} out of ${max}!`
        });
    }
}