// routes/products.js
const express = require('express');
const router = express.Router();
const { readJSON } = require('../lib/storage');

const PRODUCTS_FILE = 'products.json';

// GET /api/products — все товары
router.get('/', async (req, res) => {
  try {
    const products = await readJSON(PRODUCTS_FILE);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Не удалось загрузить каталог' });
  }
});

// GET /api/products/:id — товар по ID
router.get('/:id', async (req, res) => {
  try {
    const products = await readJSON(PRODUCTS_FILE);
    const product = products.find(p => p.id == req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка поиска' });
  }
});

module.exports = router;