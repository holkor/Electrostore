const fs = require('fs').promises;
const path = require('path');
const Datastore = require('nedb-promises');
const { readJSON } = require('./storage');

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'users.db');
const LEGACY_USERS_FILE = 'users.json';

const usersDb = Datastore.create({
  filename: DB_FILE,
  autoload: true
});

let initialized = false;

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function initializeUserStore() {
  if (initialized) {
    return;
  }

  await ensureDataDir();
  await usersDb.ensureIndex({ fieldName: 'email', unique: true });

  const usersCount = await usersDb.count({});
  if (usersCount === 0) {
    const legacyUsers = await readJSON(LEGACY_USERS_FILE);
    if (legacyUsers.length > 0) {
      const docs = legacyUsers.map((user) => ({
        id: user.id || Date.now().toString(),
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt || new Date().toISOString(),
        lastLogin: user.lastLogin || null
      }));
      await usersDb.insert(docs);
    }
  }

  initialized = true;
}

async function findUserByEmail(email) {
  await initializeUserStore();
  return usersDb.findOne({ email });
}

async function createUser({ name, email, passwordHash }) {
  await initializeUserStore();
  return usersDb.insert({
    id: Date.now().toString(),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
    lastLogin: null
  });
}

async function updateLastLogin(id) {
  await initializeUserStore();
  const lastLogin = new Date().toISOString();
  await usersDb.update({ id }, { $set: { lastLogin } });
  return lastLogin;
}

module.exports = {
  initializeUserStore,
  findUserByEmail,
  createUser,
  updateLastLogin
};
