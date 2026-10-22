// ── fmt / fmtInt / fmtNum defined in ui.js ─────────────────

let itemCounter = 1;
let editingQuotationId = null;
let docFormDirty = false;   // unsaved changes on the New / Edit Document form

// Ask before leaving a document form with unsaved changes. Resolves true to leave.
async function confirmLeaveDocForm() {
    if (currentView !== 'new' || !docFormDirty) return true;
    return confirmDialog({
        title: L('discardTitle'), message: L('discardMsg'),
        confirmLabel: L('discard'), cancelLabel: L('keepEditing'), danger: true,
    });
}

function resetDocFormState() {
    editingQuotationId = null;
    docFormDirty = false;
}

// Wired to the form's oninput/onchange. Also clears a row's error outline once it's touched.
function markDocDirty(event) {
    docFormDirty = true;
    event?.target?.closest?.('.item-row')?.classList.remove('has-error');
}

async function switchView(view) {
    // Dashboard is Admin-only
    if (view === 'dashboard' && sessionStorage.getItem('userRole') !== 'admin') view = 'bills';
    // Re-selecting New Document while on it keeps the form; anything else leaves it.
    if (view !== 'new' || currentView !== 'new') {
        if (!(await confirmLeaveDocForm())) return;
        if (currentView === 'new' || view === 'new') resetDocFormState();
    }
    currentView = view;
    renderApp();

    if (view === 'new') {
        setTimeout(() => {
            setupItemListeners();
        }, 100);
    }
}

// Recompute one row's Amount. Wired inline (oninput) in itemRowMarkup so it
// survives any re-render of the form.
function recalcItemRow(row) {
    const qtyVal = parseFloat(row.querySelector('.item-qty').value) || 0;
    const priceVal = parseFloat(row.querySelector('.item-price').value) || 0;
    row.querySelector('.item-total').value = '฿' + fmt(qtyVal * priceVal);
}

function updateItemTotal(input) {
    recalcItemRow(input.closest('.item-row'));
    updatePreview();
}

// Resync every row's Amount and the summary (e.g. after programmatic fills).
function setupItemListeners() {
    document.querySelectorAll('.item-row').forEach(recalcItemRow);
    if (document.getElementById('previewSubtotal')) updatePreview();
}

const ROW_SEL = '.item-row:not(.is-leaving)';
const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function addItemRow(animate = true) {
    itemCounter++;
    const itemsList = document.getElementById('itemsList');
    const wrap = document.createElement('div');
    wrap.innerHTML = itemRowMarkup(itemCounter).trim();
    const row = wrap.firstChild;
    if (animate) {
        row.classList.add('row-enter');
        row.addEventListener('animationend', () => row.classList.remove('row-enter'), { once: true });
    }
    itemsList.appendChild(row);
    setupItemListeners();
    if (animate) row.querySelector('.item-name')?.focus({ preventScroll: true });
}

function removeItemRow(button) {
    const rows = document.querySelectorAll(ROW_SEL);
    if (rows.length <= 1) {
        showNotification('⚠️ You must have at least one item');
        return;
    }
    const row = button.closest('.item-row');
    row.classList.add('is-leaving');
    updateItemNumbers();
    updatePreview();

    if (prefersReducedMotion()) { row.remove(); return; }
    // Collapse from its measured height to 0, pulling the stack gap closed with it.
    row.style.height = row.offsetHeight + 'px';
    requestAnimationFrame(() => {
        Object.assign(row.style, {
            height: '0px', paddingTop: '0px', paddingBottom: '0px', borderWidth: '0px',
            marginBottom: 'calc(-1 * var(--s3))', opacity: '0', transform: 'scale(.98)',
        });
    });
    let done = false;
    const finish = () => { if (!done) { done = true; row.remove(); } };
    row.addEventListener('transitionend', e => { if (e.propertyName === 'height') finish(); });
    setTimeout(finish, 400);
}

function updateItemNumbers() {
    const itemRows = document.querySelectorAll(ROW_SEL);
    itemRows.forEach((row, index) => {
        const label = row.querySelector('.item-no');
        if (label) label.textContent = L('itemN') + (index + 1);
    });
    itemCounter = itemRows.length;
}

// Tween a ฿ amount from its last shown value to `value` (ease-out, ~450ms).
function animateMoney(el, value, instant = false) {
    if (!el) return;
    const from = parseFloat(el.dataset.val) || 0;
    el.dataset.val = value;
    cancelAnimationFrame(el._raf);
    if (instant || from === value || prefersReducedMotion()) {
        el.textContent = '฿' + fmt(value);
        el.classList.remove('is-ticking');
        return;
    }
    const start = performance.now(), dur = 450;
    el.classList.add('summary-num', 'is-ticking');
    const step = now => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = '฿' + fmt(from + (value - from) * eased);
        if (t < 1) el._raf = requestAnimationFrame(step);
        else el.classList.remove('is-ticking');
    };
    el._raf = requestAnimationFrame(step);
}

function updatePreview(instant = false) {
    const itemRows = document.querySelectorAll(ROW_SEL);
    let subtotal = 0;
    
    itemRows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        subtotal += qty * price;
    });
    
    const vatChecked = document.getElementById('applyVat')?.checked !== false;
    const tax = vatChecked ? subtotal * 0.07 : 0;
    const total = subtotal + tax;

    animateMoney(document.getElementById('previewSubtotal'), subtotal, instant);
    animateMoney(document.getElementById('previewTax'), tax, instant);
    animateMoney(document.getElementById('previewTotal'), total, instant);
    animateMoney(document.getElementById('dockTotal'), total, instant);
}

// ── Document form state ───────────────────────────────────────
// One shape for reading and filling the form. Edit uses it to load a document,
// and renderApp uses it to snapshot and restore the form so a re-render
// (language, theme, live sync, new customer) never loses what was typed.
function captureDocForm() {
    const form = document.getElementById('docForm');
    if (!form) return null;
    const val = id => document.getElementById(id)?.value ?? '';
    const rows = [...form.querySelectorAll(ROW_SEL)];
    const active = document.activeElement;
    let focus = null;
    if (active && form.contains(active)) {
        const row = active.closest('.item-row');
        focus = row ? { row: rows.indexOf(row), cls: active.classList[0] } : { id: active.id };
    }
    return {
        docType: form.querySelector('input[name="docType"]:checked')?.value || 'bill',
        date: val('docDate'),
        customer: val('customerName'),
        customerEmail: val('customerEmail'),
        customerAddress: val('customerAddress'),
        taxId: val('taxId'),
        notes: val('notes'),
        vat: document.getElementById('applyVat')?.checked !== false,
        items: rows.map(row => ({
            name: row.querySelector('.item-name').value,
            description: row.querySelector('.item-description').value,
            qty: row.querySelector('.item-qty').value,
            price: row.querySelector('.item-price').value,
        })),
        focus,
    };
}

function fillDocForm(d) {
    selectDocType(d.docType || 'bill');
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
    if (d.date) set('docDate', d.date);
    set('customerName', d.customer);
    set('customerEmail', d.customerEmail);
    set('customerAddress', d.customerAddress);
    set('taxId', d.taxId);
    set('notes', d.notes);
    const vat = document.getElementById('applyVat');
    if (vat) vat.checked = d.vat !== false;

    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = '';
    itemCounter = 0;
    (d.items && d.items.length ? d.items : [{}]).forEach(item => {
        addItemRow(false);
        const row = itemsList.lastElementChild;
        row.querySelector('.item-name').value = item.name ?? '';
        row.querySelector('.item-description').value = item.description ?? '';
        row.querySelector('.item-qty').value = item.qty ?? 1;
        row.querySelector('.item-price').value = item.price ?? '';
        recalcItemRow(row);
    });
    updateCustomerHint();
    updatePreview(true);

    if (d.focus) {
        const el = d.focus.id
            ? document.getElementById(d.focus.id)
            : itemsList.children[d.focus.row]?.querySelector('.' + d.focus.cls);
        el?.focus({ preventScroll: true });
    }
}

