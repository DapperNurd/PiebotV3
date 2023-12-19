const { SlashCommandBuilder, EmbedBuilder, userMention } = require('discord.js');
const { piebotColor } = require('../../../extra.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scoreboard')
        .setDescription('View the top players for trivia!')
        .addIntegerOption(option =>
            option.setName('rank')
                .setDescription('Returns the user ranked on the scoreboard by the given value.')
                .setMinValue(1)
                .setMaxValue(999)
        ),
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // Database handling
        let [rows, fields] = await promisePool.execute('SELECT * FROM Discord.user ORDER BY triviaScore DESC');

        const embed = new EmbedBuilder()
            .setColor(piebotColor)
            .setTitle(`Trivia Scoreboard`)
            // .setDescription("***[NOTE]** Cancel Button only available for 10 minutes after reminder creation...*")
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.displayName} Trivia`
            })
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        if(interaction.options.getInteger("rank")) { // If there are arguments
            var rank  = interaction.options.getInteger("rank") - 1;
            if(!rows[rank]) rank = rows.length - 1; // If there are less rows than the given rank, sets rank to last one

            addOffset = rank;
            if(rank < 2) addOffset = 2;
            if(rank > rows.length-3) addOffset = rows.length-3; // 3 because of the index offset of 0

            for(i = 0; i < 5; i++) {
                embed.addFields([
                    { name: '\n', value: `#${i-1+addOffset} ${userMention(rows[i-2+addOffset].userID)} - ${rows[i-2+addOffset].triviaScore}` }
                ])
            }
        }
        else {
            for(i = 0; i < 10; i++) {
                if(!rows[i]) break; // if there arent enough existing rows
                if(rows[i].triviaScore <= 0) break; // if the rest of the rows are 0
                embed.addFields([
                    { name: '\n', value: `#${i+1} ${userMention(rows[i].userID)} - ${rows[i].triviaScore}` }
                ])
            }
        }

        await interaction.reply({
            embeds: [embed]
        });
        
    }
}