const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin!'),
    async execute(interaction, client) {

        // Rarity calculation
        var coin = "";
        const rarityNum = Math.floor(Math.random() * (100 - 1) + 1)
        if(rarityNum < 50)          coin = "Heads";                              // 49% chance of it being Heads
        else if(rarityNum < 99)     coin = "Tails";                              // 49% chance of it being Tails
        else if(rarityNum <= 100)   coin = "Oh my god! It landed on it's side!"; // 2% chance of it landing on the middle
        else                        coin = "Heads";                              // In case my calculations are wrong it won't break, it will just default to Heads

        // Sending the final message
        await interaction.reply({
            content: `The coin lands on... ${coin}!`
        });
    }
}