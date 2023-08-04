const { SlashCommandBuilder, userMention } = require('discord.js');
const User = require('../../../schemas/user');
const Guild = require('../../../schemas/guild');
const GlobalCount = require('../../../schemas/globalCount');
const schemaBuildingFunctions = require('../../../schemaBuilding.js');

const common = ["cheese pizza", "pepperoni pizza", "sausage pizza", "all-meat pizza", "hawaiian pizza", "margherita pizza", "veggie pizza"
];

const uncommon = ["chicago-style deep dish pizza", "breakfast pizza", "buffalo chicken pizza", "feta cheese and salami pizza", "pineapple pepperoni pizza", "BBQ chicken pizza"
];

const rare = ["chicken alfredo pizza", "loaded baked-potato pizza", "chocolate chip cookie pizza",  "verde chicken enchilada pizza", "taco quesadilla pizza"
];

const legendary = ["boneless pizza", "hotpocket™️"];

const crusts = ["deep dish", "thin crust", "stuffed crust"];

const adjectives = ["delicious", "tasty", "scrumptious", "heavenly", "delectable", "delightful", "yummy", "homemade"]
const adjectivesBad = ["day-old", "overcooked", "undercooked", "frozen"];

const phrases = ["Here, [USER]! ItalianStallion wants you to have a slice of her [ADJ] [CRUST][FOOD]!",
"[USER], you enter ItalianStallions pizzaria and order up a slice of [ADJ] [CRUST][FOOD]. Yum!",
"ItalianStallion has chosen only the finest ingredients for her [ADJ] [CRUST][FOOD]. She looks around the room and choses [USER] to have the first slice!",
"[USER], donning your pizza thief costume, you sneak into ItalianStallions kitchen and make off with her [ADJ] [CRUST][FOOD]. You're a menace!",
"The smell of ItalianStallion's [ADJ] [CRUST][FOOD] fills your nose, [USER]. She offers you a slice!",
"[USER] is feeling tired and ordered [A] [ADJ] [CRUST] [FOOD] from Domino's. Now ItalianStallion won't even talk to them.",
"Sorry, [USER], but I couldn't resist. I ate your [ADJ] [FOOD]." ];

