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
function showNotification(message) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const n = document.createElement('div');
  n.className = 'toast';
  n.textContent = String(message).replace(/[✅❌⚠️🗑️]/g, '').trim();
  document.body.appendChild(n);
  setTimeout(() => { n.style.transition = 'opacity .3s'; n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }, 2600);
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
    if (typeof renderApp === 'function') renderApp();
  }, 80);
}

function syncToFirebase() {
  if (!isFirebaseEnabled) return;
  database.ref('quotations').set(quotations).catch(e => console.warn('sync error', e));
}

function loadFromFirebase() {
  return new Promise((resolve) => {
    if (!isFirebaseEnabled) { resolve(); return; }
    database.ref('quotations').once('value')
      .then(snap => {
        const data = snap.val();
        if (data && Array.isArray(data)) {
          quotations = data;
          localStorage.setItem('quotations', JSON.stringify(quotations));
        }
        // Also load purchase orders
        return database.ref('purchaseOrders').once('value');
      })
      .then(snap => {
        const data = snap.val();
        if (data && Array.isArray(data)) purchaseOrders = data;
        return database.ref('poCosts').once('value');
      })
      .then(snap => {
        const data = snap.val();
        if (data && Array.isArray(data)) poCosts = data;
        return database.ref('materialPrices').once('value');
      })
      .then(snap => {
        const data = snap.val();
        if (data && Array.isArray(data)) materialPrices = data;
        resolve();
      })
      .catch(() => resolve());
  });
}

function setupRealtimeSync() {
  if (!isFirebaseEnabled) return;
  const listen = (path, setter, localKey) => {
    database.ref(path).on('value', (snap) => {
      const data = snap.val();
      if (data && Array.isArray(data)) {
        setter(data);
        if (localKey) localStorage.setItem(localKey, JSON.stringify(data));
        debouncedRender();
      }
    });
  };
  listen('quotations',     d => quotations = d,      'quotations');
  listen('purchaseOrders', d => purchaseOrders = d,  'purchaseOrders');
  listen('poCosts',        d => poCosts = d,         'poCosts');
  listen('materialPrices', d => materialPrices = d,  'materialPrices');
}

window.addEventListener('online', () => { if (isFirebaseEnabled) syncToFirebase(); });
