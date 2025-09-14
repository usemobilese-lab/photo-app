const socket = new WebSocket("wss://yourserver.com/socket");

socket.onopen = () => console.log("Socket connected");
socket.onmessage = (event) => console.log("Received:", event.data);
socket.onclose = () => console.log("Socket closed");