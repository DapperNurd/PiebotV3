const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, userMention, RateLimitError } = require('discord.js');
const { Table, piebotColor, FormatTime, FormatTimeLeadingZeroes } = require('../../../extra.js');
const Canvas = require('@napi-rs/canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dev')
        .setDescription('Shhhh'),
    async execute(interaction, client, promisePool) {

        Canvas.GlobalFonts.registerFromPath("src\\fonts\\gg sans Regular.ttf", "gg sans")
        Canvas.GlobalFonts.registerFromPath("src\\fonts\\gg sans SemiBold.ttf", "gg sans bold")

        const rowHeight = 40;

        const columns = [45, 35, 400, 100, 100];
        const rows = [40, rowHeight, rowHeight, rowHeight, rowHeight, rowHeight];

        var table = new Table(rows, columns);

        table.SetTableStyle(24, "gg sans");

        table.SetRowText(0, ["User", "", "", "Wins", "Played"])
        table.SetRowAlignment(0, Table.TextAlignment.center, Table.TextAlignment.center);
        table.SetRowStyle(0, 24, "gg sans bold");

        table.SetColumnAlignment(3, Table.TextAlignment.right, Table.TextAlignment.right);
        table.SetColumnAlignment(4, Table.TextAlignment.right, Table.TextAlignment.right);

        table.SetColumnTextWrap(1, Table.TextWrap.scale);

        for(var i = 1; i < rows.length; i++) {
            let [rows, fields] = await promisePool.execute(`SELECT userID, triviaScore, okCount FROM Discord.user ORDER BY RAND() LIMIT 1`);

            const member = await client.users.fetch(rows[0].userID);

            table.SetCellImage(i, 0, member.displayAvatarURL({ extension: 'png' }), Table.ImageSize.fit, true);
            table.SetRowText(i, ["", "#" + i, member.displayName, "3m", "22s"]);
        }

        const canvas = Canvas.createCanvas(table.width, table.height);
		const context = canvas.getContext('2d');

        await table.DrawTable(context);

        // Use the helpful Attachment class structure to process the file for you
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'built-canvas.png' });
    
        await interaction.reply({
            files: [attachment]
        });
    }
}