// Switch between forms
document.getElementById("loginBtn").addEventListener("click", () => {
  document.getElementById("loginForm").style.display = "flex";
  document.getElementById("signupForm").style.display = "none";
});

document.getElementById("signupBtn").addEventListener("click", () => {
  document.getElementById("signupForm").style.display = "flex";
  document.getElementById("loginForm").style.display = "none";
});

// Backend API base URL
const API = const API = "http://localhost:8080/api/auth";

// Handle signup
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "feed.html";
    } else {
      alert(data.msg || "Signup failed");
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
});

// Handle login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "feed.html";
    } else {
      alert(data.msg || "Login failed");
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
});