const { SlashCommandBuilder, userMention } = require('discord.js');
const { execute } = require('../../events/client/ready');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a dice!')
        .addStringOption(option =>
            option.setName('maximum')
                  .setDescription('The highest possible number to roll (Enter "next" to use the previously rolled number).')
                  .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('minimum')
                  .setDescription('The lowest possible number to roll. Default is 1.')
                  .setMinValue(1)
        ),
    async execute(interaction, client) {
        const min = interaction.options.getInteger("minimum") ?? 1; // The same as min = interaction.options.getInteger("minimum") ? interaction.options.getInteger("minimum") : 1
        var max = Number(interaction.options.getString("maximum"));

        // So basically this command could have been a lot cleaner if I had just used an integer instead of a string for max,
        // but there were a few reasons I did it with string:
        // - Allows me to be able to have "next" as an option for it without it being super janky with parameter fields
        // - Allows me to have a maximum greater than like 100000000 or whatever it was, with it going all the way to Infinity now like before

        if(isNaN(max)) {
            if(interaction.options.getString("maximum").toLowerCase() == 'next') {
                const messages = await interaction.channel.messages.fetch({ limit: 50 }); // gets a collection of messages from the channel, with length of limit

                messages.sweep(msg => !msg.interaction); // Removes content that meets the condition from the collection, so in our case removes all non slash commands

                const lastRollMsg = messages.find(msg => msg.interaction.commandName === 'roll'); // finds the most recent roll command usage

                if(!lastRollMsg) { // Checks if there was a roll command used in the last X messages (limit above for count)
                    return await interaction.reply({
                        content: "No previous roll found :(",
                        ephemeral: true
                    });
                }

                const msg = lastRollMsg.content.split(" "); // Splits string into array of strings separated by a space
                max = Number(msg[msg.length - 4]); // Gets the fourth to last word in the string (well, 4th to last element in the array, now)
            }
            else { // Maximum entered is not a number, and is not a specific case (such as "next")
                return await interaction.reply({
                    content: "Maximum not recognized...",
                    ephemeral: true
                });
            }
        }
        else {
            if(max < 1) { // Errors if maximum entered is less than one
                return await interaction.reply({
                    content: "Maximum should be equal to or greater than 1.",
                    ephemeral: true
                });
            }
            else if(min > max) { // Errors if maximum entered is less than minimum entered
                return await interaction.reply({
                    content: "Maximum should be higher than min...",
                    ephemeral: true
                });
            }
        }

        const rolledNum = Math.floor(Math.random() * ((max+1) - min) + min); // Calculation for roll command

        const user = userMention(interaction.user.id); // Converts user id into a mention for the string

        // Changes message based on whether there is a minimum or not (to clarify for death rolls)
        var msg = (min == 1) ? `${user} rolled a ${rolledNum} out of ${max}!` : `${user} rolled a ${rolledNum} (${min} to ${max})!`

        await interaction.reply({
            content: msg
        });
    }
}