module.exports = {
    common,
    uncommon,
    rare,
    legendary,
    crusts,
    data: new SlashCommandBuilder()
        .setName('pizza')
        .setDescription('Get a random pizza!')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('Give this user some pizza!')
        ),
    async execute(interaction, client) {

        // Database handling
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // This is a little confusing so I'm going to explain it out: if the command is run without a user added, so like just /food, then targetedUser (and therefore userProfile)
                                                                                      // belongs to the user of the command. If there IS a user added, so like /food @user, then targetedUser (and again, userProfile too) belong to the user mentioned.
        let userProfile = await User.findOne({ userID: targetedUser.id }); // Searches database for a userProfile with a matching userID to id
        if(!userProfile) userProfile = await schemaBuildingFunctions.generateNewUser(targetedUser.id, targetedUser.username); // If no userProfile is found, generate a new one

        let guildProfile = await Guild.findOne({ guildID: interaction.guild.id }); // Searches database for a guildProfile with a matching userID to id
        if(!guildProfile) guildProfile = await schemaBuildingFunctions.generateNewGuild(interaction.guild.id, interaction.guild.name); // If no guildProfile is found, generate a new one

        let globalProfile = await GlobalCount.findOne({ globalID: "global" }); // Searches database for the globalProfile
        if(!globalProfile) { // Should hopefully never happen
            console.log(chalk.red("[Bot Status]: Error finding global database!"));
            return await interaction.reply({ // We do not build a new global profile because there is only ever one.
                content: `I don't feel so good... something's not right. Where's ${userMention(author.id)}??`,
                ephemeral: true
            });
        }

        // Given / Receiving Handling
        if(interaction.options.getUser("user") && interaction.options.getUser("user") != interaction.user) { // ONLY RUNS if a food item is being given to another user
            let giverProfile = await User.findOne({ userID: interaction.user.id }); // Searches database for a userProfile with a matching userID to id
            if(!giverProfile) giverProfile = await schemaBuildingFunctions.generateNewUser(interaction.user.id, interaction.user.username); // If no userProfile is found, generate a new one

            // User adjustments
            const giverCount = giverProfile.foodGiven + 1; // Gets foodGiven count from the giver (command user) and adds one
            const receiverCount = userProfile.foodReceived + 1; // Gets foodReceived count from the receiver (person mentioned) and adds one

            await giverProfile.updateOne({ foodGiven: giverCount }); // Updates the givers (command user) foodGiven count
            await userProfile.updateOne({ foodReceived: receiverCount }); // Updates the receivers (person mentioned) foodReceived count

            // Server and Global adjustments
            const serverGiven = guildProfile.foodGiven + 1; // Gets foodGiven count from the server and adds one
            const serverReceived = guildProfile.foodReceived + 1; // Gets foodReceived count from the server and adds one
            const globalGiven = globalProfile.foodGiven + 1; // Gets global foodGiven count and adds one
            const globalReceived = globalProfile.foodReceived + 1; // Gets global foodReceived count and adds one

            await guildProfile.updateOne({ foodGiven: serverGiven }); // Updates the givers (command user) foodGiven count
            await guildProfile.updateOne({ foodReceived: serverReceived }); // Updates the receivers (person mentioned) foodReceived count
            await globalProfile.updateOne({ foodGiven: globalGiven }); // Updates the givers (command user) foodGiven count
            await globalProfile.updateOne({ foodReceived: globalReceived }); // Updates the receivers (person mentioned) foodReceived count
        }

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        const userByMention = userMention(targetedUser.id); // Turns a user object id into a discord mention

        // Food Counts fetching, updating, and saving
        const userCount = userProfile.pizzaCount + 1; ///////
        const guildCount = guildProfile.pizzaCount + 1;    // Grabs the saved variables from the database and adds one to them
        const globalCount = globalProfile.pizzaCount + 1; ///

        await userProfile.updateOne({ pizzaCount: userCount }); ///////
        await guildProfile.updateOne({ pizzaCount: guildCount });    // Updates the database variables with the new ones (added one)
        await globalProfile.updateOne({ pizzaCount: globalCount }); ///
        
        // Food Rarity calculation and assigning
        var food;
        const rarityNum = Math.floor(Math.random() * (100 - 1) + 1) // Random from 1 to 100
        if (rarityNum < 51)        food = common[Math.floor(Math.random() * common.length)];       // 50% (1 to 50 )
        else if (rarityNum < 91)   food = uncommon[Math.floor(Math.random() * uncommon.length)];   // 40% ( 51 to 90 )
        else if (rarityNum < 100)  food = rare[Math.floor(Math.random() * rare.length)];           // 9% ( 91 to 99 )
        else if (rarityNum >= 100) food = legendary[Math.floor(Math.random() * legendary.length)]; // 1% ( 100 )
        else                       food = common[Math.floor(Math.random() * common.length)];       // Should never run but just in case 

        // Adjective calculation and assigning
        const adj = (Math.floor(Math.random() * (100 - 1) + 1)) > 10
            ? adjectives[Math.floor(Math.random() * adjectives.length)]
            : adjectivesBad[Math.floor(Math.random() * adjectivesBad.length)]; // Formatting this way just because it's a long line
        
        // Phrase formatting
        var phrase = phrases[Math.floor(Math.random() * phrases.length)];

        const crust = ( (food != "chicago-style deep dish pizza" && food != "breakfast pizza" && food != "chocolate chip cookie pizza" && food != "hotpocket™️")   &&   Math.floor(Math.random() * (100 - 1) + 1) < 15 )
            ? crustType = crusts[Math.floor(Math.random() * crusts.length)] + " "
            : ""; // Crust handling... I know it is super ugly...

        phrase = phrase.replace('[USER]', userByMention); ///
        phrase = phrase.replace('[ADJ]', adj);             // Replaces placeholders in the phrase with the proper terms
        phrase = phrase.replace('[FOOD]', food);           //
        phrase = phrase.replace('[CRUST]', crust); //////////

        if(phrase.includes('[A]')) { // Proper grammar for adjective handling (whether to use "a" or "an" before the adjective)
            const a = (adj.startsWith("a") || adj.startsWith("e") || adj.startsWith("i") || adj.startsWith("o") || adj.startsWith("u")) ? "an" : "a"; // Checking if adj starts with a vowel
            phrase = phrase.replace('[A]', a); // Replaces placeholder in the phrase with the proper term
            phrase = phrase.charAt(0).toUpperCase() + phrase.slice(1); // Captializes the first character in a string, in case [AN] is the first word
        }
        
        if(phrase.includes('[S]')) { // Proper grammar for possessive handling (whether or not to use " 's " or just " ' ")
            const possessive = (targetedUser.username.toString().toLowerCase().endsWith('s')) ? "'" : "'s" // Checking if targetedUser's username ends in an "s"
            phrase = phrase.replace('[S]', possessive); // Replaces placeholder in the phrase with the proper term
        }

        // Final message building
        const finalMsg = `${phrase} There have been ${guildCount} pizzas given out on ${interaction.guild.name}.`
            
        // Sends the final message
        await interaction.reply({
            content: finalMsg
        });
    }
}