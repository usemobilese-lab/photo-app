const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8080;

// Storage setup for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Home page (upload form)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Handle photo upload
app.post("/upload", upload.single("photo"), (req, res) => {
  res.send(`
    <h2>Photo uploaded successfully ✅</h2>
    <p><a href="/gallery">Go to Gallery</a></p>
  `);
});

// Show gallery
app.get("/gallery", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) {
      return res.send("Error loading gallery");
    }
    let gallery = files
      .map(
        (file) => `<img src="/uploads/${file}" style="width:200px;margin:10px;">`
      )
      .join("");
    res.send(`
      <h2>📸 Photo Gallery</h2>
      <div>${gallery}</div>
      <p><a href="/">Upload more</a></p>
    `);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});