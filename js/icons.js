// Crate Coffee Co — stamp-style line icons, used as placeholder product art.
// Single-color, currentColor-based so they inherit the ink/gold palette.
// Swap these for real product photography before going live.

const ICONS = {
  cake: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M50 14c-3 0-5 3-5 6s2 5 5 5 5-2 5-5-2-6-5-6Z"/>
    <path d="M50 25v8"/>
    <path d="M22 78V52c0-6 5-10 11-10h34c6 0 11 4 11 10v26"/>
    <path d="M18 78h64"/>
    <path d="M22 62c4 3 8 3 12 0s8-3 12 0 8 3 12 0 8-3 12 0"/>
    <path d="M30 42v-6c0-3 2-5 5-5h30c3 0 5 2 5 5v6"/>
  </svg>`,
  cake2: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="50" cy="30" rx="26" ry="9"/>
    <path d="M24 30v20c0 5 11.5 9 26 9s26-4 26-9V30"/>
    <path d="M24 50v20c0 5 11.5 9 26 9s26-4 26-9V50"/>
    <path d="M50 15v6"/>
  </svg>`,
  pastry: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 62c4-24 20-38 32-38 8 0 12 6 10 12-2 5-8 5-9 0-1-4 2-7 6-6 10 3 15 16 9 27-7 13-27 18-48 5Z"/>
    <path d="M24 58c6 2 12 2 18-1"/>
    <path d="M34 66c6 2 13 1 19-3"/>
  </svg>`,
  cookie: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="32"/>
    <circle cx="38" cy="42" r="3.4" fill="currentColor" stroke="none"/>
    <circle cx="58" cy="36" r="3.4" fill="currentColor" stroke="none"/>
    <circle cx="63" cy="56" r="3.4" fill="currentColor" stroke="none"/>
    <circle cx="44" cy="62" r="3.4" fill="currentColor" stroke="none"/>
    <circle cx="55" cy="52" r="3" fill="currentColor" stroke="none"/>
  </svg>`,
  bottle: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M42 12h16"/>
    <path d="M45 12v10l-9 10c-3 3-4 6-4 10v34c0 4 3 7 7 7h22c4 0 7-3 7-7V42c0-4-1-7-4-10l-9-10V12"/>
    <path d="M32 60h36"/>
    <path d="M40 70h20"/>
  </svg>`,
  cup: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 38h44l-4 32c-.6 5-5 9-10 9H36c-5 0-9.4-4-10-9l-4-32Z"/>
    <path d="M66 42h6c6 0 10 4 10 9s-4 9-10 9h-4"/>
    <path d="M34 20c-2 4-2 6 0 10M46 20c-2 4-2 6 0 10M58 20c-2 4-2 6 0 10" opacity=".65"/>
  </svg>`,
  crate: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <rect x="14" y="30" width="72" height="52" rx="2"/>
    <path d="M14 46h72M14 66h72M38 30v52M62 30v52"/>
    <path d="M14 30 50 14l36 16"/>
  </svg>`,
  leaf: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M26 78C20 46 44 20 78 20c4 30-20 54-52 58Z"/>
    <path d="M28 76C42 58 56 46 74 26"/>
  </svg>`
};

function iconMarkup(key){
  return ICONS[key] || ICONS.cake;
}

// Prefers a real uploaded photo (product.imageUrl, set from the admin panel)
// and falls back to the stamp icon set so the demo always looks complete.
// Safe to drop into a single-quoted HTML attribute, e.g. onclick='fn(${jsonAttr(p)})'.
// JSON.stringify already escapes internal double quotes; this additionally
// escapes apostrophes so names like "Mom's Cake" don't break the markup.
function jsonAttr(obj){
  return JSON.stringify(obj).replace(/'/g, '&#39;');
}

function escapeAttr(value){
  return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function productImageSrc(url){
  if (!url || /^(https?:|data:|\/)/.test(url)) return url;
  return (/\/admin\//.test(location.pathname) ? '../' : '') + url;
}

function productArt(product){
  if (product && product.imageUrl){
    return `<img src="${escapeAttr(productImageSrc(product.imageUrl))}" alt="${escapeAttr(product.name || 'Coffee')}" loading="lazy">`;
  }
  return iconMarkup(product && product.icon);
}
