// ═══════════════════════════════════════════════════════════════
// Baigamgab · SmartLedger — Quotations (ใบเสนอราคา)
//
// A quotation is approved like any document (draft → pending → approved),
// then it is emailed to the customer, who answers only by replying to the email
// (staff record the reply with Accept / Decline):
//
//   approved ── customer accepts ──▶ a Job is opened with the same items
//            │                       (Jobs & Costs → Convert to invoice → payment)
//            └─ customer declines ─▶ closed, with the reason
//   validUntil passes with no answer → shown as expired (can still be accepted)
//
// A quotation is a price offer, not a sale: it is never revenue, never owed
// and has no payments. Links: quotation.jobId ↔ job.fromQuotation, and the
// invoice made from that job carries fromQuotation too.
// ═══════════════════════════════════════════════════════════════

const QUOTE_VALID_DAYS = 30;

Object.assign(LANG.en, {
  docQuotation: 'Quotation', validUntil: 'Valid until',
  validHint: '{n} days after the document date unless you change it',
  validBeforeDate: 'The valid-until date can\'t be before the document date.',
  qWaiting: 'Waiting for customer', qAccepted: 'Accepted', qDeclined: 'Declined', qExpired: 'Expired',
  qValidTo: 'Valid until {d}', qToJob: 'Job {id}',
  qAcceptBtn: 'Accept', qDeclineBtn: 'Decline',
  qAcceptTitle: 'Customer accepted this quotation by email?',
  qAcceptMsg: 'A job is opened with the same items, so you can record its costs and turn it into an invoice when the work is done.',
  qAcceptExpired: 'This quotation is past its valid-until date. Accept it anyway?',
  qAcceptConfirm: 'Accept and open job',
  qDeclineTitle: 'Customer declined this quotation by email?', qDeclineReason: 'Reason (e.g. price too high, chose another contractor)',
  qJobOpened: 'Job {job} opened', qOpenJob: 'Open Jobs', qDeclinedMsg: 'Quotation marked as declined',
  qSection: 'Customer answer', qFrom: 'From quotation {id}',
  evQAccepted: 'customer accepted', evQDeclined: 'customer declined',
  qEmailBtn: 'Email to customer', qEmailed: 'Emailed {d}',
  qEmailHow: 'The customer answers by replying to the email. When they reply, press Accept or Decline.',
  qEmailNoAddr: 'No customer email on this quotation — type the address in the email.',
  qEmailAttach: 'PDF downloaded — attach it to the email',
  qEmailSubject: 'Quotation {id} from {co}',
  qEmailBody: 'Dear {cust},\r\n\r\nPlease find attached our quotation {id}.\r\nTotal: ฿{total} (incl. VAT)\r\nValid until: {until}\r\n\r\nTo go ahead, please reply to this email with "Accept". If you do not wish to proceed, reply with "Decline" and, if possible, the reason.\r\n\r\nBest regards,\r\n{co}{phone}',
});
Object.assign(LANG.th, {
  docQuotation: 'ใบเสนอราคา', validUntil: 'ยืนราคาถึง',
  validHint: '{n} วันหลังวันที่เอกสาร แก้ไขได้',
  validBeforeDate: 'วันยืนราคาต้องไม่ก่อนวันที่เอกสาร',
  qWaiting: 'รอลูกค้าตอบรับ', qAccepted: 'ลูกค้าตอบรับ', qDeclined: 'ลูกค้าปฏิเสธ', qExpired: 'หมดอายุ',
  qValidTo: 'ยืนราคาถึง {d}', qToJob: 'งาน {id}',
  qAcceptBtn: 'ตอบรับ', qDeclineBtn: 'ปฏิเสธ',
  qAcceptTitle: 'ลูกค้าตอบรับใบเสนอราคานี้ทางอีเมลแล้ว?',
  qAcceptMsg: 'ระบบจะเปิดงานใหม่ด้วยรายการเดียวกัน เพื่อบันทึกต้นทุน แล้วแปลงเป็นใบแจ้งหนี้เมื่องานเสร็จ',
  qAcceptExpired: 'ใบเสนอราคานี้เลยวันยืนราคาแล้ว ต้องการตอบรับต่อหรือไม่?',
  qAcceptConfirm: 'ตอบรับและเปิดงาน',
  qDeclineTitle: 'ลูกค้าปฏิเสธใบเสนอราคานี้ทางอีเมลแล้ว?', qDeclineReason: 'เหตุผล (เช่น ราคาสูงไป เลือกผู้รับเหมารายอื่น)',
  qJobOpened: 'เปิดงาน {job} แล้ว', qOpenJob: 'ไปที่งาน', qDeclinedMsg: 'บันทึกว่าลูกค้าปฏิเสธแล้ว',
  qSection: 'การตอบรับของลูกค้า', qFrom: 'จากใบเสนอราคา {id}',
  evQAccepted: 'ลูกค้าตอบรับ', evQDeclined: 'ลูกค้าปฏิเสธ',
  qEmailBtn: 'ส่งอีเมลถึงลูกค้า', qEmailed: 'ส่งอีเมลแล้ว {d}',
  qEmailHow: 'ลูกค้าตอบรับหรือปฏิเสธโดยตอบกลับอีเมล เมื่อได้รับคำตอบแล้ว ให้กด ตอบรับ หรือ ปฏิเสธ',
  qEmailNoAddr: 'ใบเสนอราคานี้ไม่มีอีเมลลูกค้า กรุณาพิมพ์อีเมลเองในหน้าส่งอีเมล',
  qEmailAttach: 'ดาวน์โหลด PDF แล้ว กรุณาแนบไฟล์ในอีเมล',
  qEmailSubject: 'ใบเสนอราคา {id} จาก {co}',
  qEmailBody: 'เรียน {cust}\r\n\r\nขอส่งใบเสนอราคาเลขที่ {id} ตามไฟล์แนบ\r\nยอดรวม: ฿{total} (รวม VAT)\r\nยืนราคาถึง: {until}\r\n\r\nหากตกลง กรุณาตอบกลับอีเมลนี้ว่า "ตอบรับ" หากไม่ประสงค์ดำเนินการ กรุณาตอบกลับว่า "ปฏิเสธ" พร้อมเหตุผล (ถ้ามี)\r\n\r\nขอแสดงความนับถือ\r\n{co}{phone}',
});

