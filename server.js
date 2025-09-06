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
app.use(express.static(path.join(__dirname, 'public'))); // serve public folder

// ====== Routes ======

// Root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload Page
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// Upload Handler
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadBase),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage }).array('photos');

app.post('/upload', (req, res) => {
  upload(req, res, err => {
    if (err) return res.send("Upload error: " + err.message);
    res.send(`<h2>✅ Photos uploaded successfully!</h2><a href="/gallery">Go to Gallery</a>`);
  });
});

// Gallery Page
app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

// Delete a File
app.post('/delete', express.urlencoded({ extended: true }), (req, res) => {
  const filePath = path.join(uploadBase, req.body.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.redirect('/gallery');
});

// Download a File
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadBase, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.send("<h2>❌ File not found</h2><a href='/gallery'>Back to Gallery</a>");
  }
});

// ====== API - List uploaded files ======
app.get('/api/files', (req, res) => {
  const files = fs.readdirSync(uploadBase);
  res.json(files);
});

// Start Server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));