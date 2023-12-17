const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { piebotColor } = require('../../../extraFunctions.js');
const chalk = require('chalk');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Display a server\'s stats!'),
    async execute(interaction, client) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // Database handling
        const con = await mysql.createConnection({ host: "192.168.4.30", user: "admin", password: "Pw113445", rowsAsArray: true });
        try { 
            await con.execute(`INSERT INTO Discord.guild (guildID, guildName) VALUES ('${interaction.guild.id}', '${interaction.guild.name}')`);
            console.log(chalk.yellow(`[Database Status]: Generated new guild profile for guild: ${interaction.guild.name}`));
        } catch {} // Tries to insert a row, errors if row with that id exists... catches the error so it doesn't stop the app
        let [rows, fields] = await con.execute(`SELECT * FROM Discord.guild WHERE guildID = '${interaction.guild.id}'`);
        const guildObject = rows[0];
        con.end();

        guildObject.splice(0, 2); // Removes first two elements (id, name)...
        guildObject.pop(); // Removes last element (timestamp)...

        // Total calculation
        var total = 0;
        for(i = 0; i < guildObject.length; i++) {
            total += parseInt(guildObject[i]);
        }

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
                { name: '__Pie Count__',         value: guildObject[0].toString(),  inline: true },
                { name: '__Muffin Count__',      value: guildObject[1].toString(),  inline: true },
                { name: '__Potato Count__',      value: guildObject[2].toString(),  inline: true },
                { name: '__Pizza Count__',       value: guildObject[3].toString(),  inline: true },
                { name: '__Ice Cream Count__',   value: guildObject[4].toString(),  inline: true },
                { name: '__Cake Count__',        value: guildObject[5].toString(),  inline: true },
                { name: '__Cookie Count__',      value: guildObject[6].toString(),  inline: true },
                { name: '__Brownie Count__',     value: guildObject[7].toString(),  inline: true },
                { name: '__Chocolate Count__',   value: guildObject[8].toString(),  inline: true },
                { name: '__Sandwich Count__',    value: guildObject[9].toString(),  inline: true },
                { name: '__Pasta Count__',       value: guildObject[10].toString(), inline: true },
                { name: '__Fish Fillet Count__', value: guildObject[11].toString(), inline: true },
                { name: '__Trash Count__',       value: guildObject[12].toString(), inline: true },
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