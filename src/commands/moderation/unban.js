const { SlashCommandBuilder, userMention } = require('discord.js');
const mongoose = require('mongoose');
const BannedUser = require('../../schemas/bannedUsers')

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
                .setRequired(true)
        ),
    async execute(interaction, client) {

        const hidden = interaction.options.getBoolean('hidden');

        // No input scenario handling
        if(!interaction.options.getUser("user")) { // If there is no question asked (an empty command)
            return await interaction.reply({
                content: "Who are you banning??",
                ephemeral: true
            });
        }

        const bannedUser = interaction.options.getUser("user");

        // Database handling
        let bannedUsersProfile = await BannedUser.findOne({ userID: bannedUser.id }); // Searches database for a userID matching the command user's id

        // Unbanning handling
        if(!bannedUsersProfile) { // If banned user is not already in the list
            return await interaction.reply({
                content: "User is not currently banned...",
                ephemeral: hidden
            });
        }
        else { // If banned user IS already in the list
            const result = await BannedUser.deleteOne({ userID: bannedUser.id });
            if(result.deletedCount == 1) {
                return await interaction.reply({
                    content: "Successfully unbanned user " + userMention(bannedUser.id),
                    ephemeral: hidden
                });
            }
            else if(result.deletedCount > 1) {
                return await interaction.reply({
                    content: "Error in unbanning, please contact DapperNurd",
                    ephemeral: hidden
                });
            }
            else {
                return await interaction.reply({
                    content: "Error unbanning " + userMention(bannedUser.id),
                    ephemeral: hidden
                });
            }
        }
    }
}