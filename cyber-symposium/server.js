import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'registrations.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/register', async (req, res) => {
  try {
    const registration = {
      fullName: (req.body.fullName || '').trim(),
      email: (req.body.email || '').trim().toLowerCase(),
      organization: (req.body.organization || '').trim(),
      role: (req.body.role || '').trim(),
      interests: Array.isArray(req.body.interests) ? req.body.interests : (req.body.interests ? [req.body.interests] : []),
      attendance: (req.body.attendance || '').trim(),
      tshirtSize: (req.body.tshirtSize || '').trim(),
      agree: Boolean(req.body.agree),
      timestamp: new Date().toISOString()
    };

    if (!registration.fullName || !registration.email || !registration.attendance || !registration.agree) {
      return res.status(400).json({ ok: false, error: 'Missing required fields.' });
    }

    await fs.ensureDir(DATA_DIR);
    const existing = (await fs.pathExists(DATA_FILE)) ? await fs.readJson(DATA_FILE) : [];
    existing.push(registration);
    await fs.writeJson(DATA_FILE, existing, { spaces: 2 });

    res.json({ ok: true, message: 'Registration successful.' });
  } catch (err) {
    console.error('Registration error', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Cyber Symposium app running on http://localhost:${PORT}`);
});

