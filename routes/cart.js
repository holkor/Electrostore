// routes/cart.js
const express = require('express');
const router = express.Router();
const { readJSON } = require('../lib/storage');

const PRODUCTS_FILE = 'products.json';

// GET /api/cart — получить корзину
router.get('/', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ items: cart, count: cart.reduce((s, i) => s + i.quantity, 0), total });
});

// POST /api/cart/add — добавить товар
router.post('/add', async (req, res) => {
  const productId = req.body.productId;
  const quantity = Math.max(1, Number.parseInt(req.body.quantity, 10) || 1);
  if (!req.session.cart) req.session.cart = [];

  const products = await readJSON(PRODUCTS_FILE);
  const product = products.find(p => p.id == productId);
  if (!product) return res.status(404).json({ error: 'Товар не найден' });

  const existing = req.session.cart.find(item => item.id == productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    req.session.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity
    });
  }

  req.session.save(() => {});
  const count = req.session.cart.reduce((s, i) => s + i.quantity, 0);
  res.json({ success: true, count });
});

// POST /api/cart/remove — удалить товар
router.post('/remove', (req, res) => {
  const { productId } = req.body;
  req.session.cart = (req.session.cart || []).filter(item => item.id != productId);
  req.session.save(() => {});
  const total = req.session.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
  res.json({ success: true, total, count });
});

module.exports = router;
