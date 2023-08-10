const { SlashCommandBuilder, userMention } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getme')
        .setDescription('Ask and you shall receive!')
        .addStringOption(option =>
            option.setName('prompt')
                  .setDescription('What do you want to see?')
                  .setRequired(true)
                  .setMaxLength(50)
        ),
    async execute(interaction, client) {

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
            content: `Getting ${userMention(interaction.user.id)} "***${interaction.options.getString("prompt")}***"... ${finalMsg}`
        });
    }
}