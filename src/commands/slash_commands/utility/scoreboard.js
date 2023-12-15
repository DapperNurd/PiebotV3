const { SlashCommandBuilder, EmbedBuilder, userMention } = require('discord.js');
const User = require('../../../schemas/user');
const { piebotColor } = require('../../../extraFunctions.js');

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
    async execute(interaction, client, con) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

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
            await User.find().sort({ triviaScore: -1 }).then((items) => {
                if(!items[rank]) rank = items.length - 1; // If there are less items than the given rank, sets rank to last one

                    addOffset = rank;
                    if(rank < 2) addOffset = 2;
                    if(rank > items.length-3) addOffset = items.length-3; // 3 because of the index offset of 0

                    for(i = 0; i < 5; i++) {
                        embed.addFields([
                            { name: '\n', value: `#${i-1+addOffset} ${userMention(items[i-2+addOffset].userID)} - ${items[i-2+addOffset].triviaScore}` }
                        ])
                    }

            }).catch((err) => {
                console.error(err);
            });
        }
        else {
            await User.find().sort({ triviaScore: -1 }).then((items) => {
                for(i = 0; i < 10; i++) {
                    if(items[[i]].triviaScore <= 0) break;
                    embed.addFields([
                        { name: '\n', value: `#${i+1} ${userMention(items[i].userID)} - ${items[i].triviaScore}` }
                    ])
                }
    
            }).catch((err) => {
                console.error(err);
            });
        }

        await interaction.reply({
            embeds: [embed]
        });
        
    }
}