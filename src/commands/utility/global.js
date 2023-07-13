const { SlashCommandBuilder, EmbedBuilder, Embed } = require('discord.js');
const GlobalCount = require('../../schemas/globalCount');
const chalk = require('chalk');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('global')
        .setDescription('Display the global stats!'),
    async execute(interaction, client) {
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        let globalProfile = await GlobalCount.findOne({ globalID: "global" }); // Searches databse for the globalProfile
        if(!globalProfile) {
            console.log(chalk.red("[Bot Status]: Error finding global database!"));
            return await interaction.reply({
                content: `I don't feel so good... something's not right. Where's ${author.username}??`,
                ephemeral: true
            });
        }

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
        
        await interaction.reply({
            embeds: [statsEmbed]
        });
    }
}