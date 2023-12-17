const BannedUser = require('../../schemas/bannedUsers')
const chalk = require('chalk');
const mysql = require('mysql2/promise');

const banIgnore = ['help', 'menu', 'stats', 'server', 'global'];
const adminCommands = ['ban', 'unban'];

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);
            if (!command) return;

            const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

            // Database handling
            const columnName = 'pieCount'; // Change this to change what value is read/written
            const con = await mysql.createConnection({ host: "192.168.4.30", user: "admin", password: "Pw113445" });
            let [rows, fields] = await con.execute(`SELECT * FROM Discord.banned_user WHERE userID = '${interaction.user.id}'`);
            const userIsBanned = (rows.length > 0); // If there are any rows returned from the banned_user list associating with their id, the user is marked as banned
            con.end();

            // Running of commands
            try {
                if(userIsBanned && !banIgnore.includes(commandName)) { // If user is banned and the command does not ignore ban status
                    console.log(chalk.hex("#e8692a")(`[Bot Moderation]: ${interaction.user.displayName} tried using /${commandName} while banned`))
                    return await interaction.reply({
                        content: `You are banned from using commands!`,
                        ephemeral: true
                    });
                }
                else if(adminCommands.includes(commandName) && interaction.user.id != author.id) {
                    console.log(chalk.hex("#e8692a")(`[Bot Moderation]: ${interaction.user.displayName} tried using admin command /${commandName}`))
                    return await interaction.reply({
                        content: `You do not have permission to use this!`,
                        ephemeral: true
                    });
                }
                await command.execute(interaction, client, con);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: `I don't feel so good... something's not right.`,
                    ephemeral: true
                });
            }
        }
        else if (interaction.isButton()) {
            const { buttons } = client;
            const { customId } = interaction;
            const button = buttons.get(customId);
            if(!button) return new Error("There is no code for this button.");
            try {
                await button.execute(interaction, client);
            } catch (err) {
                console.error(err);
            }
        }
        else if (interaction.isStringSelectMenu()) {
            const { selectMenus } = client;
            const { customId } = interaction;
            const menu = selectMenus.get(customId);
            if(!menu) return new Error("There is no code for this select menu.");
            try {
                await menu.execute(interaction, client);
            } catch (err) {
                console.error(err);
            }
        }
        else if (interaction.isContextMenuCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const contextCommand = commands.get(commandName);
            if(!contextCommand) return;

            try {
                await contextCommand.execute(interaction, client);
            } catch (err) {
                console.error(err);
            }
        }
    }
};