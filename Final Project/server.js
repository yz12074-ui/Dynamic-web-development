// 1. library imports
const express = require('express');
const multer = require('multer');
const fs = require('fs');

// nedb 1.8.0 uses util.isDate() which was removed in modern Node.js
require('util').isDate = (obj) => obj instanceof Date;
const Datastore = require('nedb');

// 2. app initialization
const app = express();

// ensure data/ directory exists before nedb tries to write to it
fs.mkdirSync('data', { recursive: true });

const db = new Datastore({ filename: 'data/gallery.db', autoload: true });

// 3. middleware
app.use(express.static('client'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const upload = multer({ dest: 'client/upload/' });

// POST /upload
// Accepts: multipart/form-data
//   - caption (string, required)
//   - blob    (file, optional)
// Inserts a new gallery entry into nedb. If a file is attached, its path and
// metadata are stored alongside the caption. Caption-only entries are valid.
app.post('/upload', upload.single('blob'), (req, res) => {
    const { caption } = req.body;

    if (!caption || caption.trim() === '') {
        return res.status(400).json({ error: 'caption is required' });
    }

    const entry = {
        caption: caption.trim(),
        createdAt: new Date(),
    };

    if (req.file) {
        entry.src = `upload/${req.file.filename}`;
        entry.originalName = req.file.originalname;
        entry.mimetype = req.file.mimetype;
    }

    db.insert(entry, (err, doc) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(doc);
    });
});

// GET /gallery
// Returns all gallery entries sorted by newest first.
app.get('/gallery', (req, res) => {
    db.find({}).sort({ createdAt: -1 }).exec((err, docs) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(docs);
    });
});

// LAST: start the server
app.listen(5003, () => {
    console.log('server is running on port 5003');
});