// ═══════════════════════════════════════════════════════════════
// Baigamgab · SmartLedger — Payments (money owed and money received)
//
// An approved invoice or tax invoice is owed until its payments cover the
// total. A bill (ใบเสร็จ) is a receipt, so it counts as paid when issued.
//
//   due date   q.dueDate, else the document date + PAYMENT_TERM_DAYS
//   settled    Σ (amount + wht) over the payments that are not voided
//   balance    total − settled; the document is paid when this reaches 0
//
// Withholding tax (หัก ณ ที่จ่าย) is paid to the Revenue Department by the
// customer on our behalf, so it settles the invoice like cash; the customer
// gives us a 50 ทวิ certificate for it. Payments live inside their document
// (quotations[i].payments), so they sync, archive and restore with it.
// Payments are never deleted, only voided with a reason (audit trail).
// ═══════════════════════════════════════════════════════════════

const PAYMENT_TERM_DAYS = 30;     // matches "due within 30 days" on the PDF
const WHT_RATE = 0.03;            // the usual rate for services and contracting
const PAY_METHODS = ['transfer', 'promptpay', 'cash', 'cheque'];

Object.assign(LANG.en, {
  payPaid: 'Paid', payPartial: 'Part paid', payDue: 'Due {d}', payLate: '{n} days overdue',
  payLeft: '฿{amt} to pay', payPaidOn: 'Paid {d}',
  recordPay: 'Record payment', recordPayTitle: 'Record payment', payments: 'Payments',
  payDate: 'Date received', payMethod: 'Method', payAmount: 'Amount received (฿)',
  payWht: 'Tax withheld by customer (฿)', payWht3: 'Withheld 3%',
  payWhtHint: 'If the customer deducted withholding tax (หัก ณ ที่จ่าย), enter it here. It counts toward the invoice; ask them for the 50 ทวิ certificate.',
  payRef: 'Reference', payRefPh: 'Transfer ref. or cheque no.',
  pm_transfer: 'Bank transfer', pm_promptpay: 'PromptPay', pm_cash: 'Cash', pm_cheque: 'Cheque',
  payTotal: 'Invoice total', payThis: 'This payment', paySoFar: 'Paid so far', payBalance: 'Still to pay', dueDate: 'Due date',
  dueHint: '{n} days after the document date unless you change it',
  payWillClear: 'This pays the invoice in full.', payWillLeave: '฿{amt} will still be owed after this.',
  payTooMuch: 'That is ฿{amt} more than is owed.', payNeedAmount: 'Enter the amount received.',
  payFuture: 'The date received can\'t be in the future.', dueBeforeDate: 'The due date can\'t be before the document date.',
  payRecorded: 'Payment recorded', payCleared: '{id} is paid in full',
  payStill: '฿{amt} still to pay', payAlready: 'This document is already paid.',
  voidPay: 'Void', voidPayTitle: 'Void this payment?', voidPayReason: 'Why is it being voided?',
  payVoided: 'Payment voided', voidedLbl: 'Voided',
  chipUnpaid: 'Unpaid', chipOverdue: 'Overdue',
  owedTitle: 'Waiting for payment', owedSub: '฿{amt} owed on {n} documents',
  owedLate: '฿{amt} overdue', owedNone: 'Nothing is waiting for payment.',
  custOwes: 'Owes {amt}', custLate: '{n} overdue',
  overdueNotice: '{n} invoices are overdue', overdueDetail: '฿{amt} not paid yet',
  viewOverdue: 'View overdue', viewAllOwed: 'View all',
  evPaid: 'recorded payment', evVoided: 'voided payment',
  received: 'Money received', whtMonth: 'Tax withheld by customers (50 ทวิ)', whtShort: 'WHT',
});
Object.assign(LANG.th, {
  payPaid: 'ชำระแล้ว', payPartial: 'ชำระบางส่วน', payDue: 'ครบกำหนด {d}', payLate: 'เกินกำหนด {n} วัน',
  payLeft: 'ค้างชำระ ฿{amt}', payPaidOn: 'ชำระเมื่อ {d}',
  recordPay: 'บันทึกรับเงิน', recordPayTitle: 'บันทึกการรับชำระเงิน', payments: 'การชำระเงิน',
  payDate: 'วันที่รับเงิน', payMethod: 'ช่องทาง', payAmount: 'จำนวนเงินที่ได้รับ (฿)',
  payWht: 'ภาษีหัก ณ ที่จ่าย (฿)', payWht3: 'หัก 3%',
  payWhtHint: 'หากลูกค้าหักภาษี ณ ที่จ่าย ให้กรอกที่นี่ ยอดนี้นับเป็นการชำระด้วย และขอหนังสือรับรอง 50 ทวิ จากลูกค้า',
  payRef: 'เลขอ้างอิง', payRefPh: 'เลขที่โอน หรือเลขเช็ค',
  pm_transfer: 'โอนเงิน', pm_promptpay: 'พร้อมเพย์', pm_cash: 'เงินสด', pm_cheque: 'เช็ค',
  payTotal: 'ยอดตามเอกสาร', payThis: 'ยอดชำระครั้งนี้', paySoFar: 'ชำระแล้ว', payBalance: 'คงค้าง', dueDate: 'วันครบกำหนดชำระ',
  dueHint: '{n} วันหลังวันที่เอกสาร แก้ไขได้',
  payWillClear: 'ยอดนี้ชำระครบทั้งหมด', payWillLeave: 'หลังบันทึกจะยังค้างชำระ ฿{amt}',
  payTooMuch: 'เกินยอดค้างชำระ ฿{amt}', payNeedAmount: 'กรอกจำนวนเงินที่ได้รับ',
  payFuture: 'วันที่รับเงินต้องไม่เป็นวันในอนาคต', dueBeforeDate: 'วันครบกำหนดต้องไม่ก่อนวันที่เอกสาร',
  payRecorded: 'บันทึกการรับเงินแล้ว', payCleared: '{id} ชำระครบแล้ว',
  payStill: 'ค้างชำระอีก ฿{amt}', payAlready: 'เอกสารนี้ชำระครบแล้ว',
  voidPay: 'ยกเลิก', voidPayTitle: 'ยกเลิกรายการรับเงินนี้?', voidPayReason: 'เหตุผลที่ยกเลิก',
  payVoided: 'ยกเลิกรายการรับเงินแล้ว', voidedLbl: 'ยกเลิกแล้ว',
  chipUnpaid: 'ค้างชำระ', chipOverdue: 'เกินกำหนด',
  owedTitle: 'รอรับชำระ', owedSub: 'ค้างชำระ ฿{amt} จาก {n} เอกสาร',
  owedLate: 'เกินกำหนด ฿{amt}', owedNone: 'ไม่มีเอกสารค้างชำระ',
  custOwes: 'ค้างชำระ {amt}', custLate: 'เกินกำหนด {n} รายการ',
  overdueNotice: 'มีใบแจ้งหนี้เกินกำหนดชำระ {n} รายการ', overdueDetail: 'ยังไม่ได้รับเงิน ฿{amt}',
  viewOverdue: 'ดูรายการเกินกำหนด', viewAllOwed: 'ดูทั้งหมด',
  evPaid: 'บันทึกรับเงิน', evVoided: 'ยกเลิกรายการรับเงิน',
  received: 'เงินที่ได้รับ', whtMonth: 'ภาษีที่ลูกค้าหัก ณ ที่จ่าย (50 ทวิ)', whtShort: 'หัก ณ ที่จ่าย',
});

