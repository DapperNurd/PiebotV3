const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const pies = require('../food/pie');
const muffins = require('../food/muffin');
const potatoes = require('../food/potato');
const iceCream = require('../food/icecream')
const pizzas = require('../food/pizza');
const fishes = require('../food/fish');
const pastas = require('../food/pasta');
const cakes = require('../food/cake');
const cookies = require('../food/cookie');
const sandwiches = require('../food/sandwich');
const brownies = require('../food/brownie');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('menu')
        .setDescription('Look at the menu!')
        .addStringOption(option =>
            option.setName('food')
                  .setDescription('What food do you want to see the menu for?')
        ),
    async execute(interaction, client) {

        if(!interaction.options.getString("maximum")) {
            const select = new StringSelectMenuBuilder()
                .setCustomId('menuDropdown')
                .setPlaceholder('Make a selection!')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Pie')
                        //.setDescription('List all the pie flavors available.')
                        .setEmoji('🥧')
                        .setValue('pie'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Muffin')
                        //.setDescription('List all the muffin flavors available.')
                        .setValue('muffin'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Potato')
                        .setDescription('List all the potato types available.')
                        .setEmoji('🥔')
                        .setValue('potato')
                );

                const row = new ActionRowBuilder()
                    .addComponents(select);

                await interaction.reply({
                    content: 'Choose your food!',
                    components: [row],
                });
        }

        // Sending the final message
        await interaction.reply({
            content: `and i oop`
        });
    }
}