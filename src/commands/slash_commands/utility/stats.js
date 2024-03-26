const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const chalk = require('chalk');
const { currentTriviaSeason, columns, GetUserAccentColor } = require('../../../extra.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Display a user\'s account info!')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('User to display stats for')
        )
        .addBooleanOption(option =>
            option.setName('hidden')
                .setDescription('Hide the command from others?')
        ),
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // Sets the targetedUser to the input parameter if included, otherwise the command user
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        const namePossesive = (targetedUser.displayName.endsWith('s')) ? targetedUser.displayName+ "'" : targetedUser.displayName + "'s" // Proper spelling for when a user's displayName ends with an s... (Kecatas' instead of Kecatas's)
        const hidden = interaction.options.getBoolean('hidden') ?? false;

        // Database handling
        try { 
            await promisePool.execute(`INSERT INTO Discord.user (userID, userName) VALUES ('${targetedUser.id}', '${targetedUser.username}')`);
            console.log(chalk.yellow(`[Database Status]: Generated new user profile for user: ${targetedUser.username}`));
        } catch {} // Tries to insert a row, errors if row with that id exists... catches the error so it doesn't stop the app

        let [result] = await promisePool.execute(`SELECT COUNT(*) AS rank FROM Discord.user WHERE triviaScore >= (SELECT triviaScore FROM Discord.user WHERE userID = '${targetedUser.id}')`);
        const currTriviaRank = result[0].rank;

        let [rows, fields] = await promisePool.execute(`SELECT *, ${columns.join('+')} AS total FROM Discord.user WHERE userID = '${targetedUser.id}'`);
        const userObject = rows[0];
        
        let [twitchResult] = await promisePool.execute(`SELECT *, ${columns.join('+')} AS total FROM Twitch.user WHERE discordID = '${targetedUser.id}'`); // Should always find one because of the insert just before this
        let twitchProfile = null;
        if(twitchResult.length > 0) { // If the user is already marked having a twitch account linked
            twitchProfile = twitchResult[0];
        }

        const okString = (userObject.okCount < 0) ? '😠' : userObject.okCount.toString();

        // Building the buttons
        const leftButton = new ButtonBuilder().setCustomId('left').setLabel('<').setStyle(ButtonStyle.Secondary);
        const rightBButton = new ButtonBuilder().setCustomId('right').setLabel('>').setStyle(ButtonStyle.Secondary);

        const navButtonRow = new ActionRowBuilder().addComponents(leftButton, rightBButton);

        // Builds the embed message
        const accountEmbed = new EmbedBuilder()
            .setColor(await GetUserAccentColor(targetedUser))
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.displayName} Stats`
            })
            .setTitle(`${namePossesive} User Info`)
            .setThumbnail(targetedUser.displayAvatarURL())
            .addFields([ // ${userObject.triviaScore.toString()} (#${triviaRank})`
                { name: `__Trivia Season ${currentTriviaSeason} Score__`,      value: `${userObject.triviaScore.toString()} (${userObject.triviaScore == 0 ? 'Unranked' : '#' + currTriviaRank})${currTriviaRank == 1 ? ' 👑' : ''}`, inline: true },
                { name: '__Twitch Account__',      value: `${ twitchProfile != null ? twitchProfile.userName : 'No Twitch profile currently linked...' }` },
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        if(targetedUser.id == "189510396569190401") accountEmbed.setDescription("Bot creator"); // Adds a small comment on my (nurd) stats showing that I am the creator

                // Builds the embed message
        const discordStatsEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.displayName} Stats`
            })
            .setTitle(`${namePossesive} Discord Stats`)
            .setThumbnail(targetedUser.displayAvatarURL())
            .addFields([
                { name: '__Pie Count__',         value: userObject.pieCount.toString(), inline: true },
                { name: '__Muffin Count__',      value: userObject.muffinCount.toString(), inline: true },
                { name: '__Potato Count__',      value: userObject.potatoCount.toString(), inline: true },
                { name: '__Pizza Count__',       value: userObject.pizzaCount.toString(), inline: true },
                { name: '__Ice Cream Count__',   value: userObject.iceCreamCount.toString(), inline: true },
                { name: '__Cake Count__',        value: userObject.cakeCount.toString(), inline: true },
                { name: '__Brownie Count__',     value: userObject.brownieCount.toString(), inline: true },
                { name: '__Chocolate Count__',   value: userObject.chocolateCount.toString(), inline: true },
                { name: '__Sandwich Count__',    value: userObject.sandwichCount.toString(), inline: true },
                { name: '__Pasta Count__',       value: userObject.pastaCount.toString(), inline: true },
                { name: '__Fish Fillet Count__', value: userObject.fishCount.toString(), inline: true },
                { name: '__Trash Count__',       value: userObject.trashCount.toString(), inline: true },
                { name: '__Total Count__',       value: userObject.total.toString()},
                { name: '\n',                    value: '\n'},
                { name: '__Ok Count__',          value: okString, inline: true },
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

            
        const embeds = [accountEmbed, discordStatsEmbed];

        const twitchStatsEmbed = new EmbedBuilder();
        if(twitchProfile != null) {
            twitchStatsEmbed
            .setColor('#9146FF') // Twitch purple
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.displayName} Stats`
            })
            .setTitle(`${namePossesive} Twitch Stats`)
            .setThumbnail(targetedUser.displayAvatarURL())
            .addFields([
                { name: '__Pie Count__',         value: twitchProfile.pieCount.toString(), inline: true },
                { name: '__Muffin Count__',      value: twitchProfile.muffinCount.toString(), inline: true },
                { name: '__Potato Count__',      value: twitchProfile.potatoCount.toString(), inline: true },
                { name: '__Pizza Count__',       value: twitchProfile.pizzaCount.toString(), inline: true },
                { name: '__Ice Cream Count__',   value: twitchProfile.iceCreamCount.toString(), inline: true },
                { name: '__Cake Count__',        value: twitchProfile.cakeCount.toString(), inline: true },
                { name: '__Brownie Count__',     value: twitchProfile.brownieCount.toString(), inline: true },
                { name: '__Chocolate Count__',   value: twitchProfile.chocolateCount.toString(), inline: true },
                { name: '__Sandwich Count__',    value: twitchProfile.sandwichCount.toString(), inline: true },
                { name: '__Pasta Count__',       value: twitchProfile.pastaCount.toString(), inline: true },
                { name: '__Fish Fillet Count__', value: twitchProfile.fishCount.toString(), inline: true },
                { name: '__Trash Count__',       value: twitchProfile.trashCount.toString(), inline: true },
                { name: '__Total Count__',       value: twitchProfile.total.toString()},
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });
            embeds.push(twitchStatsEmbed);
        }
        else {
            twitchStatsEmbed
            .setColor('#9146FF') // Twitch purple
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: `${client.user.displayName} Stats`
            })
            .setTitle(`${namePossesive} Twitch Stats`)
            .setThumbnail(targetedUser.displayAvatarURL())
            .addFields([
                { name: 'Twitch profile not linked!', value: `${targetedUser.displayName} has not linked their Twitch account yet.\nType \`/link twitch\` to get started!`, inline: true },
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });
            embeds.push(twitchStatsEmbed);
        }
        
        let embedIndex = 0; // Sets starting page, currently first page
        navButtonRow.components[0].setDisabled(true); // Disables left button from start... change this if changing staring page

        // Sends the embed message
        const embedMsg = await interaction.reply({
            embeds: [embeds[embedIndex]],
            components: [navButtonRow],
            ephemeral: hidden
        });

        // Collection handling
        const collector = embedMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600_000 }); // Creating the collector for the buttons
        collector.on('collect', async i => { // Collector on collect function
            if(i.user.id != interaction.user.id) return await i.reply({ content: 'Only the command user can change pages.', ephemeral: true });
            navButtonRow.components[0].setDisabled(false); // Enables left and right button before potentially disabling
            navButtonRow.components[1].setDisabled(false); // 
            if(i.customId == 'right') { // On cancel button
                embedIndex++; // increases the page number index
                if(embedIndex >= embeds.length-1) navButtonRow.components[1].setDisabled(true); // Disables the right button if on the last page of embeds
                
                await i.update({
                    embeds: [embeds[embedIndex]],
                    components: [navButtonRow]
                }).catch(err => console.log('Error stats embed!'));
            }
            else if(i.customId == 'left') {
                embedIndex--; // increases the page number index
                if(embedIndex <= 0) navButtonRow.components[0].setDisabled(true); // Disables the left button if on the first page of embeds
                
                await i.update({
                    embeds: [embeds[embedIndex]],
                    components: [navButtonRow]
                }).catch(err => console.log('Error stats embed!'));
            }
            else {
                console.log('[ERROR]: Code missing for button on account command!')
            }
        });
 
        collector.on('end', () => { // Collector on end function
            embedMsg.edit({
                embeds: [embeds[embedIndex]],
                components: []
            }).catch(err => console.log('Error stats embed!'));
        });
    }
}