
const cartKey = 'lowkey_cart';

// ----- Carrito base -----
function getCart() {
  try {
    const raw = localStorage.getItem(cartKey);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function setCart(items) {
  localStorage.setItem(cartKey, JSON.stringify(items));
  updateCartBadge();
}

// mismo producto + mismo talle
function sameItem(a, b) {
  return (
    a.name === b.name &&
    a.brand === b.brand &&
    a.color === b.color &&
    a.img === b.img &&
    a.size === b.size
  );
}

function isInCart(item) {
  return getCart().some(i => sameItem(i, item));
}

function addItem(item) {
  const items = getCart();
  items.push(item);
  setCart(items);
}

function removeItem(item) {
  const items = getCart().filter(i => !sameItem(i, item));
  setCart(items);
}

// Devuelve true si quedó agregado, false si quedó quitado
function toggleCartItem(item) {
  if (isInCart(item)) {
    removeItem(item);
    toast('Quitado del carrito ✖');
    return false;
  } else {
    addItem(item);
    toast('Agregado al carrito ✔');
    return true;
  }
}

// ----- Badge carrito -----
function updateCartBadge() {
  const el = document.querySelector('[data-cart-badge]');
  if (!el) return;
  const n = getCart().length;
  el.textContent = n > 0 ? String(n) : '0';
}

// ----- Toast -----
function toast(msg) {
  const t = document.querySelector('.toast');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => {
    t.style.display = 'none';
  }, 1500);
}

// ----- Nav activo + badge -----
(function () {
  const page = document.documentElement.dataset.page;
  if (page) {
    document.querySelectorAll('nav a[data-match]').forEach(a => {
      if (a.dataset.match === page) a.classList.add('active');
    });
  }
  updateCartBadge();
})();

// ----- Formateo moneda -----
function currency(v) {
  try {
    const n = Number(String(v).replace(/[^0-9.]/g, ''));
    return n.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    });
  } catch (e) {
    return '$' + v;
  }
}

// ----- Lógica de la página de producto -----
(function () {
  if (!location.pathname.endsWith('product.html')) return;

  const params = new URLSearchParams(location.search);
  const product = {
    name: params.get('name') || 'Producto',
    price: params.get('price') || '0',
    brand: params.get('brand') || '',
    img: params.get('img') || '',
    color: params.get('color') || ''
  };

  const title = document.querySelector('[data-p-name]');
  const price = document.querySelector('[data-p-price]');
  const brand = document.querySelector('[data-p-brand]');
  const color = document.querySelector('[data-p-color]');
  const img = document.querySelector('[data-p-img]');

  if (title) title.textContent = product.name;
  if (price) price.textContent = currency(product.price);
  if (brand) brand.textContent = product.brand;
  if (color && product.color) color.textContent = 'Color: ' + product.color;
  if (img && product.img) img.src = product.img;

  const btn = document.querySelector('[data-add]');
  const sizeSelect = document.querySelector('[data-size]');
  const qtyInput = document.querySelector('[data-qty]');

  if (!btn) return;

  // arma el item actual según talle y cantidad
  function getCurrentItem() {
    const size = sizeSelect?.value || '40';
    const qty = parseInt(qtyInput?.value || '1', 10);
    return { ...product, size, qty };
  }

  // pone el texto correcto en el botón
  function syncButtonLabel() {
    const item = getCurrentItem();
    const exists = isInCart(item);
    btn.textContent = exists ? 'Quitar del carrito' : 'Añadir al carrito';
  }

  // estado inicial
  syncButtonLabel();

  // click => toggle
  btn.addEventListener('click', () => {
    const item = getCurrentItem();
    toggleCartItem(item);
    syncButtonLabel();
  });

  // si cambia el talle, revisa si ese talle ya está en el carrito
  if (sizeSelect) {
    sizeSelect.addEventListener('change', syncButtonLabel);
  }
})();

