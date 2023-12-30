const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, userMention } = require('discord.js');
const { piebotColor } = require('../../../extra.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // idk why but it is some weird thing with fetch v3

const allowedGuesses = 2;
 
class InteractedUser { // This is for user interaction handling, so I can easily adjust how many guesses are allowed on trivia
    constructor(id, modify = 0, createdAt = Date.now()) {
        this.userID = id;
        this.guessesLeft = allowedGuesses + modify;
        this.time = createdAt;
        this.scoredPoints = -1;
    }
    SetPoints(num) {
        this.scoredPoints = num;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Trivia command!')
        .addSubcommand(command => command
            .setName('help')
            .setDescription('Get some info about how trivia works.')
        )
        .addSubcommand(command => command
            .setName('start')
            .setDescription('[MODERATOR] Manually stats a trivia game, does not count score!')
        ),
    async execute(interaction, client, promisePool) {

        if(interaction && interaction.options.getSubcommand() == "help") {
            const helpEmbed = new EmbedBuilder()
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
                await interaction.reply({ content: "WIP", ephemeral: true });
        }

        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        var useScore = true;

        let triviaChannel = await client.channels.fetch('459566179615506442'); // #pies_of_exile

        if(interaction != null) { // This is true if the execute function is ran by a user command on discord, or through a function call through code... the sheduled trivia runs through a function call
            if(!interaction.member.roles.cache.has('320264951597891586') && !interaction.member.roles.cache.has('560348438026387457')) return interaction.reply({ content:`You cannot use this command! Trivia starts automatically every 8 hours...`, ephemeral: true }); // Does not have Moderator or Nurdiest roles
            useScore = false; // Disables using of score
            triviaChannel = interaction.channel; // sets to interaction channel
            await interaction.reply({ content: "Creating trivia...", ephemeral: true });
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

        const startTime = Date.now();

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
                { name: '\n', value: `Trivia started manually by ${userMention(interaction.user.id)}\nScoring is disabled!` }
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

        if(triviaChannel == null) return console.log("[TRIVIA ERROR]: Could not find pies_of_exile!");

        var triviaPost = await triviaChannel.send({
            embeds: [triviaEmbed],
            components: [row]
        });

        var interactedUsers = [];

        const collector = triviaPost.createMessageComponentCollector({ componentType: ComponentType.Button, time: 10 * 60_000 }); // Creating the collector for the buttons

        var firstTryGuessed = false;
        var guessed = false;

        collector.on('collect', async i => { // Collector on collect function
            const id = Number(i.customId);
            if(isNaN(id)) return console.log("Error on button input retrival for trivia...");

            let user = interactedUsers.find(user => user.userID === i.user.id)
            if(user) {
                if(user.guessesLeft <= 0) return await i.reply({ content: 'You have no guesses remaining!', ephemeral: true }); // Checks if the user is incldued in the already interacted users, and that it is not the close poll button
            }
            else {
                user = new InteractedUser(i.user.id)
                interactedUsers.push(user); // Adds a new user object to the array if user has not interacted yet, and subtracts one from remaining guesses
            }

            if(useScore) // increasing the triviaPlayed number... which is how many games the user has participated in
                promisePool.execute(`INSERT INTO Discord.user (userID,userName,triviaPlayed) VALUES ('${i.user.id}','${i.user.username}',1) ON DUPLICATE KEY UPDATE triviaPlayed=triviaPlayed+1;`);

            if(answers[id-1] == trivia.correctAnswer) { // If the guessed answer is the correct answer

                let scoreIncrement = 1; // Sets the score increment based on whether or not it's a user's first guess

                if(!firstTryGuessed && user.guessesLeft >= allowedGuesses) { // If the trivia has not been guessed first try by someone before, and the guessing user's first try guess IS the right one...
                    scoreIncrement = 3;
                    firstTryGuessed = true;
                    const msg = `${userMention(i.user.id)} guessed correctly on their first try!`;
                    triviaEmbed.addFields([{ name: '\n', value: msg }]);
                    await triviaPost.edit({ embeds: [triviaEmbed] }).catch(err => console.log('Error updating poll embed!')); 
                }

                let guessMsg = 'Correct answer'

                if(useScore) {
                    promisePool.execute(`INSERT INTO Discord.user (userID,userName,triviaCorrect) VALUES ('${i.user.id}','${i.user.username}',1) ON DUPLICATE KEY UPDATE triviaCorrect=triviaCorrect+1;`);
                    promisePool.execute(`INSERT INTO Discord.user (userID,userName,triviaScore) VALUES ('${i.user.id}','${i.user.username}',1) ON DUPLICATE KEY UPDATE triviaScore=triviaScore+${scoreIncrement};`);
                }
                guessMsg += `, you've earned ${scoreIncrement} point${scoreIncrement > 1 ? 's' : ''}`
                user.SetPoints(scoreIncrement);

                await i.reply({
                    content: `${guessMsg}!`,
                    ephemeral: true
                });
                user.guessesLeft-=allowedGuesses; // Ensures they have no more guesses available
            }
            else {
                await i.reply({ content: "Incorrect answer...", ephemeral: true });
                user.SetPoints(0);
            }
            guessed = true; // Does not necessarily mean someone got it right, but that someone tried.
            user.guessesLeft--; // subtracts from the user's guesses
        });

        collector.on('end', async i => { // Collector on end function
            const msg = !guessed ? `No one guessed... the correct answer was: ${correctID}) ${trivia.correctAnswer}` : `The correct answer was: ${correctID}) ${trivia.correctAnswer}`
            triviaEmbed.addFields([
                { name: '\n', value: '\n' },
                { name: '\n', value: msg }
            ]).setTimestamp(); // Changes the timestamp to when the trivia ended

            await triviaPost.edit({
                embeds: [triviaEmbed],
                components: []
            }).catch(err => console.log('Error updating poll embed!'));

            if(guessed) {
                const resultsEmbed = new EmbedBuilder()
                    .setColor(piebotColor)
                    .setAuthor({
                        iconURL: client.user.displayAvatarURL(),
                        name: `${client.user.displayName} Trivia`
                    })
                    .setTitle('Results')
                    .setTimestamp()
                    .setFooter({
                        iconURL: author.displayAvatarURL(),
                        text: `PiebotV3 by ${author.username}`
                    });

                const firstTryUser = interactedUsers.find(user => user.scoredPoints == 3)
                if(firstTryUser) resultsEmbed.addFields([{ name: 'Top Scorer!', value: `${userMention(firstTryUser.userID)} ${Math.round((firstTryUser.time - startTime)/1000)} seconds` }])

                const quickest = interactedUsers.sort((a, b) => { return a.time - b.time; }).filter((user) => user.scoredPoints > 0);
                if(quickest.length > 0) resultsEmbed.addFields([{ name: 'Quickest Guesser!', value: `${userMention(quickest[0].userID)} ${Math.round((quickest[0].time - startTime)/1000)} seconds` }])

                const scoredOne = interactedUsers.filter((user) => user.scoredPoints == 1);
                if(scoredOne.length > 0) {
                    let msg = '';
                    scoredOne.forEach(user => {
                        msg += userMention(user.userID) + ` ${Math.round((user.time - startTime)/1000)} seconds\n`;
                    });
                    resultsEmbed.addFields([{ name: 'Scored 1 Point', value: msg }])
                }

                const scoredNone = interactedUsers.filter((user) => user.scoredPoints == 0);
                if(scoredNone.length > 0) {
                    let msg = '';
                    scoredNone.forEach(user => {
                        msg += userMention(user.userID) + ` ${Math.round((user.time - startTime)/1000)} seconds\n`;
                    });
                    resultsEmbed.addFields([{ name: 'Did not score', value: msg }])
                }
                
                var resultsPost = await triviaChannel.send({
                    embeds: [resultsEmbed]
                });
            }

            if(useScore)
                promisePool.execute(`INSERT INTO Discord.guild (guildID,guildName,triviaPlayed) VALUES ('${triviaChannel.guild.id}','${triviaChannel.guild.name}',1) ON DUPLICATE KEY UPDATE triviaPlayed=triviaPlayed+1;`);
        });
    }
}