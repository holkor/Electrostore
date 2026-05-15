// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const {
  findUserByEmail,
  createUser,
  updateLastLogin
} = require('../lib/userStore');

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name || !email || password.length < 6) {
      return res.status(400).json({ error: 'Заполните все поля (пароль ≥ 6 символов)' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email уже зарегистрирован' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser({ name, email, passwordHash });

    req.session.user = { id: newUser.id, name: newUser.name, email: newUser.email };
    await saveSession(req);

    res.status(201).json({ success: true, redirect: '/' });
  } catch (err) {
    if (err && err.errorType === 'uniqueViolated') {
      return res.status(409).json({ error: 'Email уже зарегистрирован' });
    }
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const lastLogin = await updateLastLogin(user.id);

    req.session.user = { id: user.id, name: user.name, email: user.email };
    await saveSession(req);
    res.json({
      success: true,
      redirect: '/',
      user: { id: user.id, name: user.name, email: user.email, lastLogin }
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('electrostore.sid');
    res.json({ success: true });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  res.json(req.session.user || null);
});

module.exports = router;
