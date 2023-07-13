const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const chalk = require('chalk');

module.exports = (client) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync('./src/commands');
        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`./src/commands/${folder}`)
                .filter(file => file.endsWith('.js'));
            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
                //console.log(`Command: ${command.data.name} has been passed through the handler`); ... Commenting this to reduce clutter but this would essentially log as each command is loaded through the handler. Not deleting for future reference.
            }
        }

        const clientId = '762880889817530368';
        const guildId = '347828515858546688';
        const rest = new REST({ version: '9' }).setToken(process.env.token);
        try {
            console.log(chalk.hex("#94cc50")("[Bot Status]: Started refreshing application (/) commands."));

            // Might be weird with multiple guilds, check YT video
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: client.commandArray },
            );

            console.log(chalk.hex("#94cc50")("[Bot Status]: Successfully reloaded application (/) commands."));
        } catch (error) {
            console.error(error);
        }
    };
};