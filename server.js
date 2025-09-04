require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const PORT = process.env.PORT || 8080;

// Google OAuth2 Client
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:8080/oauth2callback";

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Middlewares
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Middleware: Auth check
function isAuthenticated(req, res, next) {
  if (req.session.user) next();
  else res.redirect("/login");
}

// Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.get("/login", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
  });
  res.redirect(url);
});

app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    req.session.user = { name: payload.name, email: payload.email, picture: payload.picture };

    res.redirect("/gallery");
  } catch (err) {
    console.error("OAuth error:", err);
    res.status(500).send("Authentication failed");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// Upload photo
app.post("/upload", isAuthenticated, upload.single("photo"), (req, res) => res.redirect("/gallery"));

// Gallery
app.get("/gallery", isAuthenticated, (req, res) => {
  fs.readdir(path.join(__dirname, "uploads"), (err, files) => {
    if (err) return res.status(500).send("Error loading gallery");

    const images = files.map((file) => "/uploads/" + file);
    const user = req.session.user;
    let html = `<h1>Welcome, ${user.name}</h1>`;
    html += `<a href="/logout">Logout</a><br><br>`;
    html += `<form method="POST" enctype="multipart/form-data" action="/upload">
               <input type="file" name="photo" required />
               <button type="submit">Upload</button>
             </form><br>`;
    html += `<h2>Gallery</h2>`;
    images.forEach((img) => (html += `<img src="${img}" width="200" style="margin:10px"/>`));
    res.send(html);
  });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
