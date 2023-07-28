const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, userMention } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Start a poll!')
        .addStringOption(option =>
            option.setName('question')
                  .setDescription('What do you want to ask?')
                  .setRequired(true)
                  .setMaxLength(256)
        )
        .addStringOption(option =>
            option.setName('first')
                  .setDescription('The first option people can pick.')
                  .setRequired(true)
                  .setMaxLength(200)
        )
        .addStringOption(option =>
            option.setName('second')
                  .setDescription('The second option people can pick.')
                  .setRequired(true)
                  .setMaxLength(200)
        )
        .addStringOption(option =>
            option.setName('third')
                  .setDescription('The third option people can pick. (Optional)')
                  .setMaxLength(200)
        )
        .addStringOption(option =>
            option.setName('fourth')
                  .setDescription('The fourth option people can pick. (Optional)')
                  .setMaxLength(200)
        )
        .addStringOption(option =>
            option.setName('fifth')
                  .setDescription('The fifth option people can pick. (Optional)')
                  .setMaxLength(200)
        )
        .addIntegerOption(option =>
            option.setName('length')
                  .setDescription('The length of time, in minutes, for the poll to last. Default is 30 minutes.')
                  .setMinValue(1)
                  .setMaxValue(120)
        ),
    async execute(interaction, client) {

        var interacted = [];
        var totalVotes = 0, aVotes = 0, bVotes = 0, cVotes = 0, dVotes = 0, eVotes = 0;

        const pollLength = interaction.options.getInteger("length") ?? 30;

        const pollTimestamp = Date.now(); // Used to track when the poll was created

        var timeLeft = pollLength; // Decrementing variable used to count time left for poll
        
        // ⬛⬜🟥🟧🟨🟩🟦🟪🟫❎⏹🔲🔳

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // Building the buttons
        const optionAButton = new ButtonBuilder().setCustomId('a').setLabel('A').setStyle(ButtonStyle.Secondary);
        const optionBButton = new ButtonBuilder().setCustomId('b').setLabel('B').setStyle(ButtonStyle.Secondary);
        const optionCButton = new ButtonBuilder().setCustomId('c').setLabel('C').setStyle(ButtonStyle.Secondary);
        const optionDButton = new ButtonBuilder().setCustomId('d').setLabel('D').setStyle(ButtonStyle.Secondary);
        const optionEButton = new ButtonBuilder().setCustomId('e').setLabel('E').setStyle(ButtonStyle.Secondary);

        const endButton = new ButtonBuilder().setCustomId('z').setLabel('End Poll').setStyle(ButtonStyle.Danger);

        const voteButtonRow = new ActionRowBuilder().addComponents(optionAButton, optionBButton);
        const actionButtonRow = new ActionRowBuilder().addComponents(endButton);

        if(interaction.options.getString("third")) voteButtonRow.addComponents(optionCButton);
        if(interaction.options.getString("fourth")) voteButtonRow.addComponents(optionDButton);
        if(interaction.options.getString("fifth")) voteButtonRow.addComponents(optionEButton);

        // Sends the embed message
        const confirmation = await interaction.reply({ // Sends a confirmation reply just to confirm out the interaction
            content: 'Building poll...',
            ephemeral: true
        });
        
        const pollMsg = await interaction.channel.send({ // Sends an empty message to be used for the embed
            content: '',
            components: [voteButtonRow, actionButtonRow]
        })

        await updateEmbed(false, true); // Initial embed updating (part of sending the embed)

        // Starts the timer for the message time remaining
        var timer = setInterval(() => {
            timeLeft -= 1;
            updateEmbed();
        }, 60 * 1000);

        // Collection handling
        const collector = pollMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: pollLength * 60_000 }); // Creating the collector for the buttons

        collector.on('collect', async i => { // Collector on collect function
            if(interacted.includes(i.user.id) && i.customId != 'z' && i.customId != 'x') return await i.reply({ content:`You have already voted!`, ephemeral: true }); // Checks if the user is incldued in the already interacted users, and that it is not the close poll button
            if(i.customId == 'z') { // Ending the poll
                // If the person who pressed the end button is not the user who ran the poll command
                if(interaction.user.id != i.user.id) return await i.reply({ content:`Only the creator can end the poll!`, ephemeral: true });
                
                // Else, end the poll
                collector.stop();
                updateEmbed(true, false);
                await i.reply({
                    content: `Successfully closed poll.`,
                    ephemeral: true
                });
            }
            else {
                if(i.customId == 'a')      aVotes++; //
                else if(i.customId == 'b') bVotes++; //
                else if(i.customId == 'c') cVotes++; // Increments the respective vote
                else if(i.customId == 'd') dVotes++; //
                else if(i.customId == 'e') eVotes++; //
                else                       return i.reply({ content: "I don't know what to do with that button.....", ephemeral: true }); // Should not ever run, but if a button is pressed that is not one of the above ones

                totalVotes++; // Increments the total vote counter
                interacted.push(i.user.id); // Adds the user (the one who pressed the button) to the array of interacted users
                updateEmbed(); // Updates the embed
                await i.reply({ // Tells the user they have successfully voted for some option
                    content: `Successfully voted for Option ${i.customId.toUpperCase()}`,
                    ephemeral: true
                });
            }
        });

        collector.on('end', () => { // Collector on end function
            updateEmbed(true, false);
        });

        // Functions
        function buildProgressBar(votes, color) { // Builds the progress var based on the votes, this is really just so I'm not repeating the same code 4 times
            var progress = "";
            var perc = (votes / totalVotes) * 10;

            if(totalVotes <= 0) perc = 0; // This is just to avoid division by zero errors and NaN occurences

            for(var i = 0; i < Math.ceil(perc); i++)       progress += `${color} `;
            for(var i = 0; i < Math.floor(10 - perc); i++) progress += "⬛ ";

            return progress += ` ${votes}  (${Math.round(100*perc)/10}%)`;
        }

        async function updateEmbed(end = false, start = false) { // Updates the embed with the proper information
            const highest = Math.max(aVotes, bVotes, cVotes, dVotes, eVotes); // Calculation for the highest voted value
            const aProgressBar = buildProgressBar(aVotes, (aVotes == highest) ? '🟩' : '🟦'); //
            const bProgressBar = buildProgressBar(bVotes, (bVotes == highest) ? '🟩' : '🟦'); //
            const cProgressBar = buildProgressBar(cVotes, (cVotes == highest) ? '🟩' : '🟦'); // Builds progress bar by votes, and determines which emoji to use for the bar based on whether or not it is the highest value
            const dProgressBar = buildProgressBar(dVotes, (dVotes == highest) ? '🟩' : '🟦'); //
            const eProgressBar = buildProgressBar(eVotes, (eVotes == highest) ? '🟩' : '🟦'); //

            const updatedEmbed = new EmbedBuilder()
                .setColor(interaction.user.accentColor ?? '#FFFFFF')
                .setAuthor({
                    iconURL: client.user.displayAvatarURL(),
                    name: `${client.user.username} Polls`
                })
                .setTitle(interaction.options.getString("question"))
                //.setThumbnail(interaction.user.displayAvatarURL()) // Removed because it made it not wide enough on mobile for the progress bars
                .addFields ([
                    { name: `A) ${interaction.options.getString("first")}`, value: aProgressBar },
                    { name: `B) ${interaction.options.getString("second")}`, value: bProgressBar },
                ])
                .setFooter({
                    iconURL: author.displayAvatarURL(),
                    text: `PiebotV3 by ${author.username}`
                })
                .setTimestamp(pollTimestamp);

            if(interaction.options.getString("third")) updatedEmbed.addFields([{ name: `C) ${interaction.options.getString("third")}`, value: cProgressBar }]);
            if(interaction.options.getString("fourth")) updatedEmbed.addFields([{ name: `D) ${interaction.options.getString("fourth")}`, value: dProgressBar }]);
            if(interaction.options.getString("fifth")) updatedEmbed.addFields([{ name: `E) ${interaction.options.getString("fifth")}`, value: eProgressBar }]);

            updatedEmbed.addFields([
                { name: '\n', value: '\n' },
                { name: `Total Votes: ${totalVotes}`, value: `Poll created by ${userMention(interaction.user.id)}\n`},
                { name: (!end) ? ( (timeLeft > 1) ? `${timeLeft} minutes remaining` : '< 1 minute remaining' ) : 'Poll ended.', value: '\n' }, // Basically a nested ?: operator... this is super messy so I will break it down... if it is not end, run { if time is less than minute, return timeLeft, else, return <1 minute } else return Poll ended
            ])

            if(start) { // Only runs on the first posting of the embed
                confirmation.delete();
            }

            if(end) { // Only runs on the last editing of the embed
                clearInterval(timer); // Stops the interval for counting down timeLeft
                await pollMsg.edit({
                    components: []
                }).catch(err => console.log('Error updating poll embed! (End check)'));
            }

            await pollMsg.edit({
                embeds: [updatedEmbed]
            }).catch(err => console.log('Error updating poll embed!'));
        }
    }
}