// backend/routes/stories.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const auth = require('../middleware/auth');
const Story = require('../models/Story');
const User = require('../models/User');

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// upload story (image/video)
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const u = await User.findOne({ email: req.user.email });
    if (!req.file) return res.status(400).json({ msg: 'No media' });
    const type = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    const story = await Story.create({
      userEmail: u.email,
      userName: u.name,
      profilePic: u.profilePic || '',
      media: `/${uploadDir}/${req.file.filename}`,
      type,
      time: new Date()
    });
    res.json(story);
  } catch (err) {
    console.error('story post err', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// get current stories (last 12 hours)
router.get('/', auth, async (req, res) => {
  try {
    const HOURS = parseInt(process.env.STORY_EXPIRY_HOURS || '12', 10);
    const cutoff = new Date(Date.now() - HOURS * 3600000);
    const stories = await Story.find({ time: { $gte: cutoff } }).sort({ time: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// cleanup (optional manual)
router.delete('/cleanup', async (req, res) => {
  try {
    const HOURS = parseInt(process.env.STORY_EXPIRY_HOURS || '12', 10);
    const cutoff = new Date(Date.now() - HOURS * 3600000);
    await Story.deleteMany({ time: { $lt: cutoff } });
    res.json({ msg: 'cleaned' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;