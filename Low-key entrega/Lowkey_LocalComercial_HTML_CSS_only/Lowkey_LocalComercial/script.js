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