const { SlashCommandBuilder, userMention } = require('discord.js');
const User = require('../../schemas/user');
const Guild = require('../../schemas/guild');
const GlobalCount = require('../../schemas/globalCount');
const schemaBuildingFunctions = require('../../schemaBuilding.js');

// 13 Categories
// 235 Total Items

const food = [  "[A] [ADJ] apple core",
                "[A] [ADJ] banana peel",
                "[A] [ADJ] pickle",
                "15 lbs of [ADJ] cheese",
                "[A] [ADJ] pineapple",
                "[A] [ADJ] pizza crust",
                "some [ADJ] chicken bones",
                "[A] [ADJ] corn dog",
                "[A] [ADJ] hard-boiled egg",
                "[A] [ADJ] apple pie",
                "some [ADJ] cheese curds",
                "some [ADJ] salami",
                "some [ADJ] pastromi",
                "some [ADJ] donut holes",
                "some [ADJ] anchovies",
                "[A] [ADJ] seasonal pie",
                "a box of [ADJ] chocolates",
                "[A] [ADJ] avocado",
                "a bag of [ADJ] doritos"    ];
const foodAdj = [ "rotten", "fresh", "moldy", "petrified", "smelly", "mushy", "greasy", "wet", "aged", "spoiled", "expired" ];

const drinks = [    "[A] [ADJ] gallon of milk",
                    "[A] [ADJ] bottle of water",
                    "a carton of [ADJ] chocolate milk",
                    "[A] [ADJ] can of tomato juice",
                    "[A] [ADJ] can of beer",
                    "[A] [ADJ] capri-sun",
                    "[A] [ADJ] carton of apple juice",
                    "[A] [ADJ] 5-hour energy",
                    "[A] [ADJ] Chug Jug",
                    "[A] [ADJ] can of pepsi",
                    "[A] [ADJ] can of coca cola",
                    "[A] [ADJ] bottle of whiskey",
                    "[A] [ADJ] keg of beer",
                    "[A] [ADJ] pumpkin spice latte",
                    "[A] [ADJ] bottle of Mike's Hard Lemonade",
                    "[A] [ADJ] jug of maple syrup",
                    "[A] [ADJ] can of Red Bull",
                    "[A] [ADJ] can of Dr. Pepper",
                    "[A] [ADJ] can of Mountain Dew",
                    "[A] [ADJ] bottle of Fireball Whiskey"     ];
const drinksAdj = [ "spoiled", "half-drank", "ice cold", "room-temperature", "empty", "piping-hot", "stinky", "aged", "leaking", "expired" ];

const clothing = [  "[A] [ADJ] MAGA hat",
                    "some [ADJ] underwear",
                    "[A] [ADJ] Abba t-shirt",
                    "[A] [ADJ] thong",
                    "[A] [ADJ] XXXL jock strap",
                    "[A] [ADJ] pair of crocs",
                    "[A] [ADJ] bunny girl outfit",
                    "[A] [ADJ] dragon furry suit",
                    "[A] [ADJ] pair of socks",
                    "[A] [ADJ] fanny pack",
                    "[A] [ADJ] cowboy hat",
                    "[A] [ADJ] top hat",
                    "[A] [ADJ] bow tie",
                    "[A] [ADJ] helicopter hat",
                    "[A] [ADJ] umbrella",
                    "[A] [ADJ] lingerie",
                    "[A] [ADJ] blanket",
                    "[A] [ADJ] dog bed",
                    "[A] [ADJ] mattress",
                    "[A] [ADJ] pillow" ];
const clothingAdj = [ "ripped", "clean", "new", "used", "stinky", "holey", "dirty", "stained", "soaked", "wet"   ];

const electronics = [   "[A] [ADJ] ipad",
                        "[A] [ADJ] game controller",
                        "[A] [ADJ] RTX 3080",
                        "[A] [ADJ] Morbius blu-ray disc",
                        "[A] [ADJ] keyboard",
                        "[A] [ADJ] USB-C cable",
                        "[A] [ADJ] texas instruments calculator",
                        "[A] [ADJ] printer",
                        "[A] [ADJ] Ratatouille blu-ray disc",
                        "[A] [ADJ] iPhone 4",
                        "[A] [ADJ] copy of Windows XP",
                        "[A] [ADJ] NES",
                        "[A] [ADJ] atari 2600",
                        "six [ADJ] PS5s",
                        "[A] [ADJ] copy of ET: the video game",
                        "[A] [ADJ] car",
                        "[A] [ADJ] GPS tracker",
                        "[A] [ADJ] USB microphone" ];
