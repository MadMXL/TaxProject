// ═══════════════════════════════════════════════════════════════
// Baigamgab · SmartLedger — Purchase requests
// Low stock → request → approval decided by the total → ordered → received.
//
//   total ≤ autoApprove   approved automatically (a technician only while
//                         their approved orders this month stay ≤ techMonthly)
//   total ≤ managerMax    a Manager approves
//   above                 the Owner (Admin) approves
//
// Limits live in companyInfo.purchaseLimits (Admin → Company). Nobody approves
// their own request except the Owner; technicians request but never approve.
// A request is created automatically when stock drops to its minimum, with the
// quantity topped up to the item's full level and the cheapest known supplier.
// Receiving adds the stock, books the cost on the job and records the price in
// Supplier Prices. Requests are never deleted, only cancelled (audit trail).
// The limits are checked here in the browser; the database rules only check
// the role (documented as future work).
// ═══════════════════════════════════════════════════════════════

const DEFAULT_PURCHASE_LIMITS = { autoApprove: 3000, managerMax: 30000, techMonthly: 10000 };
const OPEN_PR = ['pending', 'approved', 'ordered'];
const SYSTEM_USER = 'system';

function purchaseLimits() { return Object.assign({}, DEFAULT_PURCHASE_LIMITS, companyInfo.purchaseLimits || {}); }
function myEmail() { return sessionStorage.getItem('userEmail') || ''; }
function canRequestPurchase() { return currentRole() !== 'sales'; }
function canOrderPurchase() { const r = currentRole(); return r === 'manager' || r === 'admin'; }
function money0(n) { return '฿' + fmtInt(n); }
function who(email) { return email === SYSTEM_USER ? L('systemUser') : (email || '').split('@')[0] || '—'; }
function normName(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }

function openRequestFor(itemId) { return purchaseRequests.find(p => p.itemId === itemId && OPEN_PR.includes(p.status)); }

// Cheapest recorded price for this material, else the item's usual supplier and last price.
function supplierQuote(item) {
  const key = normName(item.name);
  const quotes = materialPrices.filter(m => normName(m.materialName) === key && Number(m.pricePerUnit) > 0);
  if (quotes.length) {
    const best = quotes.reduce((a, b) => (Number(b.pricePerUnit) < Number(a.pricePerUnit) ? b : a));
    return { supplier: best.supplier, unitPrice: Number(best.pricePerUnit) };
  }
  return { supplier: item.supplier || '', unitPrice: Number(item.unitCost) || 0 };
}

// Top the item up to its full level (twice the minimum when none is set).
function suggestedQty(item) {
  const full = Number(item.maxQty) > 0 ? Number(item.maxQty) : (Number(item.minQty) || 0) * 2;
  return Math.max(Math.ceil(full - (Number(item.qty) || 0)), 1);
}

// Approved, ordered or received this month, by one requester.
function monthSpent(email, ym = localDateISO().slice(0, 7)) {
  return purchaseRequests
    .filter(p => p.requestedBy === email && ['approved', 'ordered', 'received'].includes(p.status) && (p.date || '').slice(0, 7) === ym)
    .reduce((s, p) => s + (Number(p.total) || 0), 0);
}

// Who must approve a request of this total. reason explains a step up from automatic.
function approvalFor(total, requester, role) {
  const lim = purchaseLimits();
  if (!(total > 0)) return { level: 'manager', reason: 'noPrice' };
  if (total <= lim.autoApprove) {
    if (role === 'technician' && monthSpent(requester) + total > lim.techMonthly) return { level: 'manager', reason: 'monthly' };
    return { level: 'auto' };
  }
  return total <= lim.managerMax ? { level: 'manager' } : { level: 'owner' };
}

function canApprove(p) {
  if (p.status !== 'pending') return false;
  const r = currentRole();
  if (r === 'admin') return true;                       // the Owner may approve anything, own requests too
  return r === 'manager' && p.approvalLevel === 'manager' && p.requestedBy !== myEmail();
}
function waitingForMe() { return purchaseRequests.filter(canApprove).length; }
function toReceiveCount() { return purchaseRequests.filter(p => p.status === 'approved' || p.status === 'ordered').length; }

