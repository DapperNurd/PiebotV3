const { SlashCommandBuilder, userMention } = require('discord.js');
const { PercentTrue, CalculateFoodRarity } = require('../../../extra.js');

const common = ["mashed potatoes", "french fries", "baked potato", "hash browns", "tater tots"
];

const uncommon = ["loaded potato skins", "potato chips", "roasted potatoes", "potato salad", "cheesy potatoes"
];

const rare = ["potato gnocchi", "potato pancakes", "potato bread", "potato soup"
];

const legendary = ["pocket potatoes, his very own recipe"];

const adjectives = ["delicious", "tasty", "scrumptious", "heavenly", "delectable", "delightful", "yummy", "homemade"]
const adjectivesBad = ["day-old", "overcooked", "undercooked"];

const phrases = [ "Here, [USER]! Boneless wants you to have [PLURAL] [ADJ] [FOOD]! What a big heart he has!",
"[USER] seems to have caught the attention of Boneless. As he eyes you up and down, he flirtatiously hands you [PLURAL] [ADJ] [FOOD].",
"While skating, [PLURAL] [ADJ] [FOOD] fell out of Boneless' pocket! [USER] quickly snagged it while no one was looking.",
"Boneless offers [USER] [PLURAL] [ADJ] [FOOD] as they tell him about a fan fiction!",
"After a long day at the skatepark, Boneless asks [USER] if they would like to share some [PLURAL] [ADJ] [FOOD]!",
"Boneless thought [USER] might be hungry, so he brought them [PLURAL] [ADJ] [FOOD]! They gave Boneless a forehead kiss for his kindness!",
"Sorry, [USER], but I couldn't resist. I ate your [ADJ] [FOOD].",
"Uh-oh! While Meecah was visiting with his dog Jasmine, [USER] left out their [ADJ] [FOOD], and Jasmine ate it!" ];

module.exports = {
    common,
    uncommon,
    rare,
    legendary,
    data: new SlashCommandBuilder()
        .setName('potato')
        .setDescription('Get a random potato!')
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
        const columnName = 'potatoCount'; // Change this to change what value is read/written
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
        phrase = phrase.replace('[PLURAL]', food == "baked potato" ? "[A]" : "some");

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
        const finalMsg = `${phrase} There have been ${guildCount} potatoes given out on ${interaction.guild.name}.`
            
        // Sends the final message
        await interaction.reply({
            content: finalMsg
        });
    }
}