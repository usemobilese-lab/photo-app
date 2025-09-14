// frontend/js/chat.js
const API_BASE = "http://192.168.18.189:8080"; // अपना backend IP डालें
const TOKEN = localStorage.getItem("token");
const userItems = document.getElementById("userItems");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");
const chatMessage = document.getElementById("chatMessage");

let selectedUser = null;

// Users List Load करो
async function loadUsers() {
  const res = await fetch(`${API_BASE}/api/users`);
  const users = await res.json();

  users.forEach(user => {
    const li = document.createElement("li");
    li.textContent = user.fullName; // username की बजाय नाम दिखाओ
    li.onclick = () => selectUser(user);
    userItems.appendChild(li);
  });
}

function selectUser(user) {
  selectedUser = user;
  chatWindow.innerHTML = `<h4>Chat with ${user.fullName}</h4>`;
}

// Message भेजो
sendBtn.onclick = () => {
  if (!selectedUser) {
    alert("पहले कोई user चुनो!");
    return;
  }

  const msg = chatMessage.value;
  if (!msg) return;

  chatWindow.innerHTML += `<p><b>You:</b> ${msg}</p>`;
  chatMessage.value = "";

  // Socket emit
  if (window.appSocket) {
    window.appSocket.emit("chatMessage", {
      to: selectedUser._id,
      text: msg
    });
  }
};

// Socket से incoming messages सुनो
if (window.appSocket) {
  window.appSocket.on("chatMessage", (data) => {
    if (selectedUser && data.from === selectedUser._id) {
      chatWindow.innerHTML += `<p><b>${selectedUser.fullName}:</b> ${data.text}</p>`;
    }
  });
}

loadUsers();