// ── Rules ────────────────────────────────────────────────────
function payR2(n) { return Math.round((Number(n) + Number.EPSILON) * 100) / 100; }

function addDaysISO(iso, n) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return localDateISO(new Date(y, m - 1, d + n));
}
function daysFrom(a, b) {
  const t = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((t(b) - t(a)) / 86400000);
}
// "12 Oct" / "12 ต.ค."
function shortDate(iso) {
  if (!iso) return '';
  return `${Number(iso.slice(8, 10))} ${monthLabel(iso.slice(0, 7), getLang() === 'th')}`;
}

function tracksPayment(q) { return !!q && q.status === 'approved' && (q.docType === 'invoice' || q.docType === 'tax-invoice'); }
function dueDateOf(q) { return q.dueDate || (q.date ? addDaysISO(q.date, PAYMENT_TERM_DAYS) : ''); }
// Firebase can hand a sparse array back as an object, so accept both.
function allPayments(q) { const p = q.payments; return (Array.isArray(p) ? p : Object.values(p || {})).filter(Boolean); }
function livePayments(q) { return allPayments(q).filter(p => !p.voidedAt); }

// null for anything that isn't an approved invoice or tax invoice.
function payState(q) {
  if (!tracksPayment(q)) return null;
  const pays = livePayments(q);
  const paid = payR2(pays.reduce((s, p) => s + (Number(p.amount) || 0) + (Number(p.wht) || 0), 0));
  const balance = Math.max(payR2((Number(q.total) || 0) - paid), 0);
  const due = dueDateOf(q), today = localDateISO();
  const state = balance <= 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
  const lateDays = state !== 'paid' && due && today > due ? daysFrom(due, today) : 0;
  const lastPaid = pays.reduce((m, p) => ((p.date || '') > m ? p.date : m), '');
  return { state, paid, balance, due, lateDays, overdue: lateDays > 0, lastPaid };
}
function isUnpaid(q)  { const p = payState(q); return !!p && p.state !== 'paid'; }
function isOverdue(q) { const p = payState(q); return !!p && p.overdue; }