function nextPRId() {
  const y = localDateISO().slice(0, 4);
  const n = purchaseRequests.reduce((m, p) => {
    const mt = /^PR-(\d{4})-(\d+)$/.exec(p.id || '');
    return mt && mt[1] === y ? Math.max(m, Number(mt[2])) : m;
  }, 0) + 1;
  return `PR-${y}-${String(n).padStart(4, '0')}`;
}

function persistPurchases() {
  try { localStorage.setItem('purchaseRequests', JSON.stringify(purchaseRequests)); } catch (e) { console.warn('purchase save failed', e); }
  if (typeof isFirebaseEnabled !== 'undefined' && isFirebaseEnabled) {
    database.ref('purchaseRequests').set(purchaseRequests).catch(e => console.warn('purchaseRequests sync error', e));
  }
}

function createPurchaseRequest({ item, qty, supplier, unitPrice, jobId = '', note = '', auto = false }) {
  const now = new Date();
  const requester = auto ? SYSTEM_USER : myEmail();
  const total = Math.round(qty * unitPrice * 100) / 100;
  const ap = approvalFor(total, requester, auto ? SYSTEM_USER : currentRole());
  const p = {
    id: nextPRId(), date: localDateISO(now), itemId: item.id, itemName: item.name, unit: item.unit,
    qty, supplier, unitPrice, total, jobId, note, source: auto ? 'auto' : 'manual',
    approvalLevel: ap.level, status: ap.level === 'auto' ? 'approved' : 'pending',
    requestedBy: requester, requestedAt: now.toISOString(),
  };
  if (ap.level === 'auto') { p.approvedBy = SYSTEM_USER; p.approvedAt = p.requestedAt; }
  purchaseRequests.push(p);
  return p;
}

function outcomeText(p) {
  return p.status === 'approved' ? Lf('prCreatedAuto', { id: p.id })
    : Lf('prCreatedWait', { id: p.id, who: L(p.approvalLevel === 'owner' ? 'roleOwner' : 'roleManager') });
}

// Called by saveStockMove when an item crosses into low/out. Returns the new request or null.
function autoRequestFor(item) {
  if (openRequestFor(item.id)) return null;
  const q = supplierQuote(item);
  const p = createPurchaseRequest({ item, qty: suggestedQty(item), supplier: q.supplier, unitPrice: q.unitPrice,
    note: getLang() === 'th' ? 'สร้างอัตโนมัติ: สต็อกถึงขั้นต่ำ' : 'Created automatically: stock reached its minimum', auto: true });
  persistPurchases();
  return p;
}

// Low items with no open request: what the page suggests ordering.
function purchaseSuggestions() { return stockAlerts().filter(s => !openRequestFor(s.id)); }

function requestAllSuggested() {
  const list = purchaseSuggestions();
  if (!list.length) return;
  const made = list.map(s => { const q = supplierQuote(s); return createPurchaseRequest({ item: s, qty: suggestedQty(s), supplier: q.supplier, unitPrice: q.unitPrice }); });
  persistPurchases();
  renderApp();
  const auto = made.filter(p => p.status === 'approved').length;
  showNotification('✅ ' + Lf('prBatchMade', { n: made.length }), { detail: Lf('prBatchDetail', { auto, wait: made.length - auto }) });
}

// ── Page ─────────────────────────────────────────────────────
const PR_FILTERS = {
  open: p => OPEN_PR.includes(p.status), pending: p => p.status === 'pending', approved: p => p.status === 'approved',
  ordered: p => p.status === 'ordered', received: p => p.status === 'received',
  closed: p => p.status === 'rejected' || p.status === 'cancelled', all: () => true,
};
function setPurchaseFilter(f) { purchaseFilter = f; renderApp(); }

function prStatusPill(p) {
  const map = {
    pending: ['pill-pending', Lf('stWaitingFor', { who: L(p.approvalLevel === 'owner' ? 'roleOwner' : 'roleManager') })],
    approved: ['pill-open', L('stApprovedToOrder')], ordered: ['pill-progress', L('prOrdered')],
    received: ['pill-approved', L('prReceived')], rejected: ['pill-rejected', L('rejected')], cancelled: ['pill-neutral', L('stCancelled')],
  };
  const [cls, label] = map[p.status] || ['pill-neutral', p.status];
  return `<span class="pill ${cls}">${esc(label)}</span>`;
}

