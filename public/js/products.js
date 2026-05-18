// public/js/products.js
// Загрузка каталога товаров и навешивание обработчиков "Добавить в корзину".
// Требует подключения global.js перед этим файлом.

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  try {
    const products = await requestJSON('/api/products', { method: 'GET' });

    let html = '';
    products.forEach(p => {
      html += `
        <div class="card" data-id="${escapeHtml(p.id)}">
          <div class="card-image">${escapeHtml(p.image)}</div>
          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.description)}</p>
          <p class="price">${Number(p.price).toLocaleString('ru-RU')} ₽</p>
          <button class="js-add-to-cart" data-id="${escapeHtml(p.id)}">Добавить</button>
        </div>
      `;
    });

    grid.innerHTML = html;

    // Навешиваем обработчики после рендера
    document.querySelectorAll('.js-add-to-cart').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const result = await addToCart(id, 1);
        if (result && result.success) {
          alert('Товар добавлен в корзину ✅');
        }
      });
    });
  } catch (err) {
    console.error('Ошибка загрузки товаров:', err);
    grid.innerHTML = '<p style="color:red;text-align:center;">Не удалось загрузить каталог</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);
