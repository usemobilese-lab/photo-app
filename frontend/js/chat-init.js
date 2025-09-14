// frontend/js/chat-init.js
// This file connects socket and sends join with token to keep presence updated.
const API_BASE = "http://192.168.18.189:8080";
const TOKEN = localStorage.getItem('token');
if(TOKEN){
  const socket = io(API_BASE);
  socket.emit('join', { token: TOKEN });
  // you can listen to presence events:
  socket.on('presence', (p) => {
    // example: console.log('presence', p);
  });
  // expose socket if you want global socket usage
  window.appSocket = socket;
}