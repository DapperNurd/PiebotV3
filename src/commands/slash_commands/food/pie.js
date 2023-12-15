const { SlashCommandBuilder, userMention } = require('discord.js');
const User = require('../../../schemas/user');
const Guild = require('../../../schemas/guild');
const GlobalCount = require('../../../schemas/globalCount');
const { GenerateNewUser, GenerateNewGuild } = require('../../../schemaBuilding.js');
const { GiveAndReceive } = require('../../../extraFunctions.js');

const common = ["pumpkin pie", "coconut cream pie", "banana cream pie", "strawberry rhubarb pie", "chocolate cream pie", "blueberry pie", "ice cream pie", "peach pie", "pear pie", "chicken pot pie", "cranberry pie", "pineapple pie", "turtle pie", "chocolate hazelnut pie", "mixed berry pie", "chestnut pie"
];

const uncommon = ["apple pie", "cherry pie", "key lime pie", "lemon meringue pie", "blackberry pie", "raspberry pie", "pecan pie",
    "strawberry pie", "french silk pie", "custard pie", "chocolate peanut butter pie", "butterscotch pie", "mississippi mud pie", "caramel apple pie", 
    "cookies and cream pie","boysenberry pie", "shepherd's pie", "mincemeat pie"
];

const rare = ["cheesecake", "prickly pear pie", "apple pie à la mode", "blackberry pie à la mode", "cherry pie à la mode", "raspberry pie à la mode", "boysenberry pie à la mode"
];

const legendary = ["creampie", "cow pie", "cutie pie"];

const adjectives = ["delicious", "tasty", "scrumptious", "heavenly", "delectable", "delightful", "yummy", "homemade"]
const adjectivesBad = ["day-old", "overcooked", "undercooked"];

const phrases = ["Here, [USER]! Kim wants you to have a slice of her [ADJ] [FOOD]!",
    "Using artisnal skill and experience, Master Chef Kim has prepared [A] [ADJ] [FOOD] for you, [USER]!",
    "With incredible skill and hand-picked ingredients, Kim has created [A] [ADJ] [FOOD] for [USER]!",
    "[USER], you see [A] [ADJ] [FOOD] sitting on the table in Kim's kitchen. You decide to steal it, you sly fox.",
    "Using her own patented recipe, Kim made [A] [ADJ] [FOOD] just for you, [USER]! Wow, it's delicious!",
    "[A] [ADJ] [FOOD] floats down from the heavens and into [USER][S] hands. You can tell that it was prepared by Kim with love.",
    "Sorry, [USER], but I couldn't resist. I ate your [ADJ] [FOOD]." ];

module.exports = {
    common,
    uncommon,
    rare,
    legendary,
    data: new SlashCommandBuilder()
        .setName('pie')
        .setDescription('Get a random pie!')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('Give this user a pie!')
        ),
    async execute(interaction, client, con) {

        // var userCountTest, guildCountTest;

        // (async () => {
        //     con.connect();
        //     const result = await getColour("username", 2);
        //     console.log(result);
        //     con.end();
        // })();
          
        // function getColour(username, roomCount) {
        //     return new Promise((resolve, reject) => {
        //         con.query("SELECT hexcode FROM colours WHERE precedence = ?", (err, result) => {
        //             return err ? reject(err) : resolve(result[0].hexcode);
        //         });
        //     });
        // }

        // await con.connect(async (err) => {
        //     if (err) throw err;
        //     con.query(`INSERT INTO Discord.user (userID,userName,pieCount) VALUES ('${interaction.user.id}','${interaction.user.username}',1) ON DUPLICATE KEY UPDATE pieCount=pieCount+1;`, (err, result) => { if (err) return console.log(chalk.red("[MYSQL ERROR]: " + err)); }); // USER UPDATING
        //     con.query(`INSERT INTO Discord.guild (guildID,guildName,pieCount) VALUES ('${interaction.guild.id}','${interaction.guild.name}',1) ON DUPLICATE KEY UPDATE pieCount=pieCount+1;`, (err, result) => { if (err) return console.log(chalk.red("[MYSQL ERROR]: " + err)); }); // GUILD UPDATING

        //     await con.query(`SELECT * FROM Discord.user WHERE userID = '${interaction.user.id}'`, async (err, result) => { userCountTest = await result[0].pieCount; console.log(result[0].pieCount) } );
        //     await con.query(`SELECT * FROM Discord.guild WHERE guildID = '${interaction.guild.id}'`, async (err, result) => { guildCountTest = await result[0].pieCount } );
        // });

        // console.log("user count: " + userCountTest + ", guild count: " + guildCountTest);

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
        const userCount = userProfile.pieCount + 1; ///////
        const guildCount = guildProfile.pieCount + 1;    // Grabs the saved variables from the database and adds one to them
        const globalCount = globalProfile.pieCount + 1; ///

        await userProfile.updateOne({ pieCount: userCount }); ///////
        await guildProfile.updateOne({ pieCount: guildCount });    // Updates the database variables with the new ones (added one)
        await globalProfile.updateOne({ pieCount: globalCount }); ///
        
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