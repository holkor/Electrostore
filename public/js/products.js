async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const products = await res.json();

    let html = '';
    products.forEach(p => {
      html += `
        <div class="card" data-id="${p.id}">
          <div class="card-image">${p.image}</div>
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <p class="price">${p.price.toLocaleString('ru-RU')} ₽</p>
          <button class="js-add-to-cart" data-id="${p.id}">Добавить</button>
        </div>
      `;
    });

    grid.innerHTML = html;

    // Навешиваем обработчики после рендера
    document.querySelectorAll('.js-add-to-cart').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await addToCart(id);
      });
    });

  } catch (err) {
    console.error('❌ Ошибка загрузки товаров:', err);
    grid.innerHTML = '<p style="color:red;text-align:center;">Не удалось загрузить каталог</p>';
  }
}

// Добавление в корзину через API
async function addToCart(productId, quantity = 1) {
  try {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.success) {
      alert('✅ Товар добавлен в корзину!');
      if (typeof updateCartIndicators === 'function') {
        updateCartIndicators({ count: data.count || 0 });
      }
    } else {
      alert('❌ Ошибка: ' + data.error);
    }
  } catch (err) {
    console.error('Ошибка добавления:', err);
    alert('❌ Не удалось добавить товар в корзину');
  }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', loadProducts);
