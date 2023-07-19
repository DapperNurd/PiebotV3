const { SlashCommandBuilder, userMention } = require('discord.js');
const User = require('../../schemas/user');
const Guild = require('../../schemas/guild');
const GlobalCount = require('../../schemas/globalCount');
const schemaBuildingFunctions = require('../../schemaBuilding.js');

const common = ["vanilla ice cream", "chocolate ice cream", "strawberry ice cream", "mint chocolate-chip ice cream", "orange sherbet",  "coffee ice cream", "peanut butter ice cream", "neapolitan ice cream", "cookie dough ice cream", "cookies n' cream ice cream", "chocolate-chip ice cream"
];

const uncommon = ["rocky road ice cream", "birthday cake ice cream", "tiger ice cream", "vanilla bean ice cream", "maple-nut ice cream", "chocolate peanut butter ice cream", "pistachio ice cream", "peppermint ice cream", "cotton candy ice cream", "rainbow sherbet", "pumpkin pie ice cream"
];

const rare = ["fudge brownie ice cream", "strawberry cheesecake ice cream", "salted caramel ice cream", "moose tracks ice cream", "pina colada ice cream", "rum raisin ice cream"
];

const legendary = ["pɹɐzzᴉlq uǝǝnb ʎɹᴉɐp"];

const adjectives = ["delicious", "tasty", "scrumptious", "heavenly", "delectable", "delightful", "yummy"]
const adjectivesBad = ["freezer burnt", "melted"];

const phrases = ["Here, [USER]! \_\_\_\_\_ wants you to have some [ADJ] [FOOD]!"];

module.exports = {
    common,
    uncommon,
    rare,
    legendary,
    data: new SlashCommandBuilder()
        .setName('icecream')
        .setDescription('Get a random icecream!')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('Give this user a icecream!')
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
        if(interaction.options.getUser("user")) { // ONLY RUNS if a food item is being given to another user
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
        const userCount = userProfile.iceCreamCount + 1; ///////
        const guildCount = guildProfile.iceCreamCount + 1;    // Grabs the saved variables from the database and adds one to them
        const globalCount = globalProfile.iceCreamCount + 1; ///

        await userProfile.updateOne({ iceCreamCount: userCount }); ///////
        await guildProfile.updateOne({ iceCreamCount: guildCount });    // Updates the database variables with the new ones (added one)
        await globalProfile.updateOne({ iceCreamCount: globalCount }); ///
        
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

        if((Math.floor(Math.random() * (100 - 1) + 1)) < 9) phrase = "Sorry, [USER], but I couldn't resist. I ate your [ADJ] [FOOD]."; // 8% chance to send a sorry message instead 
        if(food == "pɹɐzzᴉlq uǝǝnb ʎɹᴉɐp" && (Math.floor(Math.random() * (100 - 1) + 1)) > 50) phrase = `Oh no [USER]! I dropped your melted dairy queen blizzard!`; // 50% chance on legendary food for it to be a custom message

        phrase = phrase.replace('[USER]', userByMention); ///
        phrase = phrase.replace('[ADJ]', adj);             // Replaces placeholders in the phrase with the proper terms
        phrase = phrase.replace('[FOOD]', food); ////////////

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
        const finalMsg = `${phrase} There have been ${guildCount} pies given out on ${interaction.guild.name}.`
            
        // Sends the final message
        await interaction.reply({
            content: finalMsg
        });
    }
}