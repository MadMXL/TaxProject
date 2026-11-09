// ═══════════════════════════════════════════════════════════════
// Baigamgab · SmartLedger — Stock
// Materials kept on hand. Quantities change only through movements:
//   in    = Receive (adds)       out = Use (subtracts, may name a job)
//   count = stock-take (sets the exact figure found on the shelf)
// An item is "low" at or below its minimum and "out" at zero. Low items
// raise a badge on the Stock tab, a banner on Overview and Stock, and an
// island after sign-in (see startupNotices in ui.js).
// Who: Technician, Manager and Admin record movements; Manager and Admin
// add, edit and delete items. Sales doesn't see stock.
// ═══════════════════════════════════════════════════════════════

const STOCK_CATEGORIES = ['electrical', 'steel', 'construction', 'maintenance', 'other'];
const STOCK_CAT_KEY = { electrical: 'catElectrical', steel: 'catSteel', construction: 'catConstruction', maintenance: 'catMaintenance', other: 'catOther' };

function currentRole() { return sessionStorage.getItem('userRole') || 'sales'; }
function canEditStock() { const r = currentRole(); return r === 'manager' || r === 'admin'; }
function canMoveStock() { return currentRole() !== 'sales'; }

function categoryLabel(c) { return L(STOCK_CAT_KEY[c] || 'catOther'); }
function fmtQty(n) { return (Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }); }

function stockState(s) {
  const qty = Number(s.qty) || 0;
  if (qty <= 0) return 'out';
  return qty <= (Number(s.minQty) || 0) ? 'low' : 'ok';
}
function stockStatusLabel(s) { return L({ ok: 'stOk', low: 'stLow', out: 'stOut' }[stockState(s)]); }
function stockPill(s) {
  const st = stockState(s);
  const cls = { ok: 'pill-approved', low: 'pill-pending', out: 'pill-rejected' }[st];
  return `<span class="pill ${cls}">${esc(stockStatusLabel(s))}</span>`;
}

// Items that need reordering: out of stock first, then the emptiest relative to minimum.
function stockAlerts() {
  const ratio = s => (Number(s.qty) || 0) / Math.max(Number(s.minQty) || 1, 1);
  return stockItems.filter(s => stockState(s) !== 'ok').sort((a, b) => ratio(a) - ratio(b));
}

// ── Persistence ──────────────────────────────────────────────
function persistStock() {
  try {
    localStorage.setItem('stockItems', JSON.stringify(stockItems));
    localStorage.setItem('stockMoves', JSON.stringify(stockMoves));
  } catch (e) { console.warn('stock save failed', e); }
  if (typeof isFirebaseEnabled !== 'undefined' && isFirebaseEnabled) {
    database.ref('stockItems').set(stockItems).catch(e => console.warn('stockItems sync error', e));
    database.ref('stockMoves').set(stockMoves).catch(e => console.warn('stockMoves sync error', e));
  }
}

// ── Low-stock banner (Overview + Stock) ──────────────────────
function stockBanner(onStockPage) {
  if (!canMoveStock()) return '';
  const alerts = stockAlerts();
  if (!alerts.length) return '';
  const out = alerts.filter(s => stockState(s) === 'out').length;
  const title = alerts.length === 1 ? Lf('lowBannerOne', { name: alerts[0].name }) : Lf('lowBannerMany', { n: alerts.length });
  const list = alerts.slice(0, 4).map(s =>
    `<span class="lb-item"><b>${esc(s.name)}</b> <span class="tnum">${fmtQty(s.qty)}/${fmtQty(s.minQty)} ${esc(s.unit)}</span></span>`).join('');
  return `
  <div class="low-banner ${out ? 'is-out' : ''}" role="status">
    <span class="lb-ico">${icon('alert', '')}</span>
    <div class="lb-main">
      <div class="lb-title">${esc(title)}${out ? ` <span class="lb-out">· ${esc(Lf('outBanner', { n: out }))}</span>` : ''}</div>
      <div class="lb-list">${list}${alerts.length > 4 ? `<span class="lb-item muted">+${alerts.length - 4}</span>` : ''}</div>
    </div>
    ${onStockPage
      ? (stockFilter !== 'low' ? `<button class="btn btn-secondary btn-sm" onclick="setStockFilter('low')">${L('stLow')} · ${alerts.length}</button>` : '')
      : `<button class="btn btn-secondary btn-sm" onclick="stockFilter='low';switchView('stock')">${L('openStock')} ${icon('arrowR', '')}</button>`}
  </div>`;
}

