const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, userMention } = require('discord.js');
const { piebotColor, FormatTime, FormatTimeLeadingZeroes } = require('../../../extra.js');
const Canvas = require('@napi-rs/canvas');

class InteractedUser { // This is for user interaction handling, so I can easily adjust how many guesses are allowed on trivia
    constructor(id, name, url, modify = 0, createdAt = Date.now()) {
        this.userID = id;
        this.userName = name;
        this.guessesLeft = 2 + modify;
        this.time = createdAt;
        this.pfpUrl = url;
        this.scoredPoints = 0;
        this.attemptsMade = 0;
    }
}

class Column {
    width;
    alignment;
    constructor(width, alignment = "left") {
        this.width = width;
        this.alignment = alignment;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dev')
        .setDescription('Shhhh'),
    async execute(interaction, client, promisePool) {
        const startTime = Date.now();

        // interaction.member?.nickname

        // await client.users.fetch("223578917372428288");
        // await interaction.guild.members.fetch("189510396569190401")

        const dap = await interaction.guild.members.fetch("159985870458322944");
        const pie = await interaction.guild.members.fetch("155149108183695360");
        const kec = await interaction.guild.members.fetch("990363988422447154");
        const mead = await interaction.guild.members.fetch("936929561302675456");
        const bot = await interaction.guild.members.fetch("194168385553170435");
        const trash = await interaction.guild.members.fetch('565574802094555156');

        var interactedUsers = [
            new InteractedUser(dap.id, dap.displayName, dap.displayAvatarURL({ extension: 'png' }), 0, FormatTime(Date.now()+5216 - startTime)), 
            new InteractedUser(pie.id, pie.displayName, pie.displayAvatarURL({ extension: 'png' }), 0, FormatTime(Date.now()+6048 - startTime)), 
            new InteractedUser(kec.id, kec.displayName, kec.displayAvatarURL({ extension: 'png' }), 0, FormatTime(Date.now()+6219 - startTime)), 
            new InteractedUser(mead.id, mead.displayName, mead.displayAvatarURL({ extension: 'png' }), 0, FormatTime(Date.now()+16845 - startTime)), 
            new InteractedUser(bot.id, bot.displayName, bot.displayAvatarURL({ extension: 'png' }), 0, FormatTime(Date.now()+48454 - startTime)), 
            new InteractedUser(trash.id, trash.displayName, trash.displayAvatarURL({ extension: 'png' }), 0, FormatTime(Date.now()+126680 - startTime))
        ];

        interactedUsers[0].attemptsMade = 2;
        interactedUsers[0].scoredPoints = 1;

        interactedUsers[1].attemptsMade = 1;
        interactedUsers[1].scoredPoints = 2;

        interactedUsers[2].attemptsMade = 1;
        interactedUsers[2].scoredPoints = 0;

        interactedUsers[3].attemptsMade = 2;
        interactedUsers[3].scoredPoints = 1;

        interactedUsers[4].attemptsMade = 1;
        interactedUsers[4].scoredPoints = 1;

        interactedUsers[5].attemptsMade = 2;
        interactedUsers[5].scoredPoints = 1;

        interactedUsers = interactedUsers.sort((a, b) => { return a.time - b.time; }); // Sorts it by time

        interactedUsers.forEach(user => { user.userName = user.userName.replace(/[^\x00-\x7F]/g, "") }); // Removes non-ascii characters

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id

        if(interaction.user != author) return await interaction.reply({ content: "You don't have permission to use this command!", ephemeral: true });

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

        Canvas.GlobalFonts.registerFromPath("src\\fonts\\gg sans Regular.ttf", "gg sans")
        Canvas.GlobalFonts.registerFromPath("src\\fonts\\gg sans SemiBold.ttf", "gg sans bold")

        const resolution = 6;
        const offset = 0*resolution;
        const spacing = 1.5*resolution;
        const circumferance = 8*resolution;
        const radius = circumferance/2;

        const columns = [
            new Column(75),
            new Column(13, "right"),
            new Column(13, "right"),
            new Column(18, "right")
        ];

        if(resolution != 0) for(var i = 0; i < columns.length; i++) columns[i].width = columns[i].width * resolution;
        var width = 0;
        columns.forEach(column => { width += column.width + spacing; });

        const firstTry = interactedUsers.filter((user) => user.attemptsMade == 1 && user.scoredPoints > 0); // They made one attempt and scored points
        const secondTry = interactedUsers.filter((user) => user.attemptsMade == 2 && user.scoredPoints > 0); // They took 2 attempts and scored points
        const didNotGet = interactedUsers.filter((user) => user.scoredPoints <= 0); // They did not score points

        const dividers = (firstTry.length > 0 ? firstTry.length-1 : 0) + (secondTry.length > 0 ? secondTry.length-1 : 0) + (didNotGet.length > 0 ? didNotGet.length-1 : 0);
        const paragraphs = 1 + (firstTry.length > 0 ? 1 : 0) + (secondTry.length > 0 ? 1 : 0) + (didNotGet.length > 0 ? 1 : 0);

        const canvasWidth = circumferance+spacing+offset*2 + width;
        const canvasHeight = (offset*2) + circumferance*(interactedUsers.length+5) + spacing*(interactedUsers.length+4) + (spacing*2*paragraphs);

        const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
		const context = canvas.getContext('2d');

        // makes a border around the image
        // context.lineWidth = 8;
        // context.strokeRect(0, 0, canvasWidth, canvasHeight);

        var rowCount = 0;
        var paragraphCount = 0;

        CreateTextRow(0, rowCount, "white", `${circumferance * 0.8}px gg sans bold`, ["Quickest Guesser"]);
        rowCount++;

        await CreateProfilePicture(rowCount, interactedUsers[0].pfpUrl);
        CreateTextRow(circumferance+spacing, rowCount, "white", `${circumferance * 0.8}px gg sans`, [interactedUsers[0].userName, interactedUsers[0].time[0] == "0m" ? "" : interactedUsers[0].time[0], interactedUsers[0].time[1], interactedUsers[0].time[2]]);
        rowCount++;
        paragraphCount++;

        if(firstTry.length > 0) {
            CreateTextRow(0, rowCount++, "white", `${circumferance * 0.8}px gg sans bold`, ["Guessed First Try"]);
            for(var i = 0; i < firstTry.length; i++) {
                await CreateProfilePicture(rowCount, firstTry[i].pfpUrl);
                CreateTextRow(circumferance+spacing, rowCount, "white", `${circumferance * 0.8}px gg sans`, [firstTry[i].userName, firstTry[i].time[0] == "0m" ? "" : firstTry[i].time[0], firstTry[i].time[1], firstTry[i].time[2]]);
                rowCount++;
            }
            paragraphCount++;
        }

        if(secondTry.length > 0) {
            CreateTextRow(0, rowCount++, "white", `${circumferance * 0.8}px gg sans bold`, ["Guessed Second Try"]);
            for(var i = 0; i < secondTry.length; i++) {
                await CreateProfilePicture(rowCount, secondTry[i].pfpUrl);
                CreateRectangleRow(circumferance+spacing, rowCount, "black");
                CreateTextRow(circumferance+spacing, rowCount, "white", `${circumferance * 0.8}px gg sans`, [secondTry[i].userName, secondTry[i].time[0] == "0m" ? "" : secondTry[i].time[0], secondTry[i].time[1], secondTry[i].time[2]]);
                rowCount++;
            }
            paragraphCount++;
        }

        if(didNotGet.length > 0) {
            CreateTextRow(0, rowCount++, "white", `${circumferance * 0.8}px gg sans bold`, ["Guessed Incorrectly"]);
            for(var i = 0; i < didNotGet.length; i++) {
                await CreateProfilePicture(rowCount, didNotGet[i].pfpUrl);
                CreateTextRow(circumferance+spacing, rowCount, "white", `${circumferance * 0.8}px gg sans`, [didNotGet[i].userName, didNotGet[i].time[0] == "0m" ? "" : didNotGet[i].time[0], didNotGet[i].time[1], didNotGet[i].time[2]]);
                rowCount++;
            }
            paragraphCount++;
        }

        // Use the helpful Attachment class structure to process the file for you
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'built-canvas.png' });

        resultsEmbed.setImage("attachment://built-canvas.png")
    
        await interaction.reply({
            embeds: [resultsEmbed],
            files: [attachment]
        });

        function CreateTextRow(xOffset, row, color, font, textArr) {
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

        function CreateRectangleRow(xOffset, row, color) {
            var columnsWidthTracking = 0;
            for(var i = 0; i < columns.length; i++) {
                context.fillStyle = color;
                context.fillRect(xOffset + offset + columnsWidthTracking, (paragraphCount*spacing*2)+offset+(circumferance*row)+(spacing*row), columns[i].width, circumferance);

                columnsWidthTracking += columns[i].width + spacing;
            }
        }

        async function CreateProfilePicture(row, pfpUrl) {
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