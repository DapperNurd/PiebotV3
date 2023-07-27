const BannedUser = require('../../schemas/bannedUsers')

const banIgnore = ['help', 'menu', 'stats', 'server', 'global'];
const adminCommands = ['ban', 'unban'];

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);
            if (!command) return;

            const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

            // Database Handling
            let bannedUsersProfile = await BannedUser.findOne({ userID: interaction.user.id }); // Searches database for a userID matching the command user's id

            // Running of commands
            try {
                if(bannedUsersProfile && !banIgnore.includes(commandName)) { // If user is banned and the command does not ignore ban status
                    console.log(`${interaction.user.username} tried using /${commandName} while banned...`)
                    return await interaction.reply({
                        content: `You are banned from using commands!`,
                        ephemeral: true
                    });
                }
                else if(adminCommands.includes(commandName) && interaction.user.id != author.id) {
                    console.log(`${interaction.user.username} tried using admin command /${commandName}...`)
                    return await interaction.reply({
                        content: `You do not have permission to use this!`,
                        ephemeral: true
                    });
                }
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: `I don't feel so good... something's not right.`,
                    ephemeral: true
                });
            }
        }
        else if (interaction.isButton()) {
            const { buttons } = client;
            const { customId } = interaction;
            const button = buttons.get(customId);
            if(!button) return new Error("There is no code for this button.");
            try {
                await button.execute(interaction, client);
            } catch (err) {
                console.error(err);
            }
        }
        else if (interaction.isStringSelectMenu()) {
            const { selectMenus } = client;
            const { customId } = interaction;
            const menu = selectMenus.get(customId);
            if(!menu) return new Error("There is no code for this select menu.");
            try {
                await menu.execute(interaction, client);
            } catch (err) {
                console.error(err);
            }
        }
    }
};