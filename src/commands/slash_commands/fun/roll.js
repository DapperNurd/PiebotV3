const { SlashCommandBuilder, userMention } = require('discord.js');
const { GetRandomInt } = require("../../../extra.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a die!')
        .addSubcommand(command => command
            .setName('die')
            .setDescription('Roll a custom die!')
            .addStringOption(option =>
                option.setName('maximum')
                      .setDescription('The highest possible number to roll.')
                      .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('minimum')
                      .setDescription('The lowest possible number to roll. Default is 1.')
            ),
        )
        .addSubcommand(command => command
            .setName('next')
            .setDescription('Roll directly from the previously rolled number!')
        ),
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const user = userMention(interaction.user.id); // Converts user id into a mention for the string

        // Max and min variable declaration
        var max, min;

        // Roll input handling (whether "next" is entered, or a number, or otherwise to error)
        if(interaction.options.getSubcommand() == "next") {
            const messages = await interaction.channel.messages.fetch({ limit: 50 }); // gets a collection of messages from the channel, with length of limit

            messages.sweep(msg => !msg.interaction); // Removes content that meets the condition from the collection, so in our case removes all non slash commands

            const lastRollMsg = messages.find(msg => msg.interaction.commandName == 'roll die' || msg.interaction.commandName == "roll next"); // Finds the most recent roll command usage

            if(!lastRollMsg) return await interaction.reply({ content: "No previous roll found :(", ephemeral: true }); // Checks if there was a roll command used in the last X messages (limit above for count)

            const msg = lastRollMsg.content.split(" "); // Splits string into array of strings separated by a space

            max = Number(msg[3]); // Gets the third word in the string (which is the number previously rolled) and converts it to a Number
            min = 1;
        }
        else { // roll die
            if(isNaN(interaction.options.getString("maximum"))) return await interaction.reply({ content: "Maximum must be a number...", ephemeral: true }); // Checks if the max is NaN
            if(interaction.options.getString("minimum")) { // Checks if minimum input exists
                if(isNaN(interaction.options.getString("minimum"))) return await interaction.reply({ content: "Minimum must be a number...", ephemeral: true }); // Checks if the min is NaN
                min = Number(interaction.options.getString("minimum")); // If it IS a number, sets it to the input
            }
            else min = 1; // If minimum input does not exist, sets it to one
            max = Number(interaction.options.getString("maximum")); // Sets max to the max input

            if(min < 1) return await interaction.reply({ content: "Minimum must be higher than 1...", ephemeral: true }); // Errors if maximum entered is less than minimum entered
            if(max < 1) return await interaction.reply({ content: "Maximum must be higher than 1...", ephemeral: true }); // Errors if maximum entered is less than minimum entered
            if(min > max) return await interaction.reply({ content: "Maximum must be higher than minimum...", ephemeral: true }); // Errors if maximum entered is less than minimum entered
        }

        // Calculation for roll command
        const rolledNum = GetRandomInt(min, max);

        // Building final message
        const msg = (min == 1) // Changes message based on whether there is a minimum or not (to clarify for death rolls)
            ? `${user} rolled a ${rolledNum} out of ${max}!` 
            : `${user} rolled a ${rolledNum} out of ${max} (and a minimum of ${min})!` // Formatted like this because it is a long line

        // Sending final message
        await interaction.reply({
            content: msg
        });
    }
}