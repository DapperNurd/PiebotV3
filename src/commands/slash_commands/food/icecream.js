const { SlashCommandBuilder, userMention } = require('discord.js');
const User = require('../../../schemas/user');
const Guild = require('../../../schemas/guild');
const GlobalCount = require('../../../schemas/globalCount');
const { GenerateNewUser, GenerateNewGuild } = require('../../../schemaBuilding.js');
const { GiveAndReceive } = require('../../../extraFunctions.js');

const common = ["vanilla ice cream", "chocolate ice cream", "strawberry ice cream", "mint chocolate-chip ice cream", "orange sherbet",  "coffee ice cream", "peanut butter ice cream", "neapolitan ice cream", "cookie dough ice cream", "cookies n' cream ice cream", "chocolate-chip ice cream"
];

const uncommon = ["rocky road ice cream", "birthday cake ice cream", "tiger ice cream", "vanilla bean ice cream", "maple-nut ice cream", "chocolate peanut butter ice cream", "pistachio ice cream", "peppermint ice cream", "cotton candy ice cream", "rainbow sherbet", "pumpkin pie ice cream"
];

const rare = ["fudge brownie ice cream", "strawberry cheesecake ice cream", "salted caramel ice cream", "moose tracks ice cream", "pina colada ice cream", "rum raisin ice cream"
];

const legendary = ["pɹɐzzᴉlq uǝǝnb ʎɹᴉɐp"];

const adjectives = ["delicious", "tasty", "scrumptious", "heavenly", "delectable", "delightful", "yummy"]
const adjectivesBad = ["freezer burnt", "melted"];

const phrases = [ "Here, [USER]! Violet wants you to have [PLURAL] [ADJ] [FOOD]!",
"It's hot outside! Violet got [USER] [PLURAL] [ADJ] [FOOD] to cool down. Better eat it quick before it melts!",
"[USER] won the gelato-ry! Violet blesses them with [ADJ] [FOOD]! What lucky day!",
"[USER][S] [ADJ] [FOOD] was stolen. We don't Cone-done that kind of behavior!",
"You scream, [USER] screams, we all scream for Violet's [ADJ] [FOOD]!",
"Wow, [USER] just got a heap of Violet's [ADJ] [FOOD]! Cone-gratulations!",
"Sorry, [USER], but I couldn't resist. I ate your [ADJ] [FOOD]." ];

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
                  .setDescription('Give this user some icecream!')
        ),
    async execute(interaction, client) {

        // Database handling
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // This is a little confusing so I'm going to explain it out: if the command is run without a user added, so like just /food, then targetedUser (and therefore userProfile)
                                                                                      // belongs to the user of the command. If there IS a user added, so like /food @user, then targetedUser (and again, userProfile too) belong to the user mentioned.
        let userProfile = await User.findOne({ userID: targetedUser.id }); // Searches database for a userProfile with a matching userID to id
        if(!userProfile) userProfile = await GenerateNewUser(targetedUser.id, targetedUser.username); // If no userProfile is found, generate a new one

        let guildProfile = await Guild.findOne({ guildID: interaction.guild.id }); // Searches database for a guildProfile with a matching userID to id
        if(!guildProfile) guildProfile = await GenerateNewGuild(interaction.guild.id, interaction.guild.name); // If no guildProfile is found, generate a new one

        let globalProfile = await GlobalCount.findOne({ globalID: "global" }); // Searches database for the globalProfile
        if(!globalProfile) { // Should hopefully never happen... We do not build a new global profile because there is only ever one. Instead we error and intentionally stop.
            await interaction.reply({ content: `I don't feel so good... something's not right. Where's ${userMention(author.id)}??`, ephemeral: true });
            return console.error(chalk.red("[Bot Status]: Error finding global database!"));
        }

        // Username updating within the database (to new system)
        if(userProfile.userName != interaction.user.username) await userProfile.updateOne({ userName: interaction.user.username }); // Checks if the username within the database is not the current username of the user

        // Given / Receiving Handling... only if a food item is being given to a differnet user
        if(interaction.options.getUser("user") && interaction.options.getUser("user") != interaction.user) await GiveAndReceive(interaction.user, userProfile, guildProfile, globalProfile);

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

        if(food == "pɹɐzzᴉlq uǝǝnb ʎɹᴉɐp" && (Math.floor(Math.random() * (100 - 1) + 1)) > 50) phrase = `Oh no [USER]! I dropped your melted dairy queen blizzard!`; // 50% chance on legendary food for it to be a custom message

        phrase = phrase.replace('[USER]', userByMention); ///
        phrase = phrase.replace('[ADJ]', adj);             // Replaces placeholders in the phrase with the proper terms
        phrase = phrase.replace('[FOOD]', food); ////////////
        phrase = phrase.replace('[PLURAL]', food == "pɹɐzzᴉlq uǝǝnb ʎɹᴉɐp" ? "[A]" : "some");

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
        const finalMsg = `${phrase} There have been ${guildCount} ice cream sundaes given out on ${interaction.guild.name}.`
            
        // Sends the final message
        await interaction.reply({
            content: finalMsg
        });
    }
}