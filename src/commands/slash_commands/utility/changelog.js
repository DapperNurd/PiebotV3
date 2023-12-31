const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { piebotColor } = require('../../../extra.js');

const changes = ['**~** Slash commands! Commands are no longer based by text and now start with a /...',
'**+** `/roll next` is now a feature for those who love playing Devil\'s Dice! It will automatically roll from the most recent roll.',
'**+** Use `/poll` to create a poll! Anyone can vote anonymously on a selection of choices picked by the poll creator!',
'**+** Individuals can now set private reminders with `/reminder set`! Piebot will personally remind you when the time is up.',
'**+** Sentience! <:nurdThonk:983576552488984586>',
'**+** Twitch integration? Using !clip on Traumz\'s twitch channel will now automatically make a clip and send it to discord!',
'**+** Trivia! Was once on Twitch, now brought to discord. Every 8 hours, a trivia question will be posted. First to answer correctly wins!',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changelog')
        .setDescription('See what\'s new!'),
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // Sets the targetedUser to the input parameter if included, otherwise the command user
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // Builds the embed message
        const creditsEmbed = new EmbedBuilder()
            .setColor(piebotColor)
            .setAuthor({ name: `${client.user.username} Changelog` })
            .setTimestamp()
            .setTitle("PiebotV3?...")
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });
        
        var list = "\0";
        changes.forEach((change) => { list += change + "\n\n"; })
        creditsEmbed.addFields([{ name: "Changes", value: list }]);

        // Sends the embed message
        await interaction.reply({
            embeds: [creditsEmbed],
            ephemeral: true
        });
    }
}