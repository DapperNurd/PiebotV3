const { SlashCommandBuilder, userMention } = require('discord.js');
const { PercentTrue, CalculateFoodRarity } = require('../../../extra.js');

const common = ["banana nut muffin", "blueberry muffin", "lemon poppy seed muffin", "coconut muffin", "oatmeal muffin", "raspberry muffin"
];

const uncommon = ["chocolate chip muffin", "cornbread muffin", "pumpkin muffin", "coffee cake muffin", "peanut butter muffin", "maple walnut muffin", "pecan muffin"
];

const rare = ["chocolate chunk muffin", "apple cinnamon muffin", "snickerdoodle muffin"
];

const legendary = [`Kecatas' "special" muffin`, "drudanae muffin", "muffin time"];

const adjectives = ["delicious", "tasty", "scrumptious", "heavenly", "delectable", "delightful", "yummy", "homemade"]
const adjectivesBad = ["day-old", "overcooked", "undercooked"];

const phrases = ["Here, [USER]! Kecatas wants you to have one of his [ADJ] [FOOD]s!",
    "[USER], you have stumbled upon Kecatas's stash of [ADJ] [FOOD]s. He won't know if you take just one, right?",
    "From the kitchen you can smell that Kecatas has prepared a batch of [ADJ] [FOOD]s. He offers [USER] one. What a good guy!",
    "Kecatas spent all morning baking a dozen [ADJ] [FOOD]s and wants you to try one, [USER]!",
    "Muffin Master Kecatas is testing a new recipe of [ADJ] [FOOD]s and gives you one to try. How does it taste, [USER]?",
    "[A] [ADJ] [FOOD] floats down from the heavens and into [USER][S] hands. You can tell that it was prepared by Kecatas with love.",
    "Sorry, [USER], but I couldn't resist. I ate your [ADJ] [FOOD]." ];

module.exports = {
    common,
    uncommon,
    rare,
    legendary,
    data: new SlashCommandBuilder()
        .setName('muffin')
        .setDescription('Get a random muffin!')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('Give this user a muffin!')
        ),
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // This is a little confusing so I'm going to explain it out: if the command is run without a user added, so like just /food, then targetedUser (and therefore userProfile)
        const userByMention = userMention(targetedUser.id); // Turns a user object id into a discord mention

        // Database handling
        const columnName = 'muffinCount'; // Change this to change what value is read/written
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
        const finalMsg = `${phrase} There have been ${guildCount} muffins given out on ${interaction.guild.name}.`
            
        // Sends the final message
        await interaction.reply({
            content: finalMsg
        });
    }
}