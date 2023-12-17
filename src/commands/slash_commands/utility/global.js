const { SlashCommandBuilder, EmbedBuilder, userMention } = require('discord.js');
const mysql = require('mysql2/promise');
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
        const con = await mysql.createConnection({ host: "192.168.4.30", user: "admin", password: "Pw113445", rowsAsArray: true });
        let [rows, fields] = await con.execute('SELECT SUM(pieCount) AS pieCount, SUM(muffinCount) AS muffinCount, SUM(potatoCount) AS potatoCount, SUM(pizzaCount) AS pizzaCount, SUM(iceCreamCount) AS iceCreamCount, SUM(cakeCount) AS cakeCount, SUM(cookieCount) AS cookieCount, SUM(brownieCount) AS brownieCount, SUM(chocolateCount) AS chocolateCount, SUM(sandwichCount) AS sandwichCount, SUM(pastaCount) AS pastaCount, SUM(fishCount) AS fishCount, SUM(trashCount) AS trashCount FROM Discord.user;');
        const globalObject = rows[0];
        con.end();

        // Total calculation
        var total = 0;
        for(i = 0; i < globalObject.length; i++) {
            total += parseInt(globalObject[i]);
        }

        // Builds the embed message
        const statsEmbed = new EmbedBuilder()
            .setColor(piebotColor)
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.username} Stats`
            })
            .setTitle('Global Stats')
            .addFields([
                { name: '__Pie Count__',         value: globalObject[0].toString(),  inline: true },
                { name: '__Muffin Count__',      value: globalObject[1].toString(),  inline: true },
                { name: '__Potato Count__',      value: globalObject[2].toString(),  inline: true },
                { name: '__Pizza Count__',       value: globalObject[3].toString(),  inline: true },
                { name: '__Ice Cream Count__',   value: globalObject[4].toString(),  inline: true },
                { name: '__Cake Count__',        value: globalObject[5].toString(),  inline: true },
                { name: '__Cookie Count__',      value: globalObject[6].toString(),  inline: true },
                { name: '__Brownie Count__',     value: globalObject[7].toString(),  inline: true },
                { name: '__Chocolate Count__',   value: globalObject[8].toString(),  inline: true },
                { name: '__Sandwich Count__',    value: globalObject[9].toString(),  inline: true },
                { name: '__Pasta Count__',       value: globalObject[10].toString(), inline: true },
                { name: '__Fish Fillet Count__', value: globalObject[11].toString(), inline: true },
                { name: '__Trash Count__',       value: globalObject[12].toString(), inline: true },
                { name: '__Total Count__',       value: total.toString()},
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