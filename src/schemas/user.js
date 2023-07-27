const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    userID: String,
    userName: String,
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

module.exports = model('User', userSchema, 'users');