// ── Rules ────────────────────────────────────────────────────
function isQuote(q) { return !!q && q.docType === 'quotation'; }
// Approved documents that count as revenue: everything except quotations.
function isSale(q) { return !!q && q.status === 'approved' && !isQuote(q); }
function validUntilOf(q) { return q.validUntil || (q.date ? addDaysISO(q.date, QUOTE_VALID_DAYS) : ''); }

// null unless an approved quotation: 'accepted' | 'declined' | 'expired' | 'waiting'.
function quoteState(q) {
  if (!isQuote(q) || q.status !== 'approved') return null;
  if (q.acceptedAt) return 'accepted';
  if (q.declinedAt) return 'declined';
  return localDateISO() > validUntilOf(q) ? 'expired' : 'waiting';
}
function canAnswerQuote() { const r = currentRole(); return r === 'sales' || r === 'manager' || r === 'admin'; }

function quotePill(q) {
  const st = quoteState(q);
  if (!st) return '';
  const [cls, key] = { waiting: ['pill-open', 'qWaiting'], accepted: ['pill-approved', 'qAccepted'],
    declined: ['pill-rejected', 'qDeclined'], expired: ['pill-neutral', 'qExpired'] }[st];
  return `<span class="pill ${cls}">${esc(L(key))}</span>`;
}
// Pill + one line, for the Documents table.
function quoteCell(q) {
  const st = quoteState(q);
  if (!st) return '';
  const note = st === 'accepted' ? Lf('qToJob', { id: q.jobId || '—' })
    : st === 'declined' ? (q.declineReason ? `“${q.declineReason}”` : '')
    : Lf('qValidTo', { d: shortDate(validUntilOf(q)) });
  return `<div class="pay-cell">${quotePill(q)}${note ? `<span class="cell-sub">${esc(note)}</span>` : ''}</div>`;
}
function quoteActions(q) {
  const st = quoteState(q);
  if (!(st === 'waiting' || st === 'expired') || !canAnswerQuote()) return '';
  return `<button class="act act-primary" onclick="emailQuote('${q.id}')">${L('qEmailBtn')}</button>`
       + `<button class="act act-pos act-strong" onclick="acceptQuote('${q.id}')">${L('qAcceptBtn')}</button>`
       + `<button class="act act-danger" onclick="declineQuote('${q.id}')">${L('qDeclineBtn')}</button>`;
}

// Inside the document view.
function quoteSection(q) {
  if (!isQuote(q)) return '';
  const st = quoteState(q);
  const who = e => esc((e || '').split('@')[0]);
  const detail = st === 'accepted'
    ? `<div class="cell-sub">${who(q.acceptedBy)} · ${esc((q.acceptedAt || '').slice(0, 10))}</div>
       ${q.jobId ? `<button class="act act-primary" style="align-self:flex-start;" onclick="closeViewModal();switchView('po')">${esc(Lf('qToJob', { id: q.jobId }))} ${icon('arrowR', '')}</button>` : ''}`
    : st === 'declined'
    ? `<div class="cell-sub">${who(q.declinedBy)} · ${esc((q.declinedAt || '').slice(0, 10))}${q.declineReason ? ` — “${esc(q.declineReason)}”` : ''}</div>`
    : '';
  const open = st === 'waiting' || st === 'expired';
  const emailed = q.emailedAt
    ? `<div class="cell-sub">${esc(Lf('qEmailed', { d: q.emailedAt.slice(0, 10) }))} · ${who(q.emailedBy)}</div>` : '';
  const buttons = open && canAnswerQuote()
    ? `<div class="cell-sub">${L('qEmailHow')}</div>
       <div style="display:flex;gap:8px;flex-wrap:wrap;">
         <button class="btn btn-secondary btn-sm" onclick="emailQuote('${q.id}')">${icon('mail', '')}${L('qEmailBtn')}</button>
         <button class="btn btn-primary btn-sm" onclick="acceptQuote('${q.id}')">${icon('check', '')}${L('qAcceptConfirm')}</button>
         <button class="btn btn-secondary btn-sm" onclick="declineQuote('${q.id}')">${L('qDeclineBtn')}</button></div>` : '';
  return `<div class="pay-box">
    <div class="spread"><span class="card-title">${L('qSection')}</span>${quotePill(q)}</div>
    <div><div class="field-label">${L('validUntil')}</div><div class="tnum">${esc(validUntilOf(q))}</div></div>
    ${emailed}${detail}${buttons}
  </div>`;
}

