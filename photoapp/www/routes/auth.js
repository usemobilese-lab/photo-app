// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// helper to create token
function createToken(payload) {
  const secret = process.env.JWT_SECRET || 'secret';
  const expires = process.env.TOKEN_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn: expires });
}

// REGISTER
// POST /api/auth/register
// body: { name, email, password }
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'Name, email and password are required.' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ msg: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: hashed });

    const token = createToken({ email: user.email, id: user._id });

    // return safe user object (no password)
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio
    };

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('register err', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// LOGIN
// POST /api/auth/login
// body: { email, password }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials.' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ msg: 'Invalid credentials.' });

    const token = createToken({ email: user.email, id: user._id });

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio
    };

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('login err', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;