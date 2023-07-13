const chalk = require("chalk");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(chalk.hex("#1cad2c")(`[Bot Status]: ${client.user.username} is ready and online!`));
    }
}