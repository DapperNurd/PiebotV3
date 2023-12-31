const { SlashCommandBuilder, userMention } = require('discord.js');
const { PercentTrue, CalculateFoodRarity, StartsWithVowel } = require('../../../extra.js');

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
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // This is a little confusing so I'm going to explain it out: if the command is run without a user added, so like just /food, then targetedUser (and therefore userProfile)
        const userByMention = userMention(targetedUser.id); // Turns a user object id into a discord mention

        // Database handling
        const columnName = 'pizzaCount'; // Change this to change what value is read/written
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
        const adj = PercentTrue(10)
            ? adjectives[Math.floor(Math.random() * adjectives.length)]
            : adjectivesBad[Math.floor(Math.random() * adjectivesBad.length)]; // Formatting this way just because it's a long line
        
        // Phrase formatting
        var phrase = phrases[Math.floor(Math.random() * phrases.length)];

        // Crust calculation and assigning
        const crust = ( (food != "chicago-style deep dish pizza" && food != "breakfast pizza" && food != "chocolate chip cookie pizza" && food != "hotpocket™️")   &&   Math.floor(Math.random() * (100 - 1) + 1) < 15 )
            ? crustType = crusts[Math.floor(Math.random() * crusts.length)] + " "
            : ""; // Crust handling... I know it is super ugly...

        phrase = phrase.replace('[USER]', userByMention); ///
        phrase = phrase.replace('[ADJ]', adj);             // Replaces placeholders in the phrase with the proper terms
        phrase = phrase.replace('[FOOD]', food);           //
        phrase = phrase.replace('[CRUST]', crust); //////////

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
        const finalMsg = `${phrase} There have been ${guildCount} pizzas given out on ${interaction.guild.name}.`
            
        // Sends the final message
        await interaction.reply({
            content: finalMsg
        });
    }
}