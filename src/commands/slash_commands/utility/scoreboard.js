const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, userMention } = require('discord.js');
const { Table, piebotColor, currentTriviaSeason, currentTriviaDates, previousTriviaDates } = require('../../../extra.js');
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

        let [rows, fields] = await promisePool.execute(`SELECT * FROM ${msg} WHERE triviaPlayed != 0 ORDER BY triviaScore DESC, triviaPlayed ASC`);

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

        // Table setup
        const rowHeight = 65;
        var table = new Table([rowHeight+5, rowHeight, rowHeight, rowHeight, rowHeight, rowHeight], [70, 70, 400, 150, 150]);

        table.SetTableStyle(36, "gg sans");

        table.SetRowText(0, ["", "User", "", "Score", "Played"])
        table.SetRowAlignment(0, Table.TextAlignment.center, Table.TextAlignment.center);
        table.SetRowStyle(0, table.fontSize+5, "gg sans");

        table.SetColumnTextWrap(2, Table.TextWrap.clamp);
        table.SetColumnAlignment(1, Table.TextAlignment.center, Table.TextAlignment.center);
        table.SetColumnAlignment(3, Table.TextAlignment.center, Table.TextAlignment.center);
        table.SetColumnAlignment(4, Table.TextAlignment.center, Table.TextAlignment.center);

        table.SetColumnTextWrap(1, Table.TextWrap.scale);
        table.SetCellTextWrap(0,  1, Table.TextWrap.overflow);

        // Image building
        var canvas = Canvas.createCanvas(table.width, table.height);
        var context = canvas.getContext('2d');

        await LoadUserList(table, context, index);

        await table.DrawTable(context);
        
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

            // this was causing errors and idk why (Unknown Interaction)
            // if(buttonInteraction.user.id != interaction.user.id) return await buttonInteraction.reply({ content: 'Only the command user can change pages.', ephemeral: true });
            
            navButtonRow.components[0].setDisabled(false); // Enables left and right button before potentially disabling
            navButtonRow.components[1].setDisabled(false); // 

            if(buttonInteraction.customId == 'right') { // On cancel button
                index++; // increases the page number index
                if(index >= pageLimit) navButtonRow.components[1].setDisabled(true); // Disables the right button if on the last page of embeds

                // Image building
                canvas = Canvas.createCanvas(table.width, table.height);
                context = canvas.getContext('2d');

                await LoadUserList(table, context, index);
                
                await table.DrawTable(context);
                
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

                // Image building
                canvas = Canvas.createCanvas(table.width, table.height);
                context = canvas.getContext('2d');

                await LoadUserList(table, context, index);

                await table.DrawTable(context);
                
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

        async function LoadUserList(table, context, pageIndex) {
            // Builds the list
            for(var i = 0; i < width; i++) {
                table.ClearRow(context, i+1);
                const index = pageIndex*width+i;
                if(!rows[index]) continue; // if there arent enough existing rows

                const member = await client.users.fetch(rows[index].userID);
                table.SetCellImage(i+1, 0, member.displayAvatarURL({ extension: 'png' }));
                table.SetRowText(i+1, ["", "#" + (index+1), member.displayName, rows[index].triviaScore, rows[index].triviaPlayed]);
            }
        }
    }
}