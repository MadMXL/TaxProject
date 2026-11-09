const firebaseConfig = {
  apiKey: "AIzaSyDeVDOI9RfjY9BKrpRBmueg8GBRjAG2lbc",
  authDomain: "baigumgub.firebaseapp.com",
  databaseURL: "https://baigumgub-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "baigumgub",
  storageBucket: "baigumgub.firebasestorage.app",
  messagingSenderId: "499376326897",
  appId: "1:499376326897:web:b3a2ab6f883d4a19178150"
};

let database;
let auth;
let isFirebaseEnabled = false;
let currentUser = null;

// ── INIT ─────────────────────────────────────────────────────
try {
  firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  auth = firebase.auth();
  isFirebaseEnabled = true;
  console.log('Firebase ready');
} catch (e) {
  console.error('Firebase init failed:', e);
}

// ── NOTIFICATIONS ─────────────────────────────────────────────
// Dynamic Island–style pill: grows from a dot into a pill, then shrinks away.
// showNotification(message, { type: 'success'|'error'|'warn'|'info', detail, action: { label, onClick } })
// Type is inferred from a leading ✅ / ❌ / ⚠️ when not given. Click to dismiss.
// An action (e.g. Undo) adds a button and keeps the pill up longer; hovering pauses it.
const ISLAND_ICONS = {
  success: '<path d="M5 12.5l4.2 4.2L19 7"/>',
  error:   '<path d="M7 7l10 10M17 7L7 17"/>',
  warn:    '<path d="M12 7v6M12 17h.01"/>',
  info:    '<path d="M12 11v6M12 7h.01"/>',
};
let _islandTimer = null;

function showNotification(message, opts = {}) {
  const raw = String(message);
  const type = opts.type
    || (/^\s*✅/.test(raw) ? 'success' : /^\s*❌|^error/i.test(raw) ? 'error' : /^\s*⚠|^please/i.test(raw) ? 'warn' : 'info');
  const text = raw.replace(/[✅❌⚠️🗑️🔄]/gu, '').trim();

  document.querySelectorAll('.island').forEach(t => t.remove());
  clearTimeout(_islandTimer);

  const n = document.createElement('div');
  n.className = 'island island-' + type;
  n.setAttribute('role', type === 'error' ? 'alert' : 'status');
  n.innerHTML = `
    <span class="island-dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ISLAND_ICONS[type]}</svg></span>
    <span class="island-body"><span class="island-text"></span>${opts.detail ? '<span class="island-detail"></span>' : ''}</span>
    ${opts.action ? '<button type="button" class="island-action"></button>' : ''}`;
  n.querySelector('.island-text').textContent = text;
  if (opts.detail) n.querySelector('.island-detail').textContent = opts.detail;
  if (opts.action) n.querySelector('.island-action').textContent = opts.action.label;

  const close = () => {
    clearTimeout(_islandTimer);
    n.classList.remove('is-open');
    n.classList.add('is-closing');
    setTimeout(() => n.remove(), 320);
  };
  n.addEventListener('click', (e) => {
    if (opts.action && e.target.closest('.island-action')) opts.action.onClick();
    close();
  });
  const ms = opts.action ? 6000 : type === 'error' ? 4200 : opts.detail ? 3400 : 2600;
  n.addEventListener('mouseenter', () => clearTimeout(_islandTimer));
  n.addEventListener('mouseleave', () => { _islandTimer = setTimeout(close, 1800); });
  document.body.appendChild(n);
  requestAnimationFrame(() => requestAnimationFrame(() => n.classList.add('is-open')));
  _islandTimer = setTimeout(close, ms);
}

// ── READ USER ROLE FROM DATABASE ──────────────────────────────
function getUserRole(uid) {
  return new Promise((resolve) => {
    if (!isFirebaseEnabled) { resolve('sales'); return; }
    database.ref('users/' + uid + '/role').once('value')
      .then(snap => resolve(snap.val() || 'sales'))
      .catch(() => resolve('sales'));
  });
}

function getUserName(uid) {
  return new Promise((resolve) => {
    if (!isFirebaseEnabled) { resolve('User'); return; }
    database.ref('users/' + uid + '/name').once('value')
      .then(snap => resolve(snap.val() || 'User'))
      .catch(() => resolve('User'));
  });
}

// ── SYNC ──────────────────────────────────────────────────────
let isSyncing = false;

// Debounce renderApp so multiple simultaneous Firebase updates
// only cause ONE re-render instead of 4
let _renderTimer = null;
function debouncedRender() {
  if (_renderTimer) clearTimeout(_renderTimer);
  _renderTimer = setTimeout(() => {
    // Don't redraw under someone filling in a document; the new data shows when they leave.
    if (currentView === 'new') return;
    if (typeof renderApp === 'function') renderApp();
  }, 80);
}

function syncToFirebase() {
  if (!isFirebaseEnabled) return;
  database.ref('quotations').set(quotations).catch(e => console.warn('sync error', e));
}

function syncProductsToFirebase() {
  if (!isFirebaseEnabled) return;
  database.ref('products').set(products).catch(e => console.warn('products sync error', e));
}

function syncCompanyInfoToFirebase() {
  if (!isFirebaseEnabled) return;
  database.ref('companyInfo').set(companyInfo).catch(e => console.warn('companyInfo sync error', e));
}

// Company profile is an object, not an array. Only accept a copy saved against the
// current seed (same rule as localStorage) so stale defaults don't win.
function applyCompanyInfo(d) {
  if (!d || typeof d !== 'object' || d._seed !== companyInfo._seed) return false;
  Object.assign(companyInfo, d);
  localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
  return true;
}

// Array-valued paths shared by loadFromFirebase and setupRealtimeSync
const SYNCED_ARRAYS = [
  ['quotations',     d => quotations = d],
  ['purchaseOrders', d => purchaseOrders = d],
  ['poCosts',        d => poCosts = d],
  ['materialPrices', d => materialPrices = d],
  ['customers',      d => customers = d],
  ['products',       d => products = d],
  ['stockItems',     d => stockItems = d],
  ['stockMoves',     d => stockMoves = d],
];

function loadFromFirebase() {
  if (!isFirebaseEnabled) return Promise.resolve();
  const loads = SYNCED_ARRAYS.map(([path, setter]) =>
    database.ref(path).once('value').then(snap => {
      const data = snap.val();
      if (data && Array.isArray(data)) {
        setter(data);
        localStorage.setItem(path, JSON.stringify(data));
      }
    }).catch(e => console.warn('load error', path, e))
  );
  loads.push(
    database.ref('companyInfo').once('value')
      .then(snap => applyCompanyInfo(snap.val()))
      .catch(e => console.warn('load error companyInfo', e))
  );
  return Promise.all(loads);
}

function setupRealtimeSync() {
  if (!isFirebaseEnabled) return;
  SYNCED_ARRAYS.forEach(([path, setter]) => {
    database.ref(path).on('value', (snap) => {
      const data = snap.val();
      if (data && Array.isArray(data)) {
        setter(data);
        localStorage.setItem(path, JSON.stringify(data));
        debouncedRender();
      }
    });
  });
  database.ref('companyInfo').on('value', (snap) => {
    if (applyCompanyInfo(snap.val())) debouncedRender();
  });
}

window.addEventListener('online', () => { if (isFirebaseEnabled) syncToFirebase(); });
