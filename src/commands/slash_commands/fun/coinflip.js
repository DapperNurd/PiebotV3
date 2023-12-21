const { SlashCommandBuilder } = require('discord.js');
const { GetRandomInt } = require("../../../extra.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin!'),
    async execute(interaction, client, promisePool) {

        // Rarity calculation
        var coin = "";
        const rarityNum = GetRandomInt(1, 101);
        if(rarityNum <= 1) coin = "Oh my god! It landed on it's side!"; // Has a 1/101 chance
        else if (rarityNum <= 51) coin = "Heads"; // Has a 50/101 chance
        else coin = "Tails"; // Has a 50/101 chance

        // Sending the final message
        await interaction.reply({
            content: `The coin lands on... ${coin}!`
        });
    }
}