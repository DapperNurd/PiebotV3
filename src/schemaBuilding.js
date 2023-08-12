const mongoose = require('mongoose');
const User = require('./schemas/user');
const Guild = require('./schemas/guild');
const chalk = require('chalk');

// So apparently you can, in the schema files, set values to have a default meaning they don't need to be included in the generating of a new profile
// So for example I could set all of the counts to zero by default and then these new profiles would only require id and username to be changed,
// but I'm not doing that feature simply because I think this is more clear as to what is going on.

/**
 * 
 * @param {string} id ID of the user to generate a new document for
 * @param {string} username Username of the user to generate a new document for
 * @returns 
 */
async function GenerateNewUser(id, username) {
    let userProfile = await new User({ // Essentially a template for a user document in MongoDB Atlas
        _id: new mongoose.Types.ObjectId(),
        userID: id,
        userName: username,
        pieCount: 0,
        muffinCount: 0,
        potatoCount: 0,
        iceCreamCount: 0,
        pizzaCount: 0,
        fishCount: 0,
        cakeCount: 0,
        cookieCount: 0,
        chocolateCount: 0,
        pastaCount: 0,
        sandwichCount: 0,
        trashCount: 0,
        brownieCount: 0,
        foodGiven: 0,
        foodReceived: 0,
        okCount: 0
    });

    await userProfile.save().catch(console.error);

    console.log(chalk.yellow(`[Database Status]: Generated new user profile for user: ${username}`));

    return userProfile;
}

async function GenerateNewGuild(id, name) {
    let guildProfile = await new Guild({ // Essentially a template for a guild document in MongoDB Atlas
        _id: new mongoose.Types.ObjectId(),
        guildID: id,
        guildName: name,
        pieCount: 0,
        muffinCount: 0,
        potatoCount: 0,
        iceCreamCount: 0,
        pizzaCount: 0,
        fishCount: 0,
        cakeCount: 0,
        cookieCount: 0,
        chocolateCount: 0,
        pastaCount: 0,
        sandwichCount: 0,
        trashCount: 0,
        brownieCount: 0,
        foodGiven: 0,
        foodReceived: 0,
        okCount: 0
    });

    await guildProfile.save().catch(console.error);

    console.log(chalk.yellow(`[Database Status]: Generated new guild profile for server: ${name}`));

    return guildProfile;
}

module.exports = {
    GenerateNewUser,
    GenerateNewGuild,
}