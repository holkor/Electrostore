// public/js/cart.js
// Отображение содержимого корзины и удаление товаров.
// Требует подключения global.js перед этим файлом.

async function loadCart() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  try {
    const data = await requestJSON('/api/cart', { method: 'GET' });
    const { items, total, count } = data;

    if (!items || items.length === 0) {
      container.innerHTML = `
        <p>Корзина пуста 🛒<br>
        <small>Добавьте товары на странице "Товары"</small></p>
      `;
      updateCartCount();
      return;
    }

    let html = '';
    items.forEach(item => {
      const sum = item.price * item.quantity;
      html += `
        <div class="cart-item" data-id="${escapeHtml(item.id)}">
          <h4>${escapeHtml(item.name)}</h4>
          <p>${Number(item.price).toLocaleString('ru-RU')} ₽ × ${item.quantity}
             = <strong>${sum.toLocaleString('ru-RU')} ₽</strong></p>
          <button class="js-remove-from-cart" data-id="${escapeHtml(item.id)}">Удалить</button>
        </div>
      `;
    });
    container.innerHTML = html;

    document.querySelectorAll('.js-remove-from-cart').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await removeFromCart(id);
      });
    });

    // Обновляем счётчики через global.js
    const totalEl = document.getElementById('cart-total');
    const itemsCountEl = document.getElementById('cart-items-count');
    const countEl = document.getElementById('cart-count');
    if (totalEl) totalEl.textContent = `${total.toLocaleString('ru-RU')} ₽`;
    if (itemsCountEl) itemsCountEl.textContent = count;
    if (countEl) countEl.textContent = count;
  } catch (err) {
    console.error('Ошибка загрузки корзины:', err);
    container.innerHTML = '<p>Не удалось загрузить корзину</p>';
  }
}

async function removeFromCart(productId) {
  try {
    const data = await requestJSON('/api/cart/remove', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
    if (data.success) {
      await loadCart();
    }
  } catch (err) {
    console.error('Ошибка удаления:', err);
    alert('Не удалось удалить товар: ' + err.message);
  }
}

document.addEventListener('DOMContentLoaded', loadCart);
