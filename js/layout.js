const CRATE_MARK = `<svg class="crate-mark" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round">
  <rect x="10" y="34" width="80" height="54" class="stamp-line"/>
  <path d="M10 34 50 12l40 22" class="stamp-ring"/>
  <path d="M10 60h80M40 34v54M60 34v54" class="stamp-line"/>
</svg>`;

function renderHeader(active){
  const links = [
    ['index.html', 'Home', 'home'],
    ['menu.html', 'Menu', 'menu'],
    ['location.html', 'Location & Hours', 'location'],
    ['about.html', 'About', 'about'],
    ['contact.html', 'Contact', 'contact']
  ];
  const linkHtml = links.map(([href, label, key]) =>
    `<a href="${href}" class="${active === key ? 'current' : ''}">${label}</a>`
  ).join('');

  return `
  <nav class="site-nav">
    <div class="wrap">
      <a href="index.html" class="brand">${CRATE_MARK} Crate Coffee Co</a>
      <div class="nav-links" id="navLinks">${linkHtml}</div>
      <div class="nav-cart">
        <button class="cart-btn" id="cartOpenBtn">Crate <span class="cart-count">0</span></button>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">☰</button>
      </div>
    </div>
  </nav>`;
}

function cartDrawerMarkup(){
  return `
  <div class="cart-overlay" id="cartOverlay"></div>
  <div class="cart-drawer" id="cartDrawer">
    <div class="cart-head">
      <h3>Your crate</h3>
      <button class="cart-close" id="cartCloseBtn" aria-label="Close cart">✕</button>
    </div>
    <div class="cart-items" id="cartItems"></div>
    <div class="cart-foot" id="cartFoot" style="display:none">
      <div class="cart-total-row"><span>Total</span><span id="cartTotalValue">$0.00</span></div>
      <a href="checkout.html" class="btn btn-gold btn-block">Checkout</a>
    </div>
  </div>
  <div class="toast" id="toast"></div>`;
}

function renderFooter(settings){
  const s = settings || DEFAULT_SETTINGS;
  return `
  <footer>
    <div class="wrap">
      <div class="foot-grid">
        <div>
          <a href="index.html" class="brand" style="margin-bottom:14px;">${CRATE_MARK} Crate Coffee Co</a>
          <p style="max-width:32ch;">Coffee and bakes on High Road, Loughton. Poured slow, priced in dollars.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <a href="menu.html">Menu</a>
          <a href="location.html">Location & hours</a>
          <a href="about.html">About us</a>
          <a href="contact.html">Contact</a>
          <a href="track-order.html">Track order</a>
        </div>
        <div>
          <h4>Get in touch</h4>
          <a href="tel:${s.phone}">${s.phone}</a>
          <a href="mailto:${s.email}">${s.email}</a>
          <a href="location.html">${s.address}</a>
        </div>
        <div>
          <h4>Follow</h4>
          <a href="${s.instagram}" target="_blank" rel="noopener">Instagram</a>
          <a href="${s.tiktok}" target="_blank" rel="noopener">TikTok</a>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© ${new Date().getFullYear()} Crate Coffee Co. All rights reserved.</span>
        <span>Demo site — <a href="admin/login.html" style="text-decoration:underline;display:inline">Admin panel</a></span>
      </div>
    </div>
  </footer>`;
}

function esc(value){
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function renderPlaceSide(settings){
  const s = settings || DEFAULT_SETTINGS;
  const hours = (s.hours || []).map(h =>
    `<div class="place-row"><span>${esc(h.day)}</span><span>${esc(h.time)}</span></div>`
  ).join('');
  const places = (s.places || []).map(p =>
    `<li><strong>${esc(p.name)}</strong><span>${esc(p.note)}</span></li>`
  ).join('');
  const maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s.address || '');
  return `
    <div class="place-kicker">Loughton</div>
    <h3>Find the shop</h3>
    <p class="place-address">${s.address || ''}</p>
    <a class="place-dir" href="${maps}" target="_blank" rel="noopener">Get directions</a>
    <h4>Hours</h4>
    ${hours}
    <h4>Around the shop</h4>
    <ul class="place-list">${places}</ul>`;
}

async function mountLayout(active){
  document.getElementById('site-header').innerHTML = renderHeader(active);
  document.getElementById('cart-mount').innerHTML = cartDrawerMarkup();

  // Cart drawer now exists in the DOM — wire it up and do the first render.
  document.getElementById('cartOpenBtn')?.addEventListener('click', openCart);
  document.getElementById('cartCloseBtn')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('navToggle')?.addEventListener('click', () => {
    document.getElementById('navLinks')?.classList.toggle('open');
  });
  updateCartCount();
  renderCartDrawer();

  const settings = await fetchSettings();
  document.getElementById('site-footer').innerHTML = renderFooter(settings);
  return settings;
}
