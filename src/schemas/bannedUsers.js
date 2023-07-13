const { Schema, model } = require('mongoose');

const bannedUserSchema = new Schema({
    _id: Schema.Types.ObjectId,
    userID: String,
    userTag: String
});

module.exports = model('BannedUser', bannedUserSchema, 'bannedUsers');