function prActions(p) {
  const a = [];
  const me = myEmail();
  if (canApprove(p)) {
    a.push(`<button class="act act-pos act-strong" onclick="approvePR('${p.id}')">${L('approve')}</button>`);
    a.push(`<button class="act act-danger" onclick="rejectPR('${p.id}')">${L('reject')}</button>`);
  }
  if (p.status === 'approved' && canOrderPurchase()) a.push(`<button class="act act-primary" onclick="markPROrdered('${p.id}')">${L('markOrdered')}</button>`);
  if ((p.status === 'approved' || p.status === 'ordered') && canRequestPurchase()) a.push(`<button class="act act-pos" onclick="openReceivePR('${p.id}')">${icon('plus', 'act-ico')}${L('receive')}</button>`);
  if ((p.status === 'pending' || p.status === 'approved') && (p.requestedBy === me || canOrderPurchase())) a.push(`<button class="act" onclick="cancelPR('${p.id}')">${L('cancelRequest')}</button>`);
  if (p.status === 'pending' && p.requestedBy === me && !canApprove(p) && currentRole() === 'manager') a.push(`<span class="cell-sub">${esc(L('noOwnApprove'))}</span>`);
  return a.join('');
}

function renderPurchasesView() {
  const th = getLang() === 'th';
  const lim = purchaseLimits();
  const role = currentRole();
  const counts = {};
  Object.keys(PR_FILTERS).forEach(k => { counts[k] = purchaseRequests.filter(PR_FILTERS[k]).length; });
  const chip = (k, label) => `<button class="chip" aria-pressed="${purchaseFilter === k}" onclick="setPurchaseFilter('${k}')">${esc(label)} <span class="n">${counts[k]}</span></button>`;
  const list = purchaseRequests.filter(PR_FILTERS[purchaseFilter] || PR_FILTERS.open).slice().sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));
  const sugg = canRequestPurchase() ? purchaseSuggestions() : [];

  // My monthly spend (technicians have a monthly limit)
  const spent = monthSpent(myEmail());
  const budget = role === 'technician' ? `
    <div class="pr-budget">
      <div class="spread"><span class="field-label">${L('prMyMonth')}</span><b class="tnum">${esc(Lf('prMonthLimit', { used: money0(spent), limit: money0(lim.techMonthly) }))}</b></div>
      <span class="meter"><i style="width:${Math.min(spent / lim.techMonthly * 100, 100).toFixed(1)}%;${spent >= lim.techMonthly ? 'background:var(--st-rejected);' : ''}"></i></span>
    </div>` : '';

  const rows = list.map(p => {
    const job = p.jobId ? ` · ${esc(p.jobId)}` : '';
    return `<tr>
      <td style="white-space:nowrap;"><div class="cell-strong">${esc(p.id)}</div><div class="cell-sub">${esc(p.date)} · ${esc(who(p.requestedBy))}</div></td>
      <td><div class="cell-strong">${esc(p.itemName)}</div><div class="cell-sub tnum">${fmtQty(p.qty)} ${esc(p.unit)}${job}</div>${p.note ? `<div class="cell-sub">${esc(p.note)}</div>` : ''}</td>
      <td><div>${esc(p.supplier || '—')}</div><div class="cell-sub tnum">${p.unitPrice > 0 ? '฿' + fmt(p.unitPrice) + ' / ' + esc(p.unit) : esc(L('noPriceYet'))}</div></td>
      <td class="num cell-strong tnum">${baht(p.status === 'received' && p.receivedTotal != null ? p.receivedTotal : p.total)}</td>
      <td>${prStatusPill(p)}${p.status === 'rejected' && p.rejectReason ? `<div class="cell-sub" style="color:var(--st-rejected);">“${esc(p.rejectReason)}”</div>` : ''}
        ${p.approvedBy ? `<div class="cell-sub">${esc(p.approvedBy === SYSTEM_USER ? L('approvedAuto') : L('approvedBy') + ' ' + who(p.approvedBy))}</div>` : ''}</td>
      <td style="white-space:nowrap;">${prActions(p)}</td>
    </tr>`;
  }).join('');

  const suggRows = sugg.map(s => {
    const q = supplierQuote(s), n = suggestedQty(s), est = n * q.unitPrice;
    return `<tr>
      <td><div class="cell-strong">${esc(s.name)}</div><div class="cell-sub tnum">${L('onHand')} ${fmtQty(s.qty)} / ${L('minLevel')} ${fmtQty(s.minQty)} ${esc(s.unit)}</div></td>
      <td class="num tnum">${fmtQty(n)} ${esc(s.unit)}</td>
      <td>${esc(q.supplier || '—')}</td>
      <td class="num tnum">${q.unitPrice > 0 ? baht(est) : '—'}</td>
      <td><button class="act act-primary act-strong" onclick="openPRForm('${s.id}')">${L('request')}</button></td>
    </tr>`;
  }).join('');

  return `
    <div class="view-head">
      <div><h1>${L('purchases')}</h1><p>${esc(Lf('prSub', { wait: counts.pending, open: counts.open }))}</p></div>
      ${canRequestPurchase() ? `<button class="btn btn-primary" onclick="openPRForm()">${icon('plus')}${L('newRequest')}</button>` : ''}
    </div>

    <div class="card card-pad stack">
      <div class="pr-rules">
        <div class="pr-rule is-auto"><b class="tnum">${esc(Lf('prRuleAuto', { a: money0(lim.autoApprove) }))}</b><span>${L('approvedAuto')}</span></div>
        <div class="pr-rule"><b class="tnum">${esc(Lf('prRuleMgr', { a: money0(lim.autoApprove), b: money0(lim.managerMax) }))}</b><span>${L('roleManager')} ${th ? 'อนุมัติ' : 'approves'}</span></div>
        <div class="pr-rule"><b class="tnum">${esc(Lf('prRuleOwner', { b: money0(lim.managerMax) }))}</b><span>${L('roleOwner')} ${th ? 'อนุมัติ' : 'approves'}</span></div>
      </div>
      ${budget}
    </div>

    ${sugg.length ? `<div class="card">
      <div class="card-head" style="flex-wrap:wrap;">
        <div><span class="card-title">${L('prSuggest')}</span><div class="cell-sub">${esc(L('prSuggestSub'))}</div></div>
        <button class="btn btn-primary btn-sm" onclick="requestAllSuggested()">${icon('plus', '')}${esc(Lf('requestAll', { n: sugg.length }))}</button>
      </div>
      <div class="table-wrap"><table class="table" style="min-width:640px;">
        <thead><tr><th>${L('itemName')}</th><th class="num">${L('suggestedQty')}</th><th>${L('supplierCol')}</th><th class="num">${L('estCost')}</th><th></th></tr></thead>
        <tbody>${suggRows}</tbody></table></div>
    </div>` : ''}

    <div class="card card-pad"><div class="chips">
      ${chip('open', L('prOpen'))}${chip('pending', L('prWaiting'))}${chip('approved', L('prToOrder'))}${chip('ordered', L('prOrdered'))}${chip('received', L('prReceived'))}${chip('closed', L('prClosed'))}${chip('all', L('allFilter'))}
    </div></div>

    ${list.length ? `<div class="card"><div class="table-wrap"><table class="table" style="min-width:900px;">
      <thead><tr><th>${th ? 'คำขอ' : 'Request'}</th><th>${L('itemName')}</th><th>${L('supplierCol')}</th><th class="num">${L('total')}</th><th>${L('statusCol')}</th><th>${L('actions')}</th></tr></thead>
      <tbody>${rows}</tbody></table></div></div>`
    : emptyState(L('noRequests'), L('noRequestsHint'), 'cart')}`;
}

