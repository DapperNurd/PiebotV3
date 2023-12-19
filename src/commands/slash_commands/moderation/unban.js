const { SlashCommandBuilder, userMention } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from using Piebot!')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to unban')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('hidden')
                .setDescription('Hide the command from others?')
        ),
    async execute(interaction, client, promisePool) {

        const hidden = interaction.options.getBoolean('hidden') ?? false;

        // No input scenario handling
        if(!interaction.options.getUser("user")) { // If there is no question asked (an empty command)
            return await interaction.reply({
                content: "Who are you banning??",
                ephemeral: true
            });
        }

        const bannedUser = interaction.options.getUser("user");

        // Database handling
        let [rows, fields] = await promisePool.execute(`SELECT * FROM Discord.banned_user WHERE userID = ${bannedUser.id}`);

        if(rows.length > 0) {
            promisePool.execute(`DELETE FROM Discord.banned_user WHERE userID = '${bannedUser.id}'`);
            return await interaction.reply({
                content: "Successfully unbanned " + userMention(bannedUser.id),
                ephemeral: hidden
            });
        } else {
            await interaction.reply({
                content: userMention(bannedUser.id) + " is not currently banned...",
                ephemeral: hidden
            });
        }

        return;
    }
}