// Everything still owed, the most overdue first.
function receivables(list = quotations) {
  return list.map(q => ({ q, p: payState(q) })).filter(x => x.p && x.p.state !== 'paid')
    .sort((a, b) => b.p.lateDays - a.p.lateDays || (a.p.due < b.p.due ? -1 : a.p.due > b.p.due ? 1 : 0));
}
function owedSummary(list = receivables()) {
  const late = list.filter(x => x.p.overdue);
  const sum = l => payR2(l.reduce((s, x) => s + x.p.balance, 0));
  return { count: list.length, total: sum(list), lateCount: late.length, lateTotal: sum(late) };
}

function canRecordPayment() { const r = currentRole(); return r === 'sales' || r === 'manager' || r === 'admin'; }
function canVoidPayment()   { const r = currentRole(); return r === 'manager' || r === 'admin'; }

// ── Small pieces used by the lists ───────────────────────────
function payPill(q) {
  const p = payState(q);
  if (!p) return '';
  if (p.state === 'paid') return `<span class="pill pill-approved">${esc(L('payPaid'))}</span>`;
  if (p.overdue) return `<span class="pill pill-rejected">${esc(Lf('payLate', { n: p.lateDays }))}</span>`;
  if (p.state === 'partial') return `<span class="pill pill-open">${esc(L('payPartial'))}</span>`;
  return `<span class="pill pill-neutral">${esc(Lf('payDue', { d: shortDate(p.due) }))}</span>`;
}
function payNote(q) {
  const p = payState(q);
  if (!p) return '';
  return p.state === 'paid' ? Lf('payPaidOn', { d: shortDate(p.lastPaid) })
    : Lf('payLeft', { amt: fmt(p.balance) }) + (p.overdue ? ' · ' + Lf('payDue', { d: shortDate(p.due) }) : '');
}
// Pill + one line under it, for the Documents table.
function payCell(q) {
  if (!tracksPayment(q)) return '';
  return `<div class="pay-cell">${payPill(q)}<span class="cell-sub tnum">${esc(payNote(q))}</span></div>`;
}

