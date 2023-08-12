const { SlashCommandBuilder, EmbedBuilder, userMention } = require('discord.js');
const GlobalCount = require('../../../schemas/globalCount');
const chalk = require('chalk');
const { piebotColor } = require('../../../extraFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('global')
        .setDescription('Display the global stats!'),
    async execute(interaction, client) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // Database handling
        let globalProfile = await GlobalCount.findOne({ globalID: "global" }); // Searches database for the globalProfile
        if(!globalProfile) { // Should hopefully never happen... We do not build a new global profile because there is only ever one. Instead we error and intentionally stop.
            await interaction.reply({ content: `I don't feel so good... something's not right. Where's ${userMention(author.id)}??`, ephemeral: true });
            return console.error(chalk.red("[Bot Status]: Error finding global database!"));
        }

        // Total calculation
        const total = globalProfile.pieCount + globalProfile.muffinCount + globalProfile.potatoCount + globalProfile.iceCreamCount + globalProfile.pizzaCount + globalProfile.pastaCount + globalProfile.cakeCount + globalProfile.chocolateCount + globalProfile.sandwichCount + globalProfile.brownieCount + globalProfile.fishCount + globalProfile.trashCount;

        // Builds the embed message
        const statsEmbed = new EmbedBuilder()
            .setColor(piebotColor)
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.username} Stats`
            })
            .setTitle('Global Stats')
            .addFields([
                { name: '__Pie Count__',         value: globalProfile.pieCount.toString(),       inline: true },
                { name: '__Muffin Count__',      value: globalProfile.muffinCount.toString(),    inline: true },
                { name: '__Potato Count__',      value: globalProfile.potatoCount.toString(),    inline: true },
                { name: '__Ice Cream Count__',   value: globalProfile.iceCreamCount.toString(),  inline: true },
                { name: '__Pizza Count__',       value: globalProfile.pizzaCount.toString(),     inline: true },
                { name: '__Pasta Count__',       value: globalProfile.pastaCount.toString(),     inline: true },
                { name: '__Cake Count__',        value: globalProfile.cakeCount.toString(),      inline: true },
                { name: '__Chocolate Count__',   value: globalProfile.chocolateCount.toString(), inline: true },
                { name: '__Sandwich Count__',    value: globalProfile.sandwichCount.toString(),  inline: true },
                { name: '__Brownie Count__',     value: globalProfile.brownieCount.toString(),   inline: true },
                { name: '__Fish Fillet Count__', value: globalProfile.fishCount.toString(),      inline: true },
                { name: '__Trash Count__',       value: globalProfile.trashCount.toString(),     inline: true },
                { name: '__Total Count__',       value: total.toString()},
                { name: '\n',                  value: '\n'},
                { name: '__Food Gifted__',       value: globalProfile.foodGiven.toString(),      inline: true },
                { name: '__Food Received__',     value: globalProfile.foodReceived.toString(),   inline: true },
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });
        
        // Sends the embed message
        await interaction.reply({
            embeds: [statsEmbed]
        });
    }
}