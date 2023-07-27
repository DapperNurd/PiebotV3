const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, ComponentType } = require('discord.js');
const GlobalCount = require('../../schemas/globalCount');
const pies = require('../food/pie');
const muffins = require('../food/muffin');
const potatoes = require('../food/potato');
const pizzas = require('../food/pizza');
const fishes = require('../food/fish');
const cakes = require('../food/cake');
const chocolates = require('../food/chocolate');
const pastas = require('../food/pasta');
const sandwiches = require('../food/sandwich');
const iceCream = require('../food/icecream');
const brownies = require('../food/brownie');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('menu')
        .setDescription('Look at the menu!')
        .addStringOption(option =>
            option.setName('food')
                .setDescription('What food do you want to see the menu for?')
                .addChoices(
                    { name: 'All', value: 'all' },
                    { name: 'Pie', value: 'pie' },
                    { name: 'Muffin', value: 'muffin' },
                    { name: 'Potato', value: 'potato' },
                    { name: 'Pizza', value: 'pizza' },
                    { name: 'Fish Fillet', value: 'fish' },
                    { name: 'Cake', value: 'cake' },
                    { name: 'Chocolate', value: 'chocolate' },
                    { name: 'Pasta', value: 'pasta' },
                    { name: 'Sandwich', value: 'sandwich' },
                    { name: 'Ice Cream', value: 'iceCream' },
                    { name: 'Brownie', value: 'brownie' },
                )
        ),
    async execute(interaction, client) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        var menuCount = 0; // This is simply keeping track of how many individual menus there are, so I can accurately update the maximum selected values

        // Database handling
        let globalProfile = await GlobalCount.findOne({ globalID: "global" }); // Searches database for the globalProfile
        if(!globalProfile) { // Should hopefully never happen
            console.log(chalk.red("[Bot Status]: Error finding global database!"));
            return await interaction.reply({ // We do not build a new global profile because there is only ever one.
                content: `I don't feel so good... something's not right. Where's ${userMention(author.id)}??`,
                ephemeral: true
            });
        }

        // Embed building (this is rough lol)
        menuCount++;
        var commonString = "", uncommonString = "", rareString = "", legendaryString = "";
        for(const food of pies.common)      commonString += `${food}    `;
        for(const food of pies.uncommon)    uncommonString += `${food}    `;
        for(const food of pies.rare)        rareString += `${food}    `;
        for(const food of pies.legendary)   legendaryString += `${food}    `;
        const pieMenu = new EmbedBuilder() // Pie menu embed
            .setColor('#FF1111')
            .setAuthor({ name: `Global Pie Count: ${globalProfile.pieCount}` })
            .setTitle('Pie Menu')
            .setDescription(`Number of Pies: ${pies.common.length + pies.uncommon.length + pies.rare.length + pies.legendary.length}`)
            .addFields([
                { name: 'Common Pies (50%)',   value: commonString },
                { name: 'Uncommon Pies (40%)', value: uncommonString },
                { name: 'Rare Pies (9%)',      value: rareString },
                { name: 'Legendary Pies (1%)', value: legendaryString },
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        menuCount++;
        commonString = ""; uncommonString = ""; rareString = ""; legendaryString = "";
        for(const food of muffins.common)      commonString += `${food}    `;
        for(const food of muffins.uncommon)    uncommonString += `${food}    `;
        for(const food of muffins.rare)        rareString += `${food}    `;
        for(const food of muffins.legendary)   legendaryString += `${food}    `;
        const muffinMenu = new EmbedBuilder() // Muffin menu embed
            .setColor('#00FF00')
            .setAuthor({ name: `Global Muffin Count: ${globalProfile.muffinCount}` })
            .setTitle('Muffin Menu')
            .setDescription(`Number of Muffins: ${muffins.common.length + muffins.uncommon.length + muffins.rare.length + muffins.legendary.length}`)
            .addFields([
                { name: 'Common Muffins (50%)',   value: commonString },
                { name: 'Uncommon Muffins (40%)', value: uncommonString },
                { name: 'Rare Muffins (9%)',      value: rareString },
                { name: 'Legendary Muffins (1%)', value: legendaryString },
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        menuCount++;
        commonString = ""; uncommonString = ""; rareString = ""; legendaryString = "";
        for(const food of potatoes.common)      commonString += `${food}    `;
        for(const food of potatoes.uncommon)    uncommonString += `${food}    `;
        for(const food of potatoes.rare)        rareString += `${food}    `;
        for(const food of potatoes.legendary)   legendaryString += `${food}    `;
        const potatoMenu = new EmbedBuilder() // Potato menu embed
            .setColor('#A0522D')
            .setAuthor({ name: `Global Potato Count: ${globalProfile.potatoCount}` })
            .setTitle('Pie Menu')
            .setDescription(`Number of Potatoes: ${potatoes.common.length + potatoes.uncommon.length + potatoes.rare.length + potatoes.legendary.length}`)
            .addFields([
                { name: 'Common Potatoes (50%)',   value: commonString },
                { name: 'Uncommon Potatoes (40%)', value: uncommonString },
                { name: 'Rare Potatoes (9%)',      value: rareString },
                { name: 'Legendary Potatoes (1%)', value: legendaryString },
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        menuCount++;
        var commonString = "", uncommonString = "", rareString = "", legendaryString = "";
        for(const food of pizzas.common)      commonString += `${food}    `;
        for(const food of pizzas.uncommon)    uncommonString += `${food}    `;
        for(const food of pizzas.rare)        rareString += `${food}    `;
        for(const food of pizzas.legendary)   legendaryString += `${food}    `;
        var crustsString = "";
        for(const crust of pizzas.crusts)     crustsString += `${crust}    `;
        const pizzaMenu = new EmbedBuilder() // Pizza menu embed
            .setColor('#FFCC2B')
            .setAuthor({ name: `Global Pizza Count: ${globalProfile.pizzaCount}` })
            .setTitle('Pizza Menu')
            .setDescription(`Number of Pizzas: ${pizzas.common.length + pizzas.uncommon.length + pizzas.rare.length + pizzas.legendary.length}`)
            .addFields([
                { name: 'Common Pizzas (50%)',   value: commonString },
                { name: 'Uncommon Pizzas (40%)', value: uncommonString },
                { name: 'Rare Pizzas (9%)',      value: rareString },
                { name: 'Legendary Pizzas (1%)', value: legendaryString },
                { name: '\n', value: '\n' },
                { name: 'Special Crusts (15%)',  value: crustsString }
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        menuCount++;
        commonString = ""; uncommonString = ""; rareString = ""; legendaryString = "";
        for(const food of fishes.common)      commonString += `${food}    `;
        for(const food of fishes.uncommon)    uncommonString += `${food}    `;
        for(const food of fishes.rare)        rareString += `${food}    `;
        for(const food of fishes.legendary)   legendaryString += `${food}    `;
        const fishMenu = new EmbedBuilder() // Fish Fillet menu embed
            .setColor('#CAD8D7')
            .setAuthor({ name: `Global Fish Fillet Count: ${globalProfile.fishCount}` })
            .setTitle('Fish Fillet Menu')
            .setDescription(`Number of Fish Fillets: ${fishes.common.length + fishes.uncommon.length + fishes.rare.length + fishes.legendary.length}`)
            .addFields([
                { name: 'Common Fish Fillets (50%)',   value: commonString },
                { name: 'Uncommon Fish Fillets (40%)', value: uncommonString },
                { name: 'Rare Fish Fillets (9%)',      value: rareString },
                { name: 'Legendary Fish Fillets (1%)', value: legendaryString },
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });
    
        menuCount++;
        commonString = ""; uncommonString = ""; rareString = ""; legendaryString = "";
        for(const food of cakes.common)      commonString += `${food}    `;
        for(const food of cakes.uncommon)    uncommonString += `${food}    `;
        for(const food of cakes.rare)        rareString += `${food}    `;
        for(const food of cakes.legendary)   legendaryString += `${food}    `;
        const cakeMenu = new EmbedBuilder() // Cake menu embed
            .setColor('#F1B3F2')
            .setAuthor({ name: `Global Cake Count: ${globalProfile.cakeCount}` })
            .setTitle('Cake Menu')
            .setDescription(`Number of Cakes: ${cakes.common.length + cakes.uncommon.length + cakes.rare.length + cakes.legendary.length}`)
            .addFields([
                { name: 'Common Cakes (50%)',   value: commonString },
                { name: 'Uncommon Cakes (40%)', value: uncommonString },
                { name: 'Rare Cakes (9%)',      value: rareString },
                { name: 'Legendary Cakes (1%)', value: legendaryString },
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        menuCount++;
        var commonString = "", uncommonString = "", rareString = "", legendaryString = "";
        for(const food of chocolates.common)      commonString += `${food}    `;
        for(const food of chocolates.uncommon)    uncommonString += `${food}    `;
        for(const food of chocolates.rare)        rareString += `${food}    `;
        for(const food of chocolates.legendary)   legendaryString += `${food}    `;
        const chocolateMenu = new EmbedBuilder() // Chocolate menu embed
            .setColor('#260F00')
            .setAuthor({ name: `Global Chocolate Count: ${globalProfile.chocolateCount}` })
            .setTitle('Chocolate Menu')
            .setDescription(`Number of Chocolates: ${chocolates.common.length + chocolates.uncommon.length + chocolates.rare.length + chocolates.legendary.length}`)
            .addFields([
                { name: 'Common Chocolates (50%)',   value: commonString },
                { name: 'Uncommon Chocolates (40%)', value: uncommonString },
                { name: 'Rare Chocolates (9%)',      value: rareString },
                { name: 'Legendary Chocolates (1%)', value: legendaryString },
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        menuCount++;
        commonString = ""; uncommonString = ""; rareString = ""; legendaryString = "";
        for(const food of pastas.common)      commonString += `${food}    `;
        for(const food of pastas.uncommon)    uncommonString += `${food}    `;
        for(const food of pastas.rare)        rareString += `${food}    `;
        for(const food of pastas.legendary)   legendaryString += `${food}    `;
        const pastaMenu = new EmbedBuilder() // Pasta menu embed
            .setColor('#E6D28C')
            .setAuthor({ name: `Global Pasta Count: ${globalProfile.pastaCount}` })
            .setTitle('Pasta Menu')
            .setDescription(`Number of Pastas: ${pastas.common.length + pastas.uncommon.length + pastas.rare.length + pastas.legendary.length}`)
            .addFields([
                { name: 'Common Pastas (50%)',   value: commonString },
                { name: 'Uncommon Pastas (40%)', value: uncommonString },
                { name: 'Rare Pastas (9%)',      value: rareString },
                { name: 'Legendary Pastas (1%)', value: legendaryString },
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        menuCount++;
        commonString = ""; uncommonString = ""; rareString = ""; legendaryString = "";
        for(const food of sandwiches.common)      commonString += `${food}    `;
        for(const food of sandwiches.uncommon)    uncommonString += `${food}    `;
        for(const food of sandwiches.rare)        rareString += `${food}    `;
        for(const food of sandwiches.legendary)   legendaryString += `${food}    `;
        const sandwichMenu = new EmbedBuilder() // Sandwich menu embed
            .setColor('#D6BF4B')
            .setAuthor({ name: `Global Sandwich Count: ${globalProfile.sandwichCount}` })
            .setTitle('Sandwich Menu')
            .setDescription(`Number of Sandwiches: ${sandwiches.common.length + sandwiches.uncommon.length + sandwiches.rare.length + sandwiches.legendary.length}`)
            .addFields([
                { name: 'Common Sandwiches (50%)',   value: commonString },
                { name: 'Uncommon Sandwiches (40%)', value: uncommonString },
                { name: 'Rare Sandwiches (9%)',      value: rareString },
                { name: 'Legendary Sandwiches (1%)', value: legendaryString },
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        menuCount++;
        var commonString = "", uncommonString = "", rareString = "", legendaryString = "";
        for(const food of iceCream.common)      commonString += `${food}    `;
        for(const food of iceCream.uncommon)    uncommonString += `${food}    `;
        for(const food of iceCream.rare)        rareString += `${food}    `;
        for(const food of iceCream.legendary)   legendaryString += `${food}    `;
        const iceCreamMenu = new EmbedBuilder() // Ice Cream menu embed
            .setColor('#33BBFF')
            .setAuthor({ name: `Global Ice Cream Count: ${globalProfile.iceCreamCount}` })
            .setTitle('Ice Cream Menu')
            .setDescription(`Number of Ice Cream: ${iceCream.common.length + iceCream.uncommon.length + iceCream.rare.length + iceCream.legendary.length}`)
            .addFields([
                { name: 'Common Ice Cream (50%)',   value: commonString },
                { name: 'Uncommon Ice Cream (40%)', value: uncommonString },
                { name: 'Rare Ice Cream (9%)',      value: rareString },
                { name: 'Legendary Ice Cream (1%)', value: legendaryString },
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        menuCount++;
        commonString = ""; uncommonString = ""; rareString = ""; legendaryString = "";
        for(const food of brownies.common)      commonString += `${food}    `;
        for(const food of brownies.uncommon)    uncommonString += `${food}    `;
        for(const food of brownies.rare)        rareString += `${food}    `;
        for(const food of brownies.legendary)   legendaryString += `${food}    `;
        const brownieMenu = new EmbedBuilder() // Brownie menu embed
            .setColor('#5C280E')
            .setAuthor({ name: `Global Brownie Count: ${globalProfile.brownieCount}` })
            .setTitle('Brownie Menu')
            .setDescription(`Number of Brownies: ${brownies.common.length + brownies.uncommon.length + brownies.rare.length + brownies.legendary.length}`)
            .addFields([
                { name: 'Common Brownies (50%)',   value: commonString },
                { name: 'Uncommon Brownies (40%)', value: uncommonString },
                { name: 'Rare Brownies (9%)',      value: rareString },
                { name: 'Legendary Brownies (1%)', value: legendaryString },
            ])
            .setTimestamp()
            .setFooter({
                iconURL: author.displayAvatarURL(),
                text: `PiebotV3 by ${author.username}`
            });

        // Drop down handling (no parameters entered)
        if(!interaction.options.getString("food")) {
            const select = new StringSelectMenuBuilder()
                .setCustomId('menuDropdown')
                .setPlaceholder('...')
                .setMinValues(1)
                .setMaxValues(menuCount)
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Pie')
                        .setEmoji('🥧')
                        .setValue('pie'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Muffin')
                        .setEmoji('🧁')
                        .setValue('muffin'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Potato')
                        .setEmoji('🥔')
                        .setValue('potato'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Pizza')
                        .setEmoji('🍕')
                        .setValue('pizza'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Fish')
                        .setEmoji('🐟')
                        .setValue('fish'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Cake')
                        .setEmoji('🎂')
                        .setValue('cake'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Chocolate')
                        .setEmoji('🍫')
                        .setValue('chocolate'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Pasta')
                        .setEmoji('🍝')
                        .setValue('pasta'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Sandwich')
                        .setEmoji('🥪')
                        .setValue('sandwich'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Ice Cream')
                        .setEmoji('🍦')
                        .setValue('iceCream'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Brownie')
                        .setEmoji('🧱')
                        .setValue('brownie')
                );

                const row = new ActionRowBuilder().addComponents(select);

                const response = await interaction.reply({
                    content: 'What would you like?',
                    components: [row],
                    ephemeral: true
                });

                const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 120_000 }); // Collector for the dropdown, 2 minutes

                collector.on('collect', async i => {
                    const statusMsg = await i.reply({ content: "Sending menus...", ephemeral: true }); // This is necessary so I can followUp for the rest of them... temporary
                    for(const selection of i.values) {
                        switch (selection) {
                            case 'pie':
                                await i.followUp({ embeds: [pieMenu], ephemeral: true });
                                break;
                            case 'muffin':
                                await i.followUp({ embeds: [muffinMenu], ephemeral: true });
                                break;
                            case 'potato':
                                await i.followUp({ embeds: [potatoMenu], ephemeral: true });
                                break;
                            case 'pizza':
                                await i.followUp({ embeds: [pizzaMenu], ephemeral: true });
                                break;
                            case 'fish':
                                await i.followUp({ embeds: [fishMenu], ephemeral: true });
                                break;
                            case 'cake':
                                await i.followUp({ embeds: [cakeMenu], ephemeral: true });
                                break;
                            case 'chocolate':
                                await i.followUp({ embeds: [chocolateMenu], ephemeral: true });
                                break;
                            case 'pasta':
                                await i.followUp({ embeds: [pastaMenu], ephemeral: true });
                                break;
                            case 'sandwich':
                                await i.followUp({ embeds: [sandwichMenu], ephemeral: true });
                                break;
                            case 'iceCream':
                                await i.followUp({ embeds: [iceCreamMenu], ephemeral: true });
                                break;
                            case 'brownie':
                                await i.followUp({ embeds: [brownieMenu], ephemeral: true });
                                break;
                            default:
                                await i.followUp({ content: `Could not find the ${selection} menu...`, ephemeral: true });
                                break;
                        }
                    }
                    statusMsg.delete(); // Deletes the temporary message
                });
        }
        // Parameters entered, sending embeds by input
        else {
            const selection = interaction.options.getString("food");
            switch (selection) {
                case 'pie':
                    await interaction.reply({ embeds: [pieMenu], ephemeral: true });
                    break;
                case 'muffin':
                    await interaction.reply({ embeds: [muffinMenu], ephemeral: true });
                    break;
                case 'potato':
                    await interaction.reply({ embeds: [potatoMenu], ephemeral: true });
                    break;
                case 'pizza':
                    await interaction.reply({ embeds: [pizzaMenu], ephemeral: true });
                    break;
                case 'fish':
                    await interaction.reply({ embeds: [fishMenu], ephemeral: true });
                    break;
                case 'cake':
                    await interaction.reply({ embeds: [cakeMenu], ephemeral: true });
                    break;
                case 'chocolate':
                    await interaction.reply({ embeds: [chocolateMenu], ephemeral: true });
                    break;
                case 'pasta':
                    await interaction.reply({ embeds: [pastaMenu], ephemeral: true });
                    break;
                case 'sandwich':
                    await interaction.reply({ embeds: [sandwichMenu], ephemeral: true });
                    break;
                case 'iceCream':
                    await interaction.reply({ embeds: [iceCreamMenu], ephemeral: true });
                    break;
                case 'brownie':
                    await interaction.reply({ embeds: [brownieMenu], ephemeral: true });
                    break;
                case 'all':
                    await interaction.reply({ embeds: [pieMenu], ephemeral: true });
                    await interaction.followUp({ embeds: [muffinMenu], ephemeral: true });
                    await interaction.followUp({ embeds: [potatoMenu], ephemeral: true });
                    await interaction.followUp({ embeds: [pizzaMenu], ephemeral: true });
                    await interaction.followUp({ embeds: [fishMenu], ephemeral: true });
                    await interaction.followUp({ embeds: [cakeMenu], ephemeral: true });
                    await interaction.followUp({ embeds: [chocolateMenu], ephemeral: true });
                    await interaction.followUp({ embeds: [pastaMenu], ephemeral: true });
                    await interaction.followUp({ embeds: [sandwichMenu], ephemeral: true });
                    await interaction.followUp({ embeds: [iceCreamMenu], ephemeral: true });
                    await interaction.followUp({ embeds: [brownieMenu], ephemeral: true });
                    break;
                default:
                    await interaction.reply({ content: `Could not find the ${selection} menu...`, ephemeral: true });
                    break;
            }
        }
    }
}