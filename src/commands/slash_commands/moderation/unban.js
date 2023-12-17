const { SlashCommandBuilder, userMention } = require('discord.js');
const mysql = require('mysql2/promise');

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
    async execute(interaction, client) {

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
        const con = await mysql.createConnection({ host: "192.168.4.30", user: "admin", password: "Pw113445" });
        let [rows, fields] = await con.execute(`SELECT * FROM Discord.banned_user WHERE userID = ${bannedUser.id}`);

        if(rows.length > 0) {
            con.execute(`DELETE FROM Discord.banned_user WHERE userID = '${bannedUser.id}'`);
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

        con.end();
        return;
    }
}