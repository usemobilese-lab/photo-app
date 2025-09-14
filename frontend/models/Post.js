// backend/models/Post.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  profilePic: { type: String, default: "" },
  caption: { type: String, default: "" },
  media: { type: String, default: "" }, // image/video URL
  mediaType: { type: String, enum: ["image", "video", "none"], default: "none" },
  likes: { type: [String], default: [] },
  comments: [
    {
      user: String,
      text: String,
      time: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);