const { Schema, model } = require('mongoose');

const twitchNumbersSchema = Schema({
    _id: Schema.Types.ObjectId,
    clipID: String,
    clipName: String,
    clipURL: String,
    clipCreator: String,
    clipThumbnail: String
});

module.exports = model('TwitchClips', twitchNumbersSchema, 'twitchClips');
