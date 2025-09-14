// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' },
  bio: { type: String, default: '' },
  phone: { type: String, default: '' },
  hideEmail: { type: Boolean, default: false },
  hidePhone: { type: Boolean, default: false },
  followers: { type: [String], default: [] },
  following: { type: [String], default: [] },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);