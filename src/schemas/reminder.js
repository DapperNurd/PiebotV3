const { Schema, model } = require('mongoose');

const reminderSchema = new Schema({
    _id: Schema.Types.ObjectId,
    userID: String,
    userName: String,
    time: String,
    reminder: String
});

module.exports = model('Reminder', reminderSchema);