// write mongoose schema for chat

const { model , Schema} = require('mongoose');

const chatSchema = new Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    message: String,
    createdAt: String,
});

module.exports = model('chat', chatSchema);