require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// --- Firebase setup ---
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './serviceAccountKey.json';
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Missing Firebase service account JSON. Add FIREBASE_SERVICE_ACCOUNT in .env');
  process.exit(1);
}
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});
const db = admin.firestore();

// --- Express setup ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Upload setup ---
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, unique);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'), false);
    cb(null, true);
  },
});

// --- JWT Auth Middleware ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// =============================
// ======== AUTH ROUTES ========
// =============================


// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const q = await db.collection('users').where('email', '==', email).get();
    if (q.empty) return res.status(400).json({ error: 'Invalid credentials' });

    const doc = q.docs[0];
    const data = doc.data();

    const match = await bcrypt.compare(password, data.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: doc.id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ ok: true, token, user: { id: doc.id, username: data.username, email: data.email, image: data.image } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================
// ======== USER ROUTES ========
// =============================

// Get all users
app.get('/users', authMiddleware, async (req, res) => {
  try {
    const snap = await db.collection('users').get();
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data(), password: undefined }));
    res.json({ ok: true, users });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users
app.get('/users/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ error: 'Missing search query' });

    const keyword = q.toLowerCase();

    const snap = await db.collection('users').get();
    const users = snap.docs
      .map((d) => ({ id: d.id, ...d.data(), password: undefined }))
      .filter((u) =>
        (u.username && u.username.toLowerCase().includes(keyword)) ||
        (u.email && u.email.toLowerCase().includes(keyword))
      );

    res.json({ ok: true, users });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Add new user manually (with optional image)
app.post('/users', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: 'Missing required fields' });

    const exists = await db.collection('users').where('email', '==', email).get();
    if (!exists.empty)
      return res.status(400).json({ error: 'Email already exists' });

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // handle image if exists
    let imageUrl = '';
    if (req.file) {
      imageUrl = `uploads/${req.file.filename}`;
    }

    const newUser = {
      username,
      email,
      password: hashed,
      image: imageUrl,
    };

    const userRef = await db.collection('users').add(newUser);

    res.json({
      ok: true,
      user: { id: userRef.id, username, email, image: imageUrl },
    });
  } catch (err) {
    console.error('Add user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user (username/email/password/image)
app.put('/users/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const id = req.params.id;
    const { username, email, password } = req.body;
    const userRef = db.collection('users').doc(id);
    const snap = await userRef.get();

    if (!snap.exists) return res.status(404).json({ error: 'User not found' });
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      const imageUrl = `uploads/${req.file.filename}`;
      updates.image = imageUrl;
    }

    await userRef.update(updates);
    const updatedSnap = await userRef.get();
    const data = updatedSnap.data();
    res.json({ ok: true, user: { id, username: data.username, email: data.email, image: data.image } });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
app.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const userRef = db.collection('users').doc(id);
    const snap = await userRef.get();
    if (!snap.exists) return res.status(404).json({ error: 'User not found' });
    await userRef.delete();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Static file route for uploaded images
app.use('/uploads', express.static(UPLOAD_DIR));

// Global error handler
app.use((err, req, res, next) => {
  console.error('ERR', err.message);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
