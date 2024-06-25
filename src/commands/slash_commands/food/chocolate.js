const { SlashCommandBuilder, userMention } = require('discord.js');
const { PercentTrue, CalculateFoodRarity, StartsWithVowel } = require('../../../extra.js');

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
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // This is a little confusing so I'm going to explain it out: if the command is run without a user added, so like just /food, then targetedUser (and therefore userProfile)
        const userByMention = userMention(targetedUser.id); // Turns a user object id into a discord mention

        // Database handling
        const columnName = 'chocolateCount'; // Change this to change what value is read/written
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

        phrase = phrase.replace('[USER]', userByMention); ///
        phrase = phrase.replace('[ADJ]', adj);             // Replaces placeholders in the phrase with the proper terms
        phrase = phrase.replace('[FOOD]', food); ////////////
        phrase = phrase.replace('[PLURAL]', singularItems.includes(food) ? "[A]" : "some");

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
        const finalMsg = `${phrase} There have been ${guildCount} chocolates given out on ${interaction.guild.name}.`
            
        // Sends the final message
        await interaction.reply({
            content: finalMsg
        });
    }
}