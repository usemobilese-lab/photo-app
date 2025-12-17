require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();

// ✅ Smart URL Handling (Automatic Production Link)
const FRONTEND_URL = process.env.FRONTEND_URL || "https://photo-app-e3co.onrender.com";

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(session({ secret: "secret-key", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// Photo Schema
const PhotoSchema = new mongoose.Schema({
  url: String, name: String, user: String, public_id: String,
  date: { type: Date, default: Date.now }
});
const Photo = mongoose.model("Photo", PhotoSchema);

// Auth Setup
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {
  const user = { id: profile.id, name: profile.displayName, email: profile.emails[0].value, photo: profile.photos[0].value };
  done(null, user);
}));

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// ✅ Login Success Logic (Mobile Friendly)
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
  res.send(`
    <script>
      window.opener.postMessage(
        { type: "google-auth-success", user: ${JSON.stringify(req.user)} },
        "*" 
      );
      window.close();
    </script>
  `);
});

app.get("/auth/whoami", (req, res) => res.json(req.user || null));
app.post("/auth/logout", (req, res) => req.logout(() => res.json({ ok: true })));

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = new CloudinaryStorage({ cloudinary, params: { folder: 'photo-app', allowed_formats: ['jpg', 'png'] } });
const upload = multer({ storage });

// API Routes
app.post("/api/upload", upload.array("files"), async (req, res) => {
  if (!req.user) return res.status(401).end();
  for (const f of req.files) {
    await new Photo({ url: f.path, name: f.originalname, user: req.user.email, public_id: f.filename }).save();
  }
  res.json({ ok: true });
});

app.get("/api/gallery", async (req, res) => {
  if (!req.user) return res.json([]);
  const photos = await Photo.find({ user: req.user.email }).sort({ date: -1 });
  res.json(photos.map(p => ({ id: p._id, url: p.url, name: p.name, user: p.user })));
});

app.delete("/api/gallery/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
  const photo = await Photo.findById(req.params.id);
  if (photo) {
    if (photo.public_id) await cloudinary.uploader.destroy(photo.public_id);
    await Photo.findByIdAndDelete(req.params.id);
  }
  res.json({ ok: true });
});

// ✅ SABSE ZAROORI: Website Serve Karna (Frontend Connection)
// Isse Desktop aur Phone dono par App dikhegi
app.use(express.static(path.join(__dirname, "frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));