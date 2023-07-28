const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../schemas/user');
const schemaBuildingFunctions = require('../../schemaBuilding.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List of commands to use!'),
    async execute(interaction, client) {

        // Extra misc variables
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // Sets the targetedUser to the input parameter if included, otherwise the command user
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // Builds the embed message
        const statsEmbed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setAuthor({ name: "Piebot Help" })
            .setThumbnail(client.user.displayAvatarURL())
            .setTitle("Commands")
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });
        
        const commandFolders = fs.readdirSync('./src/commands'); // Gets an array of strings of subfolders inside of the main commands folder
        for (var folder of commandFolders) { // Goes through each subfolder
            var names = ""; // Starts an empty string to use for the command names
            const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js')); // Gets an array of strings of the files in the folder of folder
            for (var file of commandFiles) { // Goes through all files in the subfolder of folder
                file = file.replace(".js", ""); // Removes the ".js" ending on the command names
                names += `${file}    ` // Adds the command name to the string of names
            }

            folder = folder.charAt(0).toUpperCase() + folder.slice(1); // Capitalizes the first letter of the folder

            if(folder == "Moderation") { // If command folder is the Moderation folder
                if(interaction.user.id != author.id) continue; // Skips the displaying of the Moderation commands if command user is not the author of the bot
                folder = "*" + folder; // Adds an asterisk to the Moderation folder label
            }

            statsEmbed.addFields({ // Adds a field with Folder name as the header and a list of commands (the string) as the value
                name: folder,
                value: names
            });
        }

        // Sends the embed message
        await interaction.reply({
            embeds: [statsEmbed]
        });
    }
}