function submitQuotation(event) {
    event.preventDefault();
    const d = captureDocForm();
    if (!d) return;

    // Every row needs a name, qty ≥ 1 and a price (0 is a valid price, e.g. a free service).
    const items = [];
    let invalid = 0;
    document.querySelectorAll(ROW_SEL).forEach((row, i) => {
        const it = d.items[i];
        const name = it.name.trim();
        const qty = parseFloat(it.qty);
        const price = parseFloat(it.price);
        const ok = !!name && qty > 0 && Number.isFinite(price) && price >= 0;
        row.classList.toggle('has-error', !ok);
        if (ok) items.push({ name, description: it.description.trim(), qty, price });
        else invalid++;
    });
    if (invalid || !items.length) {
        showNotification('⚠️ ' + L('fixItems'));
        document.querySelector('.item-row.has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const round2 = n => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
    const subtotal = round2(items.reduce((sum, item) => sum + (item.qty * item.price), 0));
    const tax = d.vat ? round2(subtotal * 0.07) : 0;
    const total = round2(subtotal + tax);

    const fields = {
        date: d.date || localDateISO(),
        customer: d.customer.trim(),
        customerEmail: d.customerEmail.trim(),
        customerAddress: d.customerAddress.trim(),
        taxId: d.taxId.trim(),
        docType: d.docType,
        items, subtotal, tax, total,
        vat: d.vat,
        notes: d.notes,
    };
    const count = getLang() === 'th' ? `${items.length} รายการ` : `${items.length} item${items.length > 1 ? 's' : ''}`;
    const detail = id => `${id} · ${count} · ฿${fmt(total)}`;
    const who = sessionStorage.getItem('userEmail');

    if (editingQuotationId) {
        const index = quotations.findIndex(q => q.id === editingQuotationId);
        if (index === -1) { showNotification('❌ ' + L('notFound')); return; }
        quotations[index] = { ...quotations[index], ...fields, updatedAt: new Date().toISOString(), updatedBy: who };
        showNotification('✅ ' + L('docUpdated'), { detail: detail(editingQuotationId) });
    } else {
        const newQuotation = {
            id: 'DOC-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4),
            ...fields,
            status: 'draft',
            createdBy: who,
            createdAt: new Date().toISOString(),
        };
        quotations.unshift(newQuotation);
        showNotification('✅ ' + L('docCreated'), { detail: detail(newQuotation.id) });
    }

    saveToLocalStorage();
    syncToFirebase();
    resetDocFormState();
    itemCounter = 1;
    switchView('bills');
}

function editQuotation(id) {
    const q = quotations.find(x => x.id === id);
    if (!q) {
        showNotification('❌ ' + L('notFound'));
        return;
    }
    editingQuotationId = id;
    docFormDirty = false;
    currentView = 'new';
    renderApp();
    // Older documents have no `vat` flag, so infer it from whether tax was charged.
    fillDocForm({ ...q, vat: q.vat !== undefined ? q.vat : (q.tax || 0) > 0 });
    window.scrollTo(0, 0);
}

function deleteQuotation(id) {
    removeWithUndo('quotations', id, L('docDeleted'));
}

// ── Delete with Undo (soft delete) ────────────────────────────
// Deletes happen immediately from the user's point of view, but the record is
// archived, not erased (see SOFT DELETE & ARCHIVE below). The notification
// offers Undo, which restores it to its old position. Lists are read through
// getters because live sync can replace the arrays at any time.
const DATA_LISTS = {
    quotations:     { get: () => quotations,     set: v => { quotations = v; },     persist: () => { saveToLocalStorage(); syncToFirebase(); } },
    customers:      { get: () => customers,      set: v => { customers = v; },      persist: () => { localStorage.setItem('customers', JSON.stringify(customers)); syncCustomersToFirebase(); } },
    products:       { get: () => products,       set: v => { products = v; },       persist: () => { localStorage.setItem('products', JSON.stringify(products)); syncProductsToFirebase(); } },
    purchaseOrders: { get: () => purchaseOrders, set: v => { purchaseOrders = v; }, persist: () => { saveToLocalStorage(); syncPOsToFirebase(); } },
    poCosts:        { get: () => poCosts,        set: v => { poCosts = v; },        persist: () => { saveToLocalStorage(); syncCostsToFirebase(); } },
    materialPrices: { get: () => materialPrices, set: v => { materialPrices = v; }, persist: () => { saveToLocalStorage(); syncMaterialPricesToFirebase(); } },
};

function removeWithUndo(listName, id, message, refresh = renderApp) {
    const list = DATA_LISTS[listName];
    const current = list.get();
    const index = current.findIndex(x => x.id === id);
    if (index === -1) return;

    archiveRecords(listName, [current[index]], 'deleted');
    list.set(current.filter(x => x.id !== id));
    list.persist();
    refresh();

    showNotification('✅ ' + message, {
        action: {
            label: L('undo'),
            onClick: () => {
                if (restoreRecord(listName, id, index)) {
                    refresh();
                    showNotification('✅ ' + L('restored'));
                }
            },
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// SOFT DELETE & ARCHIVE
// ═══════════════════════════════════════════════════════════════
// Nothing is ever erased. Deleting a record, or archiving old closed records,
// moves it out of its live list into archive/<list>/<id>, stamped with
// inactiveAt / inactiveBy / inactiveReason ('deleted' | 'archived').
// The live lists the app downloads on start-up stay small; the archive is
// only fetched on demand (Admin → Archive) and any record can be restored.
let archive = {};            // { quotations: { [id]: record }, ... } — fetched or written this session
let archiveLoaded = false;
let archiveMonths = 12;      // age cut-off for "archive old records"
let archiveFilter = 'all';   // 'all' | 'deleted' | 'archived'

const ARCHIVE_LISTS = ['quotations', 'purchaseOrders', 'customers', 'products', 'poCosts', 'materialPrices'];
const ARCHIVE_PAGE = 200;    // newest N per list, so the admin view stays fast as the archive grows

// Without Firebase the archive lives in localStorage; with Firebase it lives in
// the cloud only, so it never weighs down the browser's local copy.
function saveArchiveLocal() {
    if (isFirebaseEnabled) return;
    try { localStorage.setItem('archive', JSON.stringify(archive)); } catch (e) { console.warn('archive save failed', e); }
}

function archiveRecords(listName, items, reason) {
    const stamp = { inactiveAt: new Date().toISOString(), inactiveBy: sessionStorage.getItem('userEmail') || '', inactiveReason: reason };
    const bucket = archive[listName] = archive[listName] || {};
    const updates = {};
    items.forEach(item => {
        const rec = { ...JSON.parse(JSON.stringify(item)), ...stamp };  // JSON copy drops undefined, which Firebase rejects
        bucket[item.id] = rec;
        updates[item.id] = rec;
    });
    saveArchiveLocal();
    if (!isFirebaseEnabled) return;
    database.ref('archive/' + listName).update(updates).catch(e => {
        // Usually means database.rules.json (with the archive node) isn't deployed.
        // Put the records back so a failed archive write can never lose data.
        console.warn('archive write failed', e);
        items.forEach(item => restoreRecord(listName, item.id, 0, true));
        renderApp();
        showNotification('❌ ' + L('archiveFailed'));
    });
}

// Moves an archived record back into its live list. `index` is where it goes
// (Undo passes its old position); by default newest-first lists get it on top.
function restoreRecord(listName, id, index, quiet = false) {
    const rec = archive[listName] && archive[listName][id];
    const list = DATA_LISTS[listName];
    if (!rec || !list) return false;
    if (list.get().some(x => x.id === id)) {
        if (!quiet) showNotification('⚠️ ' + L('restoreClash'), { detail: id });
        return false;
    }
    const { inactiveAt, inactiveBy, inactiveReason, ...item } = rec;
    const next = list.get().slice();
    const at = index != null ? index : (listName === 'quotations' || listName === 'purchaseOrders') ? 0 : next.length;
    next.splice(Math.min(at, next.length), 0, item);
    list.set(next);
    list.persist();
    delete archive[listName][id];
    saveArchiveLocal();
    if (isFirebaseEnabled && !quiet) database.ref('archive/' + listName + '/' + id).remove().catch(e => console.warn('archive remove failed', e));
    return true;
}

// Fetch the newest ARCHIVE_PAGE records of each list. orderByChild + limitToLast
// is a server-side query backed by the ".indexOn" rule, so this costs the same
// whether the archive holds 200 records or 200,000.
function loadArchive(force = false) {
    if (archiveLoaded && !force) return Promise.resolve();
    if (!isFirebaseEnabled) {
        try { archive = JSON.parse(localStorage.getItem('archive') || '{}') || {}; } catch (e) { archive = {}; }
        archiveLoaded = true;
        return Promise.resolve();
    }
    return Promise.all(ARCHIVE_LISTS.map(listName =>
        database.ref('archive/' + listName).orderByChild('inactiveAt').limitToLast(ARCHIVE_PAGE).once('value')
            .then(snap => { archive[listName] = snap.val() || {}; })  // includes this session's pending writes
            .catch(e => console.warn('archive load failed', listName, e))
    )).then(() => { archiveLoaded = true; });
}

// The "dead data" query: closed records dated before the cut-off — approved or
// rejected documents and completed purchase orders. Drafts, pending documents
// and open POs are still being worked on, so they are never touched.
function monthsAgoISO(months) {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return localDateISO(d);
}
function findDeadRecords(months) {
    const cutoff = monthsAgoISO(months);
    return {
        cutoff,
        quotations: quotations.filter(q => (q.status === 'approved' || q.status === 'rejected') && (q.date || '') < cutoff),
        purchaseOrders: purchaseOrders.filter(p => p.status === 'completed' && (p.date || '') < cutoff),
    };
}

async function archiveOldRecords() {
    const dead = findDeadRecords(archiveMonths);
    const n = dead.quotations.length + dead.purchaseOrders.length;
    if (!n) { showNotification(L('nothingToArchive')); return; }
    const ok = await confirmDialog({
        title: L('archiveTitle'),
        message: L('archiveMsg').replace('{n}', n).replace('{date}', dead.cutoff),
        confirmLabel: L('archiveBtn'),
    });
    if (!ok) return;

    const poIds = new Set(dead.purchaseOrders.map(p => p.id));
    const costs = poCosts.filter(c => poIds.has(c.poId));   // a PO's costs go with it
    [['quotations', dead.quotations], ['purchaseOrders', dead.purchaseOrders], ['poCosts', costs]].forEach(([listName, recs]) => {
        if (!recs.length) return;
        const ids = new Set(recs.map(r => r.id));
        archiveRecords(listName, recs, 'archived');
        DATA_LISTS[listName].set(DATA_LISTS[listName].get().filter(r => !ids.has(r.id)));
        DATA_LISTS[listName].persist();
    });
    renderApp();
    showNotification('✅ ' + L('archivedMsg').replace('{n}', n), { detail: `${dead.quotations.length} docs · ${dead.purchaseOrders.length} POs` });
}

// Restore from the Archive tab. A PO brings back the costs that were archived with it.
function restoreFromArchive(listName, id) {
    if (!restoreRecord(listName, id)) return;
    if (listName === 'purchaseOrders') {
        Object.values(archive.poCosts || {})
            .filter(c => c.poId === id && c.inactiveReason === 'archived')
            .forEach(c => restoreRecord('poCosts', c.id));
    }
    renderApp();
    showNotification('✅ ' + L('restored'), { detail: id });
}

function setArchiveMonths(m) { archiveMonths = Number(m) || 12; renderApp(); }
function setArchiveFilter(f) { archiveFilter = f; renderApp(); }
function refreshArchive() { loadArchive(true).then(renderApp); }

function viewQuotation(id) {
    const q = quotations.find(x => x.id === id);
    if (!q) { showNotification('❌ Document not found'); return; }

    const typeLabel = q.docType === 'tax-invoice' ? 'Tax Invoice' : q.docType === 'invoice' ? 'Invoice' : 'Bill';

    let extraInfo = '';
    if (q.status === 'rejected' && q.rejectionReason) {
        extraInfo = `<div class="alert-err">
            <div style="font-weight:700;margin-bottom:2px;">${L('rejected')}</div>
            <div>${esc(q.rejectionReason)}</div>
            <div style="opacity:.75;margin-top:3px;font-size:var(--t-micro);">by ${esc(q.rejectedBy || 'Technician')} · ${q.rejectedAt ? new Date(q.rejectedAt).toLocaleDateString() : ''}</div>
        </div>`;
    }
    if (q.status === 'approved' && q.approvedBy) {
        extraInfo = `<div class="alert-ok">
            <div style="font-weight:700;">${L('approved')}</div>
            <div style="opacity:.8;font-size:var(--t-micro);">by ${esc(q.approvedBy)} · ${q.approvedAt ? new Date(q.approvedAt).toLocaleDateString() : ''}</div>
        </div>`;
    }

    const itemsHtml = q.items.map(item => `
        <tr>
            <td class="cell-strong">${esc(item.name)}</td>
            <td class="num muted">${item.qty}</td>
            <td class="num muted tnum">฿${fmt(item.price)}</td>
            <td class="num cell-strong tnum">฿${fmt(item.qty * item.price)}</td>
        </tr>`).join('');

    const qrUrl = `${window.location.origin}${window.location.pathname}?doc=${q.id}`;

    const modal = `
    <div id="viewModal" class="scrim" onclick="if(event.target.id==='viewModal')closeViewModal()">
      <div class="sheet">
        <div class="sheet-head">
          <div><div class="k">${typeLabel}</div><div class="h tnum">${esc(q.id)}</div></div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${getStatusPill(q.status)}
            <button class="sheet-x" onclick="closeViewModal()">${icon('x','')}</button>
          </div>
        </div>
        <div class="sheet-body">
          <div style="display:flex;gap:var(--s5);align-items:flex-start;flex-wrap:wrap;">
            <div style="flex:1;min-width:220px;" class="stack">
              <div class="grid-2">
                <div><div class="field-label">${L('customer2')}</div><div class="cell-strong">${esc(q.customer)}</div></div>
                <div><div class="field-label">${L('date')}</div><div>${esc(q.date)}</div></div>
                ${q.taxId ? `<div><div class="field-label">${L('taxId')}</div><div class="muted tnum">${esc(q.taxId)}</div></div>` : ''}
              </div>
              <table class="table" style="margin-top:4px;">
                <thead><tr><th>${L('itemCol')}</th><th class="num">${L('qtyCol')}</th><th class="num">${L('priceCol')}</th><th class="num">${L('amount')}</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
              </table>
              <div style="border-top:1px solid var(--line-2);padding-top:10px;text-align:right;" class="stack">
                <div class="muted" style="font-size:var(--t-meta);">${L('subtotal')}: <span class="tnum">฿${fmt(q.subtotal)}</span></div>
                <div class="muted" style="font-size:var(--t-meta);">${L('tax7')}: <span class="tnum">฿${fmt(q.tax)}</span></div>
                <div style="font-size:var(--t-lede);font-weight:700;color:var(--accent);">${L('total')}: <span class="tnum">฿${fmt(q.total)}</span></div>
              </div>
              ${extraInfo}
            </div>
            <div style="text-align:center;">
              <div id="qrcode" style="background:#fff;padding:8px;border-radius:10px;display:inline-block;border:1px solid var(--line-2);"></div>
              <div class="muted" style="font-size:var(--t-micro);margin-top:5px;">${L('scanToOpen')}</div>
            </div>
          </div>
        </div>
        <div class="sheet-foot">
          <button class="btn btn-primary btn-block" onclick="generatePDF('${q.id}')">${icon('download')}${L('exportPDF')}</button>
          <button class="btn btn-secondary" onclick="closeViewModal()">${L('close')}</button>
        </div>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modal);

    setTimeout(() => {
        const box = document.getElementById('qrcode');
        if (!box) return;
        if (typeof QRCode !== 'undefined') {
            new QRCode(box, { text: qrUrl, width: 104, height: 104, colorDark: '#16233E', colorLight: '#ffffff' });
        } else {
            box.innerHTML = '<div style="font-size:0.7rem;color:#888;padding:8px;">QR N/A</div>';
        }
    }, 50);
}

function closeViewModal() {
    const m = document.getElementById('viewModal');
    if (m) m.remove();
}


function exportGroup(key) {
    const items = quotations.filter(q => {
        return groupBy === 'date' ? q.date === key : q.customer === key;
    });
    
    if (items.length === 0) {
        showNotification('❌ No documents found in this group');
        return;
    }
    
    let csv = 'ID,Date,Customer,Tax ID,Items,Subtotal,Tax,Total,Status\n';
    
    items.forEach(q => {
        const itemsStr = q.items.map(i => `${i.name}(${i.qty}x${i.price})`).join('; ');
        csv += `${q.id},${q.date},${q.customer},${q.taxId},"${itemsStr}",${q.subtotal},${q.tax},${q.total},${q.status}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `group_${key}_export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('✅ CSV exported', { detail: 'group_' + key + '_export.csv · ' + items.length + ' records' });
}

// ========== WORKFLOW FUNCTIONS ==========

// Shared tail for every status change: save, sync, redraw, confirm.
function commitWorkflow(message) {
    saveToLocalStorage();
    syncToFirebase();
    renderApp();
    showNotification(message);
}

async function submitForApproval(quotationId) {
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) { showNotification('❌ ' + L('notFound')); return; }
    if (!(await confirmDialog({ title: L('submitTitle'), message: `${quotation.id} · ${quotation.customer}`, confirmLabel: L('submit') }))) return;

    quotation.status = 'pending';
    quotation.submittedAt = new Date().toISOString();
    quotation.submittedBy = sessionStorage.getItem('userEmail');
    commitWorkflow('✅ ' + L('submittedMsg'));
}

async function approveQuotation(quotationId) {
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) { showNotification('❌ ' + L('notFound')); return; }
    if (!(await confirmDialog({ title: L('approveTitle'), message: `${quotation.id} · ${quotation.customer} · ฿${fmt(quotation.total)}`, confirmLabel: L('approve') }))) return;

    quotation.status = 'approved';
    quotation.approvedAt = new Date().toISOString();
    quotation.approvedBy = sessionStorage.getItem('userEmail');
    commitWorkflow('✅ ' + L('approvedMsg'));
}

async function rejectQuotation(quotationId) {
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) { showNotification('❌ ' + L('notFound')); return; }
    const reason = await confirmDialog({
        title: L('rejectTitle'), message: `${quotation.id} · ${quotation.customer}`,
        confirmLabel: L('reject'), danger: true, input: { label: L('rejectReason') },
    });
    if (!reason) return;

    quotation.status = 'rejected';
    quotation.rejectedAt = new Date().toISOString();
    quotation.rejectedBy = sessionStorage.getItem('userEmail');
    quotation.rejectionReason = reason;
    commitWorkflow('❌ ' + L('rejectedMsg'));
}

async function redoQuotation(quotationId) {
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) { showNotification('❌ ' + L('notFound')); return; }
    if (!(await confirmDialog({ title: L('redoTitle'), message: `${quotation.id} · ${quotation.customer}`, confirmLabel: L('sendBack') }))) return;

    quotation.status = 'draft';
    quotation.redoAt = new Date().toISOString();
    quotation.redoBy = sessionStorage.getItem('userEmail');
    commitWorkflow(L('sentBackMsg'));
}

async function fixAndResubmit(quotationId) {
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) { showNotification('❌ ' + L('notFound')); return; }
    if (!(await confirmDialog({ title: L('resubmitTitle'), message: `${quotation.id} · ${quotation.customer}`, confirmLabel: L('resubmit') }))) return;

    // Clear rejection info and set to pending
    quotation.status = 'pending';
    quotation.resubmittedAt = new Date().toISOString();
    quotation.resubmittedBy = sessionStorage.getItem('userEmail');
    // Keep rejection history for reference
    quotation.previousRejection = {
        reason: quotation.rejectionReason,
        rejectedBy: quotation.rejectedBy,
        rejectedAt: quotation.rejectedAt
    };
    commitWorkflow('✅ ' + L('resubmittedMsg'));
}




function toggleTaxIdRequired() {
    const type = document.querySelector('input[name="customerType"]:checked')?.value;
    const taxIdInput = document.getElementById('custTaxId');
    const taxIdStar = document.getElementById('taxIdStar');
    if (!taxIdInput) return;
    if (type === 'company') {
        taxIdInput.setAttribute('required', 'required');
        taxIdStar && taxIdStar.classList.remove('hidden');
    } else {
        taxIdInput.removeAttribute('required');
        taxIdStar && taxIdStar.classList.add('hidden');
    }
}

function showAddCustomerModal(editId, prefill) {
    if (document.getElementById('customerModal')) return;
    const c = (editId && customers.find(x => x.id === editId)) || null;
    const p = c || prefill || {};
    const isCompany = p.type === 'company' || (!c && !!p.taxId);
    const modal = `
    <div id="customerModal" class="scrim" onclick="if(event.target.id==='customerModal')closeCustomerModal()">
      <div class="sheet" style="max-width:480px;">
        <div class="sheet-head">
          <div class="h">${L(c ? 'editCustomer' : 'addCustomer')}</div>
          <button class="sheet-x" onclick="closeCustomerModal()">${icon('x','')}</button>
        </div>
        <form onsubmit="saveCustomer(event)" class="sheet-body" data-edit-id="${c ? esc(c.id) : ''}">
          <div class="field">
            <span class="field-label">${L('customerType')} *</span>
            <div class="doctype" style="grid-template-columns:1fr 1fr;">
              <label><input type="radio" name="customerType" value="individual" ${isCompany ? '' : 'checked'} onchange="toggleTaxIdRequired()"><span class="dt-t">${L('individual')}</span></label>
              <label><input type="radio" name="customerType" value="company" ${isCompany ? 'checked' : ''} onchange="toggleTaxIdRequired()"><span class="dt-t">${L('company')}</span></label>
            </div>
          </div>
          <div class="field"><span class="field-label">${L('nameStar')} *</span><input id="custName" class="input" required placeholder="${L('nameStar')}" value="${esc(p.name)}"></div>
          <div class="grid-2">
            <div class="field"><span class="field-label">${L('email')}</span><input id="custEmail" type="email" class="input" placeholder="email@example.com" value="${esc(p.email)}"></div>
            <div class="field"><span class="field-label">${L('phone')}</span><input id="custPhone" class="input" placeholder="0X-XXX-XXXX" value="${esc(p.phone)}"></div>
          </div>
          <div class="field"><span class="field-label">${L('taxId')} <span id="taxIdStar" class="${isCompany ? '' : 'hidden'}">*</span></span><input id="custTaxId" class="input" placeholder="0-1234-56789-01-2" ${isCompany ? 'required' : ''} value="${esc(p.taxId)}"></div>
          <div class="field"><span class="field-label">${L('address')}</span><textarea id="custAddress" rows="2" class="textarea" placeholder="${esc(L('addressPh'))}">${esc(p.address)}</textarea></div>
          <div class="sheet-foot" style="padding:0;">
            <button type="submit" class="btn btn-primary btn-block">${L('saveDocument2')}</button>
            <button type="button" class="btn btn-secondary" onclick="closeCustomerModal()">${L('cancel')}</button>
          </div>
        </form>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modal);
    document.getElementById('custName')?.focus();
}

function closeCustomerModal() {
    document.getElementById('customerModal')?.remove();
}

function saveCustomer(event) {
    event.preventDefault();

    const editId = event.target.dataset.editId;
    const fields = {
        name: document.getElementById('custName').value.trim(),
        email: document.getElementById('custEmail').value.trim(),
        phone: document.getElementById('custPhone').value.trim(),
        address: document.getElementById('custAddress').value.trim(),
        taxId: document.getElementById('custTaxId').value.trim(),
        type: document.querySelector('input[name="customerType"]:checked').value
    };

    const existing = editId && customers.find(c => c.id === editId);
    if (existing) {
        Object.assign(existing, fields);
    } else {
        customers.push({ id: 'CUST' + Date.now(), ...fields });
    }
    localStorage.setItem('customers', JSON.stringify(customers));
    syncCustomersToFirebase();

    closeCustomerModal();
    renderApp();   // on the document form this keeps what was typed (see captureDocForm)

    showNotification(existing ? '✅ Customer updated!' : '✅ Customer added successfully!');
}

function editCustomer(id) {
    if (!customers.some(c => c.id === id)) return;
    closeCustomerPanel();
    showAddCustomerModal(id);
}

function deleteCustomer(id) {
    closeCustomerPanel();
    removeWithUndo('customers', id, L('customerDeleted'));
}

function syncCustomersToFirebase() {
    if (isFirebaseEnabled && database) {
        database.ref('customers').set(customers).catch(e => console.warn('customers sync error', e));
    }
}

function loadCustomersFromStorage() {
    const saved = localStorage.getItem('customers');
    if (saved) {
        customers = JSON.parse(saved);
    }
}

// Load customers on startup
loadCustomersFromStorage();

// Customer box on the document form: type freely, or pick an existing customer
// from the suggestions. An exact name match fills in the rest of their details.
function findCustomerByName(name) {
    const key = (name || '').trim().toLowerCase();
    return key ? customers.find(c => (c.name || '').trim().toLowerCase() === key) : null;
}

function fillCustomerInfo(input) {
    const c = findCustomerByName(input.value);
    if (c) {
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
        set('customerEmail', c.email);
        set('customerAddress', c.address);
        set('taxId', c.taxId);
    }
    updateCustomerHint();
}

function updateCustomerHint() {
    const hint = document.getElementById('customerHint');
    if (!hint) return;
    const name = document.getElementById('customerName')?.value.trim();
    if (!name) { hint.innerHTML = ''; return; }
    hint.innerHTML = findCustomerByName(name)
        ? `<span class="hint-ok">${icon('check', '')}${L('existingCustomer')}</span>`
        : `<button type="button" class="act act-primary" onclick="saveFormCustomer()">${icon('plus', '')}${L('saveAsCustomer')}</button>`;
}

// "Save as new customer" on the document form: open the customer sheet pre-filled.
function saveFormCustomer() {
    const v = id => document.getElementById(id)?.value.trim() || '';
    showAddCustomerModal(null, { name: v('customerName'), email: v('customerEmail'), address: v('customerAddress'), taxId: v('taxId') });
}

// Suggestions for the item Name box: the product catalogue first, then items used
// in earlier documents (most recent wins). Names are unique, case-insensitive.
function itemSuggestions() {
    const seen = new Map();
    const add = (name, description, price) => {
        const key = (name || '').trim().toLowerCase();
        if (key && !seen.has(key)) seen.set(key, { name: name.trim(), description: description || '', price });
    };
    products.forEach(p => add(p.name, p.description, p.price));
    quotations.forEach(q => (q.items || []).forEach(it => add(it.name, it.description, it.price)));
    return [...seen.values()];
}

// When the typed Name exactly matches a suggestion, fill description and price.
// Anything else is kept as a free-typed item.
function fillProductInfo(nameInput) {
    const key = nameInput.value.trim().toLowerCase();
    if (!key) return;
    const match = itemSuggestions().find(s => s.name.toLowerCase() === key);
    if (!match) return;

    const row = nameInput.closest('.item-row');
    row.querySelector('.item-description').value = match.description;
    if (match.price != null) row.querySelector('.item-price').value = match.price;

    recalcItemRow(row);
    updatePreview();
}

// Load products from storage
function loadProductsFromStorage() {
    const saved = localStorage.getItem('products');
    if (saved) {
        products = JSON.parse(saved);
    }
}

loadProductsFromStorage();

// ========== PDF GENERATION ==========


// ========== PRODUCT MANAGEMENT ==========

function showAddProductModal(editId) {
    if (document.getElementById('productModal')) return;
    const p = (editId && products.find(x => x.id === editId)) || null;
    const modal = `
    <div id="productModal" class="scrim" onclick="if(event.target.id==='productModal')closeProductModal()">
      <div class="sheet" style="max-width:460px;">
        <div class="sheet-head">
          <div class="h">${L(p ? 'editProductTitle' : 'addProduct')}</div>
          <button class="sheet-x" onclick="closeProductModal()">${icon('x','')}</button>
        </div>
        <form onsubmit="saveProduct(event)" class="sheet-body" data-edit-id="${p ? esc(p.id) : ''}">
          <div class="field"><span class="field-label">${L('nameStar')} *</span><input type="text" id="prodName" class="input" required placeholder="${esc(L('itemPh'))}" value="${p ? esc(p.name) : ''}"></div>
          <div class="field"><span class="field-label">${L('descriptionLbl')}</span><textarea id="prodDesc" rows="2" class="textarea" placeholder="${esc(L('optionalDetail'))}">${p ? esc(p.description) : ''}</textarea></div>
          <div class="grid-2">
            <div class="field"><span class="field-label">${L('unitPrice')} *</span><input type="number" id="prodPrice" class="input" required min="0" step="0.01" placeholder="0.00" value="${p ? esc(p.price) : ''}"></div>
            <div class="field"><span class="field-label">${L('unit')}</span><input type="text" id="prodUnit" class="input" placeholder="${esc(L('unitPh'))}" value="${p ? esc(p.unit) : 'item'}"></div>
          </div>
          <div class="sheet-foot" style="padding:0;">
            <button type="submit" class="btn btn-primary btn-block">${L('saveDocument2')}</button>
            <button type="button" class="btn btn-secondary" onclick="closeProductModal()">${L('cancel')}</button>
          </div>
        </form>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modal);
    document.getElementById('prodName')?.focus();
}

function closeProductModal() {
    document.getElementById('productModal')?.remove();
}

function saveProduct(event) {
    event.preventDefault();

    const editId = event.target.dataset.editId;
    const fields = {
        name: document.getElementById('prodName').value.trim(),
        description: document.getElementById('prodDesc').value.trim(),
        price: parseFloat(document.getElementById('prodPrice').value),
        unit: document.getElementById('prodUnit').value.trim() || 'item'
    };

    const existing = editId && products.find(p => p.id === editId);
    if (existing) Object.assign(existing, fields);
    else products.push({ id: 'PROD' + Date.now(), ...fields });

    localStorage.setItem('products', JSON.stringify(products));
    syncProductsToFirebase();

    closeProductModal();
    renderApp();
    showNotification('✅ ' + L(existing ? 'productUpdated' : 'productAdded'));
}

function editProduct(id) {
    showAddProductModal(id);
}

function deleteProduct(id) {
    removeWithUndo('products', id, L('productDeleted'));
}

// Fill product info when selected

// ========== PDF GENERATION ==========

function generatePDF(quotationId) {
    const q = quotations.find(x => x.id === quotationId);
    if (!q) { showNotification('❌ Document not found'); return; }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pw = doc.internal.pageSize.width;
        const ph = doc.internal.pageSize.height;
        const m = 18;
        const contentW = pw - 2 * m;

        // Sarabun renders Thai; fall back to Helvetica if the font module failed to load.
        const FONT = (doc.getFontList && doc.getFontList().Sarabun) ? 'Sarabun' : 'helvetica';
        const F = style => doc.setFont(FONT, style);
        const nfmt = n => (typeof fmt === 'function')
            ? fmt(n)
            : (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const money = n => '฿' + nfmt(n);   // ฿1,234.56
        const th = (typeof getLang === 'function' && getLang() === 'th');

        // ── minimal palette — ink on white, hairline rules ──
        const INK = [26, 34, 48], MUTE = [122, 132, 150], HAIR = [214, 219, 227];
        const setInk = () => doc.setTextColor(INK[0], INK[1], INK[2]);
        const setMute = () => doc.setTextColor(MUTE[0], MUTE[1], MUTE[2]);
        const hair = (yy, x1, x2) => {
            doc.setDrawColor(HAIR[0], HAIR[1], HAIR[2]);
            doc.setLineWidth(0.3);
            doc.line(x1 == null ? m : x1, yy, x2 == null ? pw - m : x2, yy);
        };
        const fmtDate = iso => { try { return new Date(iso).toLocaleDateString(th ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return String(iso || ''); } };
        F('normal');

        const HEAD = th
            ? ({ 'bill': 'ใบเสร็จรับเงิน', 'invoice': 'ใบแจ้งหนี้', 'tax-invoice': 'ใบกำกับภาษี' }[q.docType] || 'เอกสาร')
            : getDocTypeLabel(q.docType);
        const STAT = th
            ? ({ draft: 'ฉบับร่าง', pending: 'รอการอนุมัติ', approved: 'อนุมัติแล้ว', rejected: 'ไม่อนุมัติ' }[q.status] || q.status)
            : ({ draft: 'Draft', pending: 'Pending approval', approved: 'Approved', rejected: 'Rejected' }[q.status] || q.status);
        const STAT_COLOR = ({ approved: [28, 122, 90], pending: [166, 105, 11], rejected: [194, 59, 59], draft: [122, 132, 150] }[q.status]) || MUTE;

        // ── HEADER ──────────────────────────────────────────────
        doc.setFontSize(20); F('bold'); setInk();
        doc.text(HEAD, m, 24);

        // company name, top-right — plain text, no logo mark
        doc.setFontSize(9); F('normal'); setMute();
        doc.text(doc.splitTextToSize(companyInfo.name || '', 76), pw - m, 15, { align: 'right' });

        // meta rows
        let y = 34;
        const metaRow = (label, value, valColor) => {
            doc.setFontSize(8.5); F('normal'); setMute();
            doc.text(label, m, y);
            F('bold');
            if (valColor) doc.setTextColor(valColor[0], valColor[1], valColor[2]); else setInk();
            doc.text(String(value == null ? '' : value), m + 34, y);
            y += 5.4;
        };
        metaRow(th ? 'เลขที่เอกสาร' : (q.docType === 'tax-invoice' ? 'Tax invoice no.' : q.docType === 'invoice' ? 'Invoice no.' : 'Document no.'), q.id);
        metaRow(th ? 'วันที่' : 'Date', q.date);
        metaRow(th ? 'สถานะ' : 'Status', STAT, STAT_COLOR);

        // statement line
        y += 4;
        doc.setFontSize(13); F('bold'); setInk();
        let stmt = money(q.total);
        stmt += (q.status === 'approved' && q.approvedAt)
            ? (th ? '  อนุมัติเมื่อ ' + fmtDate(q.approvedAt) : '  approved on ' + fmtDate(q.approvedAt))
            : '  ·  ' + STAT;
        doc.text(stmt, m, y);
        y += 6;

        if (q.notes) {
            doc.setFontSize(8.5); F('normal'); setMute();
            const nl = doc.splitTextToSize(String(q.notes), contentW).slice(0, 3);
            doc.text(nl, m, y + 1);
            y += nl.length * 4.3 + 2;
        }

        // ── FROM / BILL TO ─────────────────────────────────────
        y += 6;
        const colR = pw / 2 + 4;
        doc.setFontSize(7); F('bold'); setMute();
        doc.text(th ? 'ผู้ออกเอกสาร' : 'FROM', m, y);
        doc.text(th ? 'ออกให้' : 'BILL TO', colR, y);

        let ay = y + 5;
        doc.setFontSize(9); F('bold'); setInk();
        const cnL = doc.splitTextToSize(companyInfo.name || '', colR - m - 6);
        doc.text(cnL, m, ay); ay += cnL.length * 4.6;
        doc.setFontSize(8); F('normal'); setMute();
        const caL = doc.splitTextToSize(companyInfo.address || '', colR - m - 6);
        doc.text(caL, m, ay); ay += caL.length * 4;
        if (companyInfo.phone) { doc.text((th ? 'โทร ' : 'Tel ') + companyInfo.phone, m, ay); ay += 4; }
        if (companyInfo.email) { doc.text(companyInfo.email, m, ay); ay += 4; }
        if (companyInfo.taxId) { doc.text((th ? 'เลขผู้เสียภาษี ' : 'Tax ID ') + companyInfo.taxId, m, ay); ay += 4; }

        let by = y + 5;
        doc.setFontSize(9); F('bold'); setInk();
        const custL = doc.splitTextToSize(q.customer || '-', pw - m - colR);
        doc.text(custL, colR, by); by += custL.length * 4.6;
        doc.setFontSize(8); F('normal'); setMute();
        if (q.customerAddress) { const xL = doc.splitTextToSize(String(q.customerAddress), pw - m - colR); doc.text(xL, colR, by); by += xL.length * 4; }
        if (q.customerEmail) { doc.text(String(q.customerEmail), colR, by); by += 4; }
        if (q.taxId) { doc.text((th ? 'เลขผู้เสียภาษี ' : 'Tax ID ') + q.taxId, colR, by); by += 4; }

        y = Math.max(ay, by) + 9;

        // ── LINE ITEMS ─────────────────────────────────────────
        const cAmt = pw - m;
        const cTax = cAmt - 22;
        const cUnit = cTax - 27;
        const cQty = cUnit - 16;
        const nameW = cQty - 12 - m;

        hair(y - 4);
        doc.setFontSize(7); F('bold'); setMute();
        doc.text(th ? 'รายละเอียด' : 'DESCRIPTION', m, y);
        doc.text(th ? 'จำนวน' : 'QTY', cQty, y, { align: 'right' });
        doc.text(th ? 'ราคา/หน่วย' : 'UNIT PRICE', cUnit, y, { align: 'right' });
        doc.text(th ? 'ภาษี' : 'TAX', cTax, y, { align: 'right' });
        doc.text(th ? 'จำนวนเงิน' : 'AMOUNT', cAmt, y, { align: 'right' });
        y += 3;
        hair(y);
        y += 7;

        const taxLabel = (Number(q.tax) || 0) > 0 ? (q.taxRate || 7) + '%' : '—';
        (q.items || []).forEach(item => {
            const amt = (Number(item.qty) || 0) * (Number(item.price) || 0);
            const nameLines = doc.splitTextToSize(item.name || '-', nameW);
            const descLines = item.description ? doc.splitTextToSize(String(item.description), nameW) : [];
            doc.setFontSize(9); F('bold'); setInk();
            doc.text(nameLines, m, y);
            if (descLines.length) {
                doc.setFontSize(7.5); F('normal'); setMute();
                doc.text(descLines, m, y + nameLines.length * 4.4);
            }
            doc.setFontSize(8.5); F('normal'); setInk();
            doc.text(String(item.qty), cQty, y, { align: 'right' });
            doc.text(money(item.price), cUnit, y, { align: 'right' });
            setMute(); doc.text(taxLabel, cTax, y, { align: 'right' });
            setInk(); F('bold'); doc.text(money(amt), cAmt, y, { align: 'right' });
            y += Math.max(7, nameLines.length * 4.4 + descLines.length * 4 + 3.5);
        });
        hair(y);

        // ── SUMMARY ────────────────────────────────────────────
        y += 8;
        const sx = pw - m - 74;
        const sumRow = (label, value, opts) => {
            opts = opts || {};
            doc.setFontSize(opts.big ? 10.5 : 9);
            F(opts.bold ? 'bold' : 'normal');
            if (opts.bold) setInk(); else setMute();
            doc.text(label, sx, y);
            F('bold'); setInk();
            doc.text(value, pw - m, y, { align: 'right' });
            y += opts.big ? 8 : 6;
        };
        sumRow(th ? 'ยอดก่อนภาษี' : 'Subtotal', money(q.subtotal));
        sumRow((th ? 'ภาษีมูลค่าเพิ่ม ' : 'VAT ') + (q.taxRate || 7) + '%', money(q.tax));
        hair(y - 2, sx, pw - m);
        y += 2;
        sumRow(th ? 'ยอดรวมทั้งสิ้น' : 'Total', money(q.total), { bold: true, big: true });

        // ── FOOTER ─────────────────────────────────────────────
        const fy = ph - 33;
        hair(fy - 7);
        doc.setFontSize(7); F('bold'); setMute();
        doc.text(th ? 'เงื่อนไขการชำระเงิน' : 'PAYMENT TERMS', m + 26, fy);
        F('normal');
        doc.text(th ? 'ชำระภายใน 30 วันนับจากวันที่ในเอกสาร' : 'Payment due within 30 days of the document date.', m + 26, fy + 4.6);
        doc.text(companyInfo.name + (companyInfo.website ? '  ·  ' + companyInfo.website : ''), m + 26, fy + 9.2);
        doc.setFontSize(7); setMute(); F('normal');
        doc.text(th ? 'หน้า 1/1' : 'Page 1 of 1', pw - m, ph - 12, { align: 'right' });

        // --- QR CODE (rendered async, then save PDF) ---
        const qrUrl = `${window.location.origin}${window.location.pathname}?doc=${q.id}`;
        const qrDiv = document.createElement('div');
        qrDiv.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
        document.body.appendChild(qrDiv);
        new QRCode(qrDiv, { text: qrUrl, width: 100, height: 100, colorDark: '#1e2937', colorLight: '#ffffff' });

        const savePDF = () => {
            try {
                const qrImg = qrDiv.querySelector('img');
                if (qrImg && qrImg.src) {
                    doc.addImage(qrImg.src, 'PNG', m, ph - 40, 19, 19);
                    doc.setFontSize(5.5);
                    F('normal');
                    doc.setTextColor(122, 132, 150);
                    doc.text(L('scanToOpen'), m + 9.5, ph - 18.5, { align: 'center' });
                }
            } catch(e) { console.log('QR embed skipped:', e); }
            document.body.removeChild(qrDiv);
            doc.save(getDocTypeLabel(q.docType).replace(/\s+/g, '') + '-' + q.id + '.pdf');
            showNotification(getLang() === 'th' ? 'ดาวน์โหลด PDF แล้ว' : 'PDF downloaded');
        };

        // Give QRCode.js 300ms to render the img
        setTimeout(savePDF, 300);

    } catch (error) {
        console.error('PDF error:', error);
        showNotification('❌ Failed to generate PDF', { detail: error.message });
    }
}


function getDocTypeLabel(docType) {
    const labels = {
        'bill': 'Bill',
        'invoice': 'Invoice',
        'tax-invoice': 'Tax Invoice'
    };
    return labels[docType] || docType;
}

// Role management functions


function toggleRole() {
    const currentRole = sessionStorage.getItem('userRole') || 'sales';
    const newRole = currentRole === 'sales' ? 'technician' : 'sales';
    sessionStorage.setItem('userRole', newRole);
    renderApp();
    showNotification('Switched to ' + getRoleLabel(newRole));
}

// ══════════════════════════════════════════════════════════════
// PURCHASE ORDER FUNCTIONS
// ══════════════════════════════════════════════════════════════

function generatePOId() {
    const now = new Date();
    const date = now.toISOString().slice(0,10).replace(/-/g,'');
    // Next number after the highest used today (live or archived), so a deleted
    // PO's number is never handed out again and a restore can't clash.
    const prefix = 'PO' + date;
    const used = purchaseOrders.map(p => p.id).concat(Object.keys(archive.purchaseOrders || {}))
        .filter(id => id.startsWith(prefix))
        .map(id => parseInt(id.slice(prefix.length), 10) || 0);
    const seq = String(Math.max(0, ...used) + 1).padStart(3, '0');
    return `${prefix}${seq}`;
}

function savePurchaseOrder() {
    const customer = document.getElementById('poCustomer')?.value?.trim();
    const date = document.getElementById('poDate')?.value;
    const notes = document.getElementById('poNotes')?.value?.trim();
    const editId = document.getElementById('poEditId')?.value;

    if (!customer) { showNotification('Please enter customer name'); return; }
    if (!date) { showNotification('Please select a date'); return; }

    // Collect items
    const rows = document.querySelectorAll('.po-item-row');
    const items = [];
    let valid = true;
    rows.forEach(row => {
        const name = row.querySelector('.po-item-name')?.value?.trim();
        const qty = parseFloat(row.querySelector('.po-item-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.po-item-price')?.value) || 0;
        if (!name) { valid = false; return; }
        items.push({ name, qty, price });
    });
    if (!valid || items.length === 0) { showNotification('Please fill in all item details'); return; }

    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    const tax = subtotal * 0.07;
    const total = subtotal + tax;

    if (editId) {
        // Edit existing
        const idx = purchaseOrders.findIndex(p => p.id === editId);
        if (idx !== -1) {
            purchaseOrders[idx] = { ...purchaseOrders[idx], customer, date, notes, items, subtotal, tax, total };
            showNotification('Purchase Order updated!');
        }
    } else {
        // New PO
        const po = {
            id: generatePOId(),
            date,
            customer,
            notes,
            items,
            subtotal,
            tax,
            total,
            status: 'open',
            createdBy: sessionStorage.getItem('userEmail') || '',
            createdAt: new Date().toISOString(),
            linkedInvoiceId: null
        };
        purchaseOrders.unshift(po);
        showNotification('Purchase Order created!');
    }

    syncPOsToFirebase();
    closePOModal();
    renderApp();
}

function updatePOStatus(id, newStatus) {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return;
    po.status = newStatus;
    syncPOsToFirebase();
    renderApp();
    showNotification('Status updated to ' + newStatus);
}

async function convertPOToInvoice(id) {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return;
    if (!(await confirmDialog({ title: L('convertTitle'), message: `${po.id} · ${po.customer} — ${L('convertMsg')}`, confirmLabel: L('convertInvoice') }))) return;

    // Create invoice from PO
    const now = new Date();
    const date = now.toISOString().slice(0,10).replace(/-/g,'');
    const seq = String(quotations.length + 1).padStart(3, '0');
    const invoiceId = `QT${date}${seq}`;

    const invoice = {
        id: invoiceId,
        date: po.date,
        customer: po.customer,
        taxId: '',
        docType: 'invoice',
        items: po.items,
        subtotal: po.subtotal,
        tax: po.tax,
        total: po.total,
        status: 'draft',
        createdBy: sessionStorage.getItem('userEmail') || '',
        createdAt: now.toISOString(),
        fromPO: po.id
    };

    quotations.unshift(invoice);

    // Mark PO as completed and link invoice
    po.status = 'completed';
    po.linkedInvoiceId = invoiceId;

    syncToFirebase();
    syncPOsToFirebase();
    closePOModal();
    currentView = 'bills';
    renderApp();
    showNotification('✅ ' + L('invoiceCreated'), { detail: `${invoiceId} ← ${po.id}` });
}

function deletePO(id) {
    closePOModal();
    removeWithUndo('purchaseOrders', id, L('poDeleted'));
}

function syncPOsToFirebase() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        firebase.database().ref('purchaseOrders').set(purchaseOrders);
    }
}

function poItemRow(item) {
    const it = item || {};
    return `
    <div class="po-item-row" style="display:grid;grid-template-columns:1fr 66px 108px 34px;gap:6px;align-items:center;">
        <input class="po-item-name input" placeholder="Item name" value="${esc(it.name || '')}">
        <input class="po-item-qty input" type="number" min="1" value="${it.qty || 1}" oninput="updatePOTotals()">
        <input class="po-item-price input" type="number" min="0" placeholder="0.00" value="${it.price != null ? it.price : ''}" oninput="updatePOTotals()">
        <button type="button" class="icon-btn" onclick="removePOItem(this)">${icon('trash','')}</button>
    </div>`;
}

function openPOForm(id = null) {
    const po = id ? purchaseOrders.find(p => p.id === id) : null;
    const today = new Date().toISOString().slice(0, 10);
    const itemsHtml = (po ? po.items : [{}]).map(poItemRow).join('');

    const modal = `
    <div id="poModal" class="scrim" onclick="if(event.target.id==='poModal')closePOModal()">
      <div class="sheet">
        <div class="sheet-head">
          <div class="h">${po ? 'Edit Purchase Order' : 'New Purchase Order'}</div>
          <button class="sheet-x" onclick="closePOModal()">${icon('x','')}</button>
        </div>
        <div class="sheet-body">
          <input type="hidden" id="poEditId" value="${po ? esc(po.id) : ''}">
          <div class="grid-2">
            <div class="field"><span class="field-label">${L('customer')} *</span><input id="poCustomer" class="input" value="${po ? esc(po.customer) : ''}" placeholder="Customer name"></div>
            <div class="field"><span class="field-label">${L('date')} *</span><input id="poDate" type="date" class="input" value="${po ? po.date : today}"></div>
          </div>
          <div class="field">
            <div style="display:grid;grid-template-columns:1fr 66px 108px 34px;gap:6px;">
              <span class="field-label">${L('itemsCol')}</span><span class="field-label">${L('qty')}</span><span class="field-label">${L('unitPrice')}</span><span></span>
            </div>
            <div id="poItemList" class="stack" style="gap:6px;">${itemsHtml}</div>
            <button type="button" class="btn btn-secondary btn-block btn-sm" style="border-style:dashed;margin-top:8px;" onclick="addPOItem()">${icon('plus')}${L('addItem')}</button>
          </div>
          <div class="fieldset" style="background:var(--surface-2);text-align:right;gap:4px;">
            <div class="muted" style="font-size:var(--t-meta);">${L('subtotal')}: <span class="tnum">฿<span id="poSubtotal">0.00</span></span></div>
            <div class="muted" style="font-size:var(--t-meta);">${L('tax7')}: <span class="tnum">฿<span id="poTax">0.00</span></span></div>
            <div style="font-weight:700;color:var(--accent);">${L('total')}: <span class="tnum">฿<span id="poTotal">0.00</span></span></div>
          </div>
          <div class="field"><span class="field-label">${L('notes')} (optional)</span><textarea id="poNotes" class="textarea" placeholder="Additional notes…">${po ? esc(po.notes || '') : ''}</textarea></div>
        </div>
        <div class="sheet-foot">
          <button class="btn btn-primary btn-block" onclick="savePurchaseOrder()">${po ? L('saveChanges') : L('createPO')}</button>
          <button class="btn btn-secondary" onclick="closePOModal()">${L('cancel')}</button>
        </div>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modal);
    updatePOTotals();
}

function addPOItem() {
    const list = document.getElementById('poItemList');
    const wrap = document.createElement('div');
    wrap.innerHTML = poItemRow(null).trim();
    list.appendChild(wrap.firstChild);
}

function removePOItem(btn) {
    btn.closest('.po-item-row').remove();
    updatePOTotals();
}

function updatePOTotals() {
    let subtotal = 0;
    document.querySelectorAll('.po-item-row').forEach(row => {
        const qty = parseFloat(row.querySelector('.po-item-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.po-item-price')?.value) || 0;
        subtotal += qty * price;
    });
    const tax = subtotal * 0.07;
    const total = subtotal + tax;
    const el = (id) => document.getElementById(id);
    if (el('poSubtotal')) el('poSubtotal').textContent = fmt(subtotal);
    if (el('poTax')) el('poTax').textContent = fmt(tax);
    if (el('poTotal')) el('poTotal').textContent = fmt(total);
}

function closePOModal() {
    const m = document.getElementById('poModal');
    if (m) m.remove();
}

// ══════════════════════════════════════════════════════════════
// COST TRACKING + MATERIAL COST PER SUPPLIER
// ══════════════════════════════════════════════════════════════

function openPOCostPanel(poId) {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    const costs = poCosts.filter(c => c.poId === poId);
    const totalCost = costs.reduce((s, c) => s + c.amount, 0);
    const profit = po.total - totalCost;
    const costPill = { labor:'pill-open', transport:'pill-pending', material:'pill-brand', other:'pill-neutral' };

    const costRows = costs.length === 0
        ? `<div class="empty" style="padding:var(--s5);"><span class="muted">${L('noCosts')}</span></div>`
        : costs.map(c => `
            <div class="row" style="padding:9px 0;">
              <span class="pill pill-plain ${costPill[c.type] || 'pill-neutral'}" style="text-transform:capitalize;min-width:66px;justify-content:center;">${c.type}</span>
              <div class="row-main">
                <div class="t" style="font-weight:500;">${esc(c.description)}</div>
                ${c.supplier ? `<div class="s">${L('supplierCol')}: ${esc(c.supplier)}</div>` : ''}
              </div>
              <div class="tnum" style="font-weight:600;">฿${fmt(c.amount)}</div>
              <button class="icon-btn" onclick="deletePOCost('${c.id}','${poId}')">${icon('trash','')}</button>
            </div>`).join('');

    const modal = `
    <div id="poCostModal" class="scrim" onclick="if(event.target.id==='poCostModal')closePOCostModal()">
      <div class="sheet">
        <div class="sheet-head">
          <div><div class="h">${L('costTracking')}</div><div class="sub">${esc(po.id)} · ${esc(po.customer)}</div></div>
          <button class="sheet-x" onclick="closePOCostModal()">${icon('x','')}</button>
        </div>
        <div class="sheet-body">
          <div class="grid-3">
            <div class="stat" style="--stat-accent:var(--accent);padding:12px;text-align:center;">
              <div class="stat-label">${L('poRevenue')}</div><div class="stat-value tnum" style="font-size:var(--t-lede);">฿${fmt(po.total)}</div>
            </div>
            <div class="stat" style="--stat-accent:var(--neg);padding:12px;text-align:center;">
              <div class="stat-label">${L('totalCost')}</div><div class="stat-value tnum" style="font-size:var(--t-lede);">฿${fmt(totalCost)}</div>
            </div>
            <div class="stat" style="--stat-accent:${profit >= 0 ? 'var(--pos)' : 'var(--neg)'};padding:12px;text-align:center;">
              <div class="stat-label">${L('profit')}</div><div class="stat-value tnum" style="font-size:var(--t-lede);color:${profit >= 0 ? 'var(--pos)' : 'var(--neg)'};">฿${fmt(profit)}</div>
            </div>
          </div>

          <div>
            <span class="card-title">${L('costEntries')}</span>
            <div id="costList">${costRows}</div>
          </div>

          <div class="fieldset">
            <h3>${L('addCostTitle')}</h3>
            <div class="grid-2">
              <div class="field"><span class="field-label">${L('typeLbl')}</span>
                <select id="costType" class="select" onchange="toggleSupplierField()">
                  <option value="labor">${L('labor')}</option>
                  <option value="transport">${L('transport')}</option>
                  <option value="material">${L('material')}</option>
                  <option value="other">${L('other')}</option>
                </select>
              </div>
              <div class="field"><span class="field-label">${L('amount')}</span><input id="costAmount" type="number" min="0" class="input" placeholder="0.00"></div>
            </div>
            <div class="field"><span class="field-label">${L('descriptionLbl')}</span><input id="costDesc" class="input" placeholder="e.g. Pipe installation labor"></div>
            <div class="field hidden" id="supplierField"><span class="field-label">${L('supplierLbl')}</span><input id="costSupplier" class="input" placeholder="e.g. Supplier A"></div>
            <button class="btn btn-primary btn-block" onclick="addPOCost('${poId}')">${L('addCost')}</button>
          </div>
        </div>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modal);
}

function toggleSupplierField() {
    const type = document.getElementById('costType')?.value;
    const field = document.getElementById('supplierField');
    if (field) field.classList.toggle('hidden', type !== 'material');
}

function addPOCost(poId) {
    const type    = document.getElementById('costType')?.value;
    const amount  = parseFloat(document.getElementById('costAmount')?.value) || 0;
    const desc    = document.getElementById('costDesc')?.value?.trim();
    const supplier = document.getElementById('costSupplier')?.value?.trim();

    if (!desc) { showNotification('Please enter a description'); return; }
    if (amount <= 0) { showNotification('Please enter a valid amount'); return; }

    const cost = {
        id: 'COST-' + Date.now(),
        poId,
        type,
        description: desc,
        amount,
        supplier: type === 'material' ? supplier : '',
        date: new Date().toISOString().slice(0,10),
        createdBy: sessionStorage.getItem('userEmail') || ''
    };

    poCosts.push(cost);

    // If material type, also save to materialPrices for supplier comparison
    if (type === 'material' && supplier && desc) {
        materialPrices.push({
            id: 'MAT-' + Date.now(),
            materialName: desc,
            supplier,
            pricePerUnit: amount,
            poId,
            date: cost.date
        });
        syncMaterialPricesToFirebase();
    }

    syncCostsToFirebase();
    closePOCostModal();
    openPOCostPanel(poId);
    showNotification('Cost added!');
}

function deletePOCost(costId, poId) {
    // Refresh the cost panel if it's still open, otherwise the page behind it.
    const refresh = () => {
        if (document.getElementById('poCostModal')) { closePOCostModal(); openPOCostPanel(poId); }
        else renderApp();
    };
    removeWithUndo('poCosts', costId, L('costDeleted'), refresh);
}

function closePOCostModal() {
    const m = document.getElementById('poCostModal');
    if (m) m.remove();
}

function syncCostsToFirebase() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        firebase.database().ref('poCosts').set(poCosts);
    }
}

function syncMaterialPricesToFirebase() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        firebase.database().ref('materialPrices').set(materialPrices);
    }
}
