const { SlashCommandBuilder, userMention } = require('discord.js');
const chalk = require('chalk');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Roll a die!')
        .addSubcommand(command => command
            .setName('twitch')
            .setDescription('Link your Discord Piebot profile with your Twitch Piebot profile!')
        ),
    async execute(interaction, client, promisePool) {

        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // NOTES:

        // When creating code, check if:
        //    User is already linked
        //    User already has active code
        // When user tries to redeem code, check if:
        //    User already has linked discord (Unsure what to do here)
        //    If invalid:
        //       Tell user code is invalid or has expired

        try { // Creating row/record for user if DNE
            await promisePool.execute(`INSERT INTO Discord.user (userID, userName) VALUES ('${interaction.user.id}', '${interaction.user.username}')`);
            console.log(chalk.yellow(`[Database Status]: Generated new user profile for user: ${interaction.user.username}`));
        } catch {} // Tries to insert a row, errors if row with that id exists... catches the error so it doesn't stop the app

        let [rows, fields] = await promisePool.execute(`SELECT * FROM Twitch.user WHERE discordID = '${interaction.user.id}'`); // Should always find one because of the insert just before this
        if(rows.length > 0) { // If the user is already marked having a twitch account linked
            return await interaction.reply({
                content: `You already have a linked twitch account! If you feel this is wrong, please contact ${userMention(author.id)}...`,
                ephemeral: true
            });
        }

        // Linking Code Generation
        const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const length = 5; // length of code
        let linkCode = '';
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            linkCode += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        try { // Creating row/record for user if DNE
            await promisePool.execute(`INSERT INTO Global.linking (userID, userName, platform, linkCode, expireTime) VALUES ('${interaction.user.id}', '${interaction.user.username}', 'discord-twitch', '${linkCode}', '${Date.now() + (3 * 60_000)}')`); // expireTime is calculated as 3 minutes from when command is ran
        } catch { // Will error if user already has an active linking code, because userID is unique
            return await interaction.reply({
                content: `You already have an active linking code! If you feel this is wrong, please contact ${userMention(author.id)}...`,
                ephemeral: true
            });
        }

        console.log(chalk.yellow(`[Database Status]: Generated linking code for user: ${interaction.user.username}`));
        // Sending final message
        await interaction.reply({
            content: `Here is your linking code: \`${linkCode}\`\n\nIt will expire in three minutes!\nTo use your code, go to https://www.twitch.tv/traumz and type \`!link ${linkCode}\` into chat.`,
            ephemeral: true
        });
    }
}