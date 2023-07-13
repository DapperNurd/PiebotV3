const { SlashCommandBuilder, EmbedBuilder, userMention } = require('discord.js');
const GlobalCount = require('../../schemas/globalCount');
const chalk = require('chalk');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('global')
        .setDescription('Display the global stats!'),
    async execute(interaction, client) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // Database handling
        let globalProfile = await GlobalCount.findOne({ globalID: "global" }); // Searches database for the globalProfile
        if(!globalProfile) { // Should hopefully never happen
            console.log(chalk.red("[Bot Status]: Error finding global database!"));
            return await interaction.reply({ // We do not build a new global profile because there is only ever one.
                content: `I don't feel so good... something's not right. Where's ${userMention(author.id)}??`,
                ephemeral: true
            });
        }

        // Builds the embed message
        const statsEmbed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.username} Stats`
            })
            .setTitle('Global Stats')
            .setThumbnail('https://creazilla-store.fra1.digitaloceanspaces.com/emojis/49917/globe-showing-americas-emoji-clipart-md.png')
            .addFields([
                { name: 'Pie Count',         value: globalProfile.pieCount.toString(),      inline: true },
                { name: 'Muffin Count',      value: globalProfile.muffinCount.toString(),   inline: true },
                { name: 'Potato Count',      value: globalProfile.potatoCount.toString(),   inline: true },
                { name: 'Ice Cream Count',   value: globalProfile.iceCreamCount.toString(), inline: true },
                { name: 'Pizza Count',       value: globalProfile.pizzaCount.toString(),    inline: true },
                { name: 'Pasta Count',       value: globalProfile.pastaCount.toString(),    inline: true },
                { name: 'Cake Count',        value: globalProfile.cakeCount.toString(),     inline: true },
                { name: 'Cookie Count',      value: globalProfile.cookieCount.toString(),   inline: true },
                { name: 'Sandwich Count',    value: globalProfile.sandwichCount.toString(), inline: true },
                { name: 'Brownie Count',     value: globalProfile.brownieCount.toString(),  inline: true },
                { name: 'Fish Fillet Count', value: globalProfile.fishCount.toString(),     inline: true },
                { name: 'Trash Count',       value: globalProfile.trashCount.toString(),    inline: true }
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