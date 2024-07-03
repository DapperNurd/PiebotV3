const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, userMention } = require('discord.js');
const { IsOnPi, debugMode, Table, currentTriviaSeason, piebotColor, FormatTime } = require('../../../extra.js');
const Canvas = require('@napi-rs/canvas');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // idk why but it is some weird thing with fetch v3

const allowedGuesses = 2;
class InteractedUser { // This is for user interaction handling, so I can easily adjust how many guesses are allowed on trivia
    constructor(member, user, modify = 0) {
        this.member = member;
        this.user = user;
        this.userName = this.member.displayName;
        this.guessesLeft = allowedGuesses + modify;
        this.time = Date.now();
        this.guessedCorrectly = false;
        this.scoredPoints = 0;
        this.attemptsMade = 0;
    }
}

async function StartTrivia(client, promisePool, channel, interaction, override) {

    const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
    
    var useScore = (interaction == null || override); // This could cause issues where you override when interaction is null, but just don't ever call it like that lol

    const triviaChannel = channel;
    // 562136578265317388 <- nurd server   |   pies of exile -> 459566179615506442

    if(interaction != null) { // This is true if the execute function is ran by a user command on discord, or through a function call through code... the sheduled trivia runs through a function call
        if(!interaction.member.roles.cache.has('320264951597891586') && !interaction.member.roles.cache.has('560348438026387457')) return interaction.reply({ content:`You cannot use this command!`, ephemeral: true }); // Does not have Moderator or Nurdiest roles
        if(override && interaction.user != author) return interaction.reply({ content:`You do not have permission to override this.`, ephemeral: true }); // Does not have Moderator or Nurdiest roles
        try { await interaction.reply({ content: "Creating trivia...", ephemeral: true }); }
        catch {}
    }

    var trivia = null;

    await fetch(`https://the-trivia-api.com/api/questions?categories=general_knowledge,film_and_tv,food_and_drink,science,arts_and_literature,geography,history,music,society_and_culture&limit=1`) // https://the-trivia-api.com/docs/
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
            name: `${client.user.displayName} Trivia Season ${currentTriviaSeason}`
        })
        .setTitle(trivia.question)
        .setDescription(`${trivia.category}\n${trivia.difficulty.toUpperCase()} Difficulty`)
        .setTimestamp()
        .setFooter({
            iconURL: author.displayAvatarURL(),
            text: `PiebotV3 by ${author.username}`
        });

    var correctID = -1;

    if(!useScore || override) {
        const msg = override ? `Trivia overriden by ${userMention(interaction.user.id)}\nScoring is **enabled!**` : `Trivia started manually by ${userMention(interaction.user.id)}\nScording is **disabled!**`
        triviaEmbed.addFields([
            { name: '\n', value: msg }
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

    const triviaMinutes = debugMode ? 0.2 : 10;
    const collector = triviaPost.createMessageComponentCollector({ componentType: ComponentType.Button, time: triviaMinutes * 60_000 }); // Creating the collector for the buttons

    var firstTryGuessed = false;
    var guessed = false;

    collector.on('collect', async i => { // Collector on collect function
        try {
            if(i.customId != "1" && i.customId != "2" && i.customId != "3" && i.customId != "4") return; // skips other button interactions
            await i.deferReply({ ephemeral: true });
            const id = Number(i.customId);
            if(isNaN(id)) return console.log("Error on button input retrival for trivia...");

            let user = interactedUsers.find(user => user.member === i.member)

            if(debugMode) { // basically if debug mde 
                user = new InteractedUser(i.member, i.user);
                interactedUsers.push(user); // Adds a new user object to the array
            }
            else {
                if(user) {
                    if(user.guessesLeft <= 0) return await i.editReply({ content: 'You have no guesses remaining!', ephemeral: true }); // Checks if the user is incldued in the already interacted users, and that it is not the close poll button
                }
                else {
                    user = new InteractedUser(i.member, i.user);
                    interactedUsers.push(user); // Adds a new user object to the array                        
                }
            }
            
            user.time = Date.now(); // Updates time to when the latest guess was made

            if(answers[id-1] == trivia.correctAnswer) { // If the guessed answer is the correct answer

                guessed = true;
                user.guessedCorrectly = true;

                if(!firstTryGuessed && user.guessesLeft >= allowedGuesses) { // If the trivia has not been guessed first try by someone before, and the guessing user's first try guess IS the right one...
                    firstTryGuessed = true;
                    triviaEmbed.addFields([{ name: '\n', value: '***Someone guessed correctly on their first try!***' }]);
                    await triviaPost.edit({ embeds: [triviaEmbed] }).catch(err => console.log('Error updating poll embed!')); 
                }

                user.guessesLeft -= allowedGuesses; // Ensures they have no more guesses available after getting it right
                
                await i.editReply({
                    content: 'Correct answer!',
                    ephemeral: true
                });
            }
            else {
                await i.editReply({ content: "Incorrect answer...", ephemeral: true });
            }

            user.guessesLeft--; // subtracts from the user's guesses
            user.attemptsMade++; // Adds an attempt to the user
        }
        catch (err) {console.log("TRIVIA BUTTON ERROR THING:  " + err)}
    });

    collector.on('end', async i => { // Collector on end function
        const msg = !guessed ? `No one guessed correctly... the correct answer was: ${correctID}) ${trivia.correctAnswer}` : `The correct answer was: ${correctID}) ${trivia.correctAnswer}`
        triviaEmbed.addFields([
            { name: '\n', value: '\n' },
            { name: '\n', value: msg }
        ]).setTimestamp(); // Changes the timestamp to when the trivia ended

        await triviaPost.edit({ // Removing buttons from trivia post
            embeds: [triviaEmbed],
            components: []
        }).catch(err => console.log('Error updating poll embed!'));

        // Sending the final results
        if(interactedUsers.length > 0) {
            // Initial embed construction
            const resultsEmbed = new EmbedBuilder()
                .setColor(piebotColor)
                .setAuthor({
                    iconURL: client.user.displayAvatarURL(),
                    name: `${client.user.displayName} Trivia Season ${currentTriviaSeason}`
                })
                .setDescription('<:top:1228543895999086623> Top Guesser          <:quickest:1228543686321635348> Quickest Guesser')
                .setTitle('Results')
                .addFields([{ name: '\n', value: `The correct answer was: ${correctID}) ${trivia.correctAnswer}` }])
                .setTimestamp()
                .setFooter({
                    iconURL: author.displayAvatarURL(),
                    text: `PiebotV3 by ${author.username}`
                });

            interactedUsers = interactedUsers.sort((a, b) => { return a.time - b.time; }); // Sorts it by time 

            let foundFirstGuesser = false;
            if(useScore) {
                interactedUsers.forEach(user => { // Updates all the values
                    promisePool.execute(`INSERT INTO Discord.user (userID,userName,triviaPlayed) VALUES ('${user.user.id}','${user.user.username}',1) ON DUPLICATE KEY UPDATE triviaPlayed=triviaPlayed+1;`);
                    user.scoredPoints = 0;
                    if(user.guessedCorrectly) {
                        if(user.attemptsMade == 1 && !foundFirstGuesser) {
                            promisePool.execute(`INSERT INTO Discord.user (userID,userName,triviaScore) VALUES ('${user.user.id}','${user.user.username}',1) ON DUPLICATE KEY UPDATE triviaScore=triviaScore+2;`);
                            foundFirstGuesser = true;
                            user.scoredPoints = 2;
                        }
                        else {
                            promisePool.execute(`INSERT INTO Discord.user (userID,userName,triviaScore) VALUES ('${user.user.id}','${user.user.username}',1) ON DUPLICATE KEY UPDATE triviaScore=triviaScore+1;`);
                            user.scoredPoints = 1;
                        }
                        promisePool.execute(`INSERT INTO Discord.user (userID,userName,triviaCorrect) VALUES ('${user.user.id}','${user.user.username}',1) ON DUPLICATE KEY UPDATE triviaCorrect=triviaCorrect+1;`);
                    }
                });
            }

            interactedUsers.forEach(user => {
                user.time = FormatTime(user.time - startTime); // Formats the time
            });
    
            const firstTry = interactedUsers.filter((user) => user.attemptsMade == 1 && user.guessedCorrectly); // They made one attempt and scored points
            const secondTry = interactedUsers.filter((user) => user.attemptsMade == 2 && user.guessedCorrectly); // They took 2 attempts and scored points
            const didNotGet = interactedUsers.filter((user) => user.scoredPoints <= 0); // They did not score points

            const rowHeight = 45;
            const tableRows = [];

            if(firstTry.length > 0) {
                tableRows.push(rowHeight + 20); // Header
                for(var i = 0; i < firstTry.length; i++) tableRows.push(rowHeight); // One row for each person
            }
            if(secondTry.length > 0) {
                tableRows.push(rowHeight + 20); // Header
                for(var i = 0; i < secondTry.length; i++) tableRows.push(rowHeight); // One row for each person
            }
            if(didNotGet.length > 0) {
                tableRows.push(rowHeight + 20); // Header
                for(var i = 0; i < didNotGet.length; i++) tableRows.push(rowHeight); // One row for each person
            }

            // Table setup
            var table = new Table(tableRows, [rowHeight + 10, 500, 80, 80, 100, rowHeight + 4, rowHeight]);

            table.SetTableStyle(36, "gg sans");

            table.SetColumnTextWrap(2, Table.TextWrap.clamp);
            table.SetColumnAlignment(2, Table.TextAlignment.right, Table.TextAlignment.center);
            table.SetColumnAlignment(3, Table.TextAlignment.right, Table.TextAlignment.center);
            table.SetColumnAlignment(4, Table.TextAlignment.right, Table.TextAlignment.center);

            table.SetColumnAlignment(5, Table.TextAlignment.right, Table.TextAlignment.center);
            table.SetColumnAlignment(6, Table.TextAlignment.right, Table.TextAlignment.center);

            table.SetColumnTextWrap(1, Table.TextWrap.scale);
            table.SetCellTextWrap(0,  1, Table.TextWrap.overflow);
            
            // Different image  paths for pi vs windows environments
            const crown = IsOnPi() ? "/home/pi/PiebotV3/src/pics/crown.png" : "src/pics/crown.png";
            const lightning = IsOnPi() ? "/home/pi/PiebotV3/src/pics/lightning.png" : "src/pics/lightning.png";

            var currRowIndex = 0;

            if(firstTry.length > 0) {
                table.SetRowText(currRowIndex, ["Guessed First Try"]);
                table.SetRowStyle(currRowIndex, table.fontSize+5, "gg sans");
                table.SetCellTextOffset(currRowIndex, 0, 0, 3);
                currRowIndex++;
                for(var i = 0; i < firstTry.length; i++) {
                    table.SetRowText(currRowIndex, ["", firstTry[i].userName, firstTry[i].time[0] == "0m" ? "" : firstTry[i].time[0], firstTry[i].time[1], firstTry[i].time[2]])
                    table.SetCellImage(currRowIndex, 0, firstTry[i].member.displayAvatarURL({ extension: 'png' }));
                    if(firstTry[i].scoredPoints == 2) table.SetCellImage(currRowIndex, 5, crown); // Sets the first image column to crown if they scored 2 points
                    if(firstTry[i] == interactedUsers[0]) table.SetCellImage(currRowIndex, table.GetCell(currRowIndex, 5).image == "" ? 5 : 6, lightning); // If quickest user, sets the lightning image to first image column, or second if it already has an image
                    currRowIndex++;
                }
            }

            if(secondTry.length > 0) {
                table.SetRowText(currRowIndex, ["Guessed Second Try"]);
                table.SetRowStyle(currRowIndex, table.fontSize+5, "gg sans");
                table.SetCellTextOffset(currRowIndex, 0, 0, 3);
                currRowIndex++;
                for(var i = 0; i < secondTry.length; i++) {
                    table.SetRowText(currRowIndex, ["", secondTry[i].userName, secondTry[i].time[0] == "0m" ? "" : secondTry[i].time[0], secondTry[i].time[1], secondTry[i].time[2]])
                    table.SetCellImage(currRowIndex, 0, secondTry[i].member.displayAvatarURL({ extension: 'png' }));
                    if(secondTry[i].scoredPoints == 2) table.SetCellImage(currRowIndex, 5, crown); // Sets the first image column to crown if they scored 2 points
                    if(secondTry[i] == interactedUsers[0]) table.SetCellImage(currRowIndex, table.GetCell(currRowIndex, 5).image == "" ? 5 : 6, lightning); // If quickest user, sets the lightning image to first image column, or second if it already has an image
                    currRowIndex++;
                }
            }

            if(didNotGet.length > 0) {
                table.SetRowText(currRowIndex, ["Guessed Incorrectly"]);
                table.SetRowStyle(currRowIndex, table.fontSize+5, "gg sans");
                table.SetCellTextOffset(currRowIndex, 0, 0, 3);
                currRowIndex++;
                for(var i = 0; i < didNotGet.length; i++) {
                    table.SetRowText(currRowIndex, ["", didNotGet[i].userName, didNotGet[i].time[0] == "0m" ? "" : didNotGet[i].time[0], didNotGet[i].time[1], didNotGet[i].time[2]])
                    table.SetCellImage(currRowIndex, 0, didNotGet[i].member.displayAvatarURL({ extension: 'png' }));
                    if(didNotGet[i].scoredPoints == 2) table.SetCellImage(currRowIndex, 5, crown); // Sets the first image column to crown if they scored 2 points
                    if(didNotGet[i] == interactedUsers[0]) table.SetCellImage(currRowIndex, table.GetCell(currRowIndex, 5).image == "" ? 5 : 6, lightning); // If quickest user, sets the lightning image to first image column, or second if it already has an image
                    currRowIndex++;
                }
            }

            const canvas = Canvas.createCanvas(table.width, table.height);
            const context = canvas.getContext('2d');

            try { await table.DrawTable(context); }
            catch (err) { return console.log("Error drawing trivia results image: " + err); }

            // Use the helpful Attachment class structure to process the file for you
            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'trivia_results.png' });

            resultsEmbed.setImage("attachment://trivia_results.png")

            await triviaChannel.send({
                embeds: [resultsEmbed],
                files: [attachment]
            }).catch((err) => {
                 console.log('Error updating trivia: could not send results!')
            });
        }

        if(useScore)
            promisePool.execute(`INSERT INTO Discord.guild (guildID,guildName,triviaPlayed) VALUES ('${triviaChannel.guild.id}','${triviaChannel.guild.name}',1) ON DUPLICATE KEY UPDATE triviaPlayed=triviaPlayed+1;`);
    });
}

