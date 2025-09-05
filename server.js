const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// ====== File Upload Setup ======
const uploadBase = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadBase)) fs.mkdirSync(uploadBase);

app.use('/uploads', express.static(uploadBase));
app.use(express.static(path.join(__dirname))); // serve static files (html, css, js)

// ====== Routes ======

// Root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Upload Form (new design page)
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'upload.html'));
});

// Upload API
app.post('/upload', (req, res) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadBase),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });

  const upload = multer({ storage }).array('photos');
  upload(req, res, err => {
    if (err) return res.send("Upload error: " + err.message);
    res.send(`<h2>Photos uploaded successfully!</h2><a href="/gallery">Go to Gallery</a>`);
  });
});

// Gallery
app.get('/gallery', (req, res) => {
  const files = fs.readdirSync(uploadBase);

  if (files.length === 0) return res.send("<h1>No photos uploaded yet</h1>");

  let html = `
  <h1>📷 Uploaded Photos</h1>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:15px;">
  `;

  files.forEach(file => {
    html += `
      <div style="background:#fff;padding:10px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.2);">
        <img src="/uploads/${file}" style="width:100%;height:150px;object-fit:cover;border-radius:5px;">
        <form action="/delete" method="POST">
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

// Delete
app.post('/delete', express.urlencoded({ extended: true }), (req, res) => {
  const filePath = path.join(uploadBase, req.body.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.redirect('/gallery');
});

// Download
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadBase, req.params.filename);
  if (fs.existsSync(filePath)) res.download(filePath);
  else res.send("<h2>File not found</h2>");
});

// Start Server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));