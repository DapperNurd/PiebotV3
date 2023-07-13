const { SlashCommandBuilder, EmbedBuilder, Embed } = require('discord.js');
const Guild = require('../../schemas/guild');
const schemaBuildingFunctions = require('../../schemaBuilding.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Display a server\'s stats!'),
    async execute(interaction, client) {

        let guildProfile = await Guild.findOne({ guildID: interaction.guild.id }); // Searches databse for a guildProfile with a matching userID to id
        if(!guildProfile) guildProfile = await schemaBuildingFunctions.generateNewGuild(interaction.guild.id, interaction.guild.name); // If no guildProfile is found, generate a new one

        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        const statsEmbed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.username} Stats`
            })
            .setTitle(`${interaction.guild.name} Server Stats`)
            .setThumbnail(interaction.guild.iconURL())
            .addFields([
                { name: 'Pie Count',         value: guildProfile.pieCount.toString(),      inline: true },
                { name: 'Muffin Count',      value: guildProfile.muffinCount.toString(),   inline: true },
                { name: 'Potato Count',      value: guildProfile.potatoCount.toString(),   inline: true },
                { name: 'Ice Cream Count',   value: guildProfile.iceCreamCount.toString(), inline: true },
                { name: 'Pizza Count',       value: guildProfile.pizzaCount.toString(),    inline: true },
                { name: 'Pasta Count',       value: guildProfile.pastaCount.toString(),    inline: true },
                { name: 'Cake Count',        value: guildProfile.cakeCount.toString(),     inline: true },
                { name: 'Cookie Count',      value: guildProfile.cookieCount.toString(),   inline: true },
                { name: 'Sandwich Count',    value: guildProfile.sandwichCount.toString(), inline: true },
                { name: 'Brownie Count',     value: guildProfile.brownieCount.toString(),  inline: true },
                { name: 'Fish Fillet Count', value: guildProfile.fishCount.toString(),     inline: true },
                { name: 'Trash Count',       value: guildProfile.trashCount.toString(),    inline: true }
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });
        
        await interaction.reply({
            embeds: [statsEmbed]
        });
    }
}