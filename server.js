const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // serve static files like HTML, CSS

// ===== Uploads folder setup =====
const uploadBase = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadBase)) fs.mkdirSync(uploadBase);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadBase);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ===== Routes =====

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Upload Form
app.get("/upload-form", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "upload.html"));
});

// Upload (Multiple Photos)
app.post("/upload", upload.array("photos", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.send("<h2>No files uploaded ❌</h2>");
  }

  res.send(`
    <h2>${req.files.length} Photos uploaded successfully ✅</h2>
    <p><a href="/gallery">Go to Gallery</a></p>
    <p><a href="/">⬅ Back to Home</a></p>
  `);
});

// Gallery
app.get("/gallery", (req, res) => {
  const files = fs.readdirSync(uploadBase);

  if (files.length === 0) {
    return res.send("<h1>No photos uploaded yet 📭</h1><a href='/'>⬅ Back to Home</a>");
  }

  let html = `
    <h1>📷 My Uploaded Photos</h1>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:15px;">
  `;

  files.forEach(file => {
    html += `
      <div style="background:#fff;padding:10px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.2);">
        <img src="/uploads/${file}" style="width:100%;height:150px;object-fit:cover;border-radius:5px;">
        <form action="/delete" method="POST" style="margin-top:8px;" enctype="application/x-www-form-urlencoded">
          <input type="hidden" name="filename" value="${file}">
          <button type="submit" style="background:red;color:#fff;border:none;padding:6px 12px;border-radius:5px;">Delete</button>
        </form>
        <a href="/download/${file}" style="display:inline-block;margin-top:5px;background:green;color:#fff;padding:6px 12px;border-radius:5px;text-decoration:none;">Download</a>
      </div>
    `;
  });

  html += "</div><br><a href='/'>⬅ Back to Home</a>";
  res.send(html);
});

// Serve uploaded files
app.use("/uploads", express.static(uploadBase));

// Delete file
app.post("/delete", express.urlencoded({ extended: true }), (req, res) => {
  const filePath = path.join(uploadBase, req.body.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.redirect("/gallery");
});

// Download file
app.get("/download/:filename", (req, res) => {
  const filePath = path.join(uploadBase, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.send("<h2>File not found ❌</h2>");
  }
});

// Start Server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));