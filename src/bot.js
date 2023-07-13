require('dotenv').config();
const { token, databaseToken } = process.env;
const { connect } = require('mongoose');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
//const client = new Client({ intents: GatewayIntentBits.Guilds });
client.commands = new Collection();
client.commandArray = [];

// Following YT Tutorial: https://youtu.be/6IgOXmQMT68

const functionFolders = fs.readdirSync(`./src/functions`); // Getting all the folders from the src functions
for (const folder of functionFolders) {
    const functionFiles = fs
        .readdirSync(`./src/functions/${folder}`)
        .filter(file => file.endsWith('.js')); // Getting all the files of that folder, specifically the .js files
    for (const file of functionFiles) 
        require(`./functions/${folder}/${file}`)(client); // For each of those files, we are passing in clients to the file
}

client.handleEvents();
client.handleCommands();
client.login(token);
(async () => {
    await connect(databaseToken).catch(console.error);
})();