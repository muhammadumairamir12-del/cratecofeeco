// ---------------------------------------------------------------
// Admin shell — sidebar + auth guard, shared by every admin page.
// Pages call renderAdminShell('products') then do their own thing
// once auth.onAuthStateChanged confirms a signed-in admin.
// ---------------------------------------------------------------
function adminSidebar(active){
  const links = [
    ['dashboard.html', 'Dashboard', 'dashboard'],
    ['products.html', 'Products', 'products'],
    ['orders.html', 'Orders', 'orders'],
    ['settings.html', 'Hours & info', 'settings'],
    ['reports.html', 'Reports', 'reports']
  ];
  return `
  <div class="admin-side">
    <a href="dashboard.html" class="brand" style="color:var(--paper-soft);">Crate Admin</a>
    <nav>
      ${links.map(([href, label, key]) => `<a href="${href}" class="${active === key ? 'current' : ''}">${label}</a>`).join('')}
      <a href="#" id="logoutLink">Log out</a>
    </nav>
  </div>`;
}

function renderAdminShell(active){
  const mount = document.getElementById('admin-sidebar');
  if (mount) mount.outerHTML = adminSidebar(active);
  document.getElementById('logoutLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => location.href = 'login.html');
  });
}

// Redirects to login.html if nobody is signed in. Resolves with the user
// once confirmed, so each page can await it before loading data.
function requireAdmin(){
  return new Promise((resolve) => {
    auth.onAuthStateChanged(user => {
      if (!user) { location.href = 'login.html'; return; }
      resolve(user);
    });
  });
}

function statusPillClass(status){
  return {
    'Received': 'pill-received',
    'Preparing': 'pill-preparing',
    'Ready': 'pill-ready',
    'Completed': 'pill-completed',
    'Cancelled': 'pill-cancelled'
  }[status] || 'pill-received';
}

function fmtDate(ts){
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function isToday(ts){
  if (!ts || !ts.toDate) return false;
  const d = ts.toDate();
  const now = new Date();
  return d.toDateString() === now.toDateString();
}
