// public/js/global.js
// Глобальные функции, используемые на всех страницах ElectroStore.
// Подключается ПЕРВЫМ, до страничных скриптов (products.js, cart.js, profile.js).

// --- Защита от XSS ---
// Экранирует HTML-сущности в строке. Использовать при выводе любых данных,
// пришедших с сервера, через innerHTML.
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- Универсальный fetch с JSON ---
async function requestJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

// --- Корзина: счётчик в шапке ---
async function updateCartCount() {
  try {
    const data = await requestJSON('/api/cart', { method: 'GET' });
    const countEl = document.getElementById('cart-count');
    const itemsCountEl = document.getElementById('cart-items-count');
    const totalEl = document.getElementById('cart-total');

    if (countEl) countEl.textContent = data.count || 0;
    if (itemsCountEl) itemsCountEl.textContent = data.count || 0;
    if (totalEl) totalEl.textContent = `${(data.total || 0).toLocaleString('ru-RU')} ₽`;
  } catch (err) {
    console.error('Не удалось обновить счётчик корзины:', err);
  }
}

// --- Корзина: добавление товара ---
async function addToCart(productId, quantity = 1) {
  try {
    const data = await requestJSON('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
    if (data.success) {
      await updateCartCount();
    }
    return data;
  } catch (err) {
    console.error('Ошибка добавления в корзину:', err);
    alert('Не удалось добавить товар в корзину: ' + err.message);
    return null;
  }
}

// --- Авторизация: текущий пользователь ---
// Возвращает { id, name, email } или null, если пользователь не авторизован.
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Ошибка проверки авторизации:', err);
    return null;
  }
}

// --- Инициализация при загрузке страницы ---
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
});

// Экспорт в глобальную область, чтобы страничные скрипты могли использовать
window.escapeHtml = escapeHtml;
window.requestJSON = requestJSON;
window.updateCartCount = updateCartCount;
window.addToCart = addToCart;
window.checkAuth = checkAuth;