// Inside the document view.
function paymentSection(q) {
  const p = payState(q);
  if (!p) return '';
  const pays = allPayments(q).slice().sort((a, b) => ((a.date || '') < (b.date || '') ? -1 : 1));
  const rows = pays.map(x => {
    const wht = Number(x.wht) > 0 ? ` <span class="cell-sub">+ ${L('whtShort')} ฿${fmt(x.wht)}</span>` : '';
    return `<div class="pay-row${x.voidedAt ? ' is-void' : ''}">
      <div class="pay-row-main">
        <div class="cell-strong tnum">฿${fmt(x.amount)}${wht}</div>
        <div class="cell-sub">${esc(x.date)} · ${esc(L('pm_' + x.method) || x.method || '')}${x.ref ? ' · ' + esc(x.ref) : ''} · ${esc((x.by || '').split('@')[0])}</div>
        ${x.note ? `<div class="cell-sub">${esc(x.note)}</div>` : ''}
        ${x.voidedAt ? `<div class="cell-sub pay-void-why">${esc(L('voidedLbl'))}: “${esc(x.voidReason || '')}”</div>` : ''}
      </div>
      ${!x.voidedAt && canVoidPayment() ? `<button class="act act-danger" onclick="voidPayment('${q.id}','${esc(x.id)}')">${L('voidPay')}</button>` : ''}
    </div>`;
  }).join('');
  return `<div class="pay-box">
    <div class="spread"><span class="card-title">${L('payments')}</span>${payPill(q)}</div>
    <div class="pay-figures">
      <div><div class="field-label">${L('dueDate')}</div><div class="tnum">${esc(p.due)}</div></div>
      <div><div class="field-label">${L('paySoFar')}</div><div class="tnum">฿${fmt(p.paid)}</div></div>
      <div><div class="field-label">${L('payBalance')}</div><div class="tnum cell-strong" style="color:${p.balance > 0 ? (p.overdue ? 'var(--st-rejected)' : 'var(--ink)') : 'var(--st-approved)'};">฿${fmt(p.balance)}</div></div>
    </div>
    ${rows ? `<div class="pay-list">${rows}</div>` : ''}
    ${p.state !== 'paid' && canRecordPayment() ? `<button class="btn btn-primary btn-sm" style="align-self:flex-start;" onclick="openPaymentForm('${q.id}')">${icon('plus', '')}${L('recordPay')}</button>` : ''}
  </div>`;
}

// Dashboard card: who owes us, most overdue first.
function receivablesCard(limit = 5) {
  const list = receivables();
  if (!list.length) return '';
  const s = owedSummary(list);
  const rows = list.slice(0, limit).map(({ q, p }) => `
    <div class="row">
      <div class="row-main">
        <div class="t">${esc(q.customer)}</div>
        <div class="s" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;"><span>${esc(q.id)}</span>${payPill(q)}</div>
      </div>
      <div class="row-end">
        <div class="tnum" style="font-weight:600;">${baht(p.balance)}</div>
        <div style="margin-top:3px;">
          <button class="act act-primary" onclick="viewQuotation('${q.id}')">${L('view')}</button>
          ${canRecordPayment() ? `<button class="act act-pos act-strong" onclick="openPaymentForm('${q.id}')">${L('recordPay')}</button>` : ''}
        </div>
      </div>
    </div>`).join('');
  return `<div class="card">
    <div class="card-head" style="flex-wrap:wrap;">
      <div><span class="card-title">${L('owedTitle')}</span>
        <div class="cell-sub tnum">${esc(Lf('owedSub', { amt: fmt(s.total), n: s.count }))}${s.lateCount ? ` · <b style="color:var(--st-rejected);">${esc(Lf('owedLate', { amt: fmt(s.lateTotal) }))}</b>` : ''}</div></div>
      <button class="act act-primary" onclick="statusFilter='unpaid';billsLimit=PAGE_SIZE;switchView('bills')">${L('viewAllOwed')} ${icon('arrowR', '')}</button>
    </div>
    ${rows}
  </div>`;
}

