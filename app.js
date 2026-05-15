// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const FileStore = require('session-file-store')(session);
const { initializeUserStore } = require('./lib/userStore');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/lib', express.static(path.join(__dirname, 'lib')));

// Сессии (для корзины и авторизации)
app.use(session({
  store: new FileStore({
    path: path.join(DATA_DIR, 'sessions'),
    retries: 0
  }),
  secret: process.env.SESSION_SECRET || 'electrostore-dev-secret',
  resave: false,
  saveUninitialized: false,
  name: 'electrostore.sid',
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// 🔗 Роуты (только необходимые)
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/auth', require('./routes/auth'));

// Главная
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Запуск
async function startServer() {
  await initializeUserStore();

  app.listen(PORT, () => {
    console.log(`⚡ ElectroStore: http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Не удалось запустить сервер:', error);
  process.exit(1);
});