// ── Page ─────────────────────────────────────────────────────
function stockFiltered(withState = true) {
  const s = stockSearchQuery.trim().toLowerCase();
  return stockItems.filter(it => {
    const st = stockState(it);
    const stateOk = !withState || stockFilter === 'all' || (stockFilter === 'low' ? st !== 'ok' : st === stockFilter);
    return stateOk && (!s || (it.name || '').toLowerCase().includes(s) || categoryLabel(it.category).toLowerCase().includes(s));
  });
}
function setStockFilter(f) { stockFilter = f; renderApp(); }

function renderStockView() {
  const all = stockFiltered(false);
  // "Low" means needs reordering, so its chip also counts items that are out.
  const n = { all: all.length, low: 0, out: 0, ok: 0 };
  all.forEach(s => { const st = stockState(s); if (st === 'ok') n.ok++; else { n.low++; if (st === 'out') n.out++; } });
  const lowTotal = stockAlerts().length;
  const fchip = (val, label) => `<button class="chip" aria-pressed="${stockFilter === val}" onclick="setStockFilter('${val}')">${esc(label)} <span class="n">${n[val]}</span></button>`;

  return `
    <div class="view-head">
      <div><h1>${L('stock')}</h1><p>${esc(Lf('stockSub', { n: stockItems.length, low: lowTotal }))}</p></div>
      ${canEditStock() ? `<button class="btn btn-primary" onclick="openStockItemForm()">${icon('plus')}${L('addStockItem')}</button>` : ''}
    </div>

    ${stockBanner(true)}

    <div class="card card-pad stack">
      ${searchBox('stock', getLang() === 'th' ? 'ค้นหาชื่อวัสดุหรือหมวด…' : 'Search by item or category…')}
      <div class="chips">
        ${fchip('all', L('allFilter'))}${fchip('low', L('stLow'))}${fchip('out', L('stOut'))}${fchip('ok', L('stOk'))}
      </div>
    </div>

    <div id="searchResults">${stockResultsHTML()}</div>

    ${renderStockMoves()}`;
}

function lastMoveFor(id) {
  for (let i = stockMoves.length - 1; i >= 0; i--) if (stockMoves[i].itemId === id) return stockMoves[i];
  return null;
}

function stockResultsHTML() {
  if (!stockItems.length) {
    return emptyState(L('noStock'), L('noStockHint'), 'stock');
  }
  const list = stockFiltered();
  if (!list.length) return emptyState(L('noResults'), L('tryFilter2'), 'stock');
  const th = getLang() === 'th';
  const order = { out: 0, low: 1, ok: 2 };
  const rows = list.slice().sort((a, b) => order[stockState(a)] - order[stockState(b)] || a.name.localeCompare(b.name, 'th')).map(s => {
    const st = stockState(s);
    const mv = lastMoveFor(s.id);
    const when = mv ? mv.date : (s.updatedAt || '').slice(0, 10);
    const actions = [];
    if (canMoveStock()) {
      actions.push(`<button class="act act-pos" onclick="openStockMove('${s.id}','in')">${icon('plus', 'act-ico')}${L('receive')}</button>`);
      actions.push(`<button class="act act-warn" onclick="openStockMove('${s.id}','out')" ${st === 'out' ? 'disabled' : ''}>${icon('minus', 'act-ico')}${L('use')}</button>`);
      actions.push(`<button class="act" onclick="openStockHistory('${s.id}')">${L('history')}</button>`);
    }
    if (canEditStock()) {
      actions.push(`<button class="act" onclick="openStockItemForm('${s.id}')">${L('edit')}</button>`);
      actions.push(`<button class="act act-danger" onclick="deleteStockItem('${s.id}')">${L('delete')}</button>`);
    }
    return `<tr class="stock-row is-${st}">
      <td><button class="row-btn cell-strong stock-name" onclick="openStockHistory('${s.id}')">${esc(s.name)}</button><div class="cell-sub">${esc(categoryLabel(s.category))}</div></td>
      <td class="num"><span class="qty qty-${st} tnum">${fmtQty(s.qty)}</span> <span class="cell-sub">${esc(s.unit)}</span></td>
      <td class="num muted tnum">${fmtQty(s.minQty)}</td>
      <td>${stockPill(s)}</td>
      <td><div class="muted tnum">${esc(when || '—')}</div>${mv ? `<div class="cell-sub">${esc(moveVerb(mv.type))} ${moveQtyText(mv)} · ${esc((mv.by || '').split('@')[0])}</div>` : ''}</td>
      <td style="white-space:nowrap;">${actions.join('')}</td>
    </tr>`;
  }).join('');
  const s = stockSearchQuery.trim();
  const count = s ? `<div style="font-size:var(--t-micro);color:var(--ink-3);margin-bottom:8px;">${list.length} ${th ? 'ผลลัพธ์' : (list.length === 1 ? 'result' : 'results')} · “${esc(s)}”</div>` : '';
  return count + `<div class="card"><div class="table-wrap"><table class="table" style="min-width:820px;">
    <thead><tr><th>${L('itemName')}</th><th class="num">${L('onHand')}</th><th class="num">${L('minLevel')}</th><th>${L('statusCol')}</th><th>${L('lastMove')}</th><th>${L('actions')}</th></tr></thead>
    <tbody>${rows}</tbody></table></div></div>`;
}

