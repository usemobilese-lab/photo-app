// backend/socket.js
const jwt = require('jsonwebtoken');
const Chat = require('./models/ChatMessage');
const User = require('./models/User');

let onlineUsers = {}; // socketId -> email

function initSocket(io) {
  io.use((socket, next) => {
    // allow without auth; we'll require token on 'join'
    next();
  });

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('join', async ({ token }) => {
      try {
        if (!token) return;
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const email = payload.email;
        onlineUsers[socket.id] = email;
        socket.join(email); // join room by email
        // broadcast presence
        io.emit('presence', { email, status: 'online' });
        await User.updateOne({ email }, { $set: { lastActive: new Date() } });
      } catch (err) {
        console.warn('socket join err', err.message);
      }
    });

    socket.on('private_message', async ({ toEmail, text, media }) => {
      try {
        const fromEmail = onlineUsers[socket.id];
        if (!fromEmail) return;
        // Save message
        const msg = await Chat.create({ from: fromEmail, to: toEmail, text: text || '', media: media || '' });
        // emit to recipient & sender rooms
        io.to(toEmail).emit('new_message', msg);
        io.to(fromEmail).emit('new_message', msg);
      } catch (err) {
        console.error('private_message err', err);
      }
    });

    socket.on('disconnect', async () => {
      const email = onlineUsers[socket.id];
      delete onlineUsers[socket.id];
      if (email) {
        io.emit('presence', { email, status: 'offline', lastActive: new Date() });
      }
    });
  });
}

module.exports = { initSocket };