module.exports = {
    StartTrivia,
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
            .addBooleanOption(option =>
                option.setName('delay')
                    .setDescription('Send a notification out and start the game in a minute?')
            )
            .addBooleanOption(option =>
                option.setName('override')
                    .setDescription('Override and execute a regular game?')
            ),
        ),
    async execute(interaction, client, promisePool) {
        
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        const triviaChannel = interaction.channel; //          562136578265317388 <- nurd server | pies of exile -> 459566179615506442

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
                    { name: 'How does it work?',      value: 'Trivia points are scored based on guessing correctly, and being the first to do so. A trivia game lasts 10 minutes, and everyone gets 2 attempts to guess it correctly. There is a 2 point reward for being the first person to guess it correctly **on their first try**. That is viewed as the top scorer. Note, it does *not* mean the first person to guess correctly in general. If you guess it correctly on your second try, or if someone has already guessed it first try, then you will still earn 1 point. After the 10 minutes are up, a results screen is posted showing who guessed, and who earned points.' },
                    { name: 'What stops me from looking up the answer?', value: "Nothing, really. We play on the honor system. The points for this game are nothing other than a number on a screen, so all of us who are playing fairly would appreciate it you do too. This should really go without saying." },
                    { name: 'Can I start a game manually?',      value: 'Nope. Only moderators have the ability to manually start a trivia game with `/trivia start`, and even then, a manually started trivia game *will not* count scores. It is purely for fun.' },
                    { name: 'Who controls the questions?',      value: 'Piebot gets all trivia questions/answers from https://the-trivia-api.com/.' },
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
            collector.on('collect', async i => { // Collector on collect function'
                if(i.customId != 'notify') return; // skips any unknown button interactions
                await i.deferReply({ ephemeral: true });
                const role = interaction.guild.roles.cache.find(role => role.name === 'Trivia')
                if(!role) { // If role is not found
                    console.log("Error finding Trivia role!");
                    return await i.editReply({ content: "I don't feel so good...", ephemeral: true })
                }
                try { 
                    if(i.member.roles.cache.has(role.id)) { // If the user has the role, remove it
                        i.member.roles.remove(role);
                        await i.editReply({ content: "Successfully removed Trivia role!", ephemeral: true })
                    }
                    else { // If the user does not have the role, add it
                        i.member.roles.add(role);
                        await i.editReply({ content: "Successfully added Trivia role!", ephemeral: true })
                    }
                }
                catch { console.log('Unable to add/remove trivia role...'); } // This try/catch is mainly for permission stuff
                return;
            });

            collector.on('end', async i => { // Collector on end function
                await reply.edit({ embeds: [helpEmbed], components: [], ephemeral: true }).catch((err) => { console.log("Error removing buttons on /trivia help..."); }); // Removes buttons from the reply after collector times out
            });

        } else { // Trivia game handling
            var delay = 1_000;
            if(interaction.options.getBoolean('delay')) {

                const role = triviaChannel.guild.roles.cache.find(role => role.name === 'Trivia')
    
                // Sending the message
                const notify = await triviaChannel.send({ content: `Trivia starts in 60 seconds! <@&${role.id}>` })
    
                // Reacting with the waiting emoji
                try {
                    const waitEmoji = await client.emojis.cache.find(emoji => emoji.id == '1187271828822036580'); // Finds emoji by id
                    notify.react(waitEmoji); // reacts with emoji
                } catch (err) { console.log("EMOJI REACTION ON TRIVIA: " + err) }
    
                delay = 60_000;
            }
            // Timeout to start the actual game
            setTimeout(async () => {
                try {
                    if(interaction.options.getBoolean('override')) StartTrivia(client, promisePool, triviaChannel, interaction, true)
                    else StartTrivia(client, promisePool, triviaChannel, interaction, false)
                } // Runs the twitch command with interaction parameter set to null
                catch (err) { console.error(err); }
            }, delay); // 60 second delay
        }
    }
}