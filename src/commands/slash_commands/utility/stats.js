const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../../schemas/user');
const { GenerateNewUser } = require('../../../schemaBuilding.js');
const { piebotColor } = require('../../../extraFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Display a user\'s stats!')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('User to display stats for')
        ),
    async execute(interaction, client) {

        // Extra misc variables
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // Sets the targetedUser to the input parameter if included, otherwise the command user
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        const namePossesive = (targetedUser.displayName.endsWith('s')) ? targetedUser.displayName+ "'" : targetedUser.displayName + "'s" // Proper spelling for when a user's displayName ends with an s... (Kecatas' instead of Kecatas's)

        // Database handling
        let userProfile = await User.findOne({ userID: targetedUser.id }); // Searches database for a userProfile with a matching userID to id
        if(!userProfile) userProfile = await GenerateNewUser(targetedUser.id, targetedUser.username); // If no userProfile is found, generate a new one

        // Username updating within the database (to new system)
        if(userProfile.userName != interaction.user.username) await userProfile.updateOne({ userName: interaction.user.username }); // Checks if the username within the database is not the current username of the user

        // Total calculation
        const total = userProfile.pieCount + userProfile.muffinCount + userProfile.potatoCount + userProfile.iceCreamCount + userProfile.pizzaCount + userProfile.pastaCount + userProfile.cakeCount + userProfile.chocolateCount + userProfile.sandwichCount + userProfile.brownieCount + userProfile.fishCount + userProfile.trashCount;

        const okString = (userProfile.okCount < 0) ? '😠' : userProfile.okCount.toString();

        // Builds the embed message
        const statsEmbed = new EmbedBuilder()
            .setColor(targetedUser.accentColor ?? piebotColor)
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.displayName} Stats`
            })
            .setTitle(`${namePossesive} User Stats`)
            .setThumbnail(targetedUser.displayAvatarURL())
            .addFields([
                { name: '__Pie Count__',             value: userProfile.pieCount.toString(),             inline: true },
                { name: '__Muffin Count__',          value: userProfile.muffinCount.toString(),          inline: true },
                { name: '__Potato Count__',          value: userProfile.potatoCount.toString(),          inline: true },
                { name: '__Ice Cream Count__',       value: userProfile.iceCreamCount.toString(),        inline: true },
                { name: '__Pizza Count__',           value: userProfile.pizzaCount.toString(),           inline: true },
                { name: '__Pasta Count__',           value: userProfile.pastaCount.toString(),           inline: true },
                { name: '__Cake Count__',            value: userProfile.cakeCount.toString(),            inline: true },
                { name: '__Chocolate Count__',       value: userProfile.chocolateCount.toString(),       inline: true },
                { name: '__Sandwich Count__',        value: userProfile.sandwichCount.toString(),        inline: true },
                { name: '__Brownie Count__',         value: userProfile.brownieCount.toString(),         inline: true },
                { name: '__Fish Fillet Count__',     value: userProfile.fishCount.toString(),            inline: true },
                { name: '__Trash Count__',           value: userProfile.trashCount.toString(),           inline: true },
                { name: '__Total Count__',           value: total.toString(),                            inline: true },
                { name: '__Total (without gifts)__', value: (total-userProfile.foodReceived).toString(), inline: true },
                { name: '\n',                        value: '\n' },
                { name: '__Food Gifted__',           value: userProfile.foodGiven.toString(),            inline: true },
                { name: '__Food Received__',         value: userProfile.foodReceived.toString(),         inline: true },
                { name: '\n',                        value: '\n' },
                { name: '__Ok Count__',              value: okString,                                    inline: true },
                { name: '__Trivia Score__',          value: userProfile.triviaScore.toString(),          inline: true },

            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        if(targetedUser.id == "189510396569190401") statsEmbed.setDescription("Bot creator"); // Adds a small comment on my (nurd) stats showing that I am the creator
        
        // Sends the embed message
        await interaction.reply({
            embeds: [statsEmbed]
        });
    }
}