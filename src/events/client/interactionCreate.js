const chalk = require('chalk');
const mysql = require('mysql2/promise');
const fs = require('fs');

const banIgnore = ['help', 'menu', 'stats', 'server', 'global'];

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client, promisePool) {
        if (interaction.isChatInputCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);
            if (!command) return;

            const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

            // Database handling
            let [rows, fields] = await promisePool.execute(`SELECT * FROM Discord.banned_user WHERE userID = '${interaction.user.id}'`);
            const userIsBanned = (rows.length > 0); // If there are any rows returned from the banned_user list associating with their id, the user is marked as banned

            let modCommands = [];
            const commandFolders = fs.readdirSync('./src/commands/slash_commands'); // Gets an array of strings of subfolders inside of the main commands folder
            for (var folder of commandFolders) { // Goes through each subfolder
                if(folder != "moderation") continue; // skips showing aliases and context_menu folders
                
                const commandFiles = fs.readdirSync(`./src/commands/slash_commands/${folder}`).filter(file => file.endsWith('.js')); // Gets an array of strings of the files in the folder of folder
                for (var file of commandFiles) { // Goes through all files in the subfolder of folder
                    file = file.replace(".js", ""); // Removes the ".js" ending on the command names
                    modCommands.push(file); // Adds the command name to the string of names
                }
            }

            // Running of commands
            try {
                if(userIsBanned && !banIgnore.includes(commandName)) { // If user is banned and the command does not ignore ban status
                    console.log(chalk.hex("#e8692a")(`[Bot Moderation]: ${interaction.user.displayName} tried using /${commandName} while banned`))
                    return await interaction.reply({
                        content: `You are banned from using commands!`,
                        ephemeral: true
                    });
                }
                else if(modCommands.includes(commandName) && interaction.user.id != author.id) {
                    console.log(chalk.hex("#e8692a")(`[Bot Moderation]: ${interaction.user.displayName} tried using admin command /${commandName}`))
                    return await interaction.reply({
                        content: `You do not have permission to use this!`,
                        ephemeral: true
                    });
                }
                await command.execute(interaction, client, promisePool);
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
                await button.execute(interaction, client, promisePool);
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
                await menu.execute(interaction, client, promisePool);
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
                await contextCommand.execute(interaction, client, promisePool);
            } catch (err) {
                console.error(err);
            }
        }
    }
};