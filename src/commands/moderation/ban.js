const { SlashCommandBuilder, userMention } = require('discord.js');
const mongoose = require('mongoose');
const BannedUser = require('../../schemas/bannedUsers')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from using Piebot!')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to ban')
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

        // Banning handling
        if(!bannedUsersProfile) { // If banned user is not already in the list
            let bannedUsersProfile = await new BannedUser({ // Essentially a template for a guild document in MongoDB Atlas
                _id: new mongoose.Types.ObjectId(),
                userID: bannedUser.id,
                userTag: bannedUser.username
            });
        
            await bannedUsersProfile.save().catch(console.error);

            return await interaction.reply({
                content: "Successfully banned " + userMention(bannedUser.id),
                ephemeral: hidden
            });
        }
        else { // If banned user IS already in the list
            return await interaction.reply({
                content: "User is already banned...",
                ephemeral: hidden
            });
        }
    }
}