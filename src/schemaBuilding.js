const mongoose = require('mongoose');
const User = require('./schemas/user');
const Guild = require('./schemas/guild');
const chalk = require('chalk');

async function generateNewUser(id, username) {
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
        pastaCount: 0,
        sandwichCount: 0,
        trashCount: 0,
        brownieCount: 0
    });

    await userProfile.save().catch(console.error);

    console.log(chalk.yellow(`Generated new user profile for user: ${username}`));

    return userProfile;
}

async function generateNewGuild(id, name) {
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
        pastaCount: 0,
        sandwichCount: 0,
        trashCount: 0,
        brownieCount: 0
    });

    await guildProfile.save().catch(console.error);

    console.log(chalk.yellow(`Generated new guild profile for server: ${name}`));

    return guildProfile;
}

module.exports = {
    generateNewUser,
    generateNewGuild,
}