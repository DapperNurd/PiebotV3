const { SlashCommandBuilder, userMention } = require('discord.js');
const { PercentTrue, CalculateFoodRarity, StartsWithVowel } = require('../../../extra.js');

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
        .setDescription('Get some random ice cream!')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('Give this user some ice cream!')
        ),
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // This is a little confusing so I'm going to explain it out: if the command is run without a user added, so like just /food, then targetedUser (and therefore userProfile)
        const userByMention = userMention(targetedUser.id); // Turns a user object id into a discord mention

        // Database handling
        const columnName = 'iceCreamCount'; // Change this to change what value is read/written
        promisePool.execute(`INSERT INTO Discord.user (userID,userName,${columnName}) VALUES ('${interaction.user.id}','${interaction.user.username}',1) ON DUPLICATE KEY UPDATE ${columnName}=${columnName}+1;`);
        await promisePool.execute(`INSERT INTO Discord.guild (guildID,guildName,${columnName}) VALUES ('${interaction.guild.id}','${interaction.guild.name}',1) ON DUPLICATE KEY UPDATE ${columnName}=${columnName}+1;`);
        let [rows, fields] = await promisePool.execute(`SELECT ${columnName} AS value FROM Discord.guild WHERE guildID = ${interaction.guild.id}`);
        const guildCount = rows[0].value;
        
        // Food Rarity calculation and assigning
        var food;
        const rarity = CalculateFoodRarity();
        if      (rarity == 'common')    food = common[Math.floor(Math.random() * common.length)];
        else if (rarity == 'uncommon')  food = uncommon[Math.floor(Math.random() * uncommon.length)];
        else if (rarity == 'rare')      food = rare[Math.floor(Math.random() * rare.length)];
        else if (rarity == 'legendary') food = legendary[Math.floor(Math.random() * legendary.length)];

        // Adjective calculation and assigning
        const adj = PercentTrue(185)
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
            const a = StartsWithVowel(adj) ? "an" : "a"; // Checking if adj starts with a vowel
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