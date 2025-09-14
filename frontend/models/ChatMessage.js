// backend/models/ChatMessage.js
const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, default: '' },
  media: { type: String, default: '' }, // optional media url
  time: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', ChatSchema);