const electronicsAdj = [ "pristine", "broken", "unopened", "slightly-used", "dirty", "scuffed", "fake", "wet", "bricked", "modded", "roughed-up" ];

const toys = [  "six [ADJ] toy cars",
                "[A] [ADJ] LED llama figure",
                "[A] [ADJ] bubble blower",
                "[A] [ADJ] tricyle",
                "[A] [ADJ] yoyo",
                "[A] [ADJ] Rubix cube",
                "[A] [ADJ] model airplane",
                "[A] [ADJ] remote-controlled car",
                "[A] [ADJ] super soaker",
                "[A] [ADJ] teddy bear",
                "a random assortment of [ADJ] legos",
                "[A] [ADJ] baseball bat",
                "[A] [ADJ] football",
                "[A] [ADJ] bowling ball",
                "[A] [ADJ] bowling pin",
                "1000 [ADJ] puzzle pieces",
                "10 [ADJ] puzzle pieces",
                "[A] [ADJ] jump rope"  ];
const toysAdj = [ "broken", "heavily-used", "sticky", "dirty", "brand-new", "well-worn", "wet", "scuffed", "pristine", "slimy" ];

const toiletries = [    "[A] [ADJ] toilet paper roll",
                        "[A] [ADJ] toothbrush",
                        "some [ADJ] toenail clippers",
                        "[A] [ADJ] toilet",
                        "[A] [ADJ] hairbrush",
                        "[A] [ADJ] comb",
                        "[A] [ADJ] hair dryer",
                        "[A] [ADJ] toothpaste bottle",
                        "[A] [ADJ] bidet",
                        "[A] [ADJ] nail file",
                        "[A] [ADJ] lint roller",
                        "[A] [ADJ] stick of deoderant",
                        "some [ADJ] dental floss",
                        "[A] [ADJ] straight razor",
                        "[A] [ADJ] rectal thermometer",
                        "[A] [ADJ] toilet brush",
                        "[A] [ADJ] COVID test kit",
                        "[A] [ADJ] ShamWow"    ];
const toiletriesAdj = [ "brand-new", "unused", "dirty", "used", "clean", "wet", "crushed", "smelly", "slimy", "lightly-used" ];

// These need to be lacking a space so the empty adjective does not cause a double space (the adjectives also end with a space, because of the [EMPTY])
const wtf = [   "[A] [ADJ]sawed-off shotgun",
                "some [ADJ]uncut bank notes",
                "[A] [ADJ]wad of $100 bills",
                "[A] [ADJ]elephant tusk",
                "[A] [ADJ]bomb",
                "[A] [ADJ]gun",
                "[A] [ADJ]bale of cannabis",
                "[A] [ADJ]human hair",
                "[A] [ADJ]24 carat diamond",
                "[A] [ADJ]severed hand",
                "[A] [ADJ]severed foot",
                "[A] [ADJ]bar of gold",
                "[A] [ADJ]Declaration of Independence",
                "[A] [ADJ]Mona Lisa",
                "[A] [ADJ]time machine",
                "[A] [ADJ]copy of Half Life 3"    ];
const wtfAdj = [ "fake ", "real ", "[EMPTY]" ];

const tools = [     "[A] [ADJ] bucket",
                    "[A] [ADJ] jackhammer",
                    "[A] [ADJ] hand drill",
                    "some [ADJ] nails",
                    "some [ADJ] scissors",
                    "[A] [ADJ] picnic table",
                    "[A] [ADJ] bottle opener",
                    "[A] [ADJ] tool box",
                    "[A] [ADJ] nail gun",
                    "[A] [ADJ] stapler",
                    "[A] [ADJ] sledge hammer",
                    "[A] [ADJ] bottle of glue",
                    "some [ADJ] flex tape",
                    "[A] [ADJ] microscope",
                    "[A] [ADJ] lockpick",
                    "[A] [ADJ] shopping cart"     ];
const toolsAdj = [ "broken", "advanced", "old", "worn", "factory-new", "dirty" ];

const kitchen = [   "[A] [ADJ] tubberware container",
                    "[A] [ADJ] pot",
                    "[A] [ADJ] whole oven",
                    "[A] [ADJ] kitchen sink",
                    "[A] [ADJ] silverware set",
                    "[A] [ADJ] blender",
                    "[A] [ADJ] refridgerator",
                    "[A] [ADJ] meat cleaver",
                    "[A] [ADJ] convection oven",
                    "[A] [ADJ] crock pot",
                    "[A] [ADJ] spoon",
                    "[A] [ADJ] pressure cooker",
                    "[A] [ADJ] glass jar",
                    "[A] [ADJ] porcelain plate",
                    "[A] [ADJ] tea cup",
                    "[A] [ADJ] tea pot",
                    "[A] [ADJ] spork",
                    "[A] [ADJ] deep freezer",
                    "[A] [ADJ] deep fryer"   ];