// ── New request sheet ────────────────────────────────────────
function openPRForm(itemId) {
  if (!canRequestPurchase()) return;
  closePRSheet();
  const items = stockItems.slice().sort((a, b) => a.name.localeCompare(b.name, 'th'));
  if (!items.length) { showNotification('⚠️ ' + L('noStock')); return; }
  const first = items.find(s => s.id === itemId) || purchaseSuggestions()[0] || items[0];
  const jobs = purchaseOrders.filter(p => p.status !== 'completed');
  const suppliers = [...new Set(materialPrices.map(m => m.supplier).concat(stockItems.map(s => s.supplier)).filter(Boolean))];
  const html = `
  <div id="prSheet" class="scrim" onclick="if(event.target.id==='prSheet')closePRSheet()">
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="prTitle" style="max-width:480px;">
      <div class="sheet-head"><div id="prTitle" class="h">${L('requestTitle')}</div>
        <button class="sheet-x" onclick="closePRSheet()" aria-label="${L('close')}">${icon('x', '')}</button></div>
      <form class="sheet-body" onsubmit="event.preventDefault();savePR()" oninput="updatePRPreview()">
        <label class="field"><span class="field-label">${L('itemName')} *</span>
          <select id="prItem" class="select" onchange="fillPRFromItem()">${items.map(s => `<option value="${esc(s.id)}" ${s.id === first.id ? 'selected' : ''}>${esc(s.name)}${stockState(s) !== 'ok' ? ' · ' + esc(stockStatusLabel(s)) : ''}</option>`).join('')}</select>
          <span id="prItemHint" class="cell-sub"></span></label>
        <div class="grid-2">
          <label class="field"><span id="prQtyLabel" class="field-label">${L('qty')} *</span>
            <input id="prQty" class="input tnum" type="number" inputmode="decimal" min="0" step="any" required></label>
          <label class="field"><span class="field-label">${L('pricePerUnit')} *</span>
            <input id="prPrice" class="input tnum" type="number" inputmode="decimal" min="0" step="0.01" required></label>
        </div>
        <label class="field"><span class="field-label">${L('supplierCol')}</span>
          <input id="prSupplier" class="input" list="prSuppliers" maxlength="80">
          <datalist id="prSuppliers">${suppliers.map(x => `<option value="${esc(x)}"></option>`).join('')}</datalist></label>
        <label class="field"><span class="field-label">${L('forJob')}</span>
          <select id="prJob" class="select"><option value="">${L('noJob')}</option>${jobs.map(p => `<option value="${esc(p.id)}">${esc(p.id)} · ${esc(p.customer)}</option>`).join('')}</select></label>
        <label class="field"><span class="field-label">${L('moveNote')}</span><input id="prNote" class="input" maxlength="140"></label>
        <div id="prPreview" class="pr-preview" role="status"></div>
        <div id="prError" class="alert-err hidden" role="alert"></div>
        <div class="dialog-foot">
          <button type="button" class="btn btn-secondary" onclick="closePRSheet()">${L('cancel')}</button>
          <button type="submit" class="btn btn-primary">${L('sendRequest')}</button>
        </div>
      </form>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.addEventListener('keydown', prSheetKey);
  fillPRFromItem();
  document.getElementById('prQty').focus();
}

function fillPRFromItem() {
  const s = stockItems.find(x => x.id === document.getElementById('prItem')?.value);
  if (!s) return;
  const q = supplierQuote(s);
  document.getElementById('prQty').value = suggestedQty(s);
  document.getElementById('prPrice').value = q.unitPrice || '';
  document.getElementById('prSupplier').value = q.supplier || '';
  document.getElementById('prQtyLabel').textContent = `${L('qty')} (${s.unit}) *`;
  const open = openRequestFor(s.id);
  document.getElementById('prItemHint').textContent = `${L('onHand')} ${fmtQty(s.qty)} · ${L('minLevel')} ${fmtQty(s.minQty)} · ${L('fullLevelShort')} ${fmtQty(s.maxQty || s.minQty * 2)} ${s.unit}`
    + (open ? ` · ${Lf('alreadyOpen', { id: open.id })}` : '');
  updatePRPreview();
}

function updatePRPreview() {
  const box = document.getElementById('prPreview');
  if (!box) return;
  const qty = parseFloat(document.getElementById('prQty').value) || 0;
  const price = parseFloat(document.getElementById('prPrice').value) || 0;
  const total = Math.round(qty * price * 100) / 100;
  const ap = approvalFor(total, myEmail(), currentRole());
  const lim = purchaseLimits();
  const text = ap.reason === 'noPrice' ? L('outcomeNoPrice')
    : ap.reason === 'monthly' ? Lf('outcomeMonthly', { used: money0(monthSpent(myEmail())), limit: money0(lim.techMonthly) })
    : L({ auto: 'outcomeAuto', manager: 'outcomeMgr', owner: 'outcomeOwner' }[ap.level]);
  box.className = 'pr-preview is-' + ap.level;
  box.innerHTML = `<div class="spread"><span>${L('total')}</span><b class="tnum">${baht(total)}</b></div><div class="pr-outcome">${icon(ap.level === 'auto' ? 'check' : 'clipboard', '')}<span>${esc(text)}</span></div>`;
}

function savePR() {
  const s = stockItems.find(x => x.id === document.getElementById('prItem')?.value);
  const qty = parseFloat(document.getElementById('prQty').value);
  const price = parseFloat(document.getElementById('prPrice').value);
  const err = document.getElementById('prError');
  const fail = m => { err.textContent = m; err.classList.remove('hidden'); };
  if (!s) return fail(L('enterName'));
  if (!(qty > 0)) return fail(L('enterQty'));
  if (!(price >= 0)) return fail(L('pricePerUnit') + ' ≥ 0');
  const p = createPurchaseRequest({ item: s, qty: Math.round(qty * 100) / 100, supplier: document.getElementById('prSupplier').value.trim(),
    unitPrice: Math.round(price * 100) / 100, jobId: document.getElementById('prJob').value, note: document.getElementById('prNote').value.trim() });
  persistPurchases();
  closePRSheet();
  if (currentView === 'purchases') purchaseFilter = 'open';
  renderApp();
  showNotification('✅ ' + outcomeText(p), { detail: `${p.itemName} · ${fmtQty(p.qty)} ${p.unit} · ฿${fmt(p.total)}` });
}

function prSheetKey(e) { if (e.key === 'Escape') closePRSheet(); }
function closePRSheet() {
  document.getElementById('prSheet')?.remove();
  document.removeEventListener('keydown', prSheetKey);
}

// ── Approve / reject / order / cancel ────────────────────────
function findPR(id) { return purchaseRequests.find(p => p.id === id); }

async function approvePR(id) {
  const p = findPR(id);
  if (!p || !canApprove(p)) return;
  if (!(await confirmDialog({ title: Lf('approvePrTitle', { id }), message: `${p.itemName} · ${fmtQty(p.qty)} ${p.unit} · ฿${fmt(p.total)}`, confirmLabel: L('approve') }))) return;
  Object.assign(p, { status: 'approved', approvedBy: myEmail(), approvedAt: new Date().toISOString() });
  persistPurchases(); renderApp();
  showNotification('✅ ' + Lf('prApprovedMsg', { id }));
}

async function rejectPR(id) {
  const p = findPR(id);
  if (!p || !canApprove(p)) return;
  const reason = await confirmDialog({ title: Lf('rejectPrTitle', { id }), message: `${p.itemName} · ฿${fmt(p.total)}`, confirmLabel: L('reject'), danger: true, input: { label: L('rejectReason') } });
  if (!reason) return;
  Object.assign(p, { status: 'rejected', rejectedBy: myEmail(), rejectedAt: new Date().toISOString(), rejectReason: reason });
  persistPurchases(); renderApp();
  showNotification('✅ ' + Lf('prRejectedMsg', { id }));
}

async function markPROrdered(id) {
  const p = findPR(id);
  if (!p || p.status !== 'approved' || !canOrderPurchase()) return;
  if (!(await confirmDialog({ title: Lf('orderedTitle', { id }), message: Lf('orderedMsg', { s: p.supplier || '—' }), confirmLabel: L('markOrdered') }))) return;
  Object.assign(p, { status: 'ordered', orderedBy: myEmail(), orderedAt: new Date().toISOString() });
  persistPurchases(); renderApp();
  showNotification('✅ ' + Lf('prOrderedMsg', { id }));
}

async function cancelPR(id) {
  const p = findPR(id);
  if (!p || !['pending', 'approved'].includes(p.status)) return;
  if (!(await confirmDialog({ title: Lf('cancelPrTitle', { id }), message: `${p.itemName} · ฿${fmt(p.total)}`, confirmLabel: L('cancelRequest'), cancelLabel: L('keepRequest'), danger: true }))) return;
  Object.assign(p, { status: 'cancelled', cancelledBy: myEmail(), cancelledAt: new Date().toISOString() });
  persistPurchases(); renderApp();
  showNotification('✅ ' + Lf('prCancelledMsg', { id }));
}

// ── Receive goods ────────────────────────────────────────────
function openReceivePR(id) {
  const p = findPR(id);
  if (!p || !['approved', 'ordered'].includes(p.status)) return;
  closePRSheet();
  const html = `
  <div id="prSheet" class="scrim" onclick="if(event.target.id==='prSheet')closePRSheet()">
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="rcTitle" style="max-width:440px;">
      <div class="sheet-head"><div><div class="k">${esc(p.id)} · ${esc(p.supplier || '—')}</div><div id="rcTitle" class="h">${esc(p.itemName)}</div></div>
        <button class="sheet-x" onclick="closePRSheet()" aria-label="${L('close')}">${icon('x', '')}</button></div>
      <form class="sheet-body" onsubmit="event.preventDefault();receivePR('${p.id}')">
        <div class="grid-2">
          <label class="field"><span class="field-label">${L('qtyReceived')} (${esc(p.unit)})</span>
            <input id="rcQty" class="input tnum" type="number" inputmode="decimal" min="0" step="any" required value="${esc(p.qty)}"></label>
          <label class="field"><span class="field-label">${L('pricePerUnit')}</span>
            <input id="rcPrice" class="input tnum" type="number" inputmode="decimal" min="0" step="0.01" required value="${esc(p.unitPrice)}"></label>
        </div>
        <div class="notice">${esc(L('receiveNote'))}</div>
        <div id="rcError" class="alert-err hidden" role="alert"></div>
        <div class="dialog-foot">
          <button type="button" class="btn btn-secondary" onclick="closePRSheet()">${L('cancel')}</button>
          <button type="submit" class="btn btn-primary">${L('receive')}</button>
        </div>
      </form>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.addEventListener('keydown', prSheetKey);
  document.getElementById('rcQty').focus();
}

