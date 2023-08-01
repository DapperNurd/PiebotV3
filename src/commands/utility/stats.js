const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../schemas/user');
const schemaBuildingFunctions = require('../../schemaBuilding.js');

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
        if(!userProfile) userProfile = await schemaBuildingFunctions.generateNewUser(targetedUser.id, targetedUser.username); // If no userProfile is found, generate a new one

        // Total calculation
        const total = userProfile.pieCount + userProfile.muffinCount + userProfile.potatoCount + userProfile.iceCreamCount + userProfile.pizzaCount + userProfile.pastaCount + userProfile.cakeCount + userProfile.chocolateCount + userProfile.sandwichCount + userProfile.brownieCount + userProfile.fishCount + userProfile.trashCount;

        // Builds the embed message
        const statsEmbed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.displayName} Stats`
            })
            .setTitle(`${namePossesive} User Stats`)
            .setThumbnail(targetedUser.displayAvatarURL())
            .addFields([
                { name: 'Pie Count',             value: userProfile.pieCount.toString(),             inline: true },
                { name: 'Muffin Count',          value: userProfile.muffinCount.toString(),          inline: true },
                { name: 'Potato Count',          value: userProfile.potatoCount.toString(),          inline: true },
                { name: 'Ice Cream Count',       value: userProfile.iceCreamCount.toString(),        inline: true },
                { name: 'Pizza Count',           value: userProfile.pizzaCount.toString(),           inline: true },
                { name: 'Pasta Count',           value: userProfile.pastaCount.toString(),           inline: true },
                { name: 'Cake Count',            value: userProfile.cakeCount.toString(),            inline: true },
                { name: 'Chocolate Count',       value: userProfile.chocolateCount.toString(),       inline: true },
                { name: 'Sandwich Count',        value: userProfile.sandwichCount.toString(),        inline: true },
                { name: 'Brownie Count',         value: userProfile.brownieCount.toString(),         inline: true },
                { name: 'Fish Fillet Count',     value: userProfile.fishCount.toString(),            inline: true },
                { name: 'Trash Count',           value: userProfile.trashCount.toString(),           inline: true },
                { name: 'Total Count',           value: total.toString(),                            inline: true },
                { name: 'Total (without gifts)', value: (total-userProfile.foodReceived).toString(), inline: true },
                { name: '\n',                    value: '\n' },
                { name: 'Food Gifted',           value: userProfile.foodGiven.toString(),            inline: true },
                { name: 'Food Received',         value: userProfile.foodReceived.toString(),         inline: true },

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