const kitchenAdj = [ "broken", "new", "old", "dirty", "clean", "shiny", "stinky" ];

const collectibles = [  "[A] [ADJ] star wars lego death star set",
                        "a binder of [ADJ] holoraphic pokemon cards",
                        "[A] [ADJ] back to the future lunchbox",
                        "[A] [ADJ] saved by the bell lunchbox",
                        "a bag of [ADJ] silver dimes",
                        "[A] [ADJ] Darth Vader action figure",
                        "[A] [ADJ] Blockbuster member card",
                        "[A] [ADJ] book of stamps",
                        "an assortment of [ADJ] Zippo lighters",
                        "a box full of [ADJ] postcards",
                        "[A] [ADJ] copy of Marval Comics #1",
                        "[A] [ADJ] Babe Ruth Topps baseball card",
                        "[A] [ADJ] Honus Wagner baseball card",
                        "some [ADJ] tickets to BlizCon",
                        "[A] [ADJ] Batmobile replica",
                        "[A] [ADJ] Delorean",
                        "[A] [ADJ] chunk of meteorite"  ];
const collectiblesAdj = [ "mint-condition", "pristine", "unkept", "dirty", "fake", "real" ];

const animals = [   "[A] [ADJ] rat",
                    "[A] [ADJ] raccoon",
                    "[A] [ADJ] opossum",
                    "[A] [ADJ] five-legged rat",
                    "a family of [ADJ] spiders",
                    "[A] [ADJ] pigeon",
                    "[A] [ADJ] seagull",
                    "[A] [ADJ] coyote",
                    "[A] [ADJ] muskrat",
                    "[A] [ADJ] vulture",
                    "two [ADJ] cockroaches",
                    "[A] [ADJ] squirrel",
                    "a hoard of [ADJ] centipedes",
                    "[A] [ADJ] trash panda",
                    "[A] [ADJ] cat"    ];
const animalsAdj = [    "rabid",
                        "domesticated",
                        "feral",
                        "questionable",
                        "undead",
                        "wet",
                        "obese",
                        "huge",
                        "scary",
                        "friendly",
                        "cute",
                        "nice",
                        "small"    ];

const furniture = [     "[A] [ADJ] couch",
                        "[A] [ADJ] gaming chair",
                        "[A] [ADJ] recliner",
                        "[A] [ADJ] rocking chair",
                        "[A] [ADJ] ottoman",
                        "[A] [ADJ] coo-coo clock ",
                        "[A] [ADJ] computer desk",
                        "[ADJ] accoustic wall panels",
                        "[A] [ADJ] Ikea table",
                        "[A] [ADJ] coffee table",
                        "[A] [ADJ] entertainment center",
                        "[A] [ADJ] bar stool",
                        "[A] [ADJ] book shelf",
                        "[A] [ADJ] futon",
                        "[A] [ADJ] fold-up chair",
                        "[A] [ADJ] cradle",
                        "[A] [ADJ] throne",
                        "[A] [ADJ] bath chair",
                        "some [ADJ] Shungite"   ];
const furnitureAdj = [  "dusty",
                        "old",
                        "new",
                        "smelly",
                        "stained",
                        "broken"    ];

const misc = [  "Kim's burnt pies",
                "some chewed gum",
                "an empty pizza box",
                "some stranger's driver's license",
                "a school yearbook from 1997",
                "nothing",
                "a jar of mayo",
                "a gallon of lard",
                "a white chocolate twix",
                "Trauma's beard trimmer",
                "Trash's secret stash",
                "a bag of toenails",
                "a bag of used cat liter",
                "some bottles of piss",
                "some prefilled vomit bags",
                "a picture of themself",
                "themself",
                "a particle accelerator",
                "a printed screenshot of a NFT",
                "the answer to life, universe and everything",
                "10 bags of cement"  ];
const miscAdj = "[EMPTY]";

