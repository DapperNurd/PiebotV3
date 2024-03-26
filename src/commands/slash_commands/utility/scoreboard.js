const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, userMention } = require('discord.js');
const { piebotColor, currentTriviaSeason, currentTriviaDates, previousTriviaDates } = require('../../../extra.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scoreboard')
        .setDescription('View the top players for trivia!')
        .addBooleanOption(option =>
            option.setName('previous')
                .setDescription('Shows the scores from the previous trivia season!')
        ),
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // Database handling
        const msg = interaction.options.getBoolean("previous") ? "Global.previous_trivia" : "Discord.user";
        const dates = interaction.options.getBoolean("previous") ? previousTriviaDates : currentTriviaDates;

        let [rows, fields] = await promisePool.execute(`SELECT * FROM ${msg} ORDER BY triviaScore DESC`);

        // Button navigation
        const leftButton = new ButtonBuilder().setCustomId('left').setLabel('<').setStyle(ButtonStyle.Secondary);
        const rightBButton = new ButtonBuilder().setCustomId('right').setLabel('>').setStyle(ButtonStyle.Secondary);

        const navButtonRow = new ActionRowBuilder().addComponents(leftButton, rightBButton);

        var index = 0;
        var length = rows.length;
        var width = 5; // How many items to display at once
        var pageLimit = Math.floor(length/width);

        // Embed building
        const embed = new EmbedBuilder()
            .setColor(piebotColor)
            .setTitle(`Trivia Scoreboard`)
            // .setDescription("***[NOTE]** Cancel Button only available for 10 minutes after reminder creation...*")
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.displayName} Trivia`
            })
            .setTimestamp()
            .setDescription(dates)
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        embed.data.fields = [];
        embed.addFields([
            { name: 'User', value: `\n`, inline: true },
            { name: 'Score', value: `\n`, inline: true },
            { name: 'Played', value: `\n`, inline: true }
        ])
        // Builds the list
        for(i = 0; i < width; i++) {
            if(!rows[i]) break; // if there arent enough existing rows
            embed.addFields([
                { name: '\n', value: `#${i+1} ${userMention(rows[i].userID)}`, inline: true },
                { name: '\n', value: `${rows[i].triviaScore}`, inline: true  },
                { name: '\n', value: `${rows[i].triviaPlayed}`, inline: true  }
            ])
        }

        const replyMsg = await interaction.reply({
            embeds: [embed],
            components: [navButtonRow]
        });
        
        // Collection handling
        const collector = replyMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600_000 }); // Creating the collector for the buttons
        collector.on('collect', async buttonInteraction => { // Collector on collect function
            if(buttonInteraction.user.id != interaction.user.id) return await buttonInteraction.reply({ content: 'Only the command user can change pages.', ephemeral: true });
            navButtonRow.components[0].setDisabled(false); // Enables left and right button before potentially disabling
            navButtonRow.components[1].setDisabled(false); // 

            if(buttonInteraction.customId == 'right') { // On cancel button
                index++; // increases the page number index
                if(index >= pageLimit) navButtonRow.components[1].setDisabled(true); // Disables the right button if on the last page of embeds

                embed.data.fields = [];
                embed.addFields([
                    { name: 'User', value: `\n`, inline: true },
                    { name: 'Score', value: `\n`, inline: true },
                    { name: 'Played', value: `\n`, inline: true }
                ])
                // Builds the list
                for(i = index*width; i < (index+1)*width; i++) {
                    if(!rows[i]) break; // if there arent enough existing rows
                    embed.addFields([
                        { name: '\n', value: `#${i+1} ${userMention(rows[i].userID)}`, inline: true },
                        { name: '\n', value: `${rows[i].triviaScore}`, inline: true  },
                        { name: '\n', value: `${rows[i].triviaPlayed}`, inline: true  }
                    ])
                }

                await buttonInteraction.update({
                    embeds: [embed],
                    components: [navButtonRow]
                }).catch(err => console.log('Error stats embed!'));
            }
            else if(buttonInteraction.customId == 'left') {                
                index--; // increases the page number index
                if(index <= 0) navButtonRow.components[0].setDisabled(true); // Disables the left button if on the first page of embeds

                embed.data.fields = [];
                embed.addFields([
                    { name: 'User', value: `\n`, inline: true },
                    { name: 'Score', value: `\n`, inline: true },
                    { name: 'Played', value: `\n`, inline: true }
                ])
                // Builds the list
                for(i = index*width; i < (index+1)*width; i++) {
                    if(!rows[i]) break; // if there arent enough existing rows
                    embed.addFields([
                        { name: '\n', value: `#${i+1} ${userMention(rows[i].userID)}`, inline: true },
                        { name: '\n', value: `${rows[i].triviaScore}`, inline: true  },
                        { name: '\n', value: `${rows[i].triviaPlayed}`, inline: true  }
                    ])
                }

                await buttonInteraction.update({
                    embeds: [embed],
                    components: [navButtonRow]
                }).catch(err => console.log('Error stats embed!'));
            }
            else {
                console.log('[ERROR]: Code missing for button on account command!')
            }
        });
 
        collector.on('end', () => { // Collector on end function
            replyMsg.edit({
                embeds: [embed],
                components: []
            }).catch(err => console.log('Error stats embed!'));
        });

    }
}