const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, userMention } = require('discord.js');
const { Column, piebotColor, currentTriviaSeason, currentTriviaDates, previousTriviaDates } = require('../../../extra.js');
const Canvas = require('@napi-rs/canvas');

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

        Canvas.GlobalFonts.registerFromPath("src\\fonts\\gg sans Regular.ttf", "gg sans")
        Canvas.GlobalFonts.registerFromPath("src\\fonts\\gg sans SemiBold.ttf", "gg sans bold")

        const resolution = 6;
        const offset = 0*resolution;
        const spacing = 1.5*resolution;
        const circumferance = 8*resolution;
        const radius = circumferance/2;
        
        const columns = [
            new Column(12),
            new Column(50),
            new Column(22, "right"),
            new Column(22, "right"),
            new Column(25) // Just for extra spacing on the right
        ];

        const paragraphs = 1;

        if(resolution != 0) for(var i = 0; i < columns.length; i++) columns[i].width = columns[i].width * resolution;
        var columnsWidth = 0;
        columns.forEach(column => { columnsWidth += column.width + spacing; });

        const canvasWidth = circumferance+spacing+offset*2 + columnsWidth;
        const canvasHeight = (offset*2) + circumferance*(width+paragraphs+1) + spacing*(width+paragraphs) + (spacing*2*paragraphs);

        const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
        const context = canvas.getContext('2d');

        var rowCount = 0;
        var paragraphCount = 0;

        CreateTextRow(context, circumferance+spacing, rowCount, "white", `${circumferance * 0.8}px gg sans`, ["", "User", "Scored", "Played"]);
        rowCount++;
        paragraphCount++;

        // Builds the list
        for(var i = 0; i < width; i++) {
            if(!rows[i]) break; // if there arent enough existing rows
            const member = await client.users.fetch(rows[i].userID);
            await CreateProfilePicture(context, rowCount, member.displayAvatarURL({ extension: 'png' }));
            CreateTextRow(context, circumferance+spacing, rowCount, "white", `${circumferance * 0.8}px gg sans`, [`#${i+1}`, `${member.displayName.replace(/[^\x00-\x7F]/g, "")}`, `${rows[i].triviaScore}`, `${rows[i].triviaPlayed}`]);
            rowCount++;
        }
        
        // Use the helpful Attachment class structure to process the file for you
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'scoreboard.png' });
        embed.setImage("attachment://scoreboard.png")

        const replyMsg = await interaction.reply({
            embeds: [embed],
            files: [attachment],
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

                const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
                const context = canvas.getContext('2d');

                var rowCount = 0;
                var paragraphCount = 0;

                CreateTextRow(context, circumferance+spacing, rowCount, "white", `${circumferance * 0.8}px gg sans`, ["", "User", "Scored", "Played"]);
                rowCount++;
                paragraphCount++;

                // Builds the list
                for(i = index*width; i < (index+1)*width; i++) {
                    if(!rows[i]) break; // if there arent enough existing rows
                    const member = await client.users.fetch(rows[i].userID);
                    await CreateProfilePicture(context, rowCount, member.displayAvatarURL({ extension: 'png' }));
                    CreateTextRow(context, circumferance+spacing, rowCount, "white", `${circumferance * 0.8}px gg sans`, [`#${i+1}`, `${member.displayName.replace(/[^\x00-\x7F]/g, "")}`, `${rows[i].triviaScore}`, `${rows[i].triviaPlayed}`]);
                    rowCount++;
                }
                
                // Use the helpful Attachment class structure to process the file for you
                const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'scoreboard.png' });
                embed.setImage("attachment://scoreboard.png")

                await buttonInteraction.update({
                    embeds: [embed],
                    files: [attachment],
                    components: [navButtonRow]
                }).catch(err => console.log('Error stats embed!'));
            }
            else if(buttonInteraction.customId == 'left') {                
                index--; // increases the page number index
                if(index <= 0) navButtonRow.components[0].setDisabled(true); // Disables the left button if on the first page of embeds

                const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
                const context = canvas.getContext('2d');

                var rowCount = 0;
                var paragraphCount = 0;

                CreateTextRow(context, circumferance+spacing, rowCount, "white", `${circumferance * 0.8}px gg sans`, ["", "User", "Scored", "Played"]);
                rowCount++;
                paragraphCount++;

                // Builds the list
                for(i = index*width; i < (index+1)*width; i++) {
                    if(!rows[i]) break; // if there arent enough existing rows
                    const member = await client.users.fetch(rows[i].userID);
                    await CreateProfilePicture(context, rowCount, member.displayAvatarURL({ extension: 'png' }));
                    CreateTextRow(context, circumferance+spacing, rowCount, "white", `${circumferance * 0.8}px gg sans`, [`#${i+1}`, `${member.displayName.replace(/[^\x00-\x7F]/g, "")}`, `${rows[i].triviaScore}`, `${rows[i].triviaPlayed}`]);
                    rowCount++;
                }
                
                // Use the helpful Attachment class structure to process the file for you
                const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'scoreboard.png' });
                embed.setImage("attachment://scoreboard.png")

                await buttonInteraction.update({
                    embeds: [embed],
                    files: [attachment],
                    components: [navButtonRow]
                }).catch(err => console.log('Error stats embed!'));
            }
        });
 
        collector.on('end', () => { // Collector on end function
            replyMsg.edit({
                embeds: [embed],
                components: []
            }).catch(err => console.log('Error stats embed!'));
        });

        function CreateTextRow(context, xOffset, row, color, font, textArr) {
            var columnsWidthTracking = 0;
            for(var i = 0; i < columns.length; i++) {
                context.font = font;
                context.textAlign = columns[i].alignment;
                const alignmentOffset = (context.textAlign == "left") ? 0 : columns[i].width;

                var str = textArr[i] ?? "";
                if(context.measureText(str).width > columns[i].width) {
                    while(context.measureText(str).width > columns[i]) str = str.slice(0, -1);
                    str = str.slice(0, -2) + "...";
                }

                context.fillStyle = color;
                context.strokeStyle = "#2b2d31";
                context.lineWidth = 5;
                context.strokeText(str, xOffset + offset + columnsWidthTracking + alignmentOffset, (paragraphCount*spacing*2)+offset+(circumferance*row)+(spacing*row) + circumferance/2 + context.measureText(str).actualBoundingBoxAscent/2);
                context.fillText(str, xOffset + offset + columnsWidthTracking + alignmentOffset, (paragraphCount*spacing*2)+offset+(circumferance*row)+(spacing*row) + circumferance/2 + context.measureText(str).actualBoundingBoxAscent/2);


                columnsWidthTracking += columns[i].width + spacing;
            }
        }

        async function CreateProfilePicture(context, row, pfpUrl) {
            context.save();
            context.beginPath();
            context.arc(offset + radius, (paragraphCount*spacing*2)+offset+(circumferance*row)+(spacing*row) + radius, radius, 0, Math.PI * 2, true);
            context.clip();

            const avatar = await Canvas.loadImage(pfpUrl);

            // image, x offset, y offset, width, height
            context.drawImage(avatar, offset, (paragraphCount*spacing*2)+offset+(circumferance*row)+(spacing*row), circumferance, circumferance);

            // console.log(offset + "," + offset+(circumferance*row)+(spacing*row))

            context.restore();
        }

    }
}