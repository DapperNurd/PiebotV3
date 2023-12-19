const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const chalk = require('chalk');
const { piebotColor, columns } = require('../../../extra.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Display a user\'s stats!')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('User to display stats for')
        ),
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // Sets the targetedUser to the input parameter if included, otherwise the command user
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        const namePossesive = (targetedUser.displayName.endsWith('s')) ? targetedUser.displayName+ "'" : targetedUser.displayName + "'s" // Proper spelling for when a user's displayName ends with an s... (Kecatas' instead of Kecatas's)

        // Database handling
        try { 
            await promisePool.execute(`INSERT INTO Discord.user (userID, userName) VALUES ('${targetedUser.id}', '${targetedUser.username}')`);
            console.log(chalk.yellow(`[Database Status]: Generated new user profile for user: ${targetedUser.username}`));
        } catch {} // Tries to insert a row, errors if row with that id exists... catches the error so it doesn't stop the app
        let [result] = await promisePool.execute(`SELECT COUNT(*) AS rank FROM Discord.user WHERE triviaScore >= (SELECT triviaScore FROM Discord.user WHERE userID = '${targetedUser.id}')`);
        let [rows, fields] = await promisePool.execute(`SELECT *, ${columns.join('+')} AS total FROM Discord.user WHERE userID = '${targetedUser.id}'`);
        const userObject = rows[0];
        const triviaRank = result[0].rank;

        const okString = (userObject.okCount < 0) ? '😠' : userObject.okCount.toString();

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
                { name: '__Pie Count__',         value: userObject.pieCount.toString(), inline: true },
                { name: '__Muffin Count__',      value: userObject.muffinCount.toString(), inline: true },
                { name: '__Potato Count__',      value: userObject.potatoCount.toString(), inline: true },
                { name: '__Pizza Count__',       value: userObject.pizzaCount.toString(), inline: true },
                { name: '__Ice Cream Count__',   value: userObject.iceCreamCount.toString(), inline: true },
                { name: '__Cake Count__',        value: userObject.cakeCount.toString(), inline: true },
                { name: '__Cookie Count__',      value: userObject.cookieCount.toString(), inline: true },
                { name: '__Brownie Count__',     value: userObject.brownieCount.toString(), inline: true },
                { name: '__Chocolate Count__',   value: userObject.chocolateCount.toString(), inline: true },
                { name: '__Sandwich Count__',    value: userObject.sandwichCount.toString(), inline: true },
                { name: '__Pasta Count__',       value: userObject.pastaCount.toString(), inline: true },
                { name: '__Fish Fillet Count__', value: userObject.fishCount.toString(), inline: true },
                { name: '__Trash Count__',       value: userObject.trashCount.toString(), inline: true },
                { name: '__Total Count__',       value: userObject.total.toString()},
                { name: '\n',                    value: '\n'},
                { name: '__Ok Count__',          value: okString, inline: true },
                { name: '__Trivia Score__',      value: `${userObject.triviaScore.toString()} (#${triviaRank})`, inline: true },

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