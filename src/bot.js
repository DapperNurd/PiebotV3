require('dotenv').config();
const { token, databaseToken } = process.env;
const { connect } = require('mongoose');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const Reminder = require('./schemas/reminder');
const TwitchClips = require('./schemas/twitchClips');
const fs = require('fs');
const chalk = require('chalk');
const { piebotColor } = require('./extraFunctions.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();
client.textCommands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
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
    await connect(databaseToken).catch(err => {console.log(err)});
})();

// Reminders Handling
setInterval(async () => {
    const reminders = await Reminder.find(); // Gets a list of all current documents in the reminder collection
    if(!reminders) return; // Does nothing if none found
    else {
        reminders.forEach(async reminder => { // Goes through each document, as reminder
            let msg = `Reminding you about "${reminder.reminder}"`;

            if(reminder.time > Date.now()) return; // Does nothing if it is not time yet for the reminder
            if(Date.now() - reminder.time > 3600) msg = `Reminding you about "${reminder.reminder}" (Reminder is late, sorry)` // Adds a late msg to the reminder if it is more than a minute late

            const user = await client.users.fetch(reminder.userID);
            user?.send({
                content: msg
            }).catch(err => {return;});

            await Reminder.deleteMany({ // Deletes the completed reminder
                _id: reminder._id,
                userID: reminder.userID,
                userName: reminder.userName,
                time: reminder.time,
                reminder: reminder.reminder
            });
        })
    }
}, 5_000);

// Reminders Handling
setInterval(async () => {
    const clips = await TwitchClips.find(); // Gets a list of all current documents in the TwitchClips collection
    if(!clips) return; // Does nothing if none found
    else {
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        clips.forEach(async clip => { // Goes through each document, as clip

            client.channels.fetch('515395913624322053').then( (channel) => { // Fetches the "twitch-clips" channel on The Trauma Center
                channel.send({
                    content: `"${clip.clipURL}\n${clip.clipName}" by ${clip.clipCreator}` // Sends a message with the clip and some additional info, name and creator
                });
            });

            await TwitchClips.deleteMany({ // Deletes the clip from the database
                _id: clip._id,
                clipID: clip.clipID,
                clipName: clip.clipName,
                clipURL: clip.clipURL,
                clipCreator: clip.clipCreator,
                clipThumbnail: clip.clipThumbnail
            });
        })
    }
}, 5_000);