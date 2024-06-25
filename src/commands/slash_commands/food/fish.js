const { SlashCommandBuilder, userMention } = require('discord.js');
const { PercentTrue, CalculateFoodRarity, StartsWithVowel } = require('../../../extra.js');

const common = ["carp", "bass", "trout", "tilapia", "catfish", "anchovy", "cod", "spanish mackeral", "bluefish", "crappie", "redfish", "mullet", "ruby splashtail"
];

const uncommon = ["cobia", "flounder", "red snapper", "king mackeral", "ladyfish", "largemouth bass", "tuna", "sunfish", "halibut", "pompano", "salmon", "sunny splashtail"
];

const rare = ["grouper", "alligator gar", "lionfish", "swordfish", "mahimahi", "wahoo", "clownfish", "indigo splashtail"
];

const legendary = ["Holy Mackerel", "umber splashtail"];

const adjectives = ["delicious", "tasty", "scrumptious", "heavenly", "delectable", "delightful", "yummy", "fresh"]
const adjectivesBad = ["day-old", "overcooked", "undercooked", "raw"];

const phrases = [ "Here, [USER]! Valyx the Florida Man wants you to have some [ADJ] [FOOD]!",
"During a heavy rainstorm, a live [FOOD] flew out of the sky and hit [USER] in the face! Where did it come from??",
"After a long struggle, Valyx the Florida Man finally managed to catch [A] [FOOD]. He prepares it just for you, [USER], and it was [ADJ]!",
"[USER] went bobbing for apples, but ended up pulling out a live [FOOD] instead! Valyx the Florida Man must have snuck it in there when no one was looking.",
"Holy Carp! Valyx the Florida Man caught a large [FOOD]. He cooked it for [USER], just the way they like it. [ADJ]!",
"You just got catfished, [USER]! Your [ADJ] [FOOD] is actually a [FOOD2]",
"Sorry, [USER], but I couldn't resist. I ate your [ADJ] [FOOD].",
"Uh-oh! While Meecah was visiting with his dog Jasmine, [USER] left out their [ADJ] [FOOD], and Jasmine ate it!" ];

module.exports = {
    common,
    uncommon,
    rare,
    legendary,
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Get a random fish!')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('Give this user a fish!')
        ),
    async execute(interaction, client, promisePool) {

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // This is a little confusing so I'm going to explain it out: if the command is run without a user added, so like just /food, then targetedUser (and therefore userProfile)
        const userByMention = userMention(targetedUser.id); // Turns a user object id into a discord mention

        // Database handling
        const columnName = 'fishCount'; // Change this to change what value is read/written
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
        if(phrase == "Holy Carp! Valyx the Florida Man caught a large [FOOD]. He cooked it for [USER], just the way they like it. [ADJ]!") // Capitalizes the adjective for this phrase
            adj = adj.charAt(0).toUpperCase() + adj.slice(1); 
        phrase = phrase.replace('[ADJ]', adj);             // Replaces placeholders in the phrase with the proper terms
        phrase = phrase.replace('[FOOD]', food); ////////////

        if(phrase.includes('[FOOD2]')) { // For the catfish message
            var food2; // Calculating and assigning second food for catfish message
            const rarityNum = Math.floor(Math.random() * (100 - 1) + 1) // Random from 1 to 100
            if (rarityNum < 51)        food2 = common[Math.floor(Math.random() * common.length)];       // 50% (1 to 50 )
            else if (rarityNum < 91)   food2 = uncommon[Math.floor(Math.random() * uncommon.length)];   // 40% ( 51 to 90 )
            else if (rarityNum < 100)  food2 = rare[Math.floor(Math.random() * rare.length)];           // 9% ( 91 to 99 )
            else if (rarityNum >= 100) food2 = legendary[Math.floor(Math.random() * legendary.length)]; // 1% ( 100 )
            else                       food2 = common[Math.floor(Math.random() * common.length)];       // Should never run but just in case
            
            phrase = phrase.replace('[FOOD2]', food2)
        }

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
        const finalMsg = `${phrase} There have been ${guildCount} fish fillets given out on ${interaction.guild.name}.`
            
        // Sends the final message
        await interaction.reply({
            content: finalMsg
        });
    }
}