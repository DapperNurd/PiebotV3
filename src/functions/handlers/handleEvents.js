const fs = require('fs');

module.exports = (client) => {
    client.handleEvents = async (promisePool) => {

        const eventFolders = fs.readdirSync(`./src/events`);
        for (const folder of eventFolders) {
            const eventFiles = fs
                .readdirSync(`./src/events/${folder}`)
                .filter(file => file.endsWith('.js')); // Going through events folder, finding files of type .js
            switch (folder) {
                case "client": // If client folder
                    for (const file of eventFiles) {
                        const event = require(`../../events/${folder}/${file}`)
                        if (event.once) client.once(event.name, (...args) => event.execute(...args, client)); // runs client.once events
                        else client.on(event.name, (...args) => event.execute(...args, client, promisePool)); // runs client.on events
                    }
                    break;
                default:
                    break;
            }
        }
    }
}