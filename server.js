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

// ====== Multer Default Setup ======
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

// ====== Albums List ======
app.get('/albums', (req, res) => {
  const albums = fs.readdirSync(uploadBase, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  if (albums.length === 0) {
    return res.send("<h1>😔 No albums created yet</h1><a href='/create-album'>➕ Create one</a>");
  }

  let html = "<h1>📂 Albums</h1><ul>";
  albums.forEach(album => {
    html += `<li><a href="/album/${album}">${album}</a></li>`;
  });
  html += "</ul><br><a href='/create-album'>➕ Create Album</a>";
  res.send(html);
});

// ====== Show Album Photos ======
app.get('/album/:name', (req, res) => {
  const albumPath = path.join(uploadBase, req.params.name);
  if (!fs.existsSync(albumPath)) return res.send("Album not found");

  const files = fs.readdirSync(albumPath);
  if (files.length === 0) {
    return res.send(`<h1>📸 Album: ${req.params.name}</h1><p>No photos yet.</p><a href='/upload-form'>Upload Now</a>`);
  }

  let html = `<h1>📸 Album: ${req.params.name}</h1>`;
  files.forEach(file => {
    html += `<img src="/uploads/${req.params.name}/${file}" style="width:150px;margin:5px;">`;
  });
  html += "<br><a href='/albums'>⬅ Back to Albums</a>";
  res.send(html);
});

// ====== Start Server ======
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));