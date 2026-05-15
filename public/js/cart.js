async function loadCart() {
  const container = document.getElementById('cart-items');
  if (!container) {
    await refreshCartSummary();
    return;
  }

  try {
    const res = await fetch('/api/cart');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const { items, total, count } = await res.json();

    if (items.length === 0) {
      container.innerHTML = '<p>Корзина пуста 🛒</p>';
      updateCartIndicators({ total: 0, count: 0 });
      return;
    }

    let html = '';
    items.forEach(item => {
      const sum = item.price * item.quantity;
      html += `
        <div class="cart-item" data-id="${item.id}">
          <h4>${item.name}</h4>
          <p>${item.price.toLocaleString('ru-RU')} ₽ × ${item.quantity} = ${sum.toLocaleString('ru-RU')} ₽</p>
          <button class="js-remove-from-cart" data-id="${item.id}">Удалить</button>
        </div>
      `;
    });

    container.innerHTML = html;

    // Навешиваем обработчики удаления
    document.querySelectorAll('.js-remove-from-cart').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await removeFromCart(id);
      });
    });

    updateCartIndicators({ total, count });

  } catch (err) {
    console.error('❌ Ошибка загрузки корзины:', err);
    container.innerHTML = '<p>Не удалось загрузить корзину</p>';
  }
}

// Удаление товара через API
async function removeFromCart(productId) {
  try {
    const res = await fetch('/api/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.success) {
      await loadCart();
    }
  } catch (err) {
    console.error('Ошибка удаления:', err);
  }
}

function updateCartIndicators({ total = 0, count = 0 }) {
  const totalEl = document.getElementById('cart-total');
  const countEl = document.getElementById('cart-count');
  const itemsCountEl = document.getElementById('cart-items-count');

  if (totalEl) totalEl.textContent = `${total.toLocaleString('ru-RU')} ₽`;
  if (countEl) countEl.textContent = count || 0;
  if (itemsCountEl) itemsCountEl.textContent = count || 0;
}

async function refreshCartSummary() {
  try {
    const res = await fetch('/api/cart');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const { total, count } = await res.json();
    updateCartIndicators({ total, count });
  } catch (err) {
    console.error('Не удалось обновить сводку корзины:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});

window.updateCartIndicators = updateCartIndicators;
