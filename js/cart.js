// ---------------------------------------------------------------
// Cart — stored in localStorage so it survives across pages without
// needing a signed-in customer. Keyed by product id.
// ---------------------------------------------------------------
const CART_KEY = 'crate_cart_v1';

function getCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch(e){ return {}; }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartDrawer();
  updateCartCount();
}
function addToCart(product, qty){
  qty = qty || 1;
  const cart = getCart();
  if (cart[product.id]) {
    cart[product.id].qty += qty;
  } else {
    cart[product.id] = { id: product.id, name: product.name, price: product.price, icon: product.icon, imageUrl: product.imageUrl || null, qty };
  }
  saveCart(cart);
  showToast(product.name + ' added to cart');
  openCart();
}
function changeQty(id, delta){
  const cart = getCart();
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  saveCart(cart);
}
function removeFromCart(id){
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
}
function clearCart(){
  localStorage.removeItem(CART_KEY);
  renderCartDrawer();
  updateCartCount();
}
function cartTotal(){
  const cart = getCart();
  return Object.values(cart).reduce((sum, i) => sum + i.price * i.qty, 0);
}
function cartCount(){
  const cart = getCart();
  return Object.values(cart).reduce((sum, i) => sum + i.qty, 0);
}
function updateCartCount(){
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = cartCount());
}

function renderCartDrawer(){
  const list = document.getElementById('cartItems');
  const foot = document.getElementById('cartFoot');
  if (!list) return;
  const cart = getCart();
  const items = Object.values(cart);
  if (!items.length){
    list.innerHTML = '<div class="cart-empty">Your crate is empty.<br>Add something from the menu.</div>';
    if (foot) foot.style.display = 'none';
    return;
  }
  if (foot) foot.style.display = 'block';
  list.innerHTML = items.map(i => `
    <div class="cart-line">
      <div class="ci-icon">${productArt(i)}</div>
      <div class="ci-info">
        <div class="name">${i.name}</div>
        <div class="unit">${formatPrice(i.price)} each</div>
      </div>
      <div class="qty-ctrl">
        <button onclick="changeQty('${i.id}',-1)" aria-label="Decrease quantity">−</button>
        <span>${i.qty}</span>
        <button onclick="changeQty('${i.id}',1)" aria-label="Increase quantity">+</button>
      </div>
    </div>
  `).join('');
  const totalEl = document.getElementById('cartTotalValue');
  if (totalEl) totalEl.textContent = formatPrice(cartTotal());
}

function openCart(){
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
}
function closeCart(){
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
}

let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// Note: drawer markup is injected later by layout.js (mountLayout), which
// calls renderCartDrawer()/updateCartCount() itself once the DOM exists —
// so no DOMContentLoaded wiring happens in this file.
