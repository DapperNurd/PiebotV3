const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, userMention, RateLimitError } = require('discord.js');
const { Table, GetRandomInt, piebotColor, FormatTime, FormatTimeLeadingZeroes } = require('../../../extra.js');
const Canvas = require('@napi-rs/canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dev')
        .setDescription('shhhh'),
    async execute(interaction, client, promisePool) {

        interaction.deferReply();

        const startTime = Date.now();

        Canvas.GlobalFonts.registerFromPath("src\\fonts\\gg sans Regular.ttf", "gg sans")
        Canvas.GlobalFonts.registerFromPath("src\\fonts\\gg sans SemiBold.ttf", "gg sans bold")

        class InteractedUser { // This is for user interaction handling, so I can easily adjust how many guesses are allowed on trivia
            constructor(member, modify = 0, createdAt = Date.now()) {
                this.member = member;
                this.userName = this.member.displayName;
                this.guessesLeft = 2 + modify;
                this.time = createdAt;
                this.scoredPoints = 0;
                this.attemptsMade = 0;
            }
        }

        var interactedUsers = [];

        for(var i = 0; i < 8; i++) {
            let [rows, fields] = await promisePool.execute(`SELECT userID, triviaScore, okCount FROM Discord.user ORDER BY RAND() LIMIT 1`);
            const member = await client.users.fetch(rows[0].userID);
            interactedUsers.push(new InteractedUser(member));

            if(i == 2) {
                interactedUsers[i].scoredPoints = 2;
                interactedUsers[i].attemptsMade = GetRandomInt(1, 2);
            }
            else {
                interactedUsers[i].scoredPoints = GetRandomInt(0, 1);
                interactedUsers[i].attemptsMade = GetRandomInt(1, 2);
            }

            interactedUsers[i].time = startTime + GetRandomInt(1000, 120000);
        }

        interactedUsers = interactedUsers.sort((a, b) => { return a.time - b.time; }); // Sorts it by time 

        interactedUsers.forEach(user => {
            user.time = FormatTime(user.time - startTime); // Formats the time
        });

        const firstTry = interactedUsers.filter((user) => user.attemptsMade == 1 && user.scoredPoints > 0); // They made one attempt and scored points
        const secondTry = interactedUsers.filter((user) => user.attemptsMade == 2 && user.scoredPoints > 0); // They took 2 attempts and scored points
        const didNotGet = interactedUsers.filter((user) => user.scoredPoints <= 0); // They did not score points

        const rowHeight = 45;

        const tableRows = [rowHeight/1.3, rowHeight/1.3]; // for the key

        if(firstTry.length > 0) {
            tableRows.push(rowHeight + 15); // Header
            for(var i = 0; i < firstTry.length; i++) tableRows.push(rowHeight); // One row for each person
        }
        if(secondTry.length > 0) {
            tableRows.push(rowHeight + 15); // Header
            for(var i = 0; i < secondTry.length; i++) tableRows.push(rowHeight); // One row for each person
        }
        if(didNotGet.length > 0) {
            tableRows.push(rowHeight + 15); // Header
            for(var i = 0; i < didNotGet.length; i++) tableRows.push(rowHeight); // One row for each person
        }

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

        // These are the paths on the pi
        const crown = "/home/pi/PiebotV3/src/pics/crown.png";
        const lightning = "/home/pi/PiebotV3/src/pics/lightning.png";

        // // These are the paths for vscode in windows
        // const crown = "/src/pics/crown.png";
        // const lightning = "/src/pics/lightning.png";

        table.SetCellImage(0, 0, crown);
        table.SetCellImage(1, 0, lightning);

        table.SetCellText(0, 1, "Top Guesser");
        table.SetCellText(1, 1, "Quickest Guesser");

        table.SetCellStyle(0, 1, 22, table.font);
        table.SetCellStyle(1, 1, 22, table.font);

        table.SetCellTextOffset(0, 1, -20, 0);
        table.SetCellTextOffset(1, 1, -20, 0);

        var currRowIndex = 2;

        if(firstTry.length > 0) {
            table.SetRowText(currRowIndex, ["Guessed First Try"]);
            table.SetRowStyle(currRowIndex, table.fontSize+2, "gg sans");
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
            table.SetRowStyle(currRowIndex, table.fontSize+2, "gg sans");
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
            table.SetRowStyle(currRowIndex, table.fontSize+2, "gg sans");
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

        await table.DrawTable(context);
        // try { await table.DrawTable(context); }
        // catch (err) { return console.log("Error drawing trivia table: " + err); }

        // Use the helpful Attachment class structure to process the file for you
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'built-canvas.png' });
    
        await interaction.editReply({
            files: [attachment]
        });
    }
}