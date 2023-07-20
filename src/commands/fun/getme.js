const { SlashCommandBuilder, userMention } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getme')
        .setDescription('List of commands to use!')
        .addStringOption(option =>
            option.setName('prompt')
                  .setDescription('What do you want to see?')
                  .setRequired(true)
                  .setMaxLength(50)
        ),
    async execute(interaction, client) {

        // No input scenario handling
        if(!interaction.options.getString("prompt")) { // If there is no question asked (an empty command)
            return await interaction.reply({
                content: "What do you want to see??",
                ephemeral: true
            });
        }

        // GIF Fetching handling
        var finalMsg = "";
        var url = `https://g.tenor.com/v1/search?q=${interaction.options.getString("prompt")}&key=LIVDSRZULELA`
        try {
            let response = await fetch(url); // Gets a list of gifs based on the prompt
            let json = await response.json(); // Converts it to JSON for accessability
            const index = Math.floor(Math.random() * json.results.length); // Grabs a random gif from the list
            finalMsg = json.results[index].url;
        } catch(err) { // If the URL fetch does not work
            console.log("Error catching GIF URL: " + err);
            finalMsg = "https://tenor.com/view/windows-error-gif-21406993"; // Sends an automatic response
        }

        // Sends the context message
        await interaction.reply({
            content: `getting you "${interaction.options.getString("prompt")}"... ${finalMsg}`
        });
    }
}