function receivePR(id) {
  const p = findPR(id);
  if (!p) return;
  const qty = Math.round((parseFloat(document.getElementById('rcQty').value) || 0) * 100) / 100;
  const price = Math.round((parseFloat(document.getElementById('rcPrice').value) || 0) * 100) / 100;
  const err = document.getElementById('rcError');
  if (!(qty > 0)) { err.textContent = L('enterQty'); err.classList.remove('hidden'); return; }
  const now = new Date(), by = myEmail(), date = localDateISO(now), total = Math.round(qty * price * 100) / 100;

  Object.assign(p, { status: 'received', receivedBy: by, receivedAt: now.toISOString(), receivedQty: qty, receivedPrice: price, receivedTotal: total });

  // 1. Stock goes up, with a movement that names the request
  const s = stockItems.find(x => x.id === p.itemId);
  if (s) {
    s.qty = roundQty((Number(s.qty) || 0) + qty);
    if (price > 0) s.unitCost = price;
    if (p.supplier) s.supplier = p.supplier;
    s.updatedAt = now.toISOString(); s.updatedBy = by;
    stockMoves.push({ id: 'MOV-' + now.getTime(), itemId: s.id, itemName: s.name, type: 'in', qty, after: s.qty,
      jobId: '', note: `${p.id}${p.supplier ? ' · ' + p.supplier : ''}`, date, at: now.toISOString(), by });
    persistStock();
  }
  // 2. The cost goes on the job
  if (p.jobId && total > 0) {
    poCosts.push({ id: 'COST-' + now.getTime(), poId: p.jobId, type: 'material', description: `${p.itemName} × ${fmtQty(qty)} ${p.unit} (${p.id})`,
      amount: total, supplier: p.supplier || '', date, createdBy: by });
    syncCostsToFirebase();
  }
  // 3. The price joins Supplier Prices for next time
  if (p.supplier && price > 0) {
    materialPrices.push({ id: 'MAT-' + now.getTime(), materialName: p.itemName, supplier: p.supplier, pricePerUnit: price, date, poId: p.jobId || null, notes: p.id });
    syncMaterialPricesToFirebase();
  }
  saveToLocalStorage();
  persistPurchases();
  closePRSheet();
  renderApp();
  showNotification('✅ ' + Lf('prReceivedMsg', { id }), { detail: s ? `${s.name}: ${fmtQty(s.qty)} ${s.unit}` : '' });
}
