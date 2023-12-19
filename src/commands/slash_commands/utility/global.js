const { SlashCommandBuilder, EmbedBuilder, userMention } = require('discord.js');
const chalk = require('chalk');
const { piebotColor, columns } = require('../../../extra.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('global')
        .setDescription('Display the global stats!'),
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // Database handling
        let queryStr = ''; // Query string building...
        columns.forEach(column => {
            queryStr += 'SUM(' + column + ') AS ' + column + ', ';
        });
        queryStr += 'SUM(' + columns.join('+') + ') AS total'

        let [rows, fields] = await promisePool.query(`SELECT ${queryStr} FROM Discord.user`);
        const globalObject = rows[0];

        // Builds the embed message
        const statsEmbed = new EmbedBuilder()
            .setColor(piebotColor)
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.username} Stats`
            })
            .setTitle('Global Stats')
            .addFields([
                { name: '__Pie Count__',         value: globalObject.pieCount.toString(),  inline: true },
                { name: '__Muffin Count__',      value: globalObject.muffinCount.toString(),  inline: true },
                { name: '__Potato Count__',      value: globalObject.potatoCount.toString(),  inline: true },
                { name: '__Pizza Count__',       value: globalObject.pizzaCount.toString(),  inline: true },
                { name: '__Ice Cream Count__',   value: globalObject.iceCreamCount.toString(),  inline: true },
                { name: '__Cake Count__',        value: globalObject.cakeCount.toString(),  inline: true },
                { name: '__Cookie Count__',      value: globalObject.cookieCount.toString(),  inline: true },
                { name: '__Brownie Count__',     value: globalObject.brownieCount.toString(),  inline: true },
                { name: '__Chocolate Count__',   value: globalObject.chocolateCount.toString(),  inline: true },
                { name: '__Sandwich Count__',    value: globalObject.sandwichCount.toString(),  inline: true },
                { name: '__Pasta Count__',       value: globalObject.pastaCount.toString(), inline: true },
                { name: '__Fish Fillet Count__', value: globalObject.fishCount.toString(), inline: true },
                { name: '__Trash Count__',       value: globalObject.trashCount.toString(), inline: true },
                { name: '__Total Count__',       value: globalObject.total.toString()},
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