const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { piebotColor } = require('../../../extraFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List of commands to use!'),
    async execute(interaction, client) {

        // Extra misc variables
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // Sets the targetedUser to the input parameter if included, otherwise the command user
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        var modCommands = "\0";

        // Builds the embed message
        const statsEmbed = new EmbedBuilder()
            .setColor(piebotColor)
            .setAuthor({ name: `${client.user.username} Help` })
            .setThumbnail(client.user.displayAvatarURL())
            .setTitle("Commands")
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });
        
        const commandFolders = fs.readdirSync('./src/commands/slash_commands'); // Gets an array of strings of subfolders inside of the main commands folder
        for (var folder of commandFolders) { // Goes through each subfolder
            var names = ""; // Starts an empty string to use for the command names
            const commandFiles = fs.readdirSync(`./src/commands/slash_commands/${folder}`).filter(file => file.endsWith('.js')); // Gets an array of strings of the files in the folder of folder
            for (var file of commandFiles) { // Goes through all files in the subfolder of folder
                file = file.replace(".js", ""); // Removes the ".js" ending on the command names
                if(file.endsWith("_CONTEXTMENU")) continue; // Skips displaying anything from the context menu (with the proper label)
                names += `${file}    \n` // Adds the command name to the string of names
            }

            folder = folder.charAt(0).toUpperCase() + folder.slice(1); // Capitalizes the first letter of the folder

            if(folder == "Moderation") { // If command folder is the Moderation folder
                if(interaction.user.id != author.id) continue; // Skips the displaying of the Moderation commands if command user is not the author of the bot
                modCommands = names;
                continue;
            }

            statsEmbed.addFields({ // Adds a field with Folder name as the header and a list of commands (the string) as the value
                name: `__${folder}__`,
                value: names,
                inline: true
            });
        }

        // Adds the mod commands last, if the field is not empty... this is just so it is the last folder in the embed and keeps it cleaner.
        if(modCommands != "\0") {
            statsEmbed.setDescription('This user can use Moderation commands*');
            statsEmbed.addFields({ // Adds a field with Folder name as the header and a list of commands (the string) as the value
                name: `__Moderation*__`,
                value: modCommands,
                inline: true
            });
        }

        // Sends the embed message
        await interaction.reply({
            embeds: [statsEmbed]
        });
    }
}