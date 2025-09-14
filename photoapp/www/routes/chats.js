// backend/routes/chats.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/ChatMessage');

// get conversation between me and other
router.get('/:otherEmail', auth, async (req, res) => {
  try {
    const me = req.user.email;
    const other = req.params.otherEmail;
    const msgs = await Chat.find({
      $or: [
        { from: me, to: other },
        { from: other, to: me }
      ]
    }).sort({ time: 1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;