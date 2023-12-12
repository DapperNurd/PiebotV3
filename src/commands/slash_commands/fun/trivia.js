const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, userMention } = require('discord.js');
const { piebotColor } = require('../../../extraFunctions.js');
const User = require('../../../schemas/user');
const Guild = require('../../../schemas/guild');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // idk why but it is some weird thing with fetch v3

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('[MODS ONLY] Manually run trivia, does not count score!'),
    async execute(interaction, client) {

        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        var useScore = true;

        if(interaction != null) {
            if(!interaction.member.roles.cache.has('320264951597891586')) return interaction.reply({ content:`You cannot use this command!`, ephemeral: true });
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
            // var value = answers[i] == trivia.correctAnswer ? `CORRECT ANSWER: ${i+1})` : `${i+1})`
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
        if(pies_of_exile == null) return console.log("[TRIVIA ERROR]: Could not find pies_of_exile!");

        var triviaPost = await pies_of_exile.send({
            embeds: [triviaEmbed],
            components: [row]
        });

        var interacted = [];

        const collector = triviaPost.createMessageComponentCollector({ componentType: ComponentType.Button, time: 10 * 60_000 }); // Creating the collector for the buttons

        var guessed = false;

        collector.on('collect', async i => { // Collector on collect function
            // if(interacted.includes(i.user.id) && i.customId != 'z' && i.customId != 'x') return await i.reply({ content:`You have already voted!`, ephemeral: true }); // Checks if the user is incldued in the already interacted users, and that it is not the close poll button
            const id = Number(i.customId);
            if(isNaN(id)) return; // ADD AN ERROR MSG***********************
            if(interacted.includes(i.user.id)) return await i.reply({ content:`You have already guessed!`, ephemeral: true }); // Checks if the user is incldued in the already interacted users, and that it is not the close poll button
            interacted.push(i.user.id); // Adds the guessing user to the interacted list

            if(useScore) {
                let userProfile = await User.findOne({ userID: i.user.id }); // Searches database for a userProfile with a matching userID to id
                if(!userProfile) userProfile = await GenerateNewUser(i.user.id, i.user.username); // If no userProfile is found, generate a new one

                const userPlayed = userProfile.triviaPlayed + 1; //
                await userProfile.updateOne({ triviaPlayed: userPlayed }); //
            }

            if(answers[id-1] == trivia.correctAnswer) {

                scoreIncrement = 1;
                if(trivia.difficulty == 'medium') scoreIncrement = 2;
                if(trivia.difficulty == 'hard') scoreIncrement = 3;

                if(useScore) {
                    // Food Counts fetching, updating, and saving
                    const userScore = userProfile.triviaScore + scoreIncrement; ////
                    const userCorrect = userProfile.triviaCorrect + 1; ////

                    await userProfile.updateOne({ triviaScore: userScore }); ////
                    await userProfile.updateOne({ triviaCorrect: userCorrect }); ////
                }

                guessed = true;
                await i.reply({ 
                    content: "Correct answer!",
                    ephemeral: true
                });
                msg = `${userMention(i.user.id)} guessed correctly`;
                if(useScore) msg += ` and won ${scoreIncrement} points`
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

            if(useScore) {
                let guildProfile = await Guild.findOne({ guildID: pies_of_exile.guild.id }); // Searches database for a guildProfile with a matching userID to id
                if(!guildProfile) guildProfile = await GenerateNewGuild(i.guild.id, pies_of_exile.guild.name); // If no guildProfile is found, generate a new one

                const guildCount = guildProfile.triviaCount + 1; // Grabs the saved variables from the database and adds one to them
                await guildProfile.updateOne({ triviaCount: guildCount }); // Updates the database variables with the new ones (added one)            
            }
        });
    }
}