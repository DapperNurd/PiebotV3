const { SlashCommandBuilder, userMention } = require('discord.js');

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
    async execute(interaction, client) {

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
            if(isNaN(interaction.options.getString("maximum"))) return await interaction.reply({ content: "Maximum must be a number...", ephemeral: true });
            if(interaction.options.getString("minimum")) {
                if(isNaN(interaction.options.getString("minimum"))) return await interaction.reply({ content: "Minimum must be a number...", ephemeral: true });
                min = Number(interaction.options.getString("minimum"));
            }
            else min = 1;
            max = Number(interaction.options.getString("maximum"));

            if(min < 1) return await interaction.reply({ content: "Minimum must be higher than 1...", ephemeral: true }); // Errors if maximum entered is less than minimum entered
            if(max < 1) return await interaction.reply({ content: "Maximum must be higher than 1...", ephemeral: true }); // Errors if maximum entered is less than minimum entered
            if(min > max) return await interaction.reply({ content: "Maximum must be higher than minimum...", ephemeral: true }); // Errors if maximum entered is less than minimum entered
        }

        // Calculation for roll command
        const rolledNum = Math.floor(Math.random() * ((max+1) - min) + min);

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