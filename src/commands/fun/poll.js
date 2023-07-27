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
        ),
    async execute(interaction, client) {

        var interacted = [];
        var totalVotes = 0;
        var aVotes = 0;
        var bVotes = 0;
        var cVotes = 0;
        var dVotes = 0;

        var timeLeft = 15; // Cannot go above 15 because of discord limits
        
        // ⬛⬜🟥🟧🟨🟩🟦🟪🟫❎⏹🔲🔳

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // Building the buttons
        const optionAButton = new ButtonBuilder()
			.setCustomId('a')
			.setLabel('A')
			.setStyle(ButtonStyle.Secondary);

        const optionBButton = new ButtonBuilder()
			.setCustomId('b')
			.setLabel('B')
			.setStyle(ButtonStyle.Secondary);

        const optionCButton = new ButtonBuilder()
			.setCustomId('c')
			.setLabel('C')
			.setStyle(ButtonStyle.Secondary);

        const optionDButton = new ButtonBuilder()
			.setCustomId('d')
			.setLabel('D')
			.setStyle(ButtonStyle.Secondary);

        const endButton = new ButtonBuilder()
            .setCustomId('x')
            .setLabel('End Poll')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
			.addComponents(optionAButton, optionBButton);

        if(interaction.options.getString("third")) row.addComponents(optionCButton);
        if(interaction.options.getString("fourth")) row.addComponents(optionDButton);

        row.addComponents(endButton);

        // Sends the embed message
        const pollMsg = await interaction.reply({
            content: 'Building poll...'
        });
        
        await updateEmbed(false);

        await pollMsg.edit({
            content: '',
            components: [row]
        })

        const collector = pollMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 880_000 }); // Collector for the buttons, just under 15 minutes

        collector.on('collect', async i => {
            if(interacted.includes(i.user.id) && i.customId != 'x') {
                return await i.reply({
                    content:`You have already voted!`,
                    ephemeral: true
                });
            }
            if(i.customId != 'x') {
                if(i.customId == 'a')      aVotes++;
                else if(i.customId == 'b') bVotes++;
                else if(i.customId == 'c') cVotes++;
                else if(i.customId == 'd') dVotes++;
                else                       return i.reply({ content: "I don't know what to do with that button.....", ephemeral: true });

                totalVotes++;
                interacted.push(i.user.id);
                updateEmbed(false);
                await i.reply({
                    content: `Successfully voted for Option ${i.customId.toUpperCase()}`,
                    ephemeral: true
                });
            }
            else {
                // If the person who pressed the end button is not the user who ran the poll command
                if(interaction.user.id != i.user.id) return await i.reply({ content:`Only the creator can end the poll!`, ephemeral: true });
                
                // Else, end the poll
                clearInterval(timer); // Stops the interval for counting down timeLeft
                collector.stop();
                updateEmbed(true);
                await i.reply({
                    content: `Successfully closed poll.`,
                    ephemeral: true
                });
            }
        });

        function buildProgressBar(votes) {
            var progress = "";
            var perc = (votes / totalVotes) * 10;
            if(totalVotes <= 0) perc = 0;
            for(var i = 0; i < Math.ceil(perc); i++) {
                progress += "🟩 ";
            }
            for(var i = 0; i < Math.floor(10 - perc); i++) {
                progress += "⬛ ";
            }
            progress += ` ${votes}  (${Math.round(100*perc)/10}%)`

            return progress;
        }

        async function updateEmbed(end) {
            const aProgressBar = buildProgressBar(aVotes);
            const bProgressBar = buildProgressBar(bVotes);
            const cProgressBar = buildProgressBar(cVotes);
            const dProgressBar = buildProgressBar(dVotes);

            const updatedEmbed = new EmbedBuilder()
                .setColor(interaction.user.accentColor ?? '#FFFFFF')
                .setAuthor({
                    iconURL: client.user.displayAvatarURL(),
                    name: `${client.user.username} Polls`
                })
                .setTitle(interaction.options.getString("question"))
                .setDescription(`Poll created by ${userMention(interaction.user.id)}`)
                //.setThumbnail(interaction.user.displayAvatarURL()) // Removed because it made it not wide enough on mobile for the progress bars
                .addFields ([
                    { name: `A) ${interaction.options.getString("first")}`, value: aProgressBar },
                    { name: `B) ${interaction.options.getString("second")}`, value: bProgressBar },
                ])
                .setTimestamp()
                .setFooter({
                    iconURL: author.displayAvatarURL(),
                    text: `PiebotV3 by ${author.username}`
                });

            if(interaction.options.getString("third")) updatedEmbed.addFields([{ name: `C) ${interaction.options.getString("third")}`, value: cProgressBar }]);
            if(interaction.options.getString("fourth")) updatedEmbed.addFields([{ name: `D) ${interaction.options.getString("fourth")}`, value: dProgressBar }]);

            updatedEmbed.addFields([
                { name: '\n', value: '\n' },
                { name: `Total Votes: ${totalVotes}`, value: '\n'},
                { name: (!end) ? `${timeLeft} minutes remaining` : 'Poll ended.', value: '\n' },
            ])

            if(end) {
                optionAButton.setDisabled(true);
                optionBButton.setDisabled(true);
                if(interaction.options.getString("third")) optionCButton.setDisabled(true);
                if(interaction.options.getString("fourth")) optionDButton.setDisabled(true);
                endButton.setDisabled(true);
                await pollMsg.edit({
                    components: [row]
                })
            }

            await pollMsg.edit({
                embeds: [updatedEmbed]
            })
        }

        collector.on('end', () => {
            clearInterval(timer);
            updateEmbed(true);
        });

        var timer = setInterval(() => {
            timeLeft -= 1;
            updateEmbed(false);
        }, 60 * 1000);

    }
}