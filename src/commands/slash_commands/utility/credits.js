const { SlashCommandBuilder, EmbedBuilder, userMention } = require('discord.js');
const { piebotColor } = require('../../../extra.js');

const creators = [
    '189510396569190401', // nurd
];
const troubleshooters = [
    '223578917372428288', // trash
    '307350352594862080', // kec
];
const writers = [
    '223578917372428288', // trash
    '676978890068983818', // beeble
    '910534977173721171', // violet
    '400539189495726101', // destro
    '117120898992963591', // trauma
];
const commandUsers = [
    '313469030432243724', // kim (pie)
    '307350352594862080', // kec (muffin)
    '379406307087876096', // boneless (potato)
    '565574802094555156', // mia (pizza)
    '222411213961691137', // valyx (fish)
    '400539189495726101', // destro (cake)
    '281750237071015937', // goth (chocolate)
    // '189510396569190401', // me (pasta)
    '324050712935792643', // manton (sandwich)
    '910534977173721171', // violet (ice cream)
    '676978890068983818', // beelbe (brownie)
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('credits')
        .setDescription('Roll credits!'),
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // Sets the targetedUser to the input parameter if included, otherwise the command user
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // Builds the embed message
        const creditsEmbed = new EmbedBuilder()
            .setColor(piebotColor)
            .setAuthor({ name: `${client.user.username} Credits` })
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });
        
        var users = "\0";
        creators.forEach((user) => { users += userMention(user) + "\n"; })
        creditsEmbed.addFields([{ name: "Creator", value: users }]);

        users = "\0";
        troubleshooters.forEach((user) => { users += userMention(user) + "\n"; })
        creditsEmbed.addFields([{ name: "Troubleshooters", value: users }]);

        users = "\0";
        commandUsers.forEach((user) => { users += userMention(user) + "\n"; })
        creditsEmbed.addFields([{ name: "Command Owners", value: users, inline: true }]);

        users = "\0";
        writers.forEach((user) => { users += userMention(user) + "\n"; })
        creditsEmbed.addFields([{ name: "Writers", value: users, inline: true }]);

        // Sends the embed message
        await interaction.reply({
            embeds: [creditsEmbed]
        });
    }
}