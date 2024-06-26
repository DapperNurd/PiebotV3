const { SlashCommandBuilder, userMention } = require('discord.js');
const { PercentTrue, CalculateFoodRarity, StartsWithVowel } = require('../../../extra.js');

const common = ["chocolate cake", "vanilla cake", "carrot cake", "birthday cake", "spice cake", "coffee cake", "ice cream cake"
];

const uncommon = ["red velvet cake", "strawberry shortcake", "coconut cake", "lemon cake", "pound cake", "pumpkin spice cake", "sponge cake", "pineapple upside down cake"
];

const rare = ["cake pop", "dulce de leche cake", "chocolate lava cake", "tiramisu", "mexican chocolate cake"
];

const legendary = ["fruitcake", "pancake"];

const adjectives = ["delicious", "tasty", "scrumptious", "heavenly", "delectable", "delightful", "yummy", "homemade"]
const adjectivesBad = ["day-old", "overcooked", "undercooked"];

const phrases = [ "Here, [USER]! Destronate wants you to have a[SLICE] [ADJ] [FOOD]!",
"Destro challenged [USER] to a game of Devil's Dice and lost! As a reward, he gave them a[SLICE] [ADJ] [FOOD]! Congratulations!",
"Think fast! Destro threw a[SLICE] [ADJ] [FOOD] at you, [USER]. Did you catch it in time?",
"Here, enjoy [USER]! Destro gives you a[SLICE] [ADJ] [FOOD]! It's definitely not poisoned..",
"While going for a walk, Destro appeared out of nowhere and slapped [USER] in the face with a[SLICE] [ADJ] [FOOD]!",
"Destro bakes [USER] up a[SLICE] [ADJ] [FOOD]! You enjoy it very much!",
"Sorry, [USER], but I couldn't resist. I ate your [ADJ] [FOOD]." ];

module.exports = {
    common,
    uncommon,
    rare,
    legendary,
    data: new SlashCommandBuilder()
        .setName('cake')
        .setDescription('Get a random cake!')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('Give this user some cake!')
        ),
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // This is a little confusing so I'm going to explain it out: if the command is run without a user added, so like just /food, then targetedUser (and therefore userProfile)
        const userByMention = userMention(targetedUser.id); // Turns a user object id into a discord mention

       // Database handling
       const columnName = 'cakeCount'; // Change this to change what value is read/written
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
        phrase = phrase.replace('[SLICE]', (food == "pancake" || food == "cake pop") ? "" : " slice of");

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
        const finalMsg = `${phrase} There have been ${guildCount} cakes given out on ${interaction.guild.name}.`
            
        // Sends the final message
        await interaction.reply({
            content: finalMsg
        });
    }
}