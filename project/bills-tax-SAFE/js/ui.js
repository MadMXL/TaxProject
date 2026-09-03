// ═══════════════════════════════════════════════════════════════
// Baigamgab · SmartLedger — UI layer
// Instrument register. All visual primitives live in css/styles.css;
// this file assembles them. Business logic stays in functions.js.
// ═══════════════════════════════════════════════════════════════

// ── NUMBER FORMATTERS ─────────────────────────────────────────
function fmt(n)    { return (n == null || isNaN(n)) ? '0.00' : Number(n).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
function fmtNum(n) { return fmt(n); }
function fmtInt(n) { return (n == null || isNaN(n)) ? '0' : Math.round(Number(n)).toLocaleString('en-US'); }
function esc(s)    { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function baht(n)   { return '<span class="cur">฿</span>' + fmt(n); }

// ── LANGUAGE ──────────────────────────────────────────────────
const LANG = {
  en: {
    dashboard:'Dashboard', bills:'Documents', po:'Purchase Orders',
    materials:'Material Costs', customers:'Customers',
    newDoc:'New Document', manageUsers:'Users', signOut:'Sign out',
    draft:'Draft', pending:'Pending', approved:'Approved', rejected:'Rejected',
    open:'Open', inProgress:'In Progress', completed:'Completed',
    newPO:'New PO', addMaterial:'Add Material Price',
    cancel:'Cancel', createPO:'Create PO', saveChanges:'Save Changes',
    addCost:'Add Cost', addCostTitle:'Add Cost', delete:'Delete', addItem:'Add Item',
    exportPDF:'Export PDF', close:'Close',
    convertInvoice:'Convert to Invoice', start:'Start',
    costs:'Costs', cheapest:'Cheapest',
    view:'View', edit:'Edit', del:'Delete', submit:'Submit', pdf:'PDF',
    approve:'Approve', reject:'Reject',
    addCustomer:'Add Customer', addUser:'Add User',
    createUser:'Create User', saveDocument:'Save Document', saveDocument2:'Save',
    overview:'Dashboard', activitySummary:'Your billing activity at a glance',
    totalRevenue:'Total Revenue', vatCollected:'VAT Collected',
    grandTotal:'Grand Total', subtotal:'Subtotal',
    taxSummary:'Tax Summary', monthlyRevenue:'Monthly Revenue',
    recentDocs:'Recent Documents', viewAll:'View all',
    pendingCount:'Pending', approvedCount:'Approved', rejectedCount:'Rejected',
    allFilter:'All', listView:'List', byDate:'By Date', byCustomer:'By Customer',
    noDocuments:'No documents found', tryFilter:'Try a different filter, or create a new document.',
    total:'Total', tax7:'VAT 7%',
    docType:'Type', customer2:'Customer', itemsCol:'Items', statusCol:'Status', actionsCol:'Actions',
    documentType:'Document Type', customerInfo:'Customer Information',
    selectCustomer:'Select Customer', manualEntry:'Enter customer details manually',
    nameStar:'Name', emailStar:'Email', email:'Email', address:'Address',
    taxId:'Tax ID', phone:'Phone',
    itemsServices:'Items / Services', productService:'Product / Service',
    descriptionLbl:'Description', qty:'Qty', amount:'Amount',
    unitPrice:'Unit Price (THB)', summary:'Summary', applyVat:'Apply VAT (7%)',
    notesTerms:'Notes / Payment Terms', submitReview:'Submit for Review', createDoc:'Create Document',
    techView:'Technician view — you can review documents, not create them',
    noCustomers:'No customers yet', addFirstCustomer:'Add your first customer to get started.',
    name:'Name', type:'Type', actions:'Actions', phoneLbl:'Phone', addressLbl:'Address',
    customerType:'Customer Type', individual:'Individual', company:'Company',
    poId:'PO ID', date:'Date', notes:'Notes', customer:'Customer',
    noOrders:'No purchase orders yet.', ordersCount:'order(s)',
    costTracking:'Cost Tracking', poRevenue:'PO Revenue',
    totalCost:'Total Cost', profit:'Profit',
    costEntries:'Cost Entries', noCosts:'No costs recorded yet',
    typeLbl:'Type', labor:'Labor', transport:'Transport', material:'Material', other:'Other',
    supplierLbl:'Supplier name',
    materialCostTitle:'Material Cost per Supplier',
    noMaterialsMsg:'No material costs recorded yet',
    addMaterialTitle:'Add Material Price',
    materialName:'Material Name', supplier:'Supplier Name',
    pricePerUnit:'Price per Unit (THB)',
    supplierCol:'Supplier', priceUnitCol:'Price / unit', dateCol:'Date', fromPOCol:'From PO',
    materialsTracked:'material(s) tracked', saveVs:'saved vs most expensive',
    userMgmt:'User Management', allUsers:'All users',
    loadingUsers:'Loading users…', noUsers:'No users yet.',
    notConnected:'Firebase not connected.', loading:'Loading…',
    fullName:'Full name', password:'Password', roleLbl:'Role',
    scanToOpen:'Scan to open',
    itemCol:'Item', qtyCol:'Qty', priceCol:'Price',
  },
  th: {
    dashboard:'แดชบอร์ด', bills:'เอกสาร', po:'ใบสั่งซื้อ',
    materials:'ต้นทุนวัสดุ', customers:'ลูกค้า',
    newDoc:'เอกสารใหม่', manageUsers:'ผู้ใช้', signOut:'ออกจากระบบ',
    draft:'ร่าง', pending:'รออนุมัติ', approved:'อนุมัติแล้ว', rejected:'ปฏิเสธ',
    open:'เปิด', inProgress:'กำลังดำเนินการ', completed:'เสร็จสิ้น',
    newPO:'ใบสั่งซื้อใหม่', addMaterial:'เพิ่มราคาวัสดุ',
    cancel:'ยกเลิก', createPO:'สร้างใบสั่งซื้อ', saveChanges:'บันทึกการเปลี่ยนแปลง',
    addCost:'เพิ่มค่าใช้จ่าย', addCostTitle:'เพิ่มค่าใช้จ่าย', delete:'ลบ', addItem:'เพิ่มรายการ',
    exportPDF:'ส่งออก PDF', close:'ปิด',
    convertInvoice:'แปลงเป็นใบแจ้งหนี้', start:'เริ่ม',
    costs:'ต้นทุน', cheapest:'ถูกสุด',
    view:'ดู', edit:'แก้ไข', del:'ลบ', submit:'ส่ง', pdf:'PDF',
    approve:'อนุมัติ', reject:'ปฏิเสธ',
    addCustomer:'เพิ่มลูกค้า', addUser:'เพิ่มผู้ใช้',
    createUser:'สร้างผู้ใช้', saveDocument:'บันทึกเอกสาร', saveDocument2:'บันทึก',
    overview:'แดชบอร์ด', activitySummary:'ภาพรวมกิจกรรมการออกบิลของคุณ',
    totalRevenue:'รายได้รวม', vatCollected:'ภาษีที่เก็บได้',
    grandTotal:'ยอดรวมทั้งสิ้น', subtotal:'ยอดก่อนภาษี',
    taxSummary:'สรุปภาษี', monthlyRevenue:'รายได้รายเดือน',
    recentDocs:'เอกสารล่าสุด', viewAll:'ดูทั้งหมด',
    pendingCount:'รออนุมัติ', approvedCount:'อนุมัติแล้ว', rejectedCount:'ปฏิเสธ',
    allFilter:'ทั้งหมด', listView:'รายการ', byDate:'ตามวันที่', byCustomer:'ตามลูกค้า',
    noDocuments:'ไม่พบเอกสาร', tryFilter:'ลองกรองแบบอื่น หรือสร้างเอกสารใหม่',
    total:'รวมทั้งสิ้น', tax7:'ภาษี 7%',
    docType:'ประเภท', customer2:'ลูกค้า', itemsCol:'รายการ', statusCol:'สถานะ', actionsCol:'การดำเนินการ',
    documentType:'ประเภทเอกสาร', customerInfo:'ข้อมูลลูกค้า',
    selectCustomer:'เลือกลูกค้า', manualEntry:'กรอกข้อมูลลูกค้าด้วยตนเอง',
    nameStar:'ชื่อ', emailStar:'อีเมล', email:'อีเมล', address:'ที่อยู่',
    taxId:'เลขที่ภาษี', phone:'โทรศัพท์',
    itemsServices:'รายการ / บริการ', productService:'สินค้า / บริการ',
    descriptionLbl:'คำอธิบาย', qty:'จำนวน', amount:'จำนวนเงิน',
    unitPrice:'ราคาต่อหน่วย (บาท)', summary:'สรุป', applyVat:'รวม VAT (7%)',
    notesTerms:'หมายเหตุ / เงื่อนไขการชำระเงิน', submitReview:'ส่งตรวจสอบ', createDoc:'สร้างเอกสาร',
    techView:'บทบาทช่างเทคนิค — ตรวจเอกสารได้ แต่สร้างไม่ได้',
    noCustomers:'ยังไม่มีลูกค้า', addFirstCustomer:'เพิ่มลูกค้าคนแรกของคุณ',
    name:'ชื่อ', type:'ประเภท', actions:'การดำเนินการ', phoneLbl:'โทรศัพท์', addressLbl:'ที่อยู่',
    customerType:'ประเภทลูกค้า', individual:'บุคคลทั่วไป', company:'บริษัท',
    poId:'รหัส PO', date:'วันที่', notes:'หมายเหตุ', customer:'ลูกค้า',
    noOrders:'ยังไม่มีใบสั่งซื้อ', ordersCount:'ใบสั่งซื้อ',
    costTracking:'ติดตามต้นทุน', poRevenue:'รายได้ PO',
    totalCost:'ต้นทุนรวม', profit:'กำไร',
    costEntries:'รายการค่าใช้จ่าย', noCosts:'ยังไม่มีค่าใช้จ่าย',
    typeLbl:'ประเภท', labor:'แรงงาน', transport:'ขนส่ง', material:'วัสดุ', other:'อื่นๆ',
    supplierLbl:'ชื่อผู้ขาย',
    materialCostTitle:'ต้นทุนวัสดุต่อผู้ขาย',
    noMaterialsMsg:'ยังไม่มีข้อมูลต้นทุนวัสดุ',
    addMaterialTitle:'เพิ่มราคาวัสดุ',
    materialName:'ชื่อวัสดุ', supplier:'ชื่อผู้ขาย',
    pricePerUnit:'ราคาต่อหน่วย (บาท)',
    supplierCol:'ผู้ขาย', priceUnitCol:'ราคา / หน่วย', dateCol:'วันที่', fromPOCol:'จาก PO',
    materialsTracked:'วัสดุที่บันทึก', saveVs:'ประหยัดกว่าราคาสูงสุด',
    userMgmt:'จัดการผู้ใช้งาน', allUsers:'ผู้ใช้ทั้งหมด',
    loadingUsers:'กำลังโหลด…', noUsers:'ยังไม่มีผู้ใช้',
    notConnected:'ไม่ได้เชื่อมต่อ Firebase', loading:'กำลังโหลด…',
    fullName:'ชื่อ-นามสกุล', password:'รหัสผ่าน', roleLbl:'บทบาท',
    scanToOpen:'สแกนเพื่อเปิด',
    itemCol:'รายการ', qtyCol:'จำนวน', priceCol:'ราคา',
  }
};
function L(k){ const l = localStorage.getItem('appLang') || 'en'; return (LANG[l] && LANG[l][k]) || LANG.en[k] || k; }
function getLang(){ return localStorage.getItem('appLang') || 'en'; }
function setLang(l){ localStorage.setItem('appLang', l); renderApp(); }

// ── THEME ─────────────────────────────────────────────────────
// One palette. Every value is a CSS custom property, so light/dark
// is handled entirely by [data-theme] in css/styles.css. Kept as an
// object (and Proxy) so legacy `${T.x}` interpolations keep working.
const THEME = {
  name:'Baigamgab',
  nav:'var(--brand)', navText:'var(--brand-ink)',
  tabs:'var(--brand-2)', tabBdr:'rgba(255,255,255,0.08)',
  body:'var(--paper)', card:'var(--surface)', cardLt:'var(--surface-2)',
  accent:'var(--accent)', accentLt:'var(--accent-ink)',
  border:'var(--line-2)', borderLt:'var(--line)',
  txt:'var(--ink)', txtMute:'var(--ink-2)', txtFaint:'var(--ink-3)',
  fill:'var(--surface-2)', cream:'var(--brand-ink)',
  rowHover:'var(--surface-2)',
  statColors:['var(--brand)','var(--st-approved)','var(--st-pending)','var(--st-rejected)'],
  dot:'var(--accent)',
};
function getTheme(){ return THEME; }
const T = new Proxy({}, { get(_, p){ return THEME[p]; } });
function setTheme(){ /* palette switcher retired — kept for back-compat */ }

function getMode(){ return localStorage.getItem('appMode') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
function setMode(m){
  localStorage.setItem('appMode', m);
  document.documentElement.setAttribute('data-theme', m === 'dark' ? 'dark' : 'light');
  renderApp();
}
function toggleMode(){ setMode(getMode() === 'dark' ? 'light' : 'dark'); }

// ── ICONS ─────────────────────────────────────────────────────
const IC = {
  dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  bills:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  po:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h4"/>',
  box:'<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  users:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 6.5a3 3 0 0 1 0 6M20.5 20a5.2 5.2 0 0 0-4-5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  shield:'<path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z"/><path d="M9.5 12l1.8 1.8L15 10"/>',
  logout:'<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h11"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
  moon:'<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  chevR:'<path d="M9 6l6 6-6 6"/>',
  arrowR:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  check:'<path d="M5 13l4 4L19 7"/>',
  dot:'<circle cx="12" cy="12" r="4"/>',
  download:'<path d="M12 3v12M7 11l5 5 5-5M5 21h14"/>',
  edit:'<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  send:'<path d="M4 12l16-8-6 16-3-6-7-2z"/>',
  receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/>',
  building:'<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
};
function icon(name, cls){
  return `<svg class="${cls||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[name]||''}</svg>`;
}

// ═══════════════════════════════════════════════════════════════
// APP FRAME
// ═══════════════════════════════════════════════════════════════
function renderApp() {
  document.documentElement.setAttribute('data-theme', getMode() === 'dark' ? 'dark' : 'light');
  const app = document.getElementById('app');
  const role  = sessionStorage.getItem('userRole') || 'sales';
  const email = sessionStorage.getItem('userEmail') || '';
  const name  = sessionStorage.getItem('userName') || email;
  const rejectedCount = quotations.filter(q => q.status === 'rejected').length;
  const showRejBadge  = (role === 'sales' || role === 'admin' || role === 'manager') && rejectedCount > 0 ? rejectedCount : 0;

  const canDocs = role === 'sales' || role === 'admin' || role === 'manager';
  const canOps  = canDocs || role === 'technician';
  const canUsers = role === 'admin' || role === 'manager';

  app.innerHTML = `
    <div class="page">
      <header class="topbar">
        <div class="shell topbar-inner">
          <div class="brand">
            <span class="brand-mark">${icon('receipt','')}</span>
            <span><span class="brand-name">Baigamgab</span> <span class="brand-sub">SmartLedger</span></span>
          </div>
          <div class="topbar-actions">
            <span class="chip-user">
              <span class="uname">${esc(name)}</span>
              <span class="sep">·</span>
              <b>${esc(getRoleLabel(role))}</b>
            </span>
            <button class="ghost-btn" onclick="toggleMode()" title="Toggle theme" aria-label="Toggle theme">
              ${icon(getMode() === 'dark' ? 'sun' : 'moon')}
            </button>
            <button class="ghost-btn" onclick="setLang(getLang()==='en'?'th':'en')">${getLang() === 'en' ? 'ไทย' : 'EN'}</button>
            <button class="ghost-btn" onclick="logout()">${icon('logout')}<span class="uname">${L('signOut')}</span></button>
          </div>
        </div>
      </header>

      <nav class="tabs">
        <div class="shell tabs-inner">
          ${tab('dashboard', L('dashboard'))}
          ${tab('bills', L('bills'), showRejBadge)}
          ${canOps  ? tab('po', L('po')) : ''}
          ${canOps  ? tab('materials', L('materials')) : ''}
          ${canDocs ? tab('customers', L('customers')) : ''}
          ${canDocs ? tab('new', L('newDoc')) : ''}
          ${canUsers ? tab('users', L('manageUsers')) : ''}
        </div>
      </nav>

      <main class="shell">
        <div class="view">${renderContent()}</div>
      </main>

      <nav class="tabbar">
        ${bottomTab('dashboard','dashboard',L('dashboard'))}
        ${bottomTab('bills','bills',L('bills'))}
        ${canDocs ? bottomTab('customers','users',L('customers')) : bottomTab('po','po',L('po'))}
        ${canDocs ? bottomTab('new','plus',L('newDoc')) : bottomTab('materials','box',L('materials'))}
      </nav>
    </div>`;
}

function tab(view, label, badge) {
  const cur = currentView === view;
  const b = badge > 0 ? `<span class="tab-badge">${badge}</span>` : '';
  return `<button class="tab" ${cur ? 'aria-current="page"' : ''} onclick="switchView('${view}')">${esc(label)}${b}</button>`;
}
function bottomTab(view, ico, label) {
  const cur = currentView === view;
  return `<a href="#" ${cur ? 'aria-current="page"' : ''} onclick="event.preventDefault();switchView('${view}')">${icon(ico)}<span>${esc(label)}</span></a>`;
}

function renderContent() {
  const html = (() => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'bills':     return renderBillsView();
      case 'customers': return renderCustomersView();
      case 'new':       return renderNewQuotation();
      case 'users':     return renderUsersView();
      case 'po':        return renderPOView();
      case 'materials': return renderMaterialsView();
      default:          return renderDashboard();
    }
  })();
  if (currentView === 'users') setTimeout(() => adminLoadUsers(), 60);
  return html;
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function renderDashboard() {
  const total    = quotations.reduce((s, q) => s + (q.total || 0), 0);
  const totalTax = quotations.reduce((s, q) => s + (q.tax || 0), 0);
  const approved = quotations.filter(q => q.status === 'approved').length;
  const pending  = quotations.filter(q => q.status === 'pending').length;
  const rejected = quotations.filter(q => q.status === 'rejected').length;

  const monthly = {};
  quotations.forEach(q => { const m = (q.date || '').substring(0, 7); if (m) monthly[m] = (monthly[m] || 0) + (q.total || 0); });
  const months = Object.entries(monthly).sort((a, b) => a[0] < b[0] ? 1 : -1).slice(0, 6).reverse();
  const maxM = Math.max(...months.map(m => m[1]), 1);

  return `
    <div class="view-head">
      <div>
        <h1>${L('overview')}</h1>
        <p>${L('activitySummary')}</p>
      </div>
    </div>

    <div class="stat-grid">
      ${stat(L('totalRevenue'), baht(total), 'var(--brand)')}
      ${stat(L('approvedCount'), approved, 'var(--st-approved)')}
      ${stat(L('pendingCount'), pending, 'var(--st-pending)')}
      ${stat(L('rejectedCount'), rejected, 'var(--st-rejected)')}
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-head"><span class="card-title">${L('taxSummary')}</span></div>
        <div class="card-pad stack">
          ${kv(L('subtotal'), baht(total - totalTax))}
          ${kv(L('vatCollected'), baht(totalTax), 'var(--accent)')}
          <div class="spread" style="background:var(--brand);color:var(--brand-ink);border-radius:8px;padding:10px 12px;margin-top:4px;">
            <span style="color:var(--brand-ink-2);font-size:var(--t-meta);">${L('grandTotal')}</span>
            <b class="tnum" style="font-size:var(--t-sm);">${baht(total)}</b>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><span class="card-title">${L('monthlyRevenue')}</span></div>
        <div class="card-pad stack">
          ${months.length ? months.map(([m, a]) => `
            <div>
              <div class="spread" style="margin-bottom:4px;">
                <span style="font-size:var(--t-micro);color:var(--ink-3);">${m}</span>
                <span class="tnum" style="font-size:var(--t-micro);color:var(--accent);font-weight:600;">฿${fmtInt(a)}</span>
              </div>
              <div class="meter"><i style="width:${(a / maxM * 100).toFixed(1)}%"></i></div>
            </div>`).join('') : `<p class="muted" style="font-size:var(--t-meta);">No revenue recorded yet.</p>`}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <span class="card-title">${L('recentDocs')}</span>
        <button class="act act-primary" onclick="switchView('bills')">${L('viewAll')} ${icon('arrowR','')}</button>
      </div>
      ${quotations.length ? quotations.slice(0, 6).map(q => `
        <div class="row">
          <span class="row-ico" style="color:${statusColor(q.status)};background:${statusWash(q.status)};">${icon(q.status === 'approved' ? 'check' : q.status === 'rejected' ? 'x' : 'dot','')}</span>
          <div class="row-main">
            <div class="t">${esc(q.customer)}</div>
            <div class="s">${esc(q.id)} · ${esc(q.date)}</div>
          </div>
          <div class="row-end">
            <div class="tnum" style="font-weight:600;font-size:var(--t-sm);">${baht(q.total)}</div>
            <div style="margin-top:3px;">${getStatusPill(q.status)}</div>
          </div>
        </div>`).join('') : emptyBody(L('noDocuments'), '')}
    </div>`;
}

function stat(label, value, accent, sub) {
  return `<div class="stat" style="--stat-accent:${accent};">
    <div class="stat-label">${esc(label)}</div>
    <div class="stat-value tnum">${value}</div>
    ${sub ? `<div class="stat-sub">${esc(sub)}</div>` : ''}
  </div>`;
}
function kv(label, value, color) {
  return `<div class="spread" style="padding:7px 0;border-bottom:1px solid var(--line);">
    <span style="color:var(--ink-2);font-size:var(--t-meta);">${esc(label)}</span>
    <span class="tnum" style="font-weight:600;font-size:var(--t-meta);color:${color || 'var(--ink)'};">${value}</span>
  </div>`;
}
function statusColor(s){ return { draft:'var(--st-draft)', pending:'var(--st-pending)', approved:'var(--st-approved)', rejected:'var(--st-rejected)' }[s] || 'var(--ink-3)'; }
function statusWash(s){ return { draft:'var(--st-draft-wash)', pending:'var(--st-pending-wash)', approved:'var(--st-approved-wash)', rejected:'var(--st-rejected-wash)' }[s] || 'var(--surface-2)'; }

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS (bills)
// ═══════════════════════════════════════════════════════════════
function renderBillsView() {
  let filtered = statusFilter === 'all' ? quotations : quotations.filter(q => q.status === statusFilter);
  if (searchQuery.trim()) {
    const s = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(d =>
      d.id.toLowerCase().includes(s) ||
      (d.customer || '').toLowerCase().includes(s) ||
      (d.taxId && d.taxId.toLowerCase().includes(s)) ||
      d.items.some(i => (i.name || '').toLowerCase().includes(s)));
  }
  const c = {
    all: quotations.length,
    draft: quotations.filter(q => q.status === 'draft').length,
    pending: quotations.filter(q => q.status === 'pending').length,
    approved: quotations.filter(q => q.status === 'approved').length,
    rejected: quotations.filter(q => q.status === 'rejected').length,
  };

  return `
    <div class="view-head">
      <div><h1>${L('bills')}</h1><p>${filtered.length} ${filtered.length === 1 ? 'document' : 'documents'}</p></div>
    </div>

    <div class="card card-pad stack">
      <div class="spread" style="flex-wrap:wrap;">
        <div class="seg">
          ${seg('list', L('listView'))}${seg('date', L('byDate'))}${seg('customer', L('byCustomer'))}
        </div>
        <div class="chips">
          ${chip('all', L('allFilter'), c.all)}${chip('draft', L('draft'), c.draft)}${chip('pending', L('pending'), c.pending)}${chip('approved', L('approved'), c.approved)}${chip('rejected', L('rejected'), c.rejected)}
        </div>
      </div>
      <div class="search-wrap">
        ${icon('search','')}
        <input class="input input-search" type="text" placeholder="Search by ID, customer, item…" value="${esc(searchQuery)}"
          oninput="searchQuery=this.value;renderApp()">
        ${searchQuery ? `<button class="search-clear" onclick="searchQuery='';renderApp()">${icon('x','')}</button>` : ''}
      </div>
      ${searchQuery ? `<div style="font-size:var(--t-micro);color:var(--ink-3);">${filtered.length} result${filtered.length === 1 ? '' : 's'} for “${esc(searchQuery)}”</div>` : ''}
    </div>

    ${billViewMode === 'list' ? renderBillsList(filtered) : renderBillsGrouped(filtered)}`;
}

function seg(mode, label) {
  return `<button aria-pressed="${billViewMode === mode}" onclick="billViewMode='${mode}';renderApp()">${esc(label)}</button>`;
}
function chip(val, label, n) {
  return `<button class="chip" aria-pressed="${statusFilter === val}" onclick="statusFilter='${val}';renderApp()">${esc(label)} <span class="n">${n}</span></button>`;
}

function renderBillsList(list) {
  if (!list.length) return emptyState(L('noDocuments'), L('tryFilter'), 'bills');
  return `
  <div class="card">
    <div class="table-wrap">
      <table class="table" style="min-width:720px;">
        <thead><tr>
          <th>Document</th><th>${L('docType')}</th><th>${L('customer2')}</th><th>${L('itemsCol')}</th>
          <th class="num">${L('total')}</th><th>${L('statusCol')}</th><th>${L('actionsCol')}</th>
        </tr></thead>
        <tbody>${list.map(q => `
          <tr>
            <td><div class="cell-strong">${esc(q.id)}</div><div class="cell-accent">${esc(q.date)}</div></td>
            <td>${getDocTypeBadge(q.docType)}</td>
            <td><div class="cell-strong">${esc(q.customer)}</div>${q.customerEmail ? `<div class="cell-sub">${esc(q.customerEmail)}</div>` : ''}</td>
            <td class="muted">${q.items.length} item${q.items.length === 1 ? '' : 's'}</td>
            <td class="num"><div class="cell-strong tnum">${baht(q.total)}</div><div class="cell-sub tnum">VAT ฿${fmt(q.tax)}</div></td>
            <td>${getStatusPill(q.status)}${q.status === 'rejected' && q.rejectionReason ? `<div style="margin-top:3px;font-size:var(--t-micro);color:var(--st-rejected);">“${esc(q.rejectionReason)}”</div>` : ''}</td>
            <td style="white-space:nowrap;">${getActionButtons(q)}</td>
          </tr>`).join('')}</tbody>
      </table>
    </div>
  </div>`;
}

function renderBillsGrouped(list) {
  if (!list.length) return emptyState(L('noDocuments'), L('tryFilter'), 'bills');
  const gk = billViewMode === 'date' ? 'date' : 'customer';
  const grouped = {};
  list.forEach(q => { const k = q[gk] || '—'; (grouped[k] = grouped[k] || []).push(q); });
  return `<div class="stack">${Object.entries(grouped).map(([key, items]) => {
    const tot = items.reduce((s, q) => s + q.total, 0);
    const tax = items.reduce((s, q) => s + q.tax, 0);
    return `
    <div class="card">
      <div class="card-head">
        <div><div style="font-weight:600;">${esc(key)}</div><div class="cell-sub">${items.length} doc${items.length === 1 ? '' : 's'}</div></div>
        <div style="text-align:right;"><div class="cell-strong tnum">${baht(tot)}</div><div class="cell-sub tnum">VAT ฿${fmt(tax)}</div></div>
      </div>
      ${items.map(q => `
        <div class="row">
          <div class="row-main">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span style="font-weight:600;font-size:var(--t-meta);">${esc(q.id)}</span>
              ${getDocTypeBadge(q.docType)}${getStatusPill(q.status)}
            </div>
            <div class="s">${gk === 'date' ? esc(q.customer) : esc(q.date)} · ${esc(q.items.map(i => i.name).join(', '))}</div>
          </div>
          <div class="row-end">
            <div class="tnum" style="font-weight:600;">${baht(q.total)}</div>
            <div style="margin-top:3px;">${getActionButtons(q)}</div>
          </div>
        </div>`).join('')}
    </div>`;
  }).join('')}</div>`;
}

// ═══════════════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════════════
function renderCustomersView() {
  return `
    <div class="view-head">
      <div><h1>${L('customers')}</h1><p>${customers.length} customer${customers.length === 1 ? '' : 's'}</p></div>
      <button class="btn btn-primary" onclick="showAddCustomerModal()">${icon('plus')}${L('addCustomer')}</button>
    </div>
    ${!customers.length ? emptyState(L('noCustomers'), L('addFirstCustomer'), 'users') : `
    <div class="card">
      <div class="table-wrap">
        <table class="table" style="min-width:600px;">
          <thead><tr>
            <th>${L('name')}</th><th>${L('type')}</th><th>${L('email')}</th><th>${L('phone')}</th><th>${L('taxId')}</th><th>${L('actions')}</th>
          </tr></thead>
          <tbody>${customers.map(c => `
            <tr>
              <td><div class="cell-strong">${esc(c.name)}</div><div class="cell-sub">${esc(c.id)}</div></td>
              <td>${c.type === 'company'
                ? `<span class="pill pill-plain pill-neutral">${L('company')}</span>`
                : `<span class="pill pill-plain pill-brand">${L('individual')}</span>`}</td>
              <td class="muted">${esc(c.email) || '—'}</td>
              <td class="muted">${esc(c.phone) || '—'}</td>
              <td class="muted tnum">${esc(c.taxId) || '—'}</td>
              <td style="white-space:nowrap;">
                <button class="act act-primary" onclick="viewCustomer('${c.id}')">${L('view')}</button>
                <button class="act act-warn" onclick="editCustomer('${c.id}')">${L('edit')}</button>
                <button class="act act-danger" onclick="deleteCustomer('${c.id}')">${L('delete')}</button>
              </td>
            </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`}`;
}

// ═══════════════════════════════════════════════════════════════
// NEW DOCUMENT
// ═══════════════════════════════════════════════════════════════
function renderNewQuotation() {
  const role = sessionStorage.getItem('userRole') || 'sales';
  if (role === 'technician') {
    return `<div class="card"><div class="empty">
      <span class="empty-ico">${icon('shield','')}</span>
      <h3>${L('techView')}</h3>
    </div></div>`;
  }
  const dt = (val, t, s) => `
    <div class="dt-opt${val === 'bill' ? ' is-on' : ''}" id="dtc-${val}" onclick="selectDocType('${val}')">
      <input type="radio" name="docType" value="${val}" ${val === 'bill' ? 'checked' : ''} style="display:none;">
      <div class="dt-t">${t}</div><div class="dt-s">${s}</div>
    </div>`;

  return `
  <div style="max-width:820px;margin:0 auto;width:100%;">
    <div class="card">
      <div class="sheet-head" style="border-radius:var(--r-card) var(--r-card) 0 0;">
        <div><div class="k">${L('documentType')}</div><div class="h">${L('newDoc')}</div></div>
      </div>
      <form onsubmit="submitQuotation(event)" class="sheet-body">
        <div class="field">
          <span class="field-label">${L('documentType')}</span>
          <div class="doctype" id="docTypeGroup">
            ${dt('bill','Bill','ใบเสร็จ')}
            ${dt('invoice','Invoice','ใบแจ้งหนี้')}
            ${dt('tax-invoice','Tax Invoice','ใบกำกับภาษี')}
          </div>
        </div>

        <div class="fieldset">
          <h3>${L('customerInfo')}</h3>
          <div class="field">
            <span class="field-label">${L('selectCustomer')}</span>
            <select id="customerSelect" class="select" onchange="fillCustomerInfo()" required>
              <option value="">— ${L('selectCustomer')} —</option>
              ${customers.map(c => `<option value="${c.id}">${esc(c.name)}${c.email ? ' (' + esc(c.email) + ')' : ''}</option>`).join('')}
              <option value="__new__">+ ${L('addCustomer')}</option>
            </select>
          </div>
          <div id="manualCustomerFields" class="hidden">
            <div class="notice" style="margin-bottom:10px;">${L('manualEntry')}</div>
            <div class="grid-2">
              <div class="field"><span class="field-label">${L('nameStar')}</span><input type="text" id="customerName" class="input" placeholder="${L('nameStar')}"></div>
              <div class="field"><span class="field-label">${L('email')}</span><input type="email" id="customerEmail" class="input" placeholder="email@example.com"></div>
            </div>
          </div>
          <div class="field hidden" id="taxIdField"><span class="field-label">${L('taxId')}</span><input type="text" id="taxId" class="input" placeholder="0-1234-56789-01-2"></div>
          <div class="field"><span class="field-label">${L('address')}</span><textarea id="customerAddress" rows="2" class="textarea" placeholder="Street, City, Postal Code"></textarea></div>
        </div>

        <div class="fieldset">
          <div class="spread"><h3>${L('itemsServices')}</h3>
            <button type="button" class="btn btn-secondary btn-sm" onclick="addItemRow()">${icon('plus')}${L('addItem')}</button></div>
          <div id="itemsList" class="stack">${itemRowMarkup(1)}</div>
        </div>

        <div class="fieldset" style="background:var(--surface-2);">
          <h3>${L('summary')}</h3>
          <div class="spread"><span class="muted" style="font-size:var(--t-meta);">${L('subtotal')}</span><span id="previewSubtotal" class="tnum" style="font-weight:600;">฿0.00</span></div>
          <div class="spread">
            <label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:var(--t-meta);color:var(--ink-2);">
              <input type="checkbox" id="applyVat" checked onchange="updatePreview()" style="width:15px;height:15px;accent-color:var(--brand);">
              ${L('applyVat')}
            </label>
            <span id="previewTax" class="tnum" style="font-weight:600;">฿0.00</span>
          </div>
          <div class="spread" style="border-top:1px solid var(--line-2);padding-top:10px;">
            <b>${L('total')}</b>
            <span id="previewTotal" class="tnum" style="font-size:var(--t-h2);font-weight:700;color:var(--accent);">฿0.00</span>
          </div>
        </div>

        <div class="field"><span class="field-label">${L('notesTerms')}</span><textarea id="notes" rows="3" class="textarea" placeholder="Payment terms, additional info…"></textarea></div>

        <div class="sheet-foot" style="padding:0;">
          <button type="submit" class="btn btn-primary btn-block">${L('saveDocument')}</button>
          <button type="button" class="btn btn-secondary" onclick="switchView('bills')">${L('cancel')}</button>
        </div>
      </form>
    </div>
  </div>`;
}

function itemRowMarkup(n) {
  return `
  <div class="item-row" style="border:1px solid var(--line-2);border-radius:var(--r-control);padding:12px;display:flex;flex-direction:column;gap:9px;">
    <div class="spread">
      <span class="item-no" style="font-size:var(--t-micro);font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-3);">Item #${n}</span>
      <button type="button" class="act act-danger" onclick="removeItemRow(this)">${L('delete')}</button>
    </div>
    <div class="field"><span class="field-label">${L('productService')}</span>
      <select class="item-product select" onchange="fillProductInfo(this)">
        <option value="">— Select or type manually —</option>
        ${products.map(p => `<option value="${p.id}">${esc(p.name)} — ฿${fmt(p.price)}</option>`).join('')}
      </select>
    </div>
    <div class="field"><span class="field-label">${L('nameStar')}</span><input type="text" class="item-name input" placeholder="e.g. Website Development" required></div>
    <div class="field"><span class="field-label">${L('descriptionLbl')}</span><input type="text" class="item-description input" placeholder="Optional detail"></div>
    <div class="grid-3">
      <div class="field"><span class="field-label">${L('qty')}</span><input type="number" class="item-qty input" min="1" value="1" required></div>
      <div class="field"><span class="field-label">${L('unitPrice')}</span><input type="number" class="item-price input" min="0" step="0.01" required></div>
      <div class="field"><span class="field-label">${L('amount')}</span><input type="text" class="item-total input" readonly value="฿0.00" style="background:var(--surface-2);color:var(--accent);font-weight:600;"></div>
    </div>
  </div>`;
}

function selectDocType(value) {
  ['bill', 'invoice', 'tax-invoice'].forEach(v => {
    const el = document.getElementById('dtc-' + v);
    if (el) { el.classList.toggle('is-on', v === value); const r = el.querySelector('input'); if (r) r.checked = (v === value); }
  });
  updateFormFields();
}
function updateFormFields() {
  const type = document.querySelector('input[name="docType"]:checked')?.value || 'bill';
  const taxField = document.getElementById('taxIdField');
  if (taxField) taxField.classList.toggle('hidden', type !== 'tax-invoice');
}
// legacy alias
function dtc() { return ''; }

// ═══════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════
function renderUsersView() {
  const role = sessionStorage.getItem('userRole') || 'sales';
  const isManager = role === 'manager';
  return `
  <div style="max-width:900px;margin:0 auto;width:100%;" class="stack">
    <div class="view-head">
      <div><h1>${L('userMgmt')}</h1><p>${isManager ? 'Manager — can add Sales & Technician only' : 'Full access — all roles'}</p></div>
    </div>

    <div class="card card-pad stack">
      <span class="card-title">Create new user account</span>
      <div class="notice">After creating a user, share their email and password so they can sign in.</div>
      <div class="grid-2">
        <div class="field"><span class="field-label">${L('fullName')} *</span><input type="text" id="au_name" class="input" placeholder="e.g. John Smith"></div>
        <div class="field"><span class="field-label">${L('email')} *</span><input type="email" id="au_email" class="input" placeholder="john@company.com"></div>
      </div>
      <div class="grid-2">
        <div class="field"><span class="field-label">${L('password')} *</span><input type="password" id="au_pass" class="input" placeholder="Min 6 characters"></div>
        <div class="field"><span class="field-label">${L('roleLbl')} *</span>
          <select id="au_role" class="select">
            <option value="sales">Sales</option>
            <option value="technician">Technician</option>
            ${!isManager ? '<option value="manager">Manager</option><option value="admin">Admin</option>' : ''}
          </select>
        </div>
      </div>
      <div><button class="btn btn-primary" onclick="adminCreateUser()">${L('createUser')}</button></div>
      <div id="au_error" class="alert-err hidden"></div>
      <div id="au_success" class="alert-ok hidden"></div>
    </div>

    <div class="card">
      <div class="card-head"><span class="card-title">${L('allUsers')}</span></div>
      <div id="au_table" class="card-pad"><p class="muted" style="font-size:var(--t-meta);">${L('loadingUsers')}</p></div>
    </div>
  </div>`;
}

function adminLoadUsers() {
  const container = document.getElementById('au_table');
  if (!container) return;
  const role = sessionStorage.getItem('userRole');
  const isManager = role === 'manager';
  if (typeof database === 'undefined' || !database) {
    container.innerHTML = `<p class="alert-err">${L('notConnected')}</p>`;
    return;
  }
  container.innerHTML = `<p class="muted" style="font-size:var(--t-meta);">${L('loading')}</p>`;

  let done = false;
  const unsub = auth.onAuthStateChanged(user => {
    if (done) return;
    if (!user) return;
    done = true; unsub(); doLoad();
  });
  if (auth.currentUser) { done = true; doLoad(); }

  function doLoad() {
    database.ref('users').once('value').then(snap => {
      const data = snap.val();
      if (!data) { container.innerHTML = `<p class="muted" style="font-size:var(--t-meta);">${L('noUsers')}</p>`; return; }
      const rolePill = { admin:'pill-rejected', manager:'pill-open', sales:'pill-approved', technician:'pill-draft' };
      const rows = Object.entries(data).map(([uid, u]) => `
        <tr>
          <td class="cell-strong">${esc(u.name) || '—'}</td>
          <td class="muted">${esc(u.email) || '—'}</td>
          <td><span class="pill pill-plain ${rolePill[u.role] || 'pill-neutral'}">${esc(u.role) || '—'}</span></td>
          <td class="muted">${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
          <td>
            <select class="select" style="width:auto;padding:5px 8px;font-size:var(--t-micro);" onchange="adminSaveRole('${uid}','${u.role}',this)">
              <option value="sales" ${u.role === 'sales' ? 'selected' : ''}>Sales</option>
              <option value="technician" ${u.role === 'technician' ? 'selected' : ''}>Technician</option>
              ${!isManager ? `<option value="manager" ${u.role === 'manager' ? 'selected' : ''}>Manager</option><option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>` : ''}
            </select>
          </td>
        </tr>`).join('');
      container.innerHTML = `<div class="table-wrap"><table class="table" style="min-width:620px;">
        <thead><tr><th>Name</th><th>${L('email')}</th><th>Role</th><th>Created</th><th>Change role</th></tr></thead>
        <tbody>${rows}</tbody></table></div>`;
    }).catch(err => {
      container.innerHTML = `<p class="alert-err">Error: ${esc(err.message)}</p>`;
    });
  }
}

function adminSaveRole(uid, currentRole, sel) {
  const newRole = sel.value;
  const isManager = sessionStorage.getItem('userRole') === 'manager';
  if (isManager && (newRole === 'admin' || newRole === 'manager')) {
    alert('Managers cannot assign Admin or Manager roles.');
    sel.value = currentRole; return;
  }
  database.ref('users/' + uid + '/role').set(newRole)
    .then(() => showNotification('Role updated to ' + newRole))
    .catch(err => alert('Error: ' + err.message));
}

async function adminCreateUser() {
  const name  = document.getElementById('au_name').value.trim();
  const email = document.getElementById('au_email').value.trim();
  const pass  = document.getElementById('au_pass').value;
  const role  = document.getElementById('au_role').value;
  const errEl = document.getElementById('au_error');
  const okEl  = document.getElementById('au_success');
  errEl.classList.add('hidden'); okEl.classList.add('hidden');

  if (!name || !email || !pass) { errEl.textContent = 'Please fill all fields.'; errEl.classList.remove('hidden'); return; }
  if (pass.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; errEl.classList.remove('hidden'); return; }

  try {
    let sec;
    try { sec = firebase.app('sec'); } catch (e) { sec = firebase.initializeApp(firebase.app().options, 'sec'); }
    const secAuth = sec.auth();
    let uid;
    try {
      const cred = await secAuth.createUserWithEmailAndPassword(email, pass);
      uid = cred.user.uid;
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        const cred = await secAuth.signInWithEmailAndPassword(email, pass);
        uid = cred.user.uid;
      } else throw e;
    }
    await secAuth.signOut();
    await database.ref('users/' + uid).set({ name, email, role, createdAt: new Date().toISOString() });
    okEl.textContent = 'User "' + name + '" created as ' + role + '.';
    okEl.classList.remove('hidden');
    document.getElementById('au_name').value = '';
    document.getElementById('au_email').value = '';
    document.getElementById('au_pass').value = '';
    adminLoadUsers();
  } catch (err) {
    const msgs = { 'auth/invalid-email':'Invalid email.', 'auth/weak-password':'Password too short.', 'auth/wrong-password':'Email exists but password is wrong.' };
    errEl.textContent = msgs[err.code] || err.message;
    errEl.classList.remove('hidden');
  }
}

// ═══════════════════════════════════════════════════════════════
// PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════
function renderPOView() {
  const role = sessionStorage.getItem('userRole') || 'sales';
  const canEdit = role === 'sales' || role === 'admin' || role === 'manager';

  let list = [...purchaseOrders];
  if (poStatusFilter !== 'all') list = list.filter(p => p.status === poStatusFilter);
  if (poSearchQuery) {
    const s = poSearchQuery.toLowerCase();
    list = list.filter(p => p.id.toLowerCase().includes(s) || (p.customer || '').toLowerCase().includes(s) || p.items.some(i => (i.name || '').toLowerCase().includes(s)));
  }
  const counts = { all: purchaseOrders.length, open: 0, 'in-progress': 0, completed: 0 };
  purchaseOrders.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++; });

  const poChip = (val, label) => `<button class="chip" aria-pressed="${poStatusFilter === val}" onclick="poStatusFilter='${val}';renderApp()">${esc(label)} <span class="n">${counts[val]}</span></button>`;
  const poPill = { 'open':'pill-open', 'in-progress':'pill-progress', 'completed':'pill-completed' };
  const poLbl  = { 'open':L('open'), 'in-progress':L('inProgress'), 'completed':L('completed') };

  const rows = list.map(po => {
    const actions = [];
    if (canEdit && po.status === 'open') actions.push(`<button class="act act-warn" onclick="updatePOStatus('${po.id}','in-progress')">${L('start')}</button>`);
    if (canEdit && po.status === 'in-progress') actions.push(`<button class="act act-pos" onclick="convertPOToInvoice('${po.id}')">${L('convertInvoice')}</button>`);
    actions.push(`<button class="act act-pos" onclick="openPOCostPanel('${po.id}')">${L('costs')}</button>`);
    if (canEdit && po.status !== 'completed') actions.push(`<button class="act act-warn" onclick="openPOForm('${po.id}')">${L('edit')}</button>`);
    if (canEdit && po.status !== 'completed') actions.push(`<button class="act act-danger" onclick="deletePO('${po.id}')">${L('delete')}</button>`);
    return `
    <tr>
      <td><div class="cell-strong" style="color:var(--accent);">${esc(po.id)}</div></td>
      <td class="muted">${esc(po.date)}</td>
      <td class="cell-strong">${esc(po.customer)}</td>
      <td class="muted">${po.items.length} item${po.items.length === 1 ? '' : 's'}</td>
      <td class="num cell-strong tnum">${baht(po.total)}</td>
      <td>${`<span class="pill ${poPill[po.status] || 'pill-neutral'}">${poLbl[po.status] || po.status}</span>`}
        ${po.linkedInvoiceId ? `<div style="margin-top:3px;"><button class="act act-primary" onclick="currentView='bills';renderApp()">→ ${esc(po.linkedInvoiceId)}</button></div>` : ''}</td>
      <td style="white-space:nowrap;">${actions.join('')}</td>
    </tr>`;
  }).join('');

  return `
    <div class="view-head">
      <div><h1>${L('po')}</h1><p>${purchaseOrders.length} ${L('ordersCount')}</p></div>
      ${canEdit ? `<button class="btn btn-primary" onclick="openPOForm()">${icon('plus')}${L('newPO')}</button>` : ''}
    </div>

    <div class="card card-pad stack">
      <div class="search-wrap">
        ${icon('search','')}
        <input class="input input-search" placeholder="Search by PO ID, customer, item…" value="${esc(poSearchQuery)}" oninput="poSearchQuery=this.value;renderApp()">
        ${poSearchQuery ? `<button class="search-clear" onclick="poSearchQuery='';renderApp()">${icon('x','')}</button>` : ''}
      </div>
      <div class="chips">
        ${poChip('all', L('allFilter'))}${poChip('open', L('open'))}${poChip('in-progress', L('inProgress'))}${poChip('completed', L('completed'))}
      </div>
    </div>

    ${list.length === 0
      ? emptyState(purchaseOrders.length === 0 ? L('noOrders') : 'No orders match your filter.', canEdit ? 'Create a purchase order to get started.' : '', 'po')
      : `<div class="card"><div class="table-wrap"><table class="table" style="min-width:760px;">
          <thead><tr>
            <th>${L('poId')}</th><th>${L('date')}</th><th>${L('customer')}</th><th>${L('itemsCol')}</th>
            <th class="num">${L('total')}</th><th>${L('statusCol')}</th><th>${L('actions')}</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table></div></div>`}`;
}

// ═══════════════════════════════════════════════════════════════
// MATERIAL COST PER SUPPLIER
// ═══════════════════════════════════════════════════════════════
function renderMaterialsView() {
  let list = [...materialPrices];
  if (matSearchQuery) {
    const s = matSearchQuery.toLowerCase();
    list = list.filter(m => (m.materialName || '').toLowerCase().includes(s) || (m.supplier || '').toLowerCase().includes(s));
  }
  const grouped = {};
  list.forEach(m => { (grouped[m.materialName] = grouped[m.materialName] || []).push(m); });

  const blocks = Object.entries(grouped).map(([matName, entries]) => {
    const minPrice = Math.min(...entries.map(e => e.pricePerUnit));
    const maxPrice = Math.max(...entries.map(e => e.pricePerUnit));
    const saving = entries.length > 1 ? maxPrice - minPrice : 0;
    const rows = entries.slice().sort((a, b) => a.pricePerUnit - b.pricePerUnit).map(e => {
      const cheap = e.pricePerUnit === minPrice && entries.length > 1;
      return `<tr>
        <td class="cell-strong">${esc(e.supplier)}</td>
        <td class="num tnum" style="${cheap ? 'color:var(--pos);font-weight:700;' : ''}">฿${fmt(e.pricePerUnit)}
          ${cheap ? `<span class="pill pill-plain pill-approved" style="margin-left:6px;">${L('cheapest')}</span>` : ''}</td>
        <td class="muted">${esc(e.date)}</td>
        <td class="cell-accent">${esc(e.poId) || '—'}</td>
        <td><button class="icon-btn" onclick="deleteMaterialPrice('${e.id}')">${icon('trash','')}</button></td>
      </tr>`;
    }).join('');
    return `
    <div class="card">
      <div class="card-head">
        <span style="font-weight:600;">${esc(matName)}</span>
        ${saving > 0 ? `<span class="pill pill-plain pill-approved">฿${fmt(saving)} ${L('saveVs')}</span>` : ''}
      </div>
      <div class="table-wrap"><table class="table" style="min-width:520px;">
        <thead><tr><th>${L('supplierCol')}</th><th class="num">${L('priceUnitCol')}</th><th>${L('dateCol')}</th><th>${L('fromPOCol')}</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div>`;
  }).join('');

  return `
    <div class="view-head">
      <div><h1>${L('materialCostTitle')}</h1><p>${Object.keys(grouped).length} ${L('materialsTracked')}</p></div>
      <button class="btn btn-primary" onclick="openAddMaterialForm()">${icon('plus')}${L('addMaterial')}</button>
    </div>

    <div class="card card-pad">
      <div class="search-wrap">
        ${icon('search','')}
        <input class="input input-search" placeholder="Search by material or supplier…" value="${esc(matSearchQuery)}" oninput="matSearchQuery=this.value;renderApp()">
        ${matSearchQuery ? `<button class="search-clear" onclick="matSearchQuery='';renderApp()">${icon('x','')}</button>` : ''}
      </div>
    </div>

    ${Object.keys(grouped).length === 0
      ? `<div class="card"><div class="empty">
          <span class="empty-ico">${icon('box','')}</span>
          <h3>${L('noMaterialsMsg')}</h3>
          <p>Open a Purchase Order → <b>${L('costs')}</b> → add a <b>${L('material')}</b> cost with a supplier name.</p>
        </div></div>`
      : `<div class="stack">${blocks}</div>`}`;
}

function deleteMaterialPrice(id) {
  if (!confirm('Delete this material price entry?')) return;
  materialPrices = materialPrices.filter(m => m.id !== id);
  syncMaterialPricesToFirebase();
  renderApp();
  showNotification('Deleted');
}

function openAddMaterialForm() {
  const today = new Date().toISOString().slice(0, 10);
  const modal = `
  <div id="matModal" class="scrim" onclick="if(event.target.id==='matModal')closeMatModal()">
    <div class="sheet" style="max-width:460px;">
      <div class="sheet-head">
        <div class="h">${L('addMaterialTitle')}</div>
        <button class="sheet-x" onclick="closeMatModal()">${icon('x','')}</button>
      </div>
      <div class="sheet-body">
        <div class="field"><span class="field-label">${L('materialName')} *</span><input id="matName" class="input" placeholder="e.g. Steel Pipe, Copper Wire"></div>
        <div class="field"><span class="field-label">${L('supplier')} *</span><input id="matSupplier" class="input" placeholder="e.g. Supplier A"></div>
        <div class="grid-2">
          <div class="field"><span class="field-label">${L('pricePerUnit')} *</span><input id="matPrice" type="number" min="0" class="input" placeholder="0.00"></div>
          <div class="field"><span class="field-label">${L('dateCol')}</span><input id="matDate" type="date" class="input" value="${today}"></div>
        </div>
        <div class="field"><span class="field-label">Notes (optional)</span><input id="matNotes" class="input" placeholder="e.g. per piece, per kg, per meter"></div>
      </div>
      <div class="sheet-foot">
        <button class="btn btn-primary btn-block" onclick="saveManualMaterialPrice()">${L('saveDocument2')}</button>
        <button class="btn btn-secondary" onclick="closeMatModal()">${L('cancel')}</button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modal);
}

function saveManualMaterialPrice() {
  const name = document.getElementById('matName')?.value?.trim();
  const supplier = document.getElementById('matSupplier')?.value?.trim();
  const price = parseFloat(document.getElementById('matPrice')?.value) || 0;
  const date = document.getElementById('matDate')?.value;
  const notes = document.getElementById('matNotes')?.value?.trim();
  if (!name) { showNotification('Please enter material name'); return; }
  if (!supplier) { showNotification('Please enter supplier name'); return; }
  if (price <= 0) { showNotification('Please enter a valid price'); return; }
  materialPrices.push({ id:'MAT-' + Date.now(), materialName:name, supplier, pricePerUnit:price, date: date || new Date().toISOString().slice(0, 10), notes, poId:null });
  syncMaterialPricesToFirebase();
  closeMatModal();
  renderApp();
  showNotification('Material price saved');
}
function closeMatModal() { document.getElementById('matModal')?.remove(); }

// ═══════════════════════════════════════════════════════════════
// SHARED PRESENTATION HELPERS
// ═══════════════════════════════════════════════════════════════
// legacy inline-style helpers kept for functions.js modals still using them
function card()  { return 'background:var(--surface);border-radius:var(--r-card);border:1px solid var(--line);padding:16px;'; }
function th()    { return 'padding:10px 14px;text-align:left;font-size:var(--t-micro);font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:0.06em;white-space:nowrap;'; }
function td()    { return 'padding:11px 14px;vertical-align:middle;'; }
function ctitle(){ return 'font-size:var(--t-micro);font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:0.07em;margin:0 0 12px;'; }
function fl()    { return 'display:block;font-size:var(--t-micro);font-weight:600;color:var(--ink-2);margin-bottom:4px;'; }
function fi()    { return 'width:100%;padding:9px 12px;border:1px solid var(--line-2);border-radius:var(--r-control);font-size:var(--t-sm);color:var(--ink);background:var(--surface);outline:none;box-sizing:border-box;font-family:inherit;'; }
function ab(c)   { return `background:none;border:none;color:${c};font-size:var(--t-micro);font-weight:600;cursor:pointer;padding:2px 5px;border-radius:4px;font-family:inherit;`; }
function abColor(c){ return ab(c); }

function emptyBody(title, sub) {
  return `<div class="empty">
    <span class="empty-ico">${icon('bills','')}</span>
    <h3>${esc(title)}</h3>${sub ? `<p>${esc(sub)}</p>` : ''}
  </div>`;
}
function emptyState(title, sub, ico) {
  return `<div class="card"><div class="empty">
    <span class="empty-ico">${icon(ico || 'bills','')}</span>
    <h3>${esc(title)}</h3>${sub ? `<p>${esc(sub)}</p>` : ''}
  </div></div>`;
}

function getStatusPill(status) {
  const label = { draft:L('draft'), pending:L('pending'), approved:L('approved'), rejected:L('rejected') }[status] || status;
  const cls = { draft:'pill-draft', pending:'pill-pending', approved:'pill-approved', rejected:'pill-rejected' }[status] || 'pill-neutral';
  return `<span class="pill ${cls}">${label}</span>`;
}
function getStatusBadge(s) { return getStatusPill(s); }

function getDocTypeBadge(docType) {
  const label = { 'bill':'Bill', 'invoice':'Invoice', 'tax-invoice':'Tax Invoice' }[docType] || 'Bill';
  return `<span class="pill pill-plain pill-neutral">${label}</span>`;
}
function getRoleLabel(role) {
  return { admin:'Admin', manager:'Manager', sales:'Sales', technician:'Technician' }[role] || 'Sales';
}

function getActionButtons(q) {
  const role = sessionStorage.getItem('userRole') || 'sales';
  const b = [];
  const mk = (label, onclick, cls) => `<button class="act ${cls || ''}" onclick="${onclick}">${label}</button>`;

  b.push(mk(L('pdf'), `generatePDF('${q.id}')`, ''));
  b.push(mk(L('view'), `viewQuotation('${q.id}')`, 'act-primary'));

  if (role === 'sales') {
    if (q.status === 'draft') {
      b.push(mk(L('edit'), `editQuotation('${q.id}')`, 'act-warn'));
      b.push(mk(L('del'), `deleteQuotation('${q.id}')`, 'act-danger'));
      b.push(mk(L('submit'), `submitForApproval('${q.id}')`, 'act-primary act-strong'));
    } else if (q.status === 'pending' || q.status === 'rejected') {
      b.push(mk(L('edit'), `editQuotation('${q.id}')`, 'act-warn'));
      b.push(mk(L('del'), `deleteQuotation('${q.id}')`, 'act-danger'));
    }
  }
  if (role === 'technician' && q.status === 'pending') {
    b.push(mk(L('approve'), `approveQuotation('${q.id}')`, 'act-pos act-strong'));
    b.push(mk(L('reject'), `rejectQuotation('${q.id}')`, 'act-danger act-strong'));
  }
  if (role === 'manager' || role === 'admin') {
    if (q.status === 'draft' || q.status === 'rejected') {
      b.push(mk(L('edit'), `editQuotation('${q.id}')`, 'act-warn'));
      b.push(mk(L('submit'), `submitForApproval('${q.id}')`, 'act-primary act-strong'));
      b.push(mk(L('del'), `deleteQuotation('${q.id}')`, 'act-danger'));
    }
    if (q.status === 'pending') {
      b.push(mk(L('edit'), `editQuotation('${q.id}')`, 'act-warn'));
      b.push(mk(L('approve'), `approveQuotation('${q.id}')`, 'act-pos act-strong'));
      b.push(mk(L('reject'), `rejectQuotation('${q.id}')`, 'act-danger act-strong'));
      b.push(mk(L('del'), `deleteQuotation('${q.id}')`, 'act-danger'));
    }
    if (q.status === 'approved') b.push(mk(L('del'), `deleteQuotation('${q.id}')`, 'act-danger'));
  }
  return b.join('');
}

// legacy stubs referenced elsewhere
function renderGroupedView() { return renderBillsGrouped(quotations); }
function renderListView()    { return renderBillsList(quotations); }
function renderStatCard(t, v){ return stat(t, v, 'var(--brand)'); }
function renderProductsView(){ return emptyState('Products', 'Product catalog.', 'box'); }
function renderThemeSwitcher(){ return ''; }
function sc(label, value)  { return stat(label, value, 'var(--brand)'); }
function tRow(label, value, color) { return kv(label, value, color); }
