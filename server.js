const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simple test route
app.get("/", (req, res) => {
  res.send("✅ PhotoApp Server is running!");
});

// Example routes (agar aapke routes folder me hai to unko require karo)
try {
  app.use("/auth", require("./www/routes/auth"));
  app.use("/chats", require("./www/routes/chats"));
  app.use("/notifications", require("./www/routes/notifications"));
  app.use("/posts", require("./www/routes/posts"));
  app.use("/stories", require("./www/routes/stories"));
  app.use("/users", require("./www/routes/users"));
} catch (err) {
  console.log("⚠️ Routes not found, skipping...");
}

// ✅ PORT ko dynamic rakha hai hosting ke liye
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});