const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Stats')
        .setType(ApplicationCommandType.User),
    async execute(interaction, client) {
        client.commands.get('stats').execute(interaction, client);
    }
}