// ── Actions ──────────────────────────────────────────────────

// The customer answers only by email: download the PDF (to attach), open the
// user's mail program addressed to the customer, and note when it was sent.
// Staff then record the reply with Accept / Decline.
function emailQuote(id) {
  const q = quotations.find(x => x.id === id);
  const st = quoteState(q);
  if (!(st === 'waiting' || st === 'expired') || !canAnswerQuote()) return;

  generatePDF(q.id);
  const vars = {
    id: q.id, co: companyInfo.name || '', cust: q.customer || '', total: fmt(q.total), until: validUntilOf(q),
    phone: companyInfo.phone ? (getLang() === 'th' ? '\r\nโทร ' : '\r\nTel ') + companyInfo.phone : '',
  };
  const to = (q.customerEmail || '').trim();
  const href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(Lf('qEmailSubject', vars))}&body=${encodeURIComponent(Lf('qEmailBody', vars))}`;

  Object.assign(q, { emailedAt: new Date().toISOString(), emailedBy: sessionStorage.getItem('userEmail') || '' });
  saveToLocalStorage();
  syncToFirebase();
  refreshAfterQuote(id);
  showNotification(L('qEmailAttach'), to ? {} : { type: 'warn', detail: L('qEmailNoAddr') });
  setTimeout(() => { window.location.href = href; }, 400);   // after the PDF download has started
}
async function acceptQuote(id) {
  const q = quotations.find(x => x.id === id);
  const st = quoteState(q);
  if (!(st === 'waiting' || st === 'expired') || !canAnswerQuote()) return;
  const ok = await confirmDialog({
    title: L('qAcceptTitle'),
    message: `${q.id} · ${q.customer} · ฿${fmt(q.total)} — ${L(st === 'expired' ? 'qAcceptExpired' : 'qAcceptMsg')}`,
    confirmLabel: L('qAcceptConfirm'),
  });
  if (!ok) return;

  const now = new Date().toISOString();
  const me = sessionStorage.getItem('userEmail') || '';
  const job = {
    id: generatePOId(), date: localDateISO(), customer: q.customer, notes: q.notes || '',
    items: (q.items || []).map(i => ({ name: i.name, description: i.description || '', qty: Number(i.qty) || 0, price: Number(i.price) || 0 })),
    subtotal: q.subtotal, tax: q.tax, total: q.total,
    status: 'open', createdBy: me, createdAt: now, linkedInvoiceId: null, fromQuotation: q.id,
  };
  purchaseOrders.unshift(job);
  Object.assign(q, { acceptedAt: now, acceptedBy: me, jobId: job.id });
  saveToLocalStorage();
  syncToFirebase();
  syncPOsToFirebase();
  refreshAfterQuote(id);
  showNotification('✅ ' + Lf('qJobOpened', { job: job.id }), {
    detail: `${q.id} · ${q.customer}`,
    action: { label: L('qOpenJob'), onClick: () => { closeViewModal(); switchView('po'); } },
  });
}

async function declineQuote(id) {
  const q = quotations.find(x => x.id === id);
  const st = quoteState(q);
  if (!(st === 'waiting' || st === 'expired') || !canAnswerQuote()) return;
  const reason = await confirmDialog({
    title: L('qDeclineTitle'), message: `${q.id} · ${q.customer}`,
    confirmLabel: L('qDeclineBtn'), danger: true, input: { label: L('qDeclineReason') },
  });
  if (!reason) return;
  Object.assign(q, { declinedAt: new Date().toISOString(), declinedBy: sessionStorage.getItem('userEmail') || '', declineReason: reason });
  saveToLocalStorage();
  syncToFirebase();
  refreshAfterQuote(id);
  showNotification(L('qDeclinedMsg'), { detail: `${q.id} · ${q.customer}` });
}

function refreshAfterQuote(id) {
  const viewing = !!document.getElementById('viewModal');
  renderApp();
  if (viewing) { closeViewModal(); viewQuotation(id); }
}
