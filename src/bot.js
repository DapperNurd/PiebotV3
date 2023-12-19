require('dotenv').config();
const { token } = process.env;
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const chalk = require('chalk');
const { piebotColor } = require('./extra.js');
const schedule = require('node-schedule');
// const mysql = require('mysql2/promise');
const mysql = require('mysql2');

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

const pool = mysql.createPool({ host: "192.168.4.30", user: "admin", password: "Pw113445", multipleStatements: true });
const promisePool = pool.promise();

client.handleEvents(promisePool);
client.handleCommands();
client.login(token);

// ------ CRON FORMATTING ------
// *      *    *    *    *    *
// ┬      ┬    ┬    ┬    ┬    ┬
// │      │    │    │    │    │
// │      │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │      │    │    │    └───── month (1 - 12)
// │      │    │    └────────── day of month (1 - 31)
// │      │    └─────────────── hour (0 - 23)
// │      └──────────────────── minute (0 - 59)
// └─────────────────────────── second (0 - 59, OPTIONAL)

const job = schedule.scheduleJob('57 */6 * * *', async function() { // '57 */6 * * *' runs every 6 hours at 57 minutes... PST based... https://cloud.google.com/scheduler/docs/configuring/cron-job-schedules for more info
    const pies_of_exile = await client.channels.fetch('459566179615506442'); //          562136578265317388 <- nurd server | pies of exile -> 459566179615506442
    pies_of_exile.send({
        content: "Trivia starting in 3 minutes!"
    })
    setTimeout(async () => {
        const contextCommand = client.commands.get("trivia");
        if(!contextCommand) return;
        try {
            await contextCommand.execute(null, client, con);
        } catch (err) {
            console.error(err);
        }
    }, 3 * 60_000);
});

// Reminders Handling
setInterval(async () => {

    // Database fetching
    let [rows, fields] = await promisePool.execute('SELECT * FROM Global.reminders');

    if(rows.length <= 0) return; // Returns if no rows are found
    else {
        rows.forEach(async reminder => { // Goes through each document, as reminder
            let msg = `Reminding you about "${reminder.reminder}"`;

            if(reminder.time > Date.now()) return; // Does nothing if it is not time yet for the reminder
            if(Date.now() - reminder.time > 5000) msg = `Reminding you about "${reminder.reminder}" (Reminder is late, sorry)` // Adds a late msg to the reminder if it is more than a minute late

            const user = await client.users.fetch(reminder.userID);
            user?.send({
                content: msg
            }).catch(err => {return;});

            await promisePool.execute(`DELETE FROM Global.reminders WHERE reminder = '${reminder.reminder}'`);
        })
    }
}, 5_000);

// Twitch Clips Handling
setInterval(async () => {

    // Database fetching
    let [rows, fields] = await promisePool.execute('SELECT * FROM Global.twitch_clips');

    if(rows.length <= 0) return; // Returns if no rows are found
    else {
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        rows.forEach(async clip => { // Goes through each document, as clip

            let msg = (clip.clipName == "") ? `${clip.clipURL}\nclipped by ${clip.clipCreator}` : `${clip.clipURL}\n"${clip.clipName}" by ${clip.clipCreator}`

            client.channels.fetch('515395913624322053').then( (channel) => { // Fetches the "twitch-clips" channel on The Trauma Center
                channel.send({
                    content: msg // Sends a message with the clip and some additional info, name and creator
                });
            });

            await promisePool.execute(`DELETE FROM Global.twitch_clips WHERE clipID = '${clip.clipID}'`);
        })
    }
}, 5_000);