const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, userMention } = require('discord.js');
const { piebotColor } = require('../../../extra.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // idk why but it is some weird thing with fetch v3

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('[MODS ONLY] Manually run trivia, does not count score!'),
    async execute(interaction, client, promisePool) {

        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        var useScore = true;

        if(interaction != null) {
            if(!interaction.member.roles.cache.has('320264951597891586') && !interaction.member.roles.cache.has('560348438026387457')) return interaction.reply({ content:`You cannot use this command! Trivia starts automatically every 8 hours...`, ephemeral: true });
            useScore = false;
            await interaction.reply({
                content: "Creating trivia...",
                ephemeral: true
            });
        }

        var trivia = null;

        await fetch(`https://the-trivia-api.com/api/questions?categories=general_knowledge,film_and_tv,food_and_drink,science,arts_and_literature,geography,music,history&limit=1`) // https://the-trivia-api.com/docs/
        .then(async (response) => {
            var questionArray = await response.json();
            trivia = questionArray[0];
        }).catch(err => { console.error(err); });

        var answers = trivia.incorrectAnswers;
        answers.push(trivia.correctAnswer);
        answers = answers.sort((a, b) => 0.5 - Math.random()); // Randomly shuffles array

        const triviaEmbed = new EmbedBuilder()
            .setColor(piebotColor)
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.displayName} Trivia`
            })
            .setTitle(trivia.question)
            .setDescription(`${trivia.category}\n${trivia.difficulty.toUpperCase()} Difficulty`)
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        var correctID = -1;

        if(!useScore) {
            triviaEmbed.addFields([
                { name: '\n', value: `Trivia started manually by ${userMention(interaction.user.id)}` }
            ])
        }
        
        for(i = 0; i < answers.length; i++) {
            // var value = answers[i] == trivia.correctAnswer ? `CORRECT ANSWER: ${i+1})` : `${i+1})` // Displays which one is the correct answer... useful for debugging
            triviaEmbed.addFields([
                { name: `${i+1}) ${answers[i]}`, value: '\n' }
            ])
            if(answers[i] == trivia.correctAnswer) correctID = i+1;
        }

        // Button building
        const oneButton = new ButtonBuilder().setCustomId('1').setLabel('1').setStyle(ButtonStyle.Danger);
        const twoButton = new ButtonBuilder().setCustomId('2').setLabel('2').setStyle(ButtonStyle.Danger);
        const threeButton = new ButtonBuilder().setCustomId('3').setLabel('3').setStyle(ButtonStyle.Danger);
        const fourButton = new ButtonBuilder().setCustomId('4').setLabel('4').setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(oneButton, twoButton, threeButton, fourButton);

        const pies_of_exile = await client.channels.fetch('459566179615506442');
        // const pies_of_exile = await client.channels.fetch('562136578265317388'); // #no FROM Nurds SERVER
        if(pies_of_exile == null) return console.log("[TRIVIA ERROR]: Could not find pies_of_exile!");

        var triviaPost = await pies_of_exile.send({
            embeds: [triviaEmbed],
            components: [row]
        });

        var interacted = [];

        const collector = triviaPost.createMessageComponentCollector({ componentType: ComponentType.Button, time: 10 * 60_000 }); // Creating the collector for the buttons

        var guessed = false;

        collector.on('collect', async i => { // Collector on collect function
            const id = Number(i.customId);
            if(isNaN(id)) return console.log("Error on button input retrival for trivia...");
            if(interacted.includes(i.user.id)) return await i.reply({ content:`You have already guessed!`, ephemeral: true }); // Checks if the user is incldued in the already interacted users, and that it is not the close poll button
            interacted.push(i.user.id); // Adds the guessing user to the interacted list

            if(useScore) // increasing the triviaPlayed number... which is how many games the user has participated in
                promisePool.execute(`INSERT INTO Discord.user (userID,userName,triviaPlayed) VALUES ('${interaction.user.id}','${interaction.user.username}',1) ON DUPLICATE KEY UPDATE triviaPlayed=triviaPlayed+1;`);

            if(answers[id-1] == trivia.correctAnswer) {

                scoreIncrement = 1;
                if(trivia.difficulty == 'medium') scoreIncrement = 2;
                if(trivia.difficulty == 'hard') scoreIncrement = 3;

                if(useScore) {
                    promisePool.execute(`INSERT INTO Discord.user (userID,userName,triviaCorrect) VALUES ('${interaction.user.id}','${interaction.user.username}',1) ON DUPLICATE KEY UPDATE triviaCorrect=triviaCorrect+1;`);
                    promisePool.execute(`INSERT INTO Discord.user (userID,userName,triviaScore) VALUES ('${interaction.user.id}','${interaction.user.username}',1) ON DUPLICATE KEY UPDATE triviaScore=triviaScore+${scoreIncrement};`);
                }

                guessed = true;
                await i.reply({ 
                    content: "Correct answer!",
                    ephemeral: true
                });
                msg = `${userMention(i.user.id)} guessed correctly`;
                if(useScore) msg += ` and won ${scoreIncrement} points`;
                triviaEmbed.addFields([
                    { name: `The correct answer was: ${correctID}) ${trivia.correctAnswer}`, value: `${msg}!` }
                ])
                await triviaPost.edit({
                    embeds: [triviaEmbed],
                    components: []
                }).catch(err => console.log('Error updating poll embed!'));
                collector.stop();
            }
            else {
                await i.reply({ 
                    content: "Incorrect answer...",
                    ephemeral: true
                });
            }
        });

        collector.on('end', async i => { // Collector on end function
            if(!guessed) {
                triviaEmbed.addFields([
                    { name: '\n', value: '\n' },
                    { name: '\n', value: `No one guessed... the correct answer was: ${correctID}) ${trivia.correctAnswer}` }
                ])
                await triviaPost.edit({
                    embeds: [triviaEmbed],
                    components: []
                }).catch(err => console.log('Error updating poll embed!'));
            }

            if(useScore)
                promisePool.execute(`INSERT INTO Discord.guild (guildID,guildName,triviaPlayed) VALUES ('${pies_of_exile.guild.id}','${pies_of_exile.guild.name}',1) ON DUPLICATE KEY UPDATE triviaPlayed=triviaPlayed+1;`);

        });
    }
}