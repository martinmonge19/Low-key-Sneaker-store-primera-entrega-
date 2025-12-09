// Simple cart using localStorage
const cartKey = 'lowkey_cart';

function getCart(){ try{return JSON.parse(localStorage.getItem(cartKey))||[]}catch(e){return[]} }
function setCart(items){ localStorage.setItem(cartKey, JSON.stringify(items)); updateCartBadge(); }

function addToCart(item){
  const items = getCart();
  items.push(item);
  setCart(items);
  toast('Agregado al carrito ✔');
}

function updateCartBadge(){
  const el = document.querySelector('[data-cart-badge]');
  if(!el) return;
  const n = getCart().length;
  el.textContent = n>0 ? n : '0';
}

function toast(msg){
  const t = document.querySelector('.toast');
  if(!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(()=>{t.style.display='none'}, 1500);
}

// Highlight active nav item by data-page
(function(){
  const page = document.documentElement.dataset.page;
  if(!page) return;
  document.querySelectorAll('nav a').forEach(a=>{
    if(a.dataset.match === page) a.classList.add('active');
  });
  updateCartBadge();
})();

// Helpers to build product links to product.html with URL parameters
function productLink(p){
  const url = new URL('product.html', window.location.href);
  Object.entries(p).forEach(([k,v])=>url.searchParams.set(k, v));
  return url.toString();
}

// On product.html: read params and render
(function(){
  if(!location.pathname.endsWith('product.html')) return;
  const params = new URLSearchParams(location.search);
  const product = {
    name: params.get('name') || 'Producto',
    price: params.get('price') || '0',
    brand: params.get('brand') || '',
    img: params.get('img') || '',
    color: params.get('color') || ''
  };
  // Fill DOM
  const title = document.querySelector('[data-p-name]');
  const price = document.querySelector('[data-p-price]');
  const brand = document.querySelector('[data-p-brand]');
  const color = document.querySelector('[data-p-color]');
  const img = document.querySelector('[data-p-img]');

  if(title) title.textContent = product.name;
  if(price) price.textContent = currency(product.price);
  if(brand) brand.textContent = product.brand;
  if(color && product.color) color.textContent = 'Color: ' + product.color;
  if(img && product.img) img.src = product.img;

  const btn = document.querySelector('[data-add]');
  if(btn){
    btn.addEventListener('click', ()=>{
      const size = document.querySelector('[data-size]')?.value || '40';
      const qty = parseInt(document.querySelector('[data-qty]')?.value || '1',10);
      addToCart({ ...product, size, qty });
    });
  }
})();

function currency(v){
  try{
    const n = Number(String(v).replace(/[^0-9.]/g,''));
    return n.toLocaleString('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 });
  }catch(e){ return '$' + v; }
}



// ==== LINKS DE DETALLE EN ADIDAS Y PUMA ====
(function(){
  const page = document.documentElement.dataset.page;
  if(page !== 'adidas' && page !== 'puma') return;

  const brand = page === 'adidas' ? 'Adidas' : 'Puma';

  document.querySelectorAll('.card').forEach(card=>{
    const link = card.querySelector('.actions a.btn');
    if(!link) return;

    const titleEl = card.querySelector('.title');
    const priceEl = card.querySelector('.price');
    const imgEl   = card.querySelector('img');

    const name  = titleEl ? titleEl.textContent.trim() : 'Producto';
    const price = priceEl ? priceEl.textContent.trim() : '0';
    const img   = imgEl ? imgEl.getAttribute('src') : '';

    link.addEventListener('click', (ev)=>{
      ev.preventDefault();
      const url = productLink({
        name,
        price,
        brand,
        img,
        color:''
      });
      window.location.href = url;
    });
  });
})();

// ==== PROMOCIONES EN HOME (index) ====
(function(){
  const page = document.documentElement.dataset.page;
  if(page !== 'home') return;

  const container = document.querySelector('[data-promos]');
  if(!container) return;

  const DISCOUNT = 0.30; // 30% de descuento

  const promos = [
    {
      brand:'Adidas',
      name:'Adidas Campus Negras',
      price:109999,
      img:'images/campusNegras.jpeg'
    },
    {
      brand:'Adidas',
      name:'Adidas Campus Marrones',
      price:109999,
      img:'images/campusMarrones.jpeg'
    },
    {
      brand:'Puma',
      name:'Puma Suede XL Azules',
      price:89999,
      img:'images/azulesxl.jpeg'
    }
  ];

  promos.forEach(p=>{
    const finalPrice = Math.round(p.price * (1 - DISCOUNT));

    const article = document.createElement('article');
    article.className = 'product';

    article.innerHTML = `
      <div class="pimg">
        <img src="${p.img}" alt="${p.name}">
      </div>
      <div class="meta">
        <div class="name">${p.name}</div>
        <div class="muted">
          ${ (DISCOUNT*100).toFixed(0) }% OFF · antes ${currency(p.price)} ahora ${currency(finalPrice)}
        </div>
        <div class="price">${currency(finalPrice)}</div>
        <div class="actions">
          <button class="btn" data-promo-add>Añadir promo</button>
        </div>
      </div>
    `;

    const btn = article.querySelector('[data-promo-add]');
    btn.addEventListener('click', ()=>{
      addToCart({
        name: p.name + ' (promo)',
        brand: p.brand,
        price: finalPrice,
        qty: 1,
        size: '40'
      });
    });

    container.appendChild(article);
  });
})();

// ==== PÁGINA DE CARRITO (cart.html) ====
(function(){
  const page = document.documentElement.dataset.page;
  if(page !== 'cart') return;

  const listEl   = document.querySelector('[data-cart-list]');
  const totalEl  = document.querySelector('[data-cart-total]');
  const emptyEl  = document.querySelector('[data-cart-empty]');

  function parseNumber(v){
    return Number(String(v).replace(/[^0-9.]/g,'')) || 0;
  }

  function renderCartPage(){
    const items = getCart();
    listEl.innerHTML = '';
    let total = 0;

    if(!items.length){
      if(emptyEl) emptyEl.style.display = 'block';
      if(totalEl) totalEl.textContent = currency(0);
      return;
    }else{
      if(emptyEl) emptyEl.style.display = 'none';
    }

    items.forEach((item, index)=>{
      const unit = parseNumber(item.price);
      const qty  = item.qty ? Number(item.qty) : 1;
      const subtotal = unit * qty;
      total += subtotal;

      const card = document.createElement('div');
      card.className = 'cart-item';

      card.innerHTML = `
        <div class="line-top">
          <div class="name">${item.name || 'Producto'}</div>
          <div class="price">${currency(subtotal)}</div>
        </div>
        <div class="muted">
          Talle ${item.size || '-'} · Cantidad ${qty}
        </div>
        <div class="actions">
          <button class="btn btn-remove" data-remove>Quitar</button>
        </div>
      `;

      const btnRemove = card.querySelector('[data-remove]');
      btnRemove.addEventListener('click', ()=>{
        const current = getCart();
        current.splice(index, 1);
        setCart(current);
        renderCartPage();
      });

      listEl.appendChild(card);
    });

    if(totalEl){
      totalEl.textContent = currency(total);
    }
  }

  renderCartPage();
})();
