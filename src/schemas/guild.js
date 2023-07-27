const { Schema, model } = require('mongoose');

const guildSchema = new Schema({
    _id: Schema.Types.ObjectId,
    guildID: String,
    guildName: String,
    pieCount: Number,
    muffinCount: Number,
    potatoCount: Number,
    iceCreamCount: Number,
    pizzaCount: Number,
    fishCount: Number,
    cakeCount: Number,
    cookieCount: Number,
    chocolateCount: Number,
    pastaCount: Number,
    sandwichCount: Number,
    trashCount: Number,
    brownieCount: Number,
    foodGiven: Number,
    foodReceived: Number,
    okCount: Number
});

module.exports = model('Guild', guildSchema, 'guilds');