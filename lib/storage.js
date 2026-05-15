// lib/storage.js
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

const ensureDir = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
};

exports.readJSON = async (filename) => {
  await ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

exports.writeJSON = async (filename, data) => {
  await ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};