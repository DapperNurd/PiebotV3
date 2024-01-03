const { SlashCommandBuilder, EmbedBuilder, userMention } = require('discord.js');
const { piebotColor } = require('../../../extra.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('[OWNER] Ban a user from using Piebot!')
        .addSubcommand(command => command
            .setName('list')
            .setDescription('Display a list of banned users!')
            .addBooleanOption(option =>
                option.setName('hidden')
                    .setDescription('Hide the command from others?')
            ),
        )
        .addSubcommand(command => command
            .setName('user')
            .setDescription('[OWNER] Display a list of banned users!')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('User to ban')
                    .setRequired(true)
            )
            .addBooleanOption(option =>
                option.setName('hidden')
                    .setDescription('Hide the command from others?')
            )
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Hide the command from others?')
                    .setMaxLength(255)
            )
        ),
    async execute(interaction, client, promisePool) {

        // Viewing banned users
        if(interaction.options.getSubcommand() == "list") {
            // Extra misc variables
            const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
            
            const hidden = interaction.options.getBoolean('hidden') ?? false;

            var listString = "No users are currently banned."

            // Embed building
            const embed = new EmbedBuilder()
                .setColor(piebotColor)
                .setAuthor({
                    iconURL: client.user.displayAvatarURL(),
                    name: `${client.user.displayName} Moderation`
                })
                .setTimestamp()
                .setFooter({
                    iconURL: author.displayAvatarURL(),
                    text: `PiebotV3 by ${author.username}`
                });

            // Database handling
            let [rows, fields] = await promisePool.execute('SELECT * FROM Discord.banned_user');

            if(rows.length <= 0) embed.addFields([ { name: 'There are currently no banned users...', value: '\n' } ]) // If there are no user rows in the Discord.banned_user table
            else {
                listString = "";
                rows.forEach(async user => { listString += user.userName + "\n"; });
                embed.addFields([ { name: 'Banned Users', value: listString } ]);
            }

            // Sending the final message
            await interaction.reply({
                embeds: [embed],
                ephemeral: hidden
            });
        }
        // Banning a user
        else {
            const hidden = interaction.options.getBoolean('hidden') ?? false;

            // No input scenario handling
            if(!interaction.options.getUser("user")) { // If there is no question asked (an empty command)
                return await interaction.reply({
                    content: "Who are you banning??",
                    ephemeral: true
                });
            }

            const bannedUser = interaction.options.getUser("user");

            // Database handling
            let [rows, fields] = await promisePool.execute(`SELECT * FROM Discord.banned_user WHERE userID = ${bannedUser.id}`);

            if(rows.length <= 0) {
                promisePool.execute(`INSERT INTO Discord.banned_user (userID, userName, reason) VALUES ('${bannedUser.id}', '${bannedUser.username}', '${interaction.options.getString('reason') ?? 'No reason given.'}')`);
                return await interaction.reply({
                    content: "Successfully banned " + userMention(bannedUser.id),
                    ephemeral: hidden
                });
            } else {
                await interaction.reply({
                    content: userMention(bannedUser.id) + " is already banned...",
                    ephemeral: hidden
                });
            }
            return;
        }
    }
}