// ── Record payment sheet ─────────────────────────────────────
function openPaymentForm(id) {
  const q = quotations.find(x => x.id === id);
  const p = payState(q);
  if (!p || !canRecordPayment()) return;
  if (p.state === 'paid') { showNotification('✅ ' + L('payAlready')); return; }
  closePaySheet();
  const today = localDateISO();
  const html = `
  <div id="paySheet" class="scrim" onclick="if(event.target.id==='paySheet')closePaySheet()">
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="payTitle" style="max-width:480px;">
      <div class="sheet-head">
        <div><div class="k">${esc(q.id)} · ${esc(q.customer)}</div><div id="payTitle" class="h">${L('recordPayTitle')}</div></div>
        <button class="sheet-x" onclick="closePaySheet()" aria-label="${L('close')}">${icon('x', '')}</button>
      </div>
      <form class="sheet-body" onsubmit="event.preventDefault();savePayment('${q.id}')" oninput="updatePayPreview('${q.id}')">
        <div class="pay-figures">
          <div><div class="field-label">${L('payTotal')}</div><div class="tnum">฿${fmt(q.total)}</div></div>
          <div><div class="field-label">${L('paySoFar')}</div><div class="tnum">฿${fmt(p.paid)}</div></div>
          <div><div class="field-label">${L('payBalance')}</div><div class="tnum cell-strong">฿${fmt(p.balance)}</div></div>
        </div>
        <div class="grid-2">
          <label class="field"><span class="field-label">${L('payDate')} *</span>
            <input id="payDate" class="input" type="date" value="${today}" max="${today}" required></label>
          <label class="field"><span class="field-label">${L('payMethod')}</span>
            <select id="payMethod" class="select">${PAY_METHODS.map(m => `<option value="${m}">${esc(L('pm_' + m))}</option>`).join('')}</select></label>
        </div>
        <label class="field"><span class="field-label">${L('payAmount')} *</span>
          <input id="payAmount" class="input tnum" type="number" inputmode="decimal" min="0" step="0.01" value="${p.balance}" required></label>
        <div class="field"><span class="field-label">${L('payWht')}</span>
          <div class="pay-wht">
            <input id="payWht" class="input tnum" type="number" inputmode="decimal" min="0" step="0.01" value="0" aria-label="${esc(L('payWht'))}">
            <button type="button" class="btn btn-secondary btn-sm" onclick="applyWht('${q.id}')">${L('payWht3')}</button>
          </div>
          <span class="cell-sub">${esc(L('payWhtHint'))}</span></div>
        <label class="field"><span class="field-label">${L('payRef')}</span>
          <input id="payRef" class="input" maxlength="60" placeholder="${esc(L('payRefPh'))}"></label>
        <label class="field"><span class="field-label">${L('moveNote')}</span>
          <input id="payNote" class="input" maxlength="140"></label>
        <div id="payPreview" class="pr-preview" role="status"></div>
        <div id="payError" class="alert-err hidden" role="alert"></div>
        <div class="dialog-foot">
          <button type="button" class="btn btn-secondary" onclick="closePaySheet()">${L('cancel')}</button>
          <button type="submit" class="btn btn-primary">${L('recordPay')}</button>
        </div>
      </form>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.addEventListener('keydown', paySheetKey);
  updatePayPreview(id);
  document.getElementById('payAmount').focus();
}

function payInputs() {
  const num = id => payR2(parseFloat(document.getElementById(id)?.value) || 0);
  return { amount: num('payAmount'), wht: num('payWht') };
}

// "Withheld 3%": split what this payment settles into cash + 3% of its pre-VAT part.
// For a full payment that is 3% of the subtotal, as on the customer's 50 ทวิ.
function applyWht(id) {
  const q = quotations.find(x => x.id === id);
  if (!q) return;
  const { amount, wht } = payInputs();
  const settles = payR2(amount + wht);
  const preVat = q.total > 0 ? settles * (Number(q.subtotal) || 0) / q.total : settles;
  const w = payR2(preVat * WHT_RATE);
  document.getElementById('payWht').value = w;
  document.getElementById('payAmount').value = payR2(settles - w);
  updatePayPreview(id);
}

function updatePayPreview(id) {
  const box = document.getElementById('payPreview');
  const q = quotations.find(x => x.id === id);
  const p = payState(q);
  if (!box || !p) return;
  const { amount, wht } = payInputs();
  const after = payR2(p.balance - amount - wht);
  const level = after < 0 ? 'owner' : after === 0 ? 'auto' : 'manager';
  const text = after < 0 ? Lf('payTooMuch', { amt: fmt(-after) }) : after === 0 ? L('payWillClear') : Lf('payWillLeave', { amt: fmt(after) });
  box.className = 'pr-preview is-' + level;
  box.innerHTML = `<div class="spread"><span>${L('payThis')}</span><b class="tnum">฿${fmt(payR2(amount + wht))}</b></div>
    <div class="pr-outcome">${icon(after === 0 ? 'check' : 'clipboard', '')}<span>${esc(text)}</span></div>`;
}

function savePayment(id) {
  const q = quotations.find(x => x.id === id);
  const p = payState(q);
  const err = document.getElementById('payError');
  const fail = m => { err.textContent = m; err.classList.remove('hidden'); };
  if (!p) return;
  const date = document.getElementById('payDate').value;
  const { amount, wht } = payInputs();
  if (!date) return fail(L('payDate'));
  if (date > localDateISO()) return fail(L('payFuture'));
  if (amount < 0 || wht < 0 || !(amount + wht > 0)) return fail(L('payNeedAmount'));
  const over = payR2(amount + wht - p.balance);
  if (over > 0) return fail(Lf('payTooMuch', { amt: fmt(over) }));

  const now = new Date().toISOString();
  q.payments = allPayments(q).concat({
    id: 'PAY-' + Date.now().toString(36).toUpperCase(), date, amount, wht,
    method: document.getElementById('payMethod').value,
    ref: document.getElementById('payRef').value.trim(),
    note: document.getElementById('payNote').value.trim(),
    by: sessionStorage.getItem('userEmail') || '', at: now,
  });
  savePaymentsAndRefresh(id);
  closePaySheet();
  const after = payState(q);
  showNotification('✅ ' + (after.state === 'paid' ? Lf('payCleared', { id: q.id }) : L('payRecorded')),
    { detail: `${q.customer} · ฿${fmt(amount)}${wht ? ` + ${L('whtShort')} ฿${fmt(wht)}` : ''}${after.state === 'paid' ? '' : ' · ' + Lf('payStill', { amt: fmt(after.balance) })}` });
}

async function voidPayment(docId, payId) {
  const q = quotations.find(x => x.id === docId);
  const pay = q && allPayments(q).find(x => x.id === payId);
  if (!pay || pay.voidedAt || !canVoidPayment()) return;
  const reason = await confirmDialog({
    title: L('voidPayTitle'), message: `${q.id} · ${pay.date} · ฿${fmt(pay.amount)}`,
    confirmLabel: L('voidPay'), danger: true, input: { label: L('voidPayReason') },
  });
  if (!reason) return;
  q.payments = allPayments(q).map(x => x.id === payId
    ? { ...x, voidedAt: new Date().toISOString(), voidedBy: sessionStorage.getItem('userEmail') || '', voidReason: reason } : x);
  savePaymentsAndRefresh(docId);
  showNotification(L('payVoided'), { detail: `${q.id} · ${Lf('payStill', { amt: fmt(payState(q).balance) })}` });
}

function savePaymentsAndRefresh(docId) {
  saveToLocalStorage();
  syncToFirebase();
  const viewing = !!document.getElementById('viewModal');
  renderApp();
  if (viewing) { closeViewModal(); viewQuotation(docId); }
}

function paySheetKey(e) { if (e.key === 'Escape') closePaySheet(); }
function closePaySheet() {
  document.getElementById('paySheet')?.remove();
  document.removeEventListener('keydown', paySheetKey);
}

// ── Monthly figures (used by the report) ─────────────────────
// Cash in this month: payments dated in the month, plus approved bills
// (a bill is a receipt, so its money arrived on the document date).
function moneyReceived(ym) {
  let cash = 0, wht = 0;
  quotations.forEach(q => {
    if (q.status === 'approved' && (q.docType || 'bill') === 'bill' && (q.date || '').slice(0, 7) === ym) cash += Number(q.total) || 0;
    livePayments(q).forEach(p => {
      if ((p.date || '').slice(0, 7) === ym) { cash += Number(p.amount) || 0; wht += Number(p.wht) || 0; }
    });
  });
  return { cash: payR2(cash), wht: payR2(wht) };
}
