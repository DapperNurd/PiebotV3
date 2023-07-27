const { ActivityType } = require('discord.js');
const chalk = require("chalk");

const options = [
    {
        type: ActivityType.Competing,
        text: "a pie eating competition",
        status: "online"
    },
    {
        type: ActivityType.Playing,
        text: "Pie Clicker™",
        status: "online"
    },
    {
        type: ActivityType.Watching,
        text: "www.twitch.tv/traumz",
        status: "online"
    },
    {
        type: ActivityType.Playing,
        text: "Devil's Dice",
        status: "online"
    }
]

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {

        // Function to set presence (has to be in the execute because of client)
        async function pickPresence() {
            const option = Math.floor(Math.random() * options.length);
        
            client.user.setPresence({
                activities: [{
                    name: options[option].text,
                    type: options[option].type
                }],
                status: options[option].status
            });
        }

        // Initial presence set
        pickPresence(); // Runs once initially before the timer starts below

        // Presence setting
        setInterval(pickPresence, 30 * 1000); // Sets the presence randomly to one of the options above on a timer (X * 1000, X being in seconds)

        // Bot online message
        console.log(chalk.hex("#1cad2c")(`[Bot Status]: ${client.user.username} is ready and online!`));
    }
}