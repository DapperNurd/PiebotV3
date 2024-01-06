const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, userMention } = require('discord.js');
const { piebotColor, FormatTime } = require('../../../extra.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // idk why but it is some weird thing with fetch v3

const allowedGuesses = 2;
 
class InteractedUser { // This is for user interaction handling, so I can easily adjust how many guesses are allowed on trivia
    constructor(id, modify = 0, createdAt = Date.now()) {
        this.userID = id;
        this.guessesLeft = allowedGuesses + modify;
        this.time = createdAt;
        this.scoredPoints = -1;
        this.attemptsMade = 0;
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
        
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        // User typed /trivia help
        if(interaction && interaction.options.getSubcommand() == "help") {
            const helpEmbed = new EmbedBuilder()
                .setColor(piebotColor)
                .setAuthor({
                    iconURL: client.user.displayAvatarURL(),
                    name: `${client.user.displayName} Trivia`
                })
                .setTitle('Trivia Help')
                .addFields([ 
                    { name: 'There\'s trivia?',      value: 'Yep! Piebot hosts a trivia game four times a day, at the same times everyday (<t:32400:t>, <t:54000:t>, <t:75600:t>, <t:97200:t>). You can earn points by guessing correctly, and view your points with `/stats`... there is even a leaderboard, with `/scoreboard`!' },
                    { name: 'How does it work?',      value: 'Trivia points are scored based on guessing correctly, and being the first to do so. A trivia game lasts 10 minutes, and everyone gets 2 attempts to guess it correctly. There is a 3 point reward for being the first person to guess it correctly **on their first try**. That is viewed as the top scorer. Note, it does *not* mean the first person to guess correctly in general. If you guess it correctly on your second try, or if someone has already guessed it first try, then you will still earn 1 point. After the 10 minutes are up, a results screen is posted showing who guessed, and who earned points.' },
                    { name: 'Can I start a game manually?',      value: 'Nope. Only moderators have the ability to manually start a trivia game with `/trivia start`, and even then, a manually started trivia game *will not* count scores. It is purely for fun.' },
                    { name: 'How does it get the questions?',      value: 'Piebot gets all trivia questions/answers from https://the-trivia-api.com/.' },
                    { name: 'Can I get notified when Trivia is starting?', value: 'Yes! Trivia will automatically signal a minute before each game starts, but if you want to get a mention notifcation, you can click the button to add (or remove) the Trivia role!' },
                ])
                .setTimestamp()
                .setFooter({
                    iconURL: author.displayAvatarURL(),
                    text: `PiebotV3 by ${author.username}`
                });

            // Builds the button
            const roleButton = new ButtonBuilder().setCustomId('notify').setLabel('Get Trivia Role!').setStyle(ButtonStyle.Secondary);
            const row = new ActionRowBuilder().addComponents(roleButton);

            // Sends the help message
            const reply = await interaction.reply({ embeds: [helpEmbed], components: [row], ephemeral: true });

            // Starts collectors
            const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 10 * 60_000 }); // Creating the collector for the buttons
            collector.on('collect', async i => { // Collector on collect function
                const role = interaction.guild.roles.cache.find(role => role.name === 'Trivia')
                if(!role) { // If role is not found
                    console.log("Error finding Trivia role!");
                    return i.reply({ content: "I don't feel so good...", ephemeral: true })
                }
                try { 
                    if(i.member.roles.cache.has(role.id)) { // If the user has the role, remove it
                        i.member.roles.remove(role);
                        await i.reply({ content: "Successfully removed Trivia role!", ephemeral: true })
                    }
                    else { // If the user does not have the role, add it
                        i.member.roles.add(role);
                        await i.reply({ content: "Successfully added Trivia role!", ephemeral: true })
                    }
                }
                catch { console.log('Unable to add/remove trivia role...'); } // This try/catch is mainly for permission stuff
                return;
            });

            collector.on('end', async i => { // Collector on end function
                await reply.edit({ embeds: [helpEmbed], components: [], ephemeral: true }).catch((err) => { console.log("Error removing buttons on /trivia help..."); }); // Removes buttons from the reply after collector times out
            });

        } else { // Trivia game handling

            var useScore = true;

            let triviaChannel = await client.channels.fetch('459566179615506442'); //   562136578265317388 <- nurd server | pies of exile -> 459566179615506442

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
                user.attemptsMade++; // Adds an attempt to the user
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

                // Sending the final results
                if(guessed) {
                    // Initial embed construction
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

                    // Embed building
                    const quickest = interactedUsers.sort((a, b) => { return a.time - b.time; }).filter((user) => user.scoredPoints > 0); // Greater than zero means only if they got it
                    if(quickest.length > 0) resultsEmbed.addFields([{ name: 'Quickest Guesser', value: `${userMention(quickest[0].userID)} ${FormatTime(quickest[0].time - startTime)}` }])

                    const firstTry = interactedUsers.filter((user) => user.attemptsMade == 1);
                    if(firstTry.length > 0) {
                        let msg = '';
                        firstTry.forEach(user => {
                            msg += userMention(user.userID) + ` ${FormatTime(user.time - startTime)}`;
                            if(user.scoredPoints == 3) msg += ' 👑';
                            msg += '\n';
                        });
                        resultsEmbed.addFields([{ name: 'Guessed First Try', value: msg }])
                    }

                    const secondTry = interactedUsers.filter((user) => user.attemptsMade == 2);
                    if(secondTry.length > 0) {
                        let msg = '';
                        secondTry.forEach(user => {
                            msg += userMention(user.userID) + ` ${FormatTime(user.time - startTime)}\n`;
                        });
                        resultsEmbed.addFields([{ name: 'Guessed Second Try', value: msg }])
                    }

                    const didNotGet = interactedUsers.filter((user) => user.attemptsMade > 2);
                    if(didNotGet.length > 0) {
                        let msg = '';
                        didNotGet.forEach(user => {
                            msg += userMention(user.userID) + ` ${FormatTime(user.time - startTime)}\n`;
                        });
                        resultsEmbed.addFields([{ name: 'Guessed Incorrectly', value: msg }])
                    }

                    // Embed updating/sending
                        await triviaPost.edit({
                            embeds: [triviaEmbed, resultsEmbed],
                            components: []
                        }).catch(async (err) => {
                            await interaction.channel.send({
                                embeds: [resultsEmbed]
                            }).catch(err => console.log('Error updating trivia: could not send results!'));
        
                        });
                }

                if(useScore)
                    promisePool.execute(`INSERT INTO Discord.guild (guildID,guildName,triviaPlayed) VALUES ('${triviaChannel.guild.id}','${triviaChannel.guild.name}',1) ON DUPLICATE KEY UPDATE triviaPlayed=triviaPlayed+1;`);
            });
        }
    }
}