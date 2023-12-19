const chalk = require('chalk');
const mysql = require('mysql2/promise');

const banIgnore = ['help', 'menu', 'stats', 'server', 'global'];
const adminCommands = ['ban', 'unban'];

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client, db) {
        if (interaction.isChatInputCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);
            if (!command) return;

            const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

            // Database handling
            let [rows, fields] = await db.execute(`SELECT * FROM Discord.banned_user WHERE userID = '${interaction.user.id}'`);
            const userIsBanned = (rows.length > 0); // If there are any rows returned from the banned_user list associating with their id, the user is marked as banned

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
                await command.execute(interaction, client, db);
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