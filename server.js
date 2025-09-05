const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// ====== File Upload Base ======
const uploadBase = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadBase)) fs.mkdirSync(uploadBase);

app.use('/uploads', express.static(uploadBase));
app.use(express.urlencoded({ extended: true })); // parse form data

// ====== Multer Setup ======
function createMulter(albumPath) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, albumPath),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });
  return multer({ storage });
}

// ====== Routes ======

// Root
app.get('/', (req, res) => {
  res.send(`
    <h1>📸 Welcome to Photo App</h1>
    <a href="/albums">📂 View Albums</a> | 
    <a href="/create-album">➕ Create Album</a> | 
    <a href="/upload-form">⬆️ Upload Photo</a>
  `);
});

// ====== Album Creation ======
app.get('/create-album', (req, res) => {
  res.send(`
    <h1>Create New Album</h1>
    <form action="/create-album" method="POST">
      <input type="text" name="album" placeholder="Album Name" required />
      <button type="submit">Create</button>
    </form>
    <br><a href="/albums">Back to Albums</a>
  `);
});

app.post('/create-album', (req, res) => {
  const albumPath = path.join(uploadBase, req.body.album);
  if (!fs.existsSync(albumPath)) fs.mkdirSync(albumPath);
  res.redirect('/albums');
});

// ====== Upload Form with Album Selection ======
app.get('/upload-form', (req, res) => {
  const albums = fs.readdirSync(uploadBase, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  let options = albums.map(a => `<option value="${a}">${a}</option>`).join("");

  res.send(`
    <h1>Upload a Photo</h1>
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <label>Select Album:</label>
      <select name="album">${options}</select><br><br>
      <input type="file" name="photos" multiple required />
      <button type="submit">Upload</button>
    </form>
    <br><a href="/albums">Back to Albums</a>
  `);
});

// Handle Upload
app.post('/upload', (req, res, next) => {
  const album = req.body.album || "General";
  const albumPath = path.join(uploadBase, album);

  if (!fs.existsSync(albumPath)) fs.mkdirSync(albumPath);

  const upload = createMulter(albumPath).array('photos');
  upload(req, res, err => {
    if (err) return res.send("Upload error: " + err.message);
    res.redirect(`/album/${album}`);
  });
});

// ====== Modern Albums List with Delete Option ======
app.get('/albums', (req, res) => {
  const albums = fs.readdirSync(uploadBase, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  if (albums.length === 0) {
    return res.send("<h1>😔 No albums created yet</h1><a href='/create-album'>➕ Create one</a>");
  }

  let html = `
  <head>
    <style>
      body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 20px; }
      h1 { text-align: center; color: #333; }
      .albums { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
      .album-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; transition: transform 0.2s; }
      .album-card:hover { transform: scale(1.05); }
      .album-icon { font-size: 50px; color: #f1c40f; }
      .album-title { margin-top: 10px; font-weight: bold; color: #333; text-decoration: none; display: block; }
      form { margin-top: 10px; }
      .delete-btn { background:#e74c3c;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer; }
    </style>
  </head>
  <body>
    <h1>📂 Albums</h1>
    <div class="albums">
  `;

  albums.forEach(album => {
    html += `
      <div class="album-card">
        <div class="album-icon">📁</div>
        <a href="/album/${album}" class="album-title">${album}</a>
        <form action="/delete-album" method="POST">
          <input type="hidden" name="album" value="${album}">
          <button type="submit" class="delete-btn">🗑 Delete Album</button>
        </form>
      </div>
    `;
  });

  html += `
    </div>
    <br><center><a href='/create-album'>➕ Create Album</a></center>
  </body>
  `;
  res.send(html);
});

// ====== Delete Album ======
app.post('/delete-album', (req, res) => {
  const album = req.body.album;
  const albumPath = path.join(uploadBase, album);

  if (fs.existsSync(albumPath)) {
    fs.rmSync(albumPath, { recursive: true, force: true });
  }
  res.redirect('/albums');
});

// ====== Modern Album Gallery ======
app.get('/album/:name', (req, res) => {
  const albumPath = path.join(uploadBase, req.params.name);
  if (!fs.existsSync(albumPath)) return res.send("Album not found");

  const files = fs.readdirSync(albumPath);
  if (files.length === 0) {
    return res.send(`<h1>📸 Album: ${req.params.name}</h1><p>No photos yet.</p><a href='/upload-form'>Upload Now</a>`);
  }

  let html = `
  <head>
    <style>
      body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 20px; }
      h1 { text-align: center; color: #333; }
      .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-top: 20px; }
      .card { background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; transition: transform 0.2s; }
      .card:hover { transform: scale(1.03); }
      .card img { width: 100%; height: 180px; object-fit: cover; transition: transform 0.3s; }
      .card img:hover { transform: scale(1.05); }
      .actions { padding: 10px; display: flex; justify-content: center; }
      .download-btn { background:#2ecc71;color:#fff;padding:6px 12px;border-radius:6px;text-decoration:none; }
    </style>
  </head>
  <body>
    <h1>📸 Album: ${req.params.name}</h1>
    <div class="gallery">
  `;

  files.forEach(file => {
    html += `
      <div class="card">
        <img src="/uploads/${req.params.name}/${file}" alt="photo">
        <div class="actions">
          <a href="/uploads/${req.params.name}/${file}" download class="download-btn">⬇ Download</a>
        </div>
      </div>
    `;
  });

  html += `
    </div>
    <br><center><a href='/albums'>⬅ Back to Albums</a></center>
  </body>
  `;
  res.send(html);
});

// ====== Start Server ======
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));