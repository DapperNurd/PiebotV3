const schemaBuildingFunctions = require('./schemaBuilding.js');
const User = require('./schemas/user.js');

const piebotColor = '#be1a34';

async function giveAndReceive(givingUser, receivingUserProfile, guildProfile, globalProfile) {
    let givingUserProfile = await User.findOne({ userID: givingUser.id }); // Searches database for a userProfile with a matching userID to id
    if(!givingUserProfile) givingUserProfile = await schemaBuildingFunctions.generateNewUser(givingUser.id, givingUser.username); // If no userProfile is found, generate a new one

    // User adjustments
    const giverCount = givingUserProfile.foodGiven + 1; // Gets foodGiven count from the giver (command user) and adds one
    const receiverCount = receivingUserProfile.foodReceived + 1; // Gets foodReceived count from the receiver (person mentioned) and adds one

    await givingUserProfile.updateOne({ foodGiven: giverCount }); // Updates the givers (command user) foodGiven count
    await receivingUserProfile.updateOne({ foodReceived: receiverCount }); // Updates the receivers (person mentioned) foodReceived count

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

module.exports = {
    giveAndReceive,
    piebotColor
}