const { SlashCommandBuilder, userMention } = require('discord.js');
const User = require('../../../schemas/user');
const Guild = require('../../../schemas/guild');
const GlobalCount = require('../../../schemas/globalCount');
const { GenerateNewUser, GenerateNewGuild } = require('../../../schemaBuilding.js');
const { GiveAndReceive } = require('../../../extraFunctions.js');

const common = ["milk chocolate", "white chocolate", "dark chocolate", "hazelnut milk chocolate", "dark mint chocolate", "mint chocolate", "almond chocolate", "fruits & nuts chocolate"
];

const uncommon = ["white chocolate with raspberry", "salted caramel chocolate", "cookies n' cream chocolate", "orange chocolate", "chocolate peanut cluster", "chocolate-covered pretzels"
];

const rare = ["galaxy chocolate", "Aero milk chocolate", "M&Ms", "Butterfinger", "Twix", "Kit Kat", "Cherry Blossom Kit Kat", "Matcha Kit Kat", "Reese’s Peanut Butter Cup", "Almond Joy", "Flake"
];

const legendary = ["pop rocks and.. gummy?.. chocolate"];

const adjectives = ["delicious", "tasty", "scrumptious", "heavenly", "delectable", "delightful", "yummy"]
const adjectivesBad = ["expired", "melted"];

const phrases = [ "Here, [USER]! GoTHFuLGirL wants you to have [PLURAL] [ADJ] [FOOD]!",
"[USER] quietly approaches as Goth sits menacingly infront of a pile of chocolates. She doesn't notice as you pick up [PLURAL] [ADJ] [FOOD] and sneak away.",
"Sorry, [USER], but I couldn't resist. I ate your [ADJ] [FOOD].",
"[USER] got [PLURAL] [ADJ] [FOOD] from Goth- after she had already licked it...",
"Goth eats her [ADJ] [FOOD] right in front of [USER]. Sorry, she doesn't share.",
"Goth didn't want to give up her [FOOD]. By the time she gave it to [USER], it had melted.",
 ];

const singularItems = [ "Aero milk chocolate", "Butterfinger", "Twix", "Kit Kat", "Cherry Blossom Kit Kat", "Matcha Kit Kat", "Reese’s Peanut Butter Cup", "Almond Joy", "Flake" ];

module.exports = {
    common,
    uncommon,
    rare,
    legendary,
    data: new SlashCommandBuilder()
        .setName('chocolate')
        .setDescription('Get a random chocolate!')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('Give this user some chocolate!')
        ),
    async execute(interaction, client, con) {

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
        const userCount = userProfile.chocolateCount + 1; ///////
        const guildCount = guildProfile.chocolateCount + 1;    // Grabs the saved variables from the database and adds one to them
        const globalCount = globalProfile.chocolateCount + 1; ///

        await userProfile.updateOne({ chocolateCount: userCount }); ///////
        await guildProfile.updateOne({ chocolateCount: guildCount });    // Updates the database variables with the new ones (added one)
        await globalProfile.updateOne({ chocolateCount: globalCount }); ///
        
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

        phrase = phrase.replace('[USER]', userByMention); ///
        phrase = phrase.replace('[ADJ]', adj);             // Replaces placeholders in the phrase with the proper terms
        phrase = phrase.replace('[FOOD]', food); ////////////
        phrase = phrase.replace('[PLURAL]', singularItems.includes(food) ? "[A]" : "some");

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
        const finalMsg = `${phrase} There have been ${guildCount} chocolates given out on ${interaction.guild.name}.`
            
        // Sends the final message
        await interaction.reply({
            content: finalMsg
        });
    }
}