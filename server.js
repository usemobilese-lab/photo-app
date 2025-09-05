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
app.use(express.urlencoded({ extended: true })); // parse form data

// ====== Multer Setup ======
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadBase),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ====== Routes ======

// Root
app.get('/', (req, res) => {
  res.send(`
    <h1>📸 Welcome to Photo App</h1>
    <a href="/upload-form">Upload a Photo</a> | 
    <a href="/gallery">View Gallery</a>
  `);
});

// Upload Form
app.get('/upload-form', (req, res) => {
  res.send(`
    <h1>Upload a Photo</h1>
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <input type="file" name="photos" multiple required />
      <button type="submit">Upload</button>
    </form>
    <br>
    <a href="/gallery">Go to Gallery</a>
  `);
});

// Upload API
app.post('/upload', upload.array('photos'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.send("<h2>No files selected!</h2><a href='/upload-form'>Try Again</a>");
  }
  res.send(`
    <h2>✅ ${req.files.length} photo(s) uploaded successfully!</h2>
    <a href="/gallery">Go to Gallery</a>
  `);
});

// ====== New Gallery Theme ======
app.get('/gallery', (req, res) => {
  const files = fs.readdirSync(uploadBase);

  if (files.length === 0) {
    return res.send(`
      <body style="font-family:sans-serif;background:#121212;color:white;text-align:center;padding:50px;">
        <h1>😔 No photos uploaded yet</h1>
        <a href='/upload-form' style="color:#00c3ff;font-size:18px;text-decoration:none;">⬆️ Upload Now</a>
      </body>
    `);
  }

  let html = `
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f4f6f9;
        margin: 20px;
      }
      h1 {
        text-align: center;
        color: #333;
      }
      .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      .card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        overflow: hidden;
        transition: transform 0.2s;
      }
      .card:hover {
        transform: scale(1.03);
      }
      .card img {
        width: 100%;
        height: 180px;
        object-fit: cover;
      }
      .card .actions {
        padding: 10px;
        display: flex;
        justify-content: space-between;
      }
      .btn {
        padding: 6px 12px;
        border-radius: 6px;
        text-decoration: none;
        font-size: 14px;
        font-weight: bold;
      }
      .delete-btn {
        background: #e74c3c;
        color: #fff;
        border: none;
        cursor: pointer;
      }
      .download-btn {
        background: #2ecc71;
        color: #fff;
      }
    </style>
  </head>
  <body>
    <h1>📷 Uploaded Photos</h1>
    <div class="gallery">
  `;

  files.forEach(file => {
    html += `
      <div class="card">
        <img src="/uploads/${file}" alt="photo">
        <div class="actions">
          <form action="/delete" method="POST">
            <input type="hidden" name="filename" value="${file}">
            <button type="submit" class="btn delete-btn">🗑 Delete</button>
          </form>
          <a href="/download/${file}" class="btn download-btn">⬇ Download</a>
        </div>
      </div>
    `;
  });

  html += `
    </div>
    <br><center><a href='/'>⬅ Back to Home</a></center>
  </body>
  `;
  res.send(html);
});

// Delete
app.post('/delete', (req, res) => {
  const filePath = path.join(uploadBase, req.body.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.redirect('/gallery');
});

// Download
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadBase, req.params.filename);
  if (fs.existsSync(filePath)) res.download(filePath);
  else res.send("<h2>❌ File not found</h2><a href='/gallery'>Back to Gallery</a>");
});

// Start Server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));