function moveVerb(type) { return L({ in: 'receive', out: 'use', count: 'count' }[type] || 'count'); }
function moveQtyText(mv) {
  if (mv.type === 'count') return `= ${fmtQty(mv.after)}`;
  return `${mv.type === 'in' ? '+' : '−'}${fmtQty(mv.qty)}`;
}

function moveLine(mv) {
  const th = getLang() === 'th';
  const d = new Date(mv.at || mv.date);
  const tm = isNaN(d) ? esc(mv.date || '') : esc(d.toLocaleDateString(th ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' }) +
    ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
  const item = stockItems.find(s => s.id === mv.itemId);
  const unit = item ? item.unit : '';
  const tone = mv.type === 'in' ? 'mv-in' : mv.type === 'out' ? 'mv-out' : 'mv-count';
  return `<div class="le">
    <span class="tm">${tm}</span>
    <span class="mv-qty ${tone} tnum">${moveQtyText(mv)}</span>
    <span class="mv-main"><span><span class="who">${esc((mv.by || '').split('@')[0] || '—')}</span> ${esc(moveVerb(mv.type).toLowerCase())} <b>${esc(mv.itemName)}</b></span>
      <span class="cell-sub">${esc(L('afterMove'))}: ${fmtQty(mv.after)} ${esc(unit)}${mv.jobId ? ` · ${esc(mv.jobId)}` : ''}${mv.note ? ` · ${esc(mv.note)}` : ''}</span></span>
  </div>`;
}

function renderStockMoves() {
  const recent = stockMoves.slice(-12).reverse();
  return `<div class="card">
    <div class="card-head"><span class="card-title">${L('recentMoves')}</span><span class="cell-sub">${stockMoves.length}</span></div>
    ${recent.length ? `<div class="log">${recent.map(moveLine).join('')}</div>` : emptyBody(L('noMoves'), '')}
  </div>`;
}

// ── Receive / Use / Count sheet ──────────────────────────────
let stockMoveState = null;   // { id, type }

function openStockMove(id, type) {
  if (!canMoveStock()) return;
  const s = stockItems.find(x => x.id === id);
  if (!s) return;
  closeStockSheet();
  closeStockHistory();
  stockMoveState = { id, type: type || 'out' };
  const jobs = purchaseOrders.filter(p => p.status !== 'completed');
  const html = `
  <div id="stockSheet" class="scrim" onclick="if(event.target.id==='stockSheet')closeStockSheet()">
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="smTitle" style="max-width:460px;">
      <div class="sheet-head">
        <div><div class="k">${esc(categoryLabel(s.category))}</div><div id="smTitle" class="h">${esc(s.name)}</div></div>
        <button class="sheet-x" onclick="closeStockSheet()" aria-label="${L('close')}">${icon('x', '')}</button>
      </div>
      <form class="sheet-body" onsubmit="event.preventDefault();saveStockMove()">
        <div class="seg seg-block" role="group">
          ${['in', 'out', 'count'].map(t => `<button type="button" data-mt="${t}" aria-pressed="${stockMoveState.type === t}" onclick="setStockMoveType('${t}')">${L({ in: 'receive', out: 'use', count: 'count' }[t])}</button>`).join('')}
        </div>
        <div class="sm-now">
          <div><span class="field-label">${L('nowOnHand')}</span><div class="sm-figure tnum">${fmtQty(s.qty)} <small>${esc(s.unit)}</small></div></div>
          <div class="sm-arrow">${icon('arrowR', '')}</div>
          <div><span class="field-label">${L('afterMove')}</span><div id="smAfter" class="sm-figure tnum">—</div></div>
        </div>
        <label class="field"><span id="smQtyLabel" class="field-label"></span>
          <input id="smQty" class="input tnum" type="number" inputmode="decimal" min="0" step="any" required oninput="updateStockMovePreview()">
        </label>
        <div id="smJobField">
          <label class="field"><span class="field-label">${L('forJob')}</span>
            <select id="smJob" class="select">
              <option value="">${L('noJob')}</option>
              ${jobs.map(p => `<option value="${esc(p.id)}">${esc(p.id)} · ${esc(p.customer)}</option>`).join('')}
            </select>
          </label>
        </div>
        <label class="field"><span class="field-label">${L('moveNote')}</span>
          <input id="smNote" class="input" maxlength="140" placeholder="${esc(L('moveNotePh'))}">
        </label>
        <div id="smError" class="alert-err hidden" role="alert"></div>
        <div class="dialog-foot">
          <button type="button" class="btn btn-secondary" onclick="closeStockSheet()">${L('cancel')}</button>
          <button type="submit" id="smSave" class="btn btn-primary"></button>
        </div>
      </form>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.addEventListener('keydown', stockSheetKey);
  setStockMoveType(stockMoveState.type);
  document.getElementById('smQty').focus();
}

function setStockMoveType(t) {
  if (!stockMoveState) return;
  stockMoveState.type = t;
  document.querySelectorAll('#stockSheet [data-mt]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mt === t)));
  document.getElementById('smQtyLabel').textContent = L({ in: 'qtyReceived', out: 'qtyUsed', count: 'qtyCounted' }[t]);
  document.getElementById('smSave').textContent = L({ in: 'receive', out: 'use', count: 'count' }[t]);
  document.getElementById('smJobField').classList.toggle('hidden', t !== 'out');
  updateStockMovePreview();
}

// The resulting quantity, or an error message when the move isn't possible.
function computeStockMove(s, type, qty) {
  if (!(qty > 0) && !(type === 'count' && qty === 0)) return { error: L('enterQty') };
  if (type === 'in') return { after: roundQty(s.qty + qty) };
  if (type === 'out') {
    if (qty > s.qty) return { error: Lf('useTooMuch', { n: fmtQty(s.qty), unit: s.unit }) };
    return { after: roundQty(s.qty - qty) };
  }
  return { after: roundQty(qty) };
}
function roundQty(n) { return Math.round((Number(n) || 0) * 100) / 100; }

function updateStockMovePreview() {
  const s = stockItems.find(x => x.id === stockMoveState?.id);
  const el = document.getElementById('smAfter');
  if (!s || !el) return;
  const raw = document.getElementById('smQty').value;
  const err = document.getElementById('smError');
  err.classList.add('hidden');
  if (raw === '') { el.innerHTML = '—'; el.className = 'sm-figure tnum'; return; }
  const r = computeStockMove(s, stockMoveState.type, parseFloat(raw));
  if (r.error) { el.innerHTML = '—'; el.className = 'sm-figure tnum'; if (raw !== '0' || stockMoveState.type !== 'count') { err.textContent = r.error; err.classList.remove('hidden'); } return; }
  const st = stockState({ qty: r.after, minQty: s.minQty });
  el.className = 'sm-figure tnum qty-' + st;
  el.innerHTML = `${fmtQty(r.after)} <small>${esc(s.unit)}</small>`;
}

function saveStockMove() {
  const s = stockItems.find(x => x.id === stockMoveState?.id);
  if (!s) return;
  const type = stockMoveState.type;
  const qty = parseFloat(document.getElementById('smQty').value);
  const r = computeStockMove(s, type, qty);
  const err = document.getElementById('smError');
  if (r.error) { err.textContent = r.error; err.classList.remove('hidden'); document.getElementById('smQty').focus(); return; }

  const before = stockState(s);
  const now = new Date();
  const by = sessionStorage.getItem('userEmail') || '';
  stockMoves.push({
    id: 'MOV-' + now.getTime(), itemId: s.id, itemName: s.name, type,
    qty: type === 'count' ? roundQty(Math.abs(r.after - s.qty)) : roundQty(qty), after: r.after,
    jobId: type === 'out' ? (document.getElementById('smJob')?.value || '') : '',
    note: (document.getElementById('smNote')?.value || '').trim(),
    date: localDateISO(now), at: now.toISOString(), by,
  });
  s.qty = r.after;
  s.updatedAt = now.toISOString();
  s.updatedBy = by;
  persistStock();
  closeStockSheet();
  renderApp();

  // Warn the moment an item crosses into low / out; otherwise a plain confirmation.
  const after = stockState(s);
  if (after !== 'ok' && after !== before) {
    showNotification('⚠️ ' + (after === 'out' ? Lf('nowOut', { name: s.name }) : Lf('nowLow', { name: s.name, n: fmtQty(s.qty), unit: s.unit })),
      { type: 'warn', detail: `${L('minLevel')}: ${fmtQty(s.minQty)} ${s.unit}` });
  } else {
    showNotification('✅ ' + L('stockSaved'), { detail: `${s.name}: ${fmtQty(s.qty)} ${s.unit}` });
  }
}

function stockSheetKey(e) { if (e.key === 'Escape') { closeStockSheet(); closeStockHistory(); } }
function closeStockSheet() {
  document.getElementById('stockSheet')?.remove();
  stockMoveState = null;
  if (!document.getElementById('stockHistory')) document.removeEventListener('keydown', stockSheetKey);
}

// ── Item history drawer ──────────────────────────────────────
function openStockHistory(id) {
  const s = stockItems.find(x => x.id === id);
  if (!s) return;
  closeStockHistory();
  const moves = stockMoves.filter(m => m.itemId === id).slice().reverse();
  const html = `
  <div id="stockHistory" class="scrim scrim-side" onclick="if(event.target.id==='stockHistory')closeStockHistory()">
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="shName">
      <div class="sheet-head">
        <div><div class="k">${esc(categoryLabel(s.category))}</div><div id="shName" class="h">${esc(s.name)}</div></div>
        <button class="sheet-x" onclick="closeStockHistory()" aria-label="${L('close')}">${icon('x', '')}</button>
      </div>
      <div class="sheet-body">
        <div class="grid-2">
          <div class="stat" style="--stat-accent:var(--${stockState(s) === 'ok' ? 'st-approved' : stockState(s) === 'low' ? 'st-pending' : 'st-rejected'});">
            <div class="stat-label">${L('onHand')}</div><div class="stat-value tnum">${fmtQty(s.qty)} <small class="muted">${esc(s.unit)}</small></div>
            <div class="stat-sub">${stockPill(s)}</div></div>
          <div class="stat"><div class="stat-label">${L('minLevel')}</div><div class="stat-value tnum">${fmtQty(s.minQty)} <small class="muted">${esc(s.unit)}</small></div></div>
        </div>
        <div>
          <div class="card-title" style="margin-bottom:6px;">${L('history')}</div>
          ${moves.length ? `<div class="card"><div class="log">${moves.map(moveLine).join('')}</div></div>` : `<p class="muted" style="font-size:var(--t-meta);">${L('noMoves')}</p>`}
        </div>
      </div>
      ${canMoveStock() ? `<div class="sheet-foot drawer-foot">
        <button class="btn btn-primary btn-block" onclick="openStockMove('${s.id}','in')">${icon('plus')}${L('receive')}</button>
        <button class="btn btn-secondary" onclick="openStockMove('${s.id}','out')" ${stockState(s) === 'out' ? 'disabled' : ''}>${icon('minus')}${L('use')}</button>
      </div>` : ''}
    </aside>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.addEventListener('keydown', stockSheetKey);
}
function closeStockHistory() {
  document.getElementById('stockHistory')?.remove();
  if (!document.getElementById('stockSheet')) document.removeEventListener('keydown', stockSheetKey);
}

// ── Add / edit item ──────────────────────────────────────────
function openStockItemForm(id) {
  if (!canEditStock()) return;
  const s = id ? stockItems.find(x => x.id === id) : null;
  closeStockSheet();
  const html = `
  <div id="stockSheet" class="scrim" onclick="if(event.target.id==='stockSheet')closeStockSheet()">
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="siTitle" style="max-width:480px;">
      <div class="sheet-head">
        <div id="siTitle" class="h">${L(s ? 'editStockItem' : 'addStockItem')}</div>
        <button class="sheet-x" onclick="closeStockSheet()" aria-label="${L('close')}">${icon('x', '')}</button>
      </div>
      <form class="sheet-body" onsubmit="event.preventDefault();saveStockItem(${s ? `'${s.id}'` : ''})">
        <label class="field"><span class="field-label">${L('itemName')} *</span>
          <input id="siName" class="input" required maxlength="80" value="${esc(s ? s.name : '')}" placeholder="${getLang() === 'th' ? 'เช่น สายไฟ THW 1×2.5 ตร.มม.' : 'e.g. THW cable 1×2.5 mm²'}"></label>
        <div class="grid-2">
          <label class="field"><span class="field-label">${L('category')}</span>
            <select id="siCat" class="select">${STOCK_CATEGORIES.map(c => `<option value="${c}" ${(s ? s.category : 'electrical') === c ? 'selected' : ''}>${esc(categoryLabel(c))}</option>`).join('')}</select></label>
          <label class="field"><span class="field-label">${L('unit')} *</span>
            <input id="siUnit" class="input" required maxlength="20" value="${esc(s ? s.unit : '')}" placeholder="${esc(L('unitStock'))}"></label>
        </div>
        <div class="grid-2">
          ${s ? `<div class="field"><span class="field-label">${L('onHand')}</span>
              <div class="sm-figure tnum" style="padding:6px 0;">${fmtQty(s.qty)} <small>${esc(s.unit)}</small></div>
              <span class="cell-sub">${getLang() === 'th' ? 'เปลี่ยนจำนวนด้วย รับเข้า / เบิกใช้ / ตรวจนับ' : 'Change it with Receive, Use or Count'}</span></div>`
            : `<label class="field"><span class="field-label">${L('onHand')}</span>
              <input id="siQty" class="input tnum" type="number" inputmode="decimal" min="0" step="any" value="0"></label>`}
          <label class="field"><span class="field-label">${L('minLevel')} *</span>
            <input id="siMin" class="input tnum" type="number" inputmode="decimal" min="0" step="any" required value="${s ? s.minQty : ''}" placeholder="${esc(L('minPh'))}"></label>
        </div>
        <div id="siError" class="alert-err hidden" role="alert"></div>
        <div class="dialog-foot">
          <button type="button" class="btn btn-secondary" onclick="closeStockSheet()">${L('cancel')}</button>
          <button type="submit" class="btn btn-primary">${L(s ? 'saveChanges' : 'addStockItem')}</button>
        </div>
      </form>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.addEventListener('keydown', stockSheetKey);
  document.getElementById('siName').focus();
}

function saveStockItem(id) {
  const g = k => (document.getElementById(k)?.value || '').trim();
  const err = document.getElementById('siError');
  const name = g('siName'), unit = g('siUnit');
  const minQty = parseFloat(g('siMin'));
  const fail = msg => { err.textContent = msg; err.classList.remove('hidden'); };
  if (!name) return fail(L('enterName'));
  if (!unit) return fail(L('unit') + ' *');
  if (!(minQty >= 0)) return fail(L('minLevel') + ' ≥ 0');

  const now = new Date();
  const by = sessionStorage.getItem('userEmail') || '';
  if (id) {
    const s = stockItems.find(x => x.id === id);
    if (!s) return;
    Object.assign(s, { name, unit, category: g('siCat'), minQty: roundQty(minQty), updatedAt: now.toISOString(), updatedBy: by });
  } else {
    const qty = Math.max(roundQty(parseFloat(g('siQty')) || 0), 0);
    const next = stockItems.reduce((m, s) => Math.max(m, parseInt(String(s.id).replace(/\D/g, ''), 10) || 0), 0) + 1;
    const item = { id: 'STK-' + String(next).padStart(3, '0'), name, category: g('siCat'), unit, qty, minQty: roundQty(minQty), updatedAt: now.toISOString(), updatedBy: by };
    stockItems.push(item);
    if (qty > 0) stockMoves.push({ id: 'MOV-' + now.getTime(), itemId: item.id, itemName: name, type: 'count', qty, after: qty, jobId: '', note: getLang() === 'th' ? 'ยอดยกมา' : 'Opening balance', date: localDateISO(now), at: now.toISOString(), by });
  }
  persistStock();
  closeStockSheet();
  renderApp();
  showNotification('✅ ' + L(id ? 'stockItemUpdated' : 'stockItemAdded'), { detail: name });
}

function deleteStockItem(id) {
  if (!canEditStock()) return;
  removeWithUndo('stockItems', id, L('stockItemDeleted'));
}
