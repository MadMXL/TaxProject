// ═══════════════════════════════════════════════════════════════
// Baigamgab · SmartLedger — Monthly revenue report
// Revenue = approved documents whose document date falls in the month
// (the same rule as the Overview KPI). Pending documents are shown as
// "not counted yet". Delivered in-app, by "Email this report" (opens the
// user's mail app pre-filled; no server) and as a PDF.
// Who: Manager and Admin.
// ═══════════════════════════════════════════════════════════════

const DOC_TYPES = ['bill', 'invoice', 'tax-invoice'];
function docTypeName(t) {
  return getLang() === 'th' ? ({ 'bill': 'ใบเสร็จ', 'invoice': 'ใบแจ้งหนี้', 'tax-invoice': 'ใบกำกับภาษี' }[t] || t) : getDocTypeLabel(t);
}

function shiftMonth(ym, d) {
  const [y, m] = ym.split('-').map(Number);
  const t = new Date(y, m - 1 + d, 1);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`;
}
function monthName(ym, lang) {
  const [y, m] = ym.split('-').map(Number);
  const th = (lang || getLang()) === 'th';
  return new Date(y, m - 1, 1).toLocaleDateString(th ? 'th-TH' : 'en-GB', { month: 'long', year: 'numeric' });
}
const r2 = n => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// Months the picker offers: every month that has a document, plus this month.
function reportMonths() {
  const set = new Set(quotations.map(q => (q.date || '').slice(0, 7)).filter(Boolean));
  set.add(localDateISO().slice(0, 7));
  return [...set].sort().reverse();
}
function defaultReportMonth() {
  const months = quotations.filter(q => q.status === 'approved').map(q => (q.date || '').slice(0, 7)).filter(Boolean).sort();
  return months.length ? months[months.length - 1] : localDateISO().slice(0, 7);
}
function activeReportMonth() {
  if (!reportMonth) reportMonth = defaultReportMonth();
  return reportMonth;
}
function setReportMonth(ym) { reportMonth = ym; renderApp(); }

function monthStats(ym) {
  const inMonth = quotations.filter(q => (q.date || '').slice(0, 7) === ym);
  const approved = inMonth.filter(q => q.status === 'approved');
  const pending = inMonth.filter(q => q.status === 'pending');
  const sum = (list, k) => r2(list.reduce((s, q) => s + (Number(q[k]) || 0), 0));

  const byType = DOC_TYPES.map(t => {
    const l = approved.filter(q => (q.docType || 'bill') === t);
    return { type: t, count: l.length, net: sum(l, 'subtotal'), vat: sum(l, 'tax'), total: sum(l, 'total') };
  });

  const cust = {};
  approved.forEach(q => {
    const k = q.customer || '—';
    cust[k] = cust[k] || { name: k, count: 0, total: 0 };
    cust[k].count++; cust[k].total = r2(cust[k].total + (Number(q.total) || 0));
  });
  const revenue = sum(approved, 'total');
  const customersTop = Object.values(cust).sort((a, b) => b.total - a.total)
    .map(c => ({ ...c, share: revenue ? c.total / revenue : 0 }));

  const jobCosts = r2(poCosts.filter(c => (c.date || '').slice(0, 7) === ym).reduce((s, c) => s + (Number(c.amount) || 0), 0));

  return {
    ym, revenue, net: sum(approved, 'subtotal'), vat: sum(approved, 'tax'), count: approved.length,
    pendingCount: pending.length, pendingTotal: sum(pending, 'total'),
    byType, customersTop, jobCosts,
  };
}

// "+12% vs August 2026" — null when the previous month has nothing to compare against.
function delta(cur, prev) {
  if (!prev) return null;
  const pct = Math.round((cur - prev) / prev * 100);
  return { pct, dir: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat', text: (pct > 0 ? '+' : pct < 0 ? '−' : '±') + Math.abs(pct) + '%' };
}

// ── Page ─────────────────────────────────────────────────────
function renderReportView() {
  const th = getLang() === 'th';
  const ym = activeReportMonth();
  const prevYm = shiftMonth(ym, -1);
  const s = monthStats(ym);
  const p = monthStats(prevYm);
  const months = reportMonths();
  const idx = months.indexOf(ym);
  const olderYm = shiftMonth(ym, -1), newerYm = shiftMonth(ym, 1);
  const thisMonth = localDateISO().slice(0, 7);

  const cmp = (cur, prev) => {
    const d = delta(cur, prev);
    return d ? { text: `${d.text} ${Lf('vsLastMonth', { m: monthName(prevYm) })}`, dir: d.dir }
             : { text: Lf('noPrior', { m: monthName(prevYm) }), dir: 'flat' };
  };
  const dRev = cmp(s.revenue, p.revenue), dCnt = cmp(s.count, p.count);

  // Trend: the 12 months ending at the selected one (the selected month is the bold last bar).
  const trend = [];
  for (let i = 11; i >= 0; i--) {
    const m = shiftMonth(ym, -i);
    trend.push({ label: monthLabel(m, th), value: monthStats(m).revenue });
  }

  const typeRows = s.byType.map(t => `<tr>
      <td>${getDocTypeBadge(t.type)}</td><td class="num tnum">${t.count}</td>
      <td class="num tnum">${baht(t.net)}</td><td class="num tnum muted">${baht(t.vat)}</td><td class="num cell-strong tnum">${baht(t.total)}</td></tr>`).join('');

  const custRows = s.customersTop.slice(0, 8).map((c, i) => `<tr>
      <td class="muted tnum" style="width:28px;">${i + 1}</td>
      <td><div class="cell-strong">${esc(c.name)}</div><div class="cell-sub">${c.count} ${th ? 'เอกสาร' : (c.count === 1 ? 'document' : 'documents')}</div></td>
      <td class="num cell-strong tnum">${baht(c.total)}</td>
      <td class="share-cell"><div class="share"><span class="meter"><i style="width:${(c.share * 100).toFixed(1)}%"></i></span><span class="tnum">${Math.round(c.share * 100)}%</span></div></td>
    </tr>`).join('');

  return `
    <div class="view-head">
      <div><h1>${L('report')}</h1><p>${esc(L('reportSub'))}</p></div>
      <div class="head-actions">
        <button class="btn btn-secondary" onclick="emailMonthlyReport()">${icon('mail')}${L('emailReport')}</button>
        <button class="btn btn-primary" onclick="generateReportPDF()">${icon('download')}${L('downloadPdf')}</button>
      </div>
    </div>

    <div class="card card-pad month-bar">
      <div class="month-nav">
        <button class="icon-btn" onclick="setReportMonth('${olderYm}')" aria-label="${L('prevMonth')}" title="${L('prevMonth')}">${icon('chevL', '')}</button>
        <label class="field month-pick"><span class="field-label sr-only">${L('month')}</span>
          <select class="select" onchange="setReportMonth(this.value)" aria-label="${L('month')}">
            ${(idx === -1 ? [ym, ...months] : months).map(m => `<option value="${m}" ${m === ym ? 'selected' : ''}>${esc(monthName(m))}</option>`).join('')}
          </select></label>
        <button class="icon-btn" onclick="setReportMonth('${newerYm}')" ${ym >= thisMonth ? 'disabled' : ''} aria-label="${L('nextMonth')}" title="${L('nextMonth')}">${icon('chevR', '')}</button>
      </div>
      ${s.pendingCount ? `<span class="month-pending">${icon('clipboard', '')}<span><b>${L('notCounted')}:</b> ${esc(Lf('pendingAmt', { n: s.pendingCount, amt: '฿' + fmt(s.pendingTotal) }))}</span></span>` : ''}
    </div>

    <div class="kpi-grid">
      ${kpi(L('revenueInclVat'), baht(s.revenue), 'var(--brand)', dRev.text, dRev.dir)}
      ${kpi(L('netRevenue'), baht(s.net), 'var(--accent)', th ? 'ยอดที่ใช้คำนวณภาษี' : 'the amount VAT is charged on')}
      ${kpi(L('outputVat'), baht(s.vat), 'var(--st-pending)', th ? 'นำส่งกรมสรรพากร (ภ.พ.30)' : 'to file on the monthly VAT return (P.P.30)')}
      ${kpi(L('docsApproved'), s.count, 'var(--st-approved)', dCnt.text, dCnt.dir)}
    </div>

    <div class="grid-2 report-grid">
      <div class="card">
        <div class="card-head"><span class="card-title">${L('trend12')}</span><span class="cell-sub">${th ? 'พันบาท' : 'THB ×1,000'}</span></div>
        <div class="card-pad">${barChartSVG(trend)}</div>
      </div>
      <div class="card">
        <div class="card-head"><span class="card-title">${L('byType')}</span><span class="cell-sub">${esc(monthName(ym))}</span></div>
        <div class="table-wrap"><table class="table" style="min-width:440px;">
          <thead><tr><th>${L('docType')}</th><th class="num">${th ? 'จำนวน' : 'Docs'}</th><th class="num">${L('subtotal')}</th><th class="num">VAT</th><th class="num">${L('total')}</th></tr></thead>
          <tbody>${typeRows}</tbody>
          <tfoot><tr><td class="cell-strong">${L('total')}</td><td class="num tnum cell-strong">${s.count}</td><td class="num tnum cell-strong">${baht(s.net)}</td><td class="num tnum cell-strong">${baht(s.vat)}</td><td class="num tnum cell-strong">${baht(s.revenue)}</td></tr></tfoot>
        </table></div>
        <div class="card-pad" style="padding-top:var(--s2);">
          ${kv(L('jobCosts'), '฿' + fmt(s.jobCosts), 'var(--ink-2)')}
          ${kv(L('grossMargin') + (th ? ' (ก่อนภาษี)' : ' (before VAT)'), '฿' + fmt(r2(s.net - s.jobCosts)), s.net - s.jobCosts >= 0 ? 'var(--pos)' : 'var(--neg)')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><span class="card-title">${L('topCustomers')}</span><span class="cell-sub">${s.customersTop.length}</span></div>
      ${s.customersTop.length ? `<div class="table-wrap"><table class="table" style="min-width:520px;">
        <thead><tr><th></th><th>${L('customer2')}</th><th class="num">${L('total')}</th><th>${L('share')}</th></tr></thead>
        <tbody>${custRows}</tbody></table></div>`
      : emptyBody(L('noRevenueMonth'), L('noRevenueHint'))}
    </div>`;
}

// ── Plain-text summary (email body) ──────────────────────────
function reportText(ym) {
  const th = getLang() === 'th';
  const s = monthStats(ym), p = monthStats(shiftMonth(ym, -1));
  const d = delta(s.revenue, p.revenue);
  const B = n => '฿' + fmt(n);
  const lines = [
    Lf('reportEmailSubject', { m: monthName(ym) }),
    companyInfo.name || '',
    '',
    `${L('revenueInclVat')}: ${B(s.revenue)}${d ? `  (${d.text} ${Lf('vsLastMonth', { m: monthName(shiftMonth(ym, -1)) })})` : ''}`,
    `${L('netRevenue')}: ${B(s.net)}`,
    `${L('outputVat')}: ${B(s.vat)}`,
    `${L('docsApproved')}: ${s.count}`,
    s.pendingCount ? `${L('notCounted')}: ${Lf('pendingAmt', { n: s.pendingCount, amt: B(s.pendingTotal) })}` : '',
    `${L('jobCosts')}: ${B(s.jobCosts)}`,
    '',
    L('byType'),
    ...s.byType.filter(t => t.count).map(t => `- ${docTypeName(t.type)}: ${t.count} · ${B(t.total)}`),
    '',
    L('topCustomers'),
    ...s.customersTop.slice(0, 5).map((c, i) => `${i + 1}. ${c.name}: ${B(c.total)} (${Math.round(c.share * 100)}%)`),
    '',
    L('reportSub') + '.',
    (th ? 'ส่งจาก Baigamgab SmartLedger' : 'Sent from Baigamgab SmartLedger'),
  ];
  return lines.filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\r\n');
}

function emailMonthlyReport() {
  const ym = activeReportMonth();
  const to = companyInfo.email || '';
  const href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(Lf('reportEmailSubject', { m: monthName(ym) }))}&body=${encodeURIComponent(reportText(ym))}`;
  window.location.href = href;
}

// ── PDF ──────────────────────────────────────────────────────
function generateReportPDF() {
  const ym = activeReportMonth();
  const s = monthStats(ym), p = monthStats(shiftMonth(ym, -1));
  const th = getLang() === 'th';
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.width, m = 18;
    const FONT = (doc.getFontList && doc.getFontList().Sarabun) ? 'Sarabun' : 'helvetica';
    const F = st => doc.setFont(FONT, st);
    const INK = [26, 34, 48], MUTE = [122, 132, 150], HAIR = [214, 219, 227];
    const ink = () => doc.setTextColor(...INK), mute = () => doc.setTextColor(...MUTE);
    const hair = y => { doc.setDrawColor(...HAIR); doc.setLineWidth(0.3); doc.line(m, y, pw - m, y); };
    const B = n => '฿' + fmt(n);

    // Header
    F('bold'); doc.setFontSize(18); ink();
    doc.text(th ? 'รายงานรายได้ประจำเดือน' : 'Monthly revenue report', m, 24);
    F('normal'); doc.setFontSize(9); mute();
    doc.text(doc.splitTextToSize(companyInfo.name || '', 80), pw - m, 16, { align: 'right' });
    if (companyInfo.taxId) doc.text((th ? 'เลขประจำตัวผู้เสียภาษี ' : 'Tax ID ') + companyInfo.taxId, pw - m, 26, { align: 'right' });
    doc.setFontSize(12); ink(); F('bold');
    doc.text(monthName(ym), m, 33);
    F('normal'); doc.setFontSize(8.5); mute();
    doc.text(L('reportSub'), m, 39);
    hair(44);

    // Key figures, two columns
    let y = 54;
    const d = delta(s.revenue, p.revenue);
    const fig = (label, value, x, sub) => {
      F('normal'); doc.setFontSize(8.5); mute(); doc.text(label, x, y);
      F('bold'); doc.setFontSize(15); ink(); doc.text(value, x, y + 8);
      if (sub) { F('normal'); doc.setFontSize(8); mute(); doc.text(sub, x, y + 13.5); }
    };
    const col2 = m + (pw - 2 * m) / 2;
    fig(L('revenueInclVat'), B(s.revenue), m, d ? `${d.text} ${Lf('vsLastMonth', { m: monthName(shiftMonth(ym, -1)) })}` : '');
    fig(L('docsApproved'), String(s.count), col2, s.pendingCount ? `${L('notCounted')}: ${Lf('pendingAmt', { n: s.pendingCount, amt: B(s.pendingTotal) })}` : '');
    y += 24;
    fig(L('netRevenue'), B(s.net), m);
    fig(L('outputVat'), B(s.vat), col2);
    y += 22;
    hair(y); y += 9;

    // Table helper
    const table = (title, head, rows, aligns) => {
      F('bold'); doc.setFontSize(10); ink(); doc.text(title, m, y); y += 6;
      const xs = [m, m + 70, m + 92, m + 122, pw - m];
      const put = (cells, bold) => {
        F(bold ? 'bold' : 'normal'); doc.setFontSize(8.5);
        cells.forEach((c, i) => {
          if (aligns[i] === 'r') doc.text(String(c), i === cells.length - 1 ? pw - m : xs[i + 1] - 3, y, { align: 'right' });
          else doc.text(doc.splitTextToSize(String(c), xs[i + 1] - xs[i] - 4)[0], xs[i], y);
        });
        y += 6;
      };
      mute(); put(head, true); hair(y - 4); ink();
      rows.forEach(r => put(r.cells, r.bold));
      y += 4;
    };
    table(L('byType'), [L('docType'), th ? 'จำนวน' : 'Docs', L('subtotal'), 'VAT', L('total')],
      [...s.byType.map(t => ({ cells: [docTypeName(t.type), t.count, B(t.net), B(t.vat), B(t.total)] })),
       { cells: [L('total'), s.count, B(s.net), B(s.vat), B(s.revenue)], bold: true }],
      ['l', 'r', 'r', 'r', 'r']);
    table(L('topCustomers'), [L('customer2'), th ? 'จำนวน' : 'Docs', '', L('share'), L('total')],
      s.customersTop.slice(0, 10).map(c => ({ cells: [c.name, c.count, '', Math.round(c.share * 100) + '%', B(c.total)] })),
      ['l', 'r', 'r', 'r', 'r']);

    F('normal'); doc.setFontSize(9); ink();
    doc.text(`${L('jobCosts')}: ${B(s.jobCosts)}`, m, y);
    doc.text(`${L('grossMargin')}: ${B(r2(s.net - s.jobCosts))}`, m, y + 6);

    // Footer
    const ph = doc.internal.pageSize.height;
    F('normal'); doc.setFontSize(7.5); mute();
    doc.text(`${th ? 'สร้างเมื่อ' : 'Generated'} ${new Date().toLocaleString(th ? 'th-TH' : 'en-GB')} · ${sessionStorage.getItem('userEmail') || ''}`, m, ph - 12);
    doc.text('Baigamgab SmartLedger', pw - m, ph - 12, { align: 'right' });

    doc.save(`revenue-report_${ym}.pdf`);
    showNotification('✅ PDF', { detail: `revenue-report_${ym}.pdf` });
  } catch (e) {
    console.error(e);
    showNotification('❌ PDF', { detail: e.message });
  }
}
