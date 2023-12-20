const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Accounts')
        .setType(ApplicationCommandType.User),
    async execute(interaction, client, promisePool) {
        client.commands.get('account').execute(interaction, client);
    }
}