// List of phrases that piebot can pick from when sending a message
const phrases = [   "[USER] goes rummaging through the garbage and finds [ITEM].",
                    "[USER] dug through Trash's special dumpster and found [ITEM]. They should probably pay for that...",
                    "Trashed thought they heard [USER] sifting through his dumpster. They managed to sneak away with [ITEM] without getting caught.",
                    "[USER] accidentally knocked over a trash can and [ITEM] fell out.",
                    "Trashed has graced [USER] with [ITEM] from his personal bin.",
                    "Uh, oh... [USER] was caught digging in a dumpster by the Police. They had [ITEM] removed from their person.",
                    "It's trash day, and [USER] notices [ITEM] fall out of their neighbor's garbage can as the truck picks it up.",
                    "In frustration, [USER] kicked over a trash bin and found [ITEM] as debris spewed everywhere!",
                    "Walking home, [USER] was thrown into a dumpster by some thugs. Before crawling out they found [ITEM]. Their wallet may have been stolen but at least they take home a prize!"];

const specialPhrase = "[USER] went dumpster diving and found [ITEM]! How did they even find it? Trash wont be happy when he finds out.  .";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trash')
        .setDescription('Dig through some trash!')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('Give this user actual garbage!')
        ),
    async execute(interaction, client) {

        // Database handling
        const targetedUser = interaction.options.getUser("user") ?? interaction.user; // This is a little confusing so I'm going to explain it out: if the command is run without a user added, so like just /food, then targetedUser (and therefore userProfile)
                                                                                      // belongs to the user of the command. If there IS a user added, so like /food @user, then targetedUser (and again, userProfile too) belong to the user mentioned.
        let userProfile = await User.findOne({ userID: targetedUser.id }); // Searches database for a userProfile with a matching userID to id
        if(!userProfile) userProfile = await schemaBuildingFunctions.generateNewUser(targetedUser.id, targetedUser.username); // If no userProfile is found, generate a new one

        let guildProfile = await Guild.findOne({ guildID: interaction.guild.id }); // Searches database for a guildProfile with a matching userID to id
        if(!guildProfile) guildProfile = await schemaBuildingFunctions.generateNewGuild(interaction.guild.id, interaction.guild.name); // If no guildProfile is found, generate a new one

        let globalProfile = await GlobalCount.findOne({ globalID: "global" }); // Searches database for the globalProfile
        if(!globalProfile) { // Should hopefully never happen
            console.log(chalk.red("[Bot Status]: Error finding global database!"));
            return await interaction.reply({ // We do not build a new global profile because there is only ever one.
                content: `I don't feel so good... something's not right. Where's ${userMention(author.id)}??`,
                ephemeral: true
            });
        }

        // Given / Receiving Handling
        if(interaction.options.getUser("user") && interaction.options.getUser("user") != interaction.user) { // ONLY RUNS if a food item is being given to another user
            let giverProfile = await User.findOne({ userID: interaction.user.id }); // Searches database for a userProfile with a matching userID to id
            if(!giverProfile) giverProfile = await schemaBuildingFunctions.generateNewUser(interaction.user.id, interaction.user.username); // If no userProfile is found, generate a new one

            // User adjustments
            const giverCount = giverProfile.foodGiven + 1; // Gets foodGiven count from the giver (command user) and adds one
            const receiverCount = userProfile.foodReceived + 1; // Gets foodReceived count from the receiver (person mentioned) and adds one

            await giverProfile.updateOne({ foodGiven: giverCount }); // Updates the givers (command user) foodGiven count
            await userProfile.updateOne({ foodReceived: receiverCount }); // Updates the receivers (person mentioned) foodReceived count

            // Server and Global adjustments
            const serverGiven = guildProfile.foodGiven + 1; // Gets foodGiven count from the server and adds one
            const serverReceived = guildProfile.foodReceived + 1; // Gets foodReceived count from the server and adds one
            const globalGiven = globalProfile.foodGiven + 1; // Gets global foodGiven count and adds one
            const globalReceived = globalProfile.foodReceived + 1; // Gets global foodReceived count and adds one

            await guildProfile.updateOne({ foodGiven: serverGiven }); // Updates the givers (command user) foodGiven count
            await guildProfile.updateOne({ foodReceived: serverReceived }); // Updates the receivers (person mentioned) foodReceived count
            await globalProfile.updateOne({ foodGiven: globalGiven }); // Updates the givers (command user) foodGiven count
            await globalProfile.updateOne({ foodReceived: globalReceived }); // Updates the receivers (person mentioned) foodReceived count
        }

        // Extra misc variables
        const author = await client.users.fetch("189510396569190401"); // Gets my (nurd) user from my id
        const userByMention = userMention(targetedUser.id); // Turns a user object id into a discord mention

        // Food Counts fetching, updating, and saving
        const userCount = userProfile.trashCount + 1; ///////
        const guildCount = guildProfile.trashCount + 1;    // Grabs the saved variables from the database and adds one to them
        const globalCount = globalProfile.trashCount + 1; ///

        await userProfile.updateOne({ trashCount: userCount }); ///////
        await guildProfile.updateOne({ trashCount: guildCount });    // Updates the database variables with the new ones (added one)
        await globalProfile.updateOne({ trashCount: globalCount }); ///
        
        // Food and Adjective Category calculation and assigning
        var item, adj;
        const randomCategory = Math.floor(Math.random() * 13) + 1; // Generates a number from 1 to 13 to pick one of the 14 categories
        switch (randomCategory) {
            case (1):
                item = food[Math.floor(Math.random() * food.length)];
                adj = foodAdj[Math.floor(Math.random() * foodAdj.length)];
                break;
            case (2):
                item = drinks[Math.floor(Math.random() * drinks.length)];
                adj = drinksAdj[Math.floor(Math.random() * drinksAdj.length)];
                break;
            case (3):
                item = clothing[Math.floor(Math.random() * clothing.length)];
                adj = clothingAdj[Math.floor(Math.random() * clothingAdj.length)];
                break;
            case (4):
                item = electronics[Math.floor(Math.random() * electronics.length)];
                adj = electronicsAdj[Math.floor(Math.random() * electronicsAdj.length)];
                break;
            case (5):
                item = toys[Math.floor(Math.random() * toys.length)];
                adj = toysAdj[Math.floor(Math.random() * toysAdj.length)];
                break;
            case (6):
                item = toiletries[Math.floor(Math.random() * toiletries.length)];
                adj = toiletriesAdj[Math.floor(Math.random() * toiletriesAdj.length)];
                break;
            case (7):
                item = wtf[Math.floor(Math.random() * wtf.length)];
                adj = wtfAdj[Math.floor(Math.random() * wtfAdj.length)];
                break;
            case (8):
                item = tools[Math.floor(Math.random() * tools.length)];
                adj = toolsAdj[Math.floor(Math.random() * toolsAdj.length)];
                break;
            case (9):
                item = kitchen[Math.floor(Math.random() * kitchen.length)];
                adj = kitchenAdj[Math.floor(Math.random() * kitchenAdj.length)];
                break;
            case (10):
                item = collectibles[Math.floor(Math.random() * collectibles.length)];
                adj = collectiblesAdj[Math.floor(Math.random() * collectiblesAdj.length)];
                break;
            case (11):
                item = animals[Math.floor(Math.random() * animals.length)];
                adj = animalsAdj[Math.floor(Math.random() * animalsAdj.length)];
                break;
            case (12):
                item = furniture[Math.floor(Math.random() * furniture.length)];
                adj = furnitureAdj[Math.floor(Math.random() * furnitureAdj.length)];
                break;
            case (13):
                item = misc[Math.floor(Math.random() * misc.length)];
                adj = miscAdj; // Misc adjective is [EMPTY] and gets replaced with an empty string, this was done to prevent undefined errors
                break;
            default: // Using toys as the default because it has the most items, but it should never actually be called this way with the way the random generator works
                item = toys[Math.floor(Math.random() * toys.length)];
                adj = toysAdj[Math.floor(Math.random() * toysAdj.length)];
        }

        // Item string formatting
        item = item.replace('[ADJ]', adj);
        item = item.replace('[EMPTY]', ""); // Replaces the empty adjectives (that were inserted in the previous line) with nothing
        if(item.includes('[A]')) { // Proper grammar for adjective handling (whether to use "a" or "an" before the adjective)
            const a = (adj.startsWith("a") || adj.startsWith("e") || adj.startsWith("i") || adj.startsWith("o") || adj.startsWith("u")) ? "an" : "a"; // Checking if adj starts with a vowel
            item = item.replace('[A]', a); // Replaces placeholder in the phrase with the proper term
        }
        
        // Phrase formatting
        var phrase = ((item == "Trash's secret stash") ? specialPhrase : phrases[Math.floor(Math.random() * phrases.length)]);

        phrase = phrase.replace('[USER]', userByMention); ///
        phrase = phrase.replace('[ADJ]', adj);             // Replaces placeholders in the phrase with the proper terms
        phrase = phrase.replace('[ITEM]', item); ////////////

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
        const finalMsg = `${phrase} There have been ${guildCount} pieces of trash found on ${interaction.guild.name}.`
            
        // Sends the final message
        await interaction.reply({
            content: finalMsg
        });
    }
}