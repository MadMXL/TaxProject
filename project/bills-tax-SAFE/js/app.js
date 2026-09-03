document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Bills & Tax Manager App Started');
    
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('✅ Service Worker registered:', registration);
        } catch (error) {
            console.log('❌ Service Worker registration failed:', error);
        }
    }
    
    loadFromLocalStorage();
    
    await loadFromFirebase();
    
    console.log('📊 Loaded ' + quotations.length + ' quotations');
    
    // Make sure renderApp is loaded before calling it
    if (typeof renderApp === 'function') {
        renderApp();
        // Check for QR ?doc= param now that data is loaded
        checkQRParam();
    } else {
        console.error('❌ renderApp function not found!');
        document.getElementById('app').innerHTML = '<div style="padding:48px;text-align:center;color:#C23B3B;font-weight:700;">Error: UI not loaded properly</div>';
    }
    
    setupRealtimeSync();
    
    console.log('✅ App initialized with Firebase!');
    // Firebase connected
});

function saveToLocalStorage() {
    try {
        localStorage.setItem('quotations',      JSON.stringify(quotations));
        localStorage.setItem('purchaseOrders',  JSON.stringify(purchaseOrders));
        localStorage.setItem('poCosts',         JSON.stringify(poCosts));
        localStorage.setItem('materialPrices',  JSON.stringify(materialPrices));
        localStorage.setItem('companyInfo',     JSON.stringify(companyInfo));
    } catch (e) {
        console.error('localStorage save failed:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const load = (key, setter) => {
            const raw = localStorage.getItem(key);
            if (raw) setter(JSON.parse(raw));
        };
        load('quotations',     d => quotations = d);
        load('purchaseOrders', d => purchaseOrders = d);
        load('poCosts',        d => poCosts = d);
        load('materialPrices', d => materialPrices = d);
        load('companyInfo',    d => Object.assign(companyInfo, d));
        return true;
    } catch (e) {
        console.error('localStorage load failed:', e);
    }
    return false;
}

window.addEventListener('beforeunload', () => {
    saveToLocalStorage();
    syncToFirebase();
});

// ── QR CODE URL HANDLER ──────────────────────────────────────
function checkQRParam() {
    const docId = new URLSearchParams(window.location.search).get('doc');
    if (!docId) return;
    let tries = 0;
    const attempt = setInterval(() => {
        tries++;
        if (typeof quotations !== 'undefined' && quotations.length > 0) {
            clearInterval(attempt);
            const found = quotations.find(q => q.id === docId);
            if (found) {
                viewQuotation(docId);
            } else {
                showNotification('Document not found: ' + docId);
            }
        }
        if (tries > 20) clearInterval(attempt); // give up after 6s
    }, 300);
}
