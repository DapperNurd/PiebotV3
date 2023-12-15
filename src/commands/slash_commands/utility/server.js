const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Guild = require('../../../schemas/guild');
const { GenerateNewGuild } = require('../../../schemaBuilding.js');
const { piebotColor } = require('../../../extraFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Display a server\'s stats!'),
    async execute(interaction, client, con) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // Database Handling
        let guildProfile = await Guild.findOne({ guildID: interaction.guild.id }); // Searches database for a guildProfile with a matching userID to id
        if(!guildProfile) guildProfile = await GenerateNewGuild(interaction.guild.id, interaction.guild.name); // If no guildProfile is found, generate a new one

        // Total calculation
        const total = guildProfile.pieCount + guildProfile.muffinCount + guildProfile.potatoCount + guildProfile.iceCreamCount + guildProfile.pizzaCount + guildProfile.pastaCount + guildProfile.cakeCount + guildProfile.chocolateCount + guildProfile.sandwichCount + guildProfile.brownieCount + guildProfile.fishCount + guildProfile.trashCount;

        // Builds the embed message
        const statsEmbed = new EmbedBuilder()
            .setColor(piebotColor)
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.username} Stats`
            })
            .setTitle(`${interaction.guild.name} Server Stats`)
            .setThumbnail(interaction.guild.iconURL())
            .addFields([
                { name: '__Pie Count__',         value: guildProfile.pieCount.toString(),       inline: true },
                { name: '__Muffin Count__',      value: guildProfile.muffinCount.toString(),    inline: true },
                { name: '__Potato Count__',      value: guildProfile.potatoCount.toString(),    inline: true },
                { name: '__Ice Cream Count__',   value: guildProfile.iceCreamCount.toString(),  inline: true },
                { name: '__Pizza Count__',       value: guildProfile.pizzaCount.toString(),     inline: true },
                { name: '__Pasta Count__',       value: guildProfile.pastaCount.toString(),     inline: true },
                { name: '__Cake Count__',        value: guildProfile.cakeCount.toString(),      inline: true },
                { name: '__Chocolate Count__',   value: guildProfile.chocolateCount.toString(), inline: true },
                { name: '__Sandwich Count__',    value: guildProfile.sandwichCount.toString(),  inline: true },
                { name: '__Brownie Count__',     value: guildProfile.brownieCount.toString(),   inline: true },
                { name: '__Fish Fillet Count__', value: guildProfile.fishCount.toString(),      inline: true },
                { name: '__Trash Count__',       value: guildProfile.trashCount.toString(),     inline: true },
                { name: '__Total Count__',       value: total.toString()},
                { name: '\n',                  value: '\n'},
                { name: '__Food Gifted__',       value: guildProfile.foodGiven.toString(),      inline: true },
                { name: '__Food Received__',     value: guildProfile.foodReceived.toString(),   inline: true },
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