const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const chalk = require('chalk');
const { piebotColor } = require('../../../extraFunctions.js');

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
        const con = await mysql.createConnection({ host: "192.168.4.30", user: "admin", password: "Pw113445", rowsAsArray: true });
        try { 
            await con.execute(`INSERT INTO Discord.user (userID, userName) VALUES ('${targetedUser.id}', '${targetedUser.username}')`);
            console.log(chalk.yellow(`[Database Status]: Generated new user profile for user: ${targetedUser.username}`));
        } catch {} // Tries to insert a row, errors if row with that id exists... catches the error so it doesn't stop the app
        let [result] = await con.execute(`SELECT COUNT(*) AS rank FROM Discord.user WHERE triviaScore >= (SELECT triviaScore FROM Discord.user WHERE userID = '${targetedUser.id}')`);
        let [rows, fields] = await con.execute(`SELECT * FROM Discord.user WHERE userID = '${targetedUser.id}'`);
        const userObject = rows[0];
        const triviaRank = result[0][0];
        con.end();

        userObject.splice(0, 3); // Removes first three elements (id, name, isBanned)...
        userObject.pop(); // Removes last element (timestamp)...

        const okString = (userObject[13] < 0) ? '😠' : userObject[13].toString();

        // Total calculation
        var total = 0;
        for(i = 0; i < userObject.length-4; i++) { // -4 because it gets rid of the last 3 trivia numbers as well as the okCount
            total += parseInt(userObject[i]);
        }

        // Builds the embed message
        const statsEmbed = new EmbedBuilder()
            .setColor(targetedUser.accentColor ?? piebotColor)
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.displayName} Stats`
            })
            .setTitle(`${namePossesive} User Stats`)
            .setThumbnail(targetedUser.displayAvatarURL())
            .addFields([
                { name: '__Pie Count__',         value: userObject[0].toString(),  inline: true },
                { name: '__Muffin Count__',      value: userObject[1].toString(),  inline: true },
                { name: '__Potato Count__',      value: userObject[2].toString(),  inline: true },
                { name: '__Pizza Count__',       value: userObject[3].toString(),  inline: true },
                { name: '__Ice Cream Count__',   value: userObject[4].toString(),  inline: true },
                { name: '__Cake Count__',        value: userObject[5].toString(),  inline: true },
                { name: '__Cookie Count__',      value: userObject[6].toString(),  inline: true },
                { name: '__Brownie Count__',     value: userObject[7].toString(),  inline: true },
                { name: '__Chocolate Count__',   value: userObject[8].toString(),  inline: true },
                { name: '__Sandwich Count__',    value: userObject[9].toString(),  inline: true },
                { name: '__Pasta Count__',       value: userObject[10].toString(), inline: true },
                { name: '__Fish Fillet Count__', value: userObject[11].toString(), inline: true },
                { name: '__Trash Count__',       value: userObject[12].toString(), inline: true },
                { name: '__Total Count__',       value: total.toString()},
                { name: '\n',                    value: '\n'},
                { name: '__Ok Count__',          value: okString,                                    inline: true },
                { name: '__Trivia Score__',      value: `${userObject[16].toString()} (#${triviaRank})`, inline: true },

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