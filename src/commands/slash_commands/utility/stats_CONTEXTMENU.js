const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const stats = require('./stats.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Stats')
        .setType(ApplicationCommandType.User),
    async execute(interaction, client) {
        client.commands.get('stats').execute(interaction, client, interaction.targetUser);
    }
}