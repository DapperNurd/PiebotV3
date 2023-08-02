const { SlashCommandBuilder, EmbedBuilder, userMention } = require('discord.js');
const mongoose = require('mongoose');
const BannedUser = require('../../schemas/bannedUsers')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from using Piebot!')
        .addSubcommand(command => command
            .setName('list')
            .setDescription('Display a list of banned users!')
            .addBooleanOption(option =>
                option.setName('hidden')
                    .setDescription('Hide the command from others?')
            ),
        )
        .addSubcommand(command => command
            .setName('user')
            .setDescription('Display a list of banned users!')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('User to ban')
                    .setRequired(true)
            )
            .addBooleanOption(option =>
                option.setName('hidden')
                    .setDescription('Hide the command from others?')
            )
        ),
    async execute(interaction, client) {

        // Viewing banned users
        if(interaction.options.getSubcommand() == "list") {
            // Extra misc variables
            const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
            
            const hidden = interaction.options.getBoolean('hidden') ?? false;

            var listString = "No users are currently banned."

            // Embed building
            const embed = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setAuthor({
                    iconURL: client.user.displayAvatarURL(),
                    name: `${client.user.displayName} Moderation`
                })
                .setTimestamp()
                .setFooter({
                    iconURL: author.displayAvatarURL(),
                    text: `PiebotV3 by ${author.username}`
                });

            // Database handling
            const banned = await BannedUser.find();
            if(!banned) { // For some reason this just doesnt work....
                embed.setDescription(listString);
            }
            else {
                listString = "\0";
                banned.forEach(async user => {
                    listString += user.userTag + "\n";
                });
                embed.addFields([
                    { name: 'Banned Users', value: listString }
                ])
            }

            // Sending the final message
            await interaction.reply({
                embeds: [embed],
                ephemeral: hidden
            });
        }
        // Banning a user
        else {
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
                    content: userMention(bannedUser.id) + " is already banned...",
                    ephemeral: hidden
                });
            }
        }
    }
}