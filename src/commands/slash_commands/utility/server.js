const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { piebotColor, columns } = require('../../../extra.js');
const chalk = require('chalk');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Display a server\'s stats!'),
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // Database handling
        try { 
            await promisePool.execute(`INSERT INTO Discord.guild (guildID, guildName) VALUES ('${interaction.guild.id}', '${interaction.guild.name}')`);
            console.log(chalk.yellow(`[Database Status]: Generated new guild profile for guild: ${interaction.guild.name}`));
        } catch {} // Tries to insert a row, errors if row with that id exists... catches the error so it doesn't stop the app
        let [rows, fields] = await promisePool.execute(`SELECT *, ${columns.join('+')} AS total FROM Discord.guild WHERE guildID = '${interaction.guild.id}'`);
        const guildObject = rows[0];

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
                { name: '__Pie Count__',         value: guildObject.pieCount.toString(),  inline: true },
                { name: '__Muffin Count__',      value: guildObject.muffinCount.toString(),  inline: true },
                { name: '__Potato Count__',      value: guildObject.potatoCount.toString(),  inline: true },
                { name: '__Pizza Count__',       value: guildObject.pizzaCount.toString(),  inline: true },
                { name: '__Ice Cream Count__',   value: guildObject.iceCreamCount.toString(),  inline: true },
                { name: '__Cake Count__',        value: guildObject.cakeCount.toString(),  inline: true },
                { name: '__Brownie Count__',     value: guildObject.brownieCount.toString(),  inline: true },
                { name: '__Chocolate Count__',   value: guildObject.chocolateCount.toString(),  inline: true },
                { name: '__Sandwich Count__',    value: guildObject.sandwichCount.toString(),  inline: true },
                { name: '__Pasta Count__',       value: guildObject.pastaCount.toString(), inline: true },
                { name: '__Fish Fillet Count__', value: guildObject.fishCount.toString(), inline: true },
                { name: '__Trash Count__',       value: guildObject.trashCount.toString(), inline: true },
                { name: '__Total Count__',       value: guildObject.total.toString()},
                { name: '\n',                    value: '\n'},
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