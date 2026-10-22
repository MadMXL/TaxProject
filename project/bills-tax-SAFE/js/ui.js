// ═══════════════════════════════════════════════════════════════
// Baigamgab · SmartLedger — UI layer
// Instrument register. All visual primitives live in css/styles.css;
// this file assembles them. Business logic stays in functions.js.
// ═══════════════════════════════════════════════════════════════

// ── NUMBER FORMATTERS ─────────────────────────────────────────
function fmt(n)    { return (n == null || isNaN(n)) ? '0.00' : Number(n).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
function fmtNum(n) { return fmt(n); }
// Today as YYYY-MM-DD in the user's local time (toISOString is UTC, so it would
// give yesterday's date in Thailand before 07:00).
function localDateISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
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
    addCustomer:'Add Customer', editCustomer:'Edit Customer', addUser:'Add User',
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
    itemN:'Item #', updateDocument:'Update Document', editDocument:'Edit Document',
    customerPh:'Type a name or pick an existing customer', existingCustomer:'Existing customer — details filled in',
    saveAsCustomer:'Save as new customer', itemPh:'Type a name or pick a previous one',
    optionalDetail:'Optional detail', addressPh:'Street, City, Postal Code', notesPh:'Payment terms, additional info…',
    undo:'Undo', restored:'Restored',
    archiveFailed:'Could not move the record to the archive, so it was kept. Check that the database rules are deployed.',
    restoreClash:'A live record with this ID already exists', nothingToArchive:'No closed records are older than the cut-off',
    archiveTitle:'Archive old records?', archiveBtn:'Archive',
    archiveMsg:'{n} closed records dated before {date} will be moved to the archive. They are not deleted and can be restored any time from Admin → Archive.',
    archivedMsg:'{n} records archived',
    docCreated:'Document created', docUpdated:'Document updated', docDeleted:'Document deleted',
    customerDeleted:'Customer deleted', productDeleted:'Product deleted', poDeleted:'Purchase order deleted',
    costDeleted:'Cost entry deleted', entryDeleted:'Price entry deleted',
    discardTitle:'Discard this document?', discardMsg:'You have unsaved changes. They will be lost if you leave this page.',
    discard:'Discard', keepEditing:'Keep editing',
    fixItems:'Check the items: each needs a name, a quantity of 1 or more, and a price',
    products:'Products & Services', addProduct:'Add Product', editProductTitle:'Edit Product', unit:'Unit',
    noProducts:'No products yet', productsHint:'Saved products appear as suggestions when you create a document.',
    productAdded:'Product added', productUpdated:'Product updated', unitPh:'e.g. item, hour, project',
    dateFrom:'From date', dateTo:'To date', allTypes:'All types', clearFilters:'Clear filters',
    tryFilter2:'Nothing matches all of these filters. Try removing one.',
    showMore:'Show more',
    search:'Search', palettePh:'Search documents, customers, products, actions…', noResults:'No results',
    actionsGrp:'Actions', goTo:'Go to', toggleTheme:'Toggle light / dark mode', switchLang:'เปลี่ยนเป็นภาษาไทย (Thai)',
    paletteHint:'navigate · open · close',
    docsCount:'Documents', totalBilled:'Total billed', newDocForCustomer:'New document for this customer',
    noDocsYet:'No documents yet',
    submitTitle:'Submit for approval?', approveTitle:'Approve this document?', rejectTitle:'Reject this document',
    rejectReason:'Reason for rejection', redoTitle:'Send back to Sales for revision?', sendBack:'Send back',
    resubmitTitle:'Mark as fixed and resubmit for approval?', resubmit:'Resubmit',
    convertTitle:'Convert to invoice?', convertMsg:'This creates a new invoice and marks the purchase order as completed.',
    submittedMsg:'Submitted for approval', approvedMsg:'Document approved', rejectedMsg:'Document rejected',
    sentBackMsg:'Sent back to Sales for revision', resubmittedMsg:'Resubmitted for approval',
    invoiceCreated:'Invoice created', notFound:'Document not found',
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
    addCustomer:'เพิ่มลูกค้า', editCustomer:'แก้ไขลูกค้า', addUser:'เพิ่มผู้ใช้',
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
    itemN:'รายการที่ ', updateDocument:'บันทึกการแก้ไข', editDocument:'แก้ไขเอกสาร',
    customerPh:'พิมพ์ชื่อ หรือเลือกลูกค้าเดิม', existingCustomer:'ลูกค้าเดิม — กรอกข้อมูลให้แล้ว',
    saveAsCustomer:'บันทึกเป็นลูกค้าใหม่', itemPh:'พิมพ์ชื่อ หรือเลือกจากรายการเดิม',
    optionalDetail:'รายละเอียดเพิ่มเติม (ไม่บังคับ)', addressPh:'บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์', notesPh:'เงื่อนไขการชำระเงิน ข้อมูลเพิ่มเติม…',
    undo:'เลิกทำ', restored:'กู้คืนแล้ว',
    archiveFailed:'ย้ายรายการเข้าคลังไม่สำเร็จ ระบบจึงเก็บรายการไว้ตามเดิม กรุณาตรวจสอบว่าได้ deploy กฎฐานข้อมูลแล้ว',
    restoreClash:'มีรายการที่ใช้รหัสนี้อยู่แล้ว', nothingToArchive:'ไม่มีรายการที่ปิดแล้วซึ่งเก่ากว่าที่กำหนด',
    archiveTitle:'เก็บข้อมูลเก่าเข้าคลัง?', archiveBtn:'เก็บเข้าคลัง',
    archiveMsg:'รายการที่ปิดแล้ว {n} รายการ ซึ่งลงวันที่ก่อน {date} จะถูกย้ายเข้าคลัง ข้อมูลไม่ถูกลบ และกู้คืนได้ทุกเมื่อที่ ผู้ดูแลระบบ → คลังข้อมูลเก่า',
    archivedMsg:'เก็บเข้าคลังแล้ว {n} รายการ',
    docCreated:'สร้างเอกสารแล้ว', docUpdated:'บันทึกการแก้ไขแล้ว', docDeleted:'ลบเอกสารแล้ว',
    customerDeleted:'ลบลูกค้าแล้ว', productDeleted:'ลบสินค้าแล้ว', poDeleted:'ลบใบสั่งซื้อแล้ว',
    costDeleted:'ลบรายการค่าใช้จ่ายแล้ว', entryDeleted:'ลบรายการราคาแล้ว',
    discardTitle:'ทิ้งเอกสารนี้?', discardMsg:'มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก หากออกจากหน้านี้ข้อมูลจะหายไป',
    discard:'ทิ้งการเปลี่ยนแปลง', keepEditing:'แก้ไขต่อ',
    fixItems:'ตรวจสอบรายการ: ต้องมีชื่อ จำนวนอย่างน้อย 1 และราคา',
    products:'สินค้าและบริการ', addProduct:'เพิ่มสินค้า', editProductTitle:'แก้ไขสินค้า', unit:'หน่วย',
    noProducts:'ยังไม่มีสินค้า', productsHint:'สินค้าที่บันทึกไว้จะแสดงเป็นตัวเลือกเมื่อสร้างเอกสาร',
    productAdded:'เพิ่มสินค้าแล้ว', productUpdated:'บันทึกสินค้าแล้ว', unitPh:'เช่น ชิ้น ชั่วโมง งาน',
    dateFrom:'ตั้งแต่วันที่', dateTo:'ถึงวันที่', allTypes:'ทุกประเภท', clearFilters:'ล้างตัวกรอง',
    tryFilter2:'ไม่มีรายการที่ตรงกับตัวกรองทั้งหมด ลองเอาตัวกรองออกบางตัว',
    showMore:'แสดงเพิ่ม',
    search:'ค้นหา', palettePh:'ค้นหาเอกสาร ลูกค้า สินค้า หรือคำสั่ง…', noResults:'ไม่พบผลลัพธ์',
    actionsGrp:'คำสั่ง', goTo:'ไปที่', toggleTheme:'สลับโหมดสว่าง / มืด', switchLang:'Switch to English',
    paletteHint:'เลื่อน · เปิด · ปิด',
    docsCount:'เอกสาร', totalBilled:'ยอดรวมที่ออกบิล', newDocForCustomer:'สร้างเอกสารให้ลูกค้ารายนี้',
    noDocsYet:'ยังไม่มีเอกสาร',
    submitTitle:'ส่งเอกสารเพื่อขออนุมัติ?', approveTitle:'อนุมัติเอกสารนี้?', rejectTitle:'ไม่อนุมัติเอกสารนี้',
    rejectReason:'เหตุผลที่ไม่อนุมัติ', redoTitle:'ส่งกลับให้ฝ่ายขายแก้ไข?', sendBack:'ส่งกลับ',
    resubmitTitle:'แก้ไขแล้ว ส่งขออนุมัติอีกครั้ง?', resubmit:'ส่งอีกครั้ง',
    convertTitle:'แปลงเป็นใบแจ้งหนี้?', convertMsg:'ระบบจะสร้างใบแจ้งหนี้ใหม่ และปิดใบสั่งซื้อนี้เป็นเสร็จสิ้น',
    submittedMsg:'ส่งขออนุมัติแล้ว', approvedMsg:'อนุมัติเอกสารแล้ว', rejectedMsg:'ไม่อนุมัติเอกสาร',
    sentBackMsg:'ส่งกลับให้ฝ่ายขายแก้ไขแล้ว', resubmittedMsg:'ส่งขออนุมัติอีกครั้งแล้ว',
    invoiceCreated:'สร้างใบแจ้งหนี้แล้ว', notFound:'ไม่พบเอกสาร',
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
  // Snapshot the document form (if open) so re-rendering never loses typed input.
  const docSnap = currentView === 'new' ? captureDocForm() : null;
  const role  = sessionStorage.getItem('userRole') || 'sales';
  const email = sessionStorage.getItem('userEmail') || '';
  const name  = sessionStorage.getItem('userName') || email;
  const rejectedCount = quotations.filter(q => q.status === 'rejected').length;
  const showRejBadge  = (role === 'sales' || role === 'admin' || role === 'manager') && rejectedCount > 0 ? rejectedCount : 0;

  const pendingCount = quotations.filter(q => q.status === 'pending').length;

  const canDocs = role === 'sales' || role === 'admin' || role === 'manager';
  const canOps  = canDocs || role === 'technician';
  const canUsers = role === 'admin' || role === 'manager';
  const isAdmin = role === 'admin';
  const th = getLang() === 'th';

  // Dashboard is Admin-only — send everyone else to Documents
  if (currentView === 'dashboard' && !isAdmin) currentView = 'bills';

  // Documents badge: approvers see items awaiting them, creators see rejections
  const docBadge = (role === 'technician' || role === 'manager' || role === 'admin')
    ? pendingCount : showRejBadge;

  const sideBrand = `
    <div class="side-logo">
      <span class="brand-mark">${icon('receipt','')}</span>
      <span><span class="brand-name">Baigamgab</span> <span class="brand-sub">SmartLedger</span></span>
    </div>`;

  app.innerHTML = `
    <div class="page">
      <aside class="sidebar">
        ${sideBrand}
        <div class="nav-group">${th ? 'หลัก' : 'Main'}</div>
        ${isAdmin ? navItem('dashboard', 'dashboard', L('dashboard')) : ''}
        ${navItem('bills', 'bills', L('bills'), docBadge)}
        ${canOps  ? navItem('po', 'po', L('po')) : ''}
        ${canOps  ? navItem('materials', 'box', L('materials')) : ''}
        ${canDocs ? navItem('customers', 'users', L('customers')) : ''}
        ${isAdmin ? `
          <div class="nav-group">${th ? 'ผู้ดูแลระบบ' : 'Admin'}</div>
          ${navItem('users', 'shield', th ? 'ทีมงานและสิทธิ์' : 'Team & Roles', 0, 'team')}
          ${navItem('users', 'building', th ? 'ข้อมูลบริษัท' : 'Company', 0, 'company')}
          ${navItem('users', 'receipt', th ? 'บันทึกการใช้งาน' : 'Audit Log', 0, 'audit')}
          ${navItem('users', 'box', th ? 'คลังข้อมูลเก่า' : 'Archive', 0, 'archive')}
        ` : (canUsers ? `
          <div class="nav-group">${th ? 'ผู้ดูแลระบบ' : 'Admin'}</div>
          ${navItem('users', 'shield', L('manageUsers'))}
        ` : '')}
        <div class="side-spacer"></div>
      </aside>

      <div class="main-col">
        <header class="topbar">
          <div class="shell topbar-inner">
            <div class="brand">
              <span class="brand-mark">${icon('receipt','')}</span>
              <span><span class="brand-name">Baigamgab</span> <span class="brand-sub">SmartLedger</span></span>
            </div>
            <div class="topbar-actions">
              <button class="ghost-btn" onclick="openPalette()" aria-label="${L('search')}" title="${L('search')} (${isMac() ? '⌘' : 'Ctrl'} K)">
                ${icon('search')}<span class="uname">${L('search')}</span><kbd class="kbd-hint">${isMac() ? '⌘' : 'Ctrl'} K</kbd>
              </button>
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

        <main class="shell">
          <div class="view">${renderContent()}</div>
        </main>
      </div>

      <nav class="tabbar">
        ${isAdmin ? bottomTab('dashboard','dashboard',L('dashboard')) : ''}
        ${bottomTab('bills','bills',L('bills'))}
        ${canDocs ? bottomTab('customers','users',L('customers')) : bottomTab('po','po',L('po'))}
        ${canDocs ? bottomTab('new','plus',L('newDoc')) : bottomTab('materials','box',L('materials'))}
        ${canUsers && !isAdmin ? bottomTab('users','shield',L('manageUsers')) : ''}
      </nav>
    </div>`;
  if (docSnap) fillDocForm(docSnap);
}

function tab(view, label, badge) {
  const cur = currentView === view;
  const b = badge > 0 ? `<span class="tab-badge">${badge}</span>` : '';
  return `<button class="tab" ${cur ? 'aria-current="page"' : ''} onclick="switchView('${view}')">${esc(label)}${b}</button>`;
}

function navItem(view, ico, label, badge, adminSub) {
  const cur = adminSub
    ? (currentView === 'users' && (adminTab || 'team') === adminSub)
    : (view === 'users' ? currentView === 'users' : currentView === view);
  const b = badge > 0 ? `<span class="tab-badge">${badge}</span>` : '';
  const onclick = adminSub ? `switchAdminTab('${adminSub}')` : `switchView('${view}')`;
  return `<button class="nav-item" ${cur ? 'aria-current="page"' : ''} onclick="${onclick}">${icon(ico)}<span>${esc(label)}</span>${b}</button>`;
}

async function switchAdminTab(t) {
  if (!(await confirmLeaveDocForm())) return;
  if (currentView === 'new') resetDocFormState();
  adminTab = t; currentView = 'users'; renderApp();
}
function bottomTab(view, ico, label) {
  const cur = currentView === view;
  return `<a href="#" ${cur ? 'aria-current="page"' : ''} onclick="event.preventDefault();switchView('${view}')">${icon(ico)}<span>${esc(label)}</span></a>`;
}

function renderContent() {
  const role = sessionStorage.getItem('userRole') || 'sales';
  const html = (() => {
    switch (currentView) {
      case 'dashboard': return role === 'admin' ? renderDashboard() : renderBillsView();
      case 'bills':     return renderBillsView();
      case 'customers': return renderCustomersView();
      case 'new':       return renderNewQuotation();
      case 'users':     return renderUsersView();
      case 'po':        return renderPOView();
      case 'materials': return renderMaterialsView();
      default:          return renderBillsView();
    }
  })();
  if (currentView === 'users' && (adminTab || 'team') === 'team') setTimeout(() => adminLoadUsers(), 60);
  return html;
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function renderDashboard() {
  const th = getLang() === 'th';
  const total = quotations.reduce((s, q) => s + (q.total || 0), 0);
  const vat   = quotations.reduce((s, q) => s + (q.tax || 0), 0);
  const c = {
    draft:    quotations.filter(q => q.status === 'draft').length,
    pending:  quotations.filter(q => q.status === 'pending').length,
    approved: quotations.filter(q => q.status === 'approved').length,
    rejected: quotations.filter(q => q.status === 'rejected').length,
  };
  const totalDocs = quotations.length;
  const submitted = c.pending + c.approved + c.rejected;
  const decided   = c.approved + c.rejected;
  const approvalRate = decided ? Math.round(c.approved / decided * 100) : 0;

  const monthly = {};
  quotations.forEach(q => { const m = (q.date || '').substring(0, 7); if (m) monthly[m] = (monthly[m] || 0) + (q.total || 0); });
  const months = Object.keys(monthly).sort().slice(-6).map(m => ({ label: monthLabel(m, th), value: monthly[m] }));

  return `
    <div class="view-head">
      <div><h1>${L('overview')}</h1><p>${L('activitySummary')}</p></div>
    </div>

    <div class="kpi-grid">
      ${kpi(L('totalRevenue'), baht(total), 'var(--brand)', (th ? 'จาก ' : 'across ') + totalDocs + (th ? ' เอกสาร' : ' documents'))}
      ${kpi(L('pendingCount'), c.pending, 'var(--st-pending)', th ? 'รอตรวจสอบ' : 'awaiting review', c.pending ? 'up' : 'flat')}
      ${kpi(L('approvedCount'), c.approved, 'var(--st-approved)', (th ? 'อัตราอนุมัติ ' : 'approval rate ') + approvalRate + '%')}
      ${kpi(L('vatCollected'), baht(vat), 'var(--accent)', th ? 'ภาษีขาย 7%' : 'output VAT 7%')}
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-head"><span class="card-title">${L('monthlyRevenue')}</span><span class="cell-sub">${th ? 'พันบาท' : 'THB ×1,000'}</span></div>
        <div class="card-pad">${months.length ? barChartSVG(months) : `<p class="muted" style="font-size:var(--t-meta);">${th ? 'ยังไม่มีข้อมูลรายได้' : 'No revenue recorded yet.'}</p>`}</div>
      </div>
      <div class="card">
        <div class="card-head"><span class="card-title">${th ? 'สถานะเอกสาร' : 'Document status'}</span><span class="cell-sub">${totalDocs}</span></div>
        <div class="card-pad">${donutChartSVG([
          { label: L('approved'), value: c.approved, color: 'var(--st-approved)' },
          { label: L('pending'),  value: c.pending,  color: 'var(--st-pending)' },
          { label: L('draft'),    value: c.draft,    color: 'var(--st-draft)' },
          { label: L('rejected'), value: c.rejected, color: 'var(--st-rejected)' },
        ], totalDocs, th ? 'เอกสาร' : 'docs')}</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-head">
          <span class="card-title">${L('recentDocs')}</span>
          <button class="act act-primary" onclick="switchView('bills')">${L('viewAll')} ${icon('arrowR','')}</button>
        </div>
        <div class="table-wrap">
          <table class="table" style="min-width:520px;">
            <thead><tr><th>${th ? 'เลขที่' : 'Document'}</th><th>${L('customer2')}</th><th class="num">${L('total')}</th><th>${L('statusCol')}</th></tr></thead>
            <tbody>${quotations.slice(0, 6).map(q => `
              <tr onclick="viewQuotation('${q.id}')" style="cursor:pointer;">
                <td style="white-space:nowrap;"><div class="cell-strong">${esc(q.id)}</div><div class="cell-sub">${esc(q.date)}</div></td>
                <td class="muted">${esc(q.customer)}</td>
                <td class="num cell-strong tnum">${baht(q.total)}</td>
                <td>${getStatusPill(q.status)}</td>
              </tr>`).join('') || `<tr><td colspan="4">${emptyBody(L('noDocuments'), '')}</td></tr>`}</tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><span class="card-title">${th ? 'ช่องทางการอนุมัติ' : 'Approval funnel'}</span></div>
        <div class="card-pad">
          <div class="funnel">
            ${funnelRow(th ? 'สร้างเอกสาร' : 'Created', totalDocs, totalDocs)}
            ${funnelRow(th ? 'ส่งตรวจสอบ' : 'Submitted', submitted, totalDocs)}
            ${funnelRow(th ? 'อนุมัติแล้ว' : 'Approved', c.approved, totalDocs, 'var(--st-approved)')}
          </div>
          <p class="muted" style="font-size:var(--t-micro);margin-top:12px;">
            ${th ? `ปฏิเสธ ${c.rejected} · ร่าง ${c.draft}` : `${c.rejected} rejected · ${c.draft} draft`}
          </p>
        </div>
      </div>
    </div>`;
}

function kpi(label, value, accent, sub, dir) {
  return `<div class="kpi" style="--kpi-accent:${accent};">
    <div class="kpi-l">${esc(label)}</div>
    <div class="kpi-v tnum">${value}</div>
    ${sub ? `<div class="kpi-d ${dir || 'flat'}">${esc(sub)}</div>` : ''}
  </div>`;
}

function monthLabel(ym, th) {
  const m = Number(ym.split('-')[1]);
  const en = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const tha = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return (th ? tha : en)[m - 1] || ym;
}

function niceCeil(v) {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / mag;
  const step = n <= 1 ? 1 : n <= 1.5 ? 1.5 : n <= 2 ? 2 : n <= 2.5 ? 2.5
             : n <= 3 ? 3 : n <= 4 ? 4 : n <= 5 ? 5 : n <= 7.5 ? 7.5 : 10;
  return step * mag;
}

function barChartSVG(data) {
  const W = 520, H = 240, padL = 46, padR = 12, padT = 16, padB = 30;
  const x0 = padL, x1 = W - padR, y0 = padT, y1 = H - padB;
  const top = niceCeil(Math.max(...data.map(d => d.value), 1));
  const y = v => y1 - (v / top) * (y1 - y0);
  const slot = (x1 - x0) / data.length;
  const bw = Math.min(46, slot * 0.58);
  const fmtK = v => (v >= 1000 ? fmtInt(v / 1000) + 'k' : fmtInt(v));
  const grid = [0, top / 2, top].map(t => `
    <line x1="${x0}" y1="${y(t).toFixed(1)}" x2="${x1}" y2="${y(t).toFixed(1)}" stroke="var(--line-2)" stroke-width="1"/>
    <text x="${x0 - 6}" y="${(y(t) + 3.5).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--ink-3)">${fmtK(t)}</text>`).join('');
  const bars = data.map((d, i) => {
    const cx = x0 + i * slot + slot / 2;
    const h = Math.max(y1 - y(d.value), 0);
    const last = i === data.length - 1;
    return `
      <rect x="${(cx - bw / 2).toFixed(1)}" y="${y(d.value).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="var(--accent)" fill-opacity="${last ? '1' : '0.32'}"/>
      <text x="${cx.toFixed(1)}" y="${(y(d.value) - 6).toFixed(1)}" text-anchor="middle" font-size="10" fill="${last ? 'var(--ink)' : 'var(--ink-3)'}" font-weight="${last ? '700' : '400'}">${fmtInt(d.value / 1000)}</text>
      <text x="${cx.toFixed(1)}" y="${H - 10}" text-anchor="middle" font-size="10" fill="${last ? 'var(--ink)' : 'var(--ink-3)'}" font-weight="${last ? '700' : '400'}">${esc(d.label)}</text>`;
  }).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${getLang() === 'th' ? 'กราฟรายได้รายเดือน' : 'Monthly revenue bar chart'}">
    ${grid}
    <line x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}" stroke="var(--line-3)" stroke-width="1"/>
    ${bars}
  </svg>`;
}

function donutChartSVG(segments, total, centerLabel) {
  const r = 52, sw = 20, cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  const sum = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const arcs = segments.filter(s => s.value > 0).map(s => {
    const len = s.value / sum * circ;
    const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${sw}" stroke-dasharray="${len.toFixed(2)} ${(circ - len).toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}"/>`;
    acc += len;
    return seg;
  }).join('');
  const legend = segments.map(s => `
    <div class="li"><span class="dot" style="background:${s.color};"></span>${esc(s.label)}
      <b class="tnum">${s.value}</b><span class="pct">${Math.round(s.value / sum * 100)}%</span></div>`).join('');
  return `<div class="donut-wrap">
    <svg class="donut-svg" viewBox="0 0 160 160" role="img" aria-label="${getLang() === 'th' ? 'สัดส่วนสถานะเอกสาร' : 'Document status breakdown'}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="${sw}"/>
      <g transform="rotate(-90 ${cx} ${cy})">${arcs}</g>
      <text x="${cx}" y="${cy - 1}" text-anchor="middle" font-size="22" font-weight="700" fill="var(--ink)">${total}</text>
      <text x="${cx}" y="${cy + 15}" text-anchor="middle" font-size="10" fill="var(--ink-3)">${esc(centerLabel)}</text>
    </svg>
    <div class="donut-legend">${legend}</div>
  </div>`;
}

function funnelRow(label, value, base, color) {
  const pct = base ? (value / base * 100) : 0;
  return `<div>
    <div class="fn-top"><span>${esc(label)}</span><b>${value}</b></div>
    <div class="fn-bar" style="width:${Math.max(pct, 6).toFixed(1)}%;${color ? `background:${color};` : ''}">${Math.round(pct)}%</div>
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
// Every filter narrows the same list (AND): status chip, customer, date range,
// document type and the search box can all be used together.
// withStatus/withText=false skip the status chip / search box, so the chips and
// header can show counts that don't go stale while the user types.
function billsFiltered(withStatus = true, withText = true) {
  const f = listFilters.bills;
  const s = withText ? searchQuery.trim().toLowerCase() : '';
  return quotations.filter(d =>
    (!withStatus || statusFilter === 'all' || d.status === statusFilter) &&
    (!f.name || d.customer === f.name) &&
    (!f.docType || d.docType === f.docType) &&
    inDateRange(d.date, f) &&
    (!s ||
      d.id.toLowerCase().includes(s) ||
      (d.customer || '').toLowerCase().includes(s) ||
      (d.customerEmail || '').toLowerCase().includes(s) ||
      (d.taxId && d.taxId.toLowerCase().includes(s)) ||
      d.items.some(i => (i.name || '').toLowerCase().includes(s))));
}

// Only the first `billsLimit` rows are drawn; "Show more" adds another page.
// Filtering 20,000 documents takes a few ms, but drawing them all takes seconds,
// so paging keeps the screen fast however large the data grows.
const PAGE_SIZE = 100;
let billsLimit = PAGE_SIZE;

function billsResultsHTML() {
  const list = billsFiltered();
  const shown = Math.min(list.length, billsLimit);
  const more = list.length > shown
    ? `<div style="text-align:center;margin-top:12px;"><button class="btn btn-secondary" onclick="showMoreBills()">${L('showMore')} <span class="muted">(${shown} / ${list.length})</span></button></div>`
    : '';
  return resultCount('bills', list.length) + (billViewMode === 'list' ? renderBillsList(list.slice(0, shown)) : renderBillsGrouped(list, shown)) + more;
}
function showMoreBills() {
  billsLimit += PAGE_SIZE;
  const host = document.getElementById('searchResults');
  if (host) host.innerHTML = billsResultsHTML(); else renderApp();
}

// CSV of exactly what the filters show. Quoted fields + BOM so Excel opens Thai text correctly.
function exportFilteredCSV() {
  const list = billsFiltered();
  if (!list.length) { showNotification('⚠️ ' + L('noDocuments')); return; }
  const cell = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const head = ['ID', 'Date', 'Type', 'Customer', 'Tax ID', 'Items', 'Subtotal', 'VAT', 'Total', 'Status'];
  const rows = list.map(q => [q.id, q.date, getDocTypeLabel(q.docType), q.customer, q.taxId,
    q.items.map(i => `${i.name} (${i.qty} x ${i.price})`).join('; '), q.subtotal, q.tax, q.total, q.status].map(cell).join(','));
  const blob = new Blob(['\ufeff' + [head.join(','), ...rows].join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `documents_${localDateISO()}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  showNotification('✅ CSV exported', { detail: `${list.length} ${list.length === 1 ? 'document' : 'documents'}` });
}

function renderBillsView() {
  const scoped = billsFiltered(true, false);
  const facet = billsFiltered(false, false);
  const c = {
    all: facet.length,
    draft: facet.filter(q => q.status === 'draft').length,
    pending: facet.filter(q => q.status === 'pending').length,
    approved: facet.filter(q => q.status === 'approved').length,
    rejected: facet.filter(q => q.status === 'rejected').length,
  };

  const role = sessionStorage.getItem('userRole') || 'sales';
  const canCreate = role === 'sales' || role === 'admin' || role === 'manager';
  const th = getLang() === 'th';

  return `
    <div class="view-head">
      <div><h1>${L('bills')}</h1><p>${scoped.length} ${th ? 'เอกสาร' : (scoped.length === 1 ? 'document' : 'documents')}</p></div>
      ${canCreate ? `<button class="btn btn-primary" onclick="switchView('new')">${icon('plus')}${L('newDoc')}</button>` : ''}
    </div>

    <div class="card card-pad stack">
      <div class="spread" style="flex-wrap:wrap;">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <div class="seg">
            ${seg('list', L('listView'))}${seg('date', L('byDate'))}${seg('customer', L('byCustomer'))}
          </div>
          <button class="btn btn-secondary btn-sm" onclick="exportFilteredCSV()" title="${th ? 'ส่งออกรายการที่กรองเป็น CSV' : 'Export the filtered list as CSV'}">${icon('download', '')}CSV</button>
        </div>
        <div class="chips">
          ${chip('all', L('allFilter'), c.all)}${chip('draft', L('draft'), c.draft)}${chip('pending', L('pending'), c.pending)}${chip('approved', L('approved'), c.approved)}${chip('rejected', L('rejected'), c.rejected)}
        </div>
      </div>
      ${searchBox('bills', th ? 'ค้นหาด้วยเลขที่ ลูกค้า หรือรายการ…' : 'Search by ID, customer, item…')}
      ${filterBar('bills', L('customer2'), quotations.map(q => q.customer), `
        <label class="field"><span class="field-label">${L('docType')}</span>
          <select class="select" onchange="setListFilter('bills','docType',this.value)">
            <option value="">${L('allTypes')}</option>
            ${['bill', 'invoice', 'tax-invoice'].map(v => `<option value="${v}" ${listFilters.bills.docType === v ? 'selected' : ''}>${esc(getDocTypeLabel(v))}</option>`).join('')}
          </select>
        </label>`)}
    </div>

    <div id="searchResults">${billsResultsHTML()}</div>`;
}

// ── COMBINED FILTERS ──────────────────────────────────────────
// Name + date range (+ any extra selects) shared by Documents, POs and Materials.
// Changing a filter re-renders the view; the search box keeps its own state.
function inDateRange(date, f) {
  let { from, to } = f;
  if (from && to && from > to) [from, to] = [to, from];  // forgive a reversed range
  return (!from || (date || '') >= from) && (!to || (date || '') <= to);  // ISO dates compare as strings
}
function filtersActive(key) {
  return Object.values(listFilters[key]).some(Boolean);
}
function setListFilter(key, field, value) {
  listFilters[key][field] = value;
  billsLimit = PAGE_SIZE;
  renderApp();
}
function clearListFilters(key) {
  Object.keys(listFilters[key]).forEach(k => { listFilters[key][k] = ''; });
  billsLimit = PAGE_SIZE;
  renderApp();
}
function filterBar(key, nameLabel, names, extra = '') {
  const f = listFilters[key];
  const opts = [...new Set(names.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'th'));
  return `
    <div class="filters">
      <label class="field"><span class="field-label">${esc(nameLabel)}</span>
        <select class="select" onchange="setListFilter('${key}','name',this.value)">
          <option value="">${L('allFilter')}</option>
          ${opts.map(n => `<option value="${esc(n)}" ${f.name === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}
        </select>
      </label>
      <label class="field"><span class="field-label">${L('dateFrom')}</span>
        <input type="date" class="input" value="${esc(f.from)}" onchange="setListFilter('${key}','from',this.value)">
      </label>
      <label class="field"><span class="field-label">${L('dateTo')}</span>
        <input type="date" class="input" value="${esc(f.to)}" onchange="setListFilter('${key}','to',this.value)">
      </label>
      ${extra}
      ${filtersActive(key) ? `<button class="btn btn-secondary btn-sm filters-clear" onclick="clearListFilters('${key}')">${icon('x', '')}${L('clearFilters')}</button>` : ''}
    </div>`;
}
// "3 results · Customer + date range" — shown whenever search text or a filter narrows the list.
function resultCount(key, n) {
  const th = getLang() === 'th';
  const s = getSearch(key).trim();
  const f = listFilters[key];
  const parts = [];
  if (s) parts.push(`“${esc(s)}”`);
  if (f.name) parts.push(esc(f.name));
  if (f.from || f.to) parts.push(`${esc(f.from || '…')} → ${esc(f.to || '…')}`);
  if (f.docType) parts.push(esc(getDocTypeLabel(f.docType)));
  if (!parts.length) return '';
  return `<div style="font-size:var(--t-micro);color:var(--ink-3);margin-bottom:8px;">${n} ${th ? 'ผลลัพธ์' : (n === 1 ? 'result' : 'results')} · ${parts.join(' + ')}</div>`;
}

function seg(mode, label) {
  return `<button aria-pressed="${billViewMode === mode}" onclick="billViewMode='${mode}';renderApp()">${esc(label)}</button>`;
}
function chip(val, label, n) {
  return `<button class="chip" aria-pressed="${statusFilter === val}" onclick="statusFilter='${val}';billsLimit=PAGE_SIZE;renderApp()">${esc(label)} <span class="n">${n}</span></button>`;
}

// ── LIVE SEARCH ───────────────────────────────────────────────
// Typing must not rebuild the whole page — that flashes the layout and
// drops focus on every keystroke. Instead we update only #searchResults
// in place and leave the input untouched.
function setSearch(key, val) {
  if (key === 'bills') searchQuery = val;
  else if (key === 'po') poSearchQuery = val;
  else if (key === 'mat') matSearchQuery = val;
}
function getSearch(key) {
  return key === 'bills' ? searchQuery : key === 'po' ? poSearchQuery : matSearchQuery;
}
function searchResultsHTML(key) {
  return key === 'bills' ? billsResultsHTML()
    : key === 'po' ? poResultsHTML()
    : key === 'mat' ? matResultsHTML() : '';
}
function onSearch(el, key) {
  setSearch(key, el.value);
  if (key === 'bills') billsLimit = PAGE_SIZE;
  const btn = document.querySelector('[data-search-clear="' + key + '"]');
  if (btn) btn.classList.toggle('hidden', !el.value);
  const host = document.getElementById('searchResults');
  if (host) host.innerHTML = searchResultsHTML(key);
  else renderApp();
}
function clearSearch(key) {
  setSearch(key, '');
  const input = document.querySelector('input[data-search="' + key + '"]');
  if (input) { input.value = ''; onSearch(input, key); input.focus(); }
  else renderApp();
}
function searchBox(key, placeholder) {
  const val = getSearch(key);
  return `
    <div class="search-wrap">
      ${icon('search', '')}
      <input class="input input-search" type="text" data-search="${key}" placeholder="${esc(placeholder)}" value="${esc(val)}"
        oninput="onSearch(this,'${key}')">
      <button class="search-clear${val ? '' : ' hidden'}" data-search-clear="${key}" onclick="clearSearch('${key}')" aria-label="Clear search">${icon('x', '')}</button>
    </div>`;
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
            <td style="white-space:nowrap;"><div class="cell-strong">${esc(q.id)}</div><div class="cell-accent">${esc(q.date)}</div></td>
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

function renderBillsGrouped(list, limit = Infinity) {
  if (!list.length) return emptyState(L('noDocuments'), L('tryFilter'), 'bills');
  const gk = billViewMode === 'date' ? 'date' : 'customer';
  const grouped = {};
  list.forEach(q => { const k = q[gk] || '—'; (grouped[k] = grouped[k] || []).push(q); });
  // Group totals use every document; only whole groups are drawn until `limit` rows are on screen.
  let drawn = 0;
  const groups = Object.entries(grouped).filter(([, items]) => { const take = drawn === 0 || drawn + items.length <= limit; if (take) drawn += items.length; return take; });
  return `<div class="stack">${groups.map(([key, items]) => {
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
    </div>`}
    ${renderProductsPanel()}`;
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
  const editing = !!editingQuotationId;
  const dt = (val, t, s) => `
    <div class="dt-opt${val === 'bill' ? ' is-on' : ''}" id="dtc-${val}" onclick="selectDocType('${val}');markDocDirty()">
      <input type="radio" name="docType" value="${val}" ${val === 'bill' ? 'checked' : ''} style="display:none;">
      <div class="dt-t">${t}</div><div class="dt-s">${s}</div>
    </div>`;

  return `
  <div style="max-width:820px;margin:0 auto;width:100%;" class="stack">
    <button class="act act-primary" style="align-self:flex-start;" onclick="switchView('bills')">← ${L('bills')}</button>
    <div class="card">
      <div class="sheet-head" style="border-radius:var(--r-card) var(--r-card) 0 0;">
        <div><div class="k">${editing ? esc(editingQuotationId) : L('bills')}</div><div class="h">${L(editing ? 'editDocument' : 'newDoc')}</div></div>
      </div>
      <form id="docForm" onsubmit="submitQuotation(event)" oninput="markDocDirty(event)" onchange="markDocDirty(event)" class="sheet-body">
        <div class="field">
          <span class="field-label">${L('documentType')}</span>
          <div class="doctype" id="docTypeGroup">
            ${dt('bill','Bill','ใบเสร็จ')}
            ${dt('invoice','Invoice','ใบแจ้งหนี้')}
            ${dt('tax-invoice','Tax Invoice','ใบกำกับภาษี')}
          </div>
        </div>

        <div class="field" style="max-width:240px;">
          <span class="field-label">${L('date')}</span>
          <input type="date" id="docDate" class="input" value="${localDateISO()}" required>
        </div>

        <div class="fieldset">
          <h3>${L('customerInfo')}</h3>
          <div class="grid-2">
            <div class="field">
              <span class="field-label">${L('customer2')} *</span>
              <input type="text" id="customerName" class="input" list="customerSuggestions" autocomplete="off" required
                placeholder="${esc(L('customerPh'))}" oninput="fillCustomerInfo(this)">
              <div id="customerHint" class="field-hint"></div>
            </div>
            <div class="field"><span class="field-label">${L('email')}</span><input type="email" id="customerEmail" class="input" placeholder="email@example.com"></div>
          </div>
          <datalist id="customerSuggestions">
            ${customers.map(c => `<option value="${esc(c.name)}">${esc([c.email, c.taxId].filter(Boolean).join(' · '))}</option>`).join('')}
          </datalist>
          <div class="field hidden" id="taxIdField"><span class="field-label">${L('taxId')}</span><input type="text" id="taxId" class="input" placeholder="0-1234-56789-01-2"></div>
          <div class="field"><span class="field-label">${L('address')}</span><textarea id="customerAddress" rows="2" class="textarea" placeholder="${esc(L('addressPh'))}"></textarea></div>
        </div>

        <div class="fieldset">
          <div class="spread"><h3>${L('itemsServices')}</h3>
            <button type="button" class="btn btn-secondary btn-sm" onclick="addItemRow();markDocDirty()">${icon('plus')}${L('addItem')}</button></div>
          <div id="itemsList" class="stack">${itemRowMarkup(1)}</div>
          <datalist id="itemSuggestions">
            ${itemSuggestions().map(s => `<option value="${esc(s.name)}">${s.price != null ? '฿' + fmt(s.price) : ''}${s.description ? ' · ' + esc(s.description) : ''}</option>`).join('')}
          </datalist>
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

        <div class="field"><span class="field-label">${L('notesTerms')}</span><textarea id="notes" rows="3" class="textarea" placeholder="${esc(L('notesPh'))}"></textarea></div>

        <!-- Sticky: keeps the running total and Save in reach on long documents -->
        <div class="doc-dock">
          <div class="doc-dock-total"><span>${L('total')}</span><b id="dockTotal" class="tnum">฿0.00</b></div>
          <button type="button" class="btn btn-secondary" onclick="switchView('bills')">${L('cancel')}</button>
          <button type="submit" class="btn btn-primary">${L(editing ? 'updateDocument' : 'saveDocument')}</button>
        </div>
      </form>
    </div>
  </div>`;
}

function itemRowMarkup(n) {
  return `
  <div class="item-row" style="border:1px solid var(--line-2);border-radius:var(--r-control);padding:12px;display:flex;flex-direction:column;gap:9px;">
    <div class="spread">
      <span class="item-no" style="font-size:var(--t-micro);font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-3);">${L('itemN')}${n}</span>
      <button type="button" class="act act-danger" onclick="removeItemRow(this);markDocDirty()">${L('delete')}</button>
    </div>
    <div class="field"><span class="field-label">${L('productService')}</span><input type="text" class="item-name input" list="itemSuggestions" autocomplete="off" placeholder="${esc(L('itemPh'))}" required oninput="fillProductInfo(this)"></div>
    <div class="field"><span class="field-label">${L('descriptionLbl')}</span><input type="text" class="item-description input" placeholder="${esc(L('optionalDetail'))}"></div>
    <div class="grid-3">
      <div class="field"><span class="field-label">${L('qty')}</span><input type="number" class="item-qty input" min="1" value="1" required oninput="updateItemTotal(this)"></div>
      <div class="field"><span class="field-label">${L('unitPrice')}</span><input type="number" class="item-price input" min="0" step="0.01" required oninput="updateItemTotal(this)"></div>
      <div class="field"><span class="field-label">${L('amount')}</span><input type="text" class="item-total input" readonly tabindex="-1" value="฿0.00" style="background:var(--surface-2);color:var(--accent);font-weight:600;"></div>
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
  const th = getLang() === 'th';

  if (role !== 'admin') {
    // Manager: team panel only
    return `<div style="max-width:960px;margin:0 auto;width:100%;" class="stack">
      <div class="view-head">
        <div><h1>${L('userMgmt')}</h1><p>${th ? 'ผู้จัดการ — เพิ่มได้เฉพาะ Sales และ Technician' : 'Manager — can add Sales & Technician only'}</p></div>
      </div>
      ${renderTeamPanel(false)}
    </div>`;
  }

  const t = adminTab || 'team';
  const sub = (id, label) => `<button ${t === id ? 'aria-current="page"' : ''} onclick="switchAdminTab('${id}')">${esc(label)}</button>`;
  const body = t === 'company' ? renderCompanyPanel() : t === 'audit' ? renderAuditPanel()
    : t === 'archive' ? renderArchivePanel() : renderTeamPanel(true);

  return `
  <div style="max-width:960px;margin:0 auto;width:100%;" class="stack">
    <div class="view-head">
      <div>
        <h1>${th ? 'ผู้ดูแลระบบ' : 'Admin'}</h1>
        <p>${th ? 'จัดการทีมงาน สิทธิ์ ข้อมูลบริษัท บันทึกการใช้งาน และคลังข้อมูลเก่า' : 'Team, roles, company profile, activity log and archive'}</p>
      </div>
    </div>
    <div class="subtabs">
      ${sub('team',    th ? 'ทีมงานและสิทธิ์' : 'Team & Roles')}
      ${sub('company', th ? 'ข้อมูลบริษัท'     : 'Company')}
      ${sub('audit',   th ? 'บันทึกการใช้งาน'  : 'Audit Log')}
      ${sub('archive', th ? 'คลังข้อมูลเก่า'   : 'Archive')}
    </div>
    ${body}
  </div>`;
}

function renderTeamPanel(showRoleBar) {
  const role = sessionStorage.getItem('userRole') || 'sales';
  const isManager = role === 'manager';
  const th = getLang() === 'th';
  return `
  <div class="stack">
    ${showRoleBar ? `<div class="rolebar" id="au_rolecounts">
      <div class="rc"><div class="n">–</div><div class="l">${th ? 'สมาชิก' : 'Members'}</div></div>
      <div class="rc"><div class="n">–</div><div class="l">Sales</div></div>
      <div class="rc"><div class="n">–</div><div class="l">Technician</div></div>
      <div class="rc"><div class="n">–</div><div class="l">Manager</div></div>
      <div class="rc"><div class="n">–</div><div class="l">Admin</div></div>
    </div>` : ''}

    <div class="card card-pad stack">
      <span class="card-title">${th ? 'สร้างบัญชีผู้ใช้ใหม่' : 'Create new user account'}</span>
      <div class="notice">${th ? 'หลังสร้างบัญชีแล้ว แจ้งอีเมลและรหัสผ่านให้ผู้ใช้เพื่อเข้าสู่ระบบ' : 'After creating a user, share their email and password so they can sign in.'}</div>
      <div class="grid-2">
        <div class="field"><span class="field-label">${L('fullName')} *</span><input type="text" id="au_name" class="input" placeholder="${th ? 'เช่น สมหญิง จันทร์เพ็ญ' : 'e.g. Somying Chanpen'}"></div>
        <div class="field"><span class="field-label">${L('email')} *</span><input type="email" id="au_email" class="input" placeholder="name@baigamgab.co"></div>
      </div>
      <div class="grid-2">
        <div class="field"><span class="field-label">${L('password')} *</span><input type="password" id="au_pass" class="input" placeholder="${th ? 'อย่างน้อย 6 ตัวอักษร' : 'Min 6 characters'}"></div>
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

function renderCompanyPanel() {
  const th = getLang() === 'th';
  const line = (id, label, val) => `<div class="field"><span class="field-label">${label}</span><input id="${id}" class="input" value="${esc(val || '')}"></div>`;
  return `
  <div class="card card-pad stack">
    <span class="card-title">${th ? 'ข้อมูลบริษัทและภาษี' : 'Company & tax details'}</span>
    <div class="notice">${th ? 'ข้อมูลนี้จะแสดงบนหัวเอกสารและใบกำกับภาษี PDF' : 'Shown on document headers and tax-invoice PDFs.'}</div>
    <div class="field"><span class="field-label">${th ? 'ชื่อบริษัท' : 'Company name'}</span><input id="ci_name" class="input" value="${esc(companyInfo.name)}"></div>
    <div class="field"><span class="field-label">${th ? 'ที่อยู่' : 'Address'}</span><textarea id="ci_address" rows="2" class="textarea">${esc(companyInfo.address)}</textarea></div>
    <div class="grid-2">
      ${line('ci_phone', th ? 'โทรศัพท์' : 'Phone', companyInfo.phone)}
      ${line('ci_email', th ? 'อีเมล' : 'Email', companyInfo.email)}
    </div>
    <div class="grid-2">
      ${line('ci_taxId', th ? 'เลขประจำตัวผู้เสียภาษี' : 'Tax ID', companyInfo.taxId)}
      ${line('ci_website', th ? 'เว็บไซต์' : 'Website', companyInfo.website)}
    </div>
    <div><button class="btn btn-primary" onclick="saveCompanyInfo()">${L('saveChanges')}</button></div>
  </div>`;
}

function saveCompanyInfo() {
  const g = id => (document.getElementById(id) || {}).value || '';
  companyInfo.name    = g('ci_name').trim();
  companyInfo.address = g('ci_address').trim();
  companyInfo.phone   = g('ci_phone').trim();
  companyInfo.email   = g('ci_email').trim();
  companyInfo.taxId   = g('ci_taxId').trim();
  companyInfo.website = g('ci_website').trim();
  if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
  if (typeof syncCompanyInfoToFirebase === 'function') syncCompanyInfoToFirebase();
  showNotification(getLang() === 'th' ? 'บันทึกข้อมูลบริษัทแล้ว' : 'Company details saved');
}

function renderAuditPanel() {
  const th = getLang() === 'th';
  const ev = [];
  quotations.forEach(q => {
    if (q.submittedAt) ev.push({ t: q.submittedAt, who: q.submittedBy, act: th ? 'ส่งตรวจสอบ' : 'submitted', doc: q.id });
    if (q.approvedAt)  ev.push({ t: q.approvedAt,  who: q.approvedBy,  act: th ? 'อนุมัติ'    : 'approved',  doc: q.id });
    if (q.rejectedAt)  ev.push({ t: q.rejectedAt,  who: q.rejectedBy,  act: th ? 'ปฏิเสธ'     : 'rejected',  doc: q.id, note: q.rejectionReason });
  });
  // Deletes and archiving live in the archive, which is fetched on demand.
  if (!archiveLoaded) loadArchive().then(() => { if (currentView === 'users' && adminTab === 'audit') renderApp(); });
  ARCHIVE_LISTS.forEach(listName => Object.values(archive[listName] || {}).forEach(r => {
    if (r.inactiveAt) ev.push({ t: r.inactiveAt, who: r.inactiveBy, doc: r.id,
      act: r.inactiveReason === 'archived' ? (th ? 'เก็บเข้าคลัง' : 'archived') : (th ? 'ลบ' : 'deleted') });
  }));
  ev.sort((a, b) => (a.t < b.t ? 1 : -1));
  const rows = ev.slice(0, 40).map(e => {
    const d = new Date(e.t);
    const tm = d.toLocaleDateString(th ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' }) +
      ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return `<div class="le">
      <span class="tm">${esc(tm)}</span>
      <span><span class="who">${esc((e.who || '').split('@')[0] || '—')}</span> ${esc(e.act)} <b>${esc(e.doc)}</b>${e.note ? ` — <span class="note">“${esc(e.note)}”</span>` : ''}</span>
    </div>`;
  }).join('');
  return `<div class="card">
    <div class="card-head"><span class="card-title">${th ? 'บันทึกการใช้งาน' : 'Activity log'}</span><span class="cell-sub">${ev.length} ${th ? 'รายการ' : 'events'}</span></div>
    ${ev.length ? `<div class="log">${rows}</div>` : emptyBody(th ? 'ยังไม่มีบันทึก' : 'No activity yet', '')}
  </div>`;
}

// ── ARCHIVE (soft-deleted + archived records) ─────────────────
const ARCHIVE_KIND = {
  quotations:     ['Document', 'เอกสาร'],
  purchaseOrders: ['Purchase order', 'ใบสั่งซื้อ'],
  customers:      ['Customer', 'ลูกค้า'],
  products:       ['Product', 'สินค้า'],
  poCosts:        ['PO cost', 'ค่าใช้จ่าย PO'],
  materialPrices: ['Material price', 'ราคาวัสดุ'],
};

function renderArchivePanel() {
  const th = getLang() === 'th';
  if (!archiveLoaded) loadArchive().then(() => { if (currentView === 'users' && adminTab === 'archive') renderApp(); });

  const dead = findDeadRecords(archiveMonths);
  const deadN = dead.quotations.length + dead.purchaseOrders.length;
  const all = ARCHIVE_LISTS.flatMap(listName => Object.values(archive[listName] || {}).map(r => ({ listName, r })));
  const n = { all: all.length, deleted: 0, archived: 0 };
  all.forEach(({ r }) => { if (n[r.inactiveReason] !== undefined) n[r.inactiveReason]++; });
  const shown = all
    .filter(({ r }) => archiveFilter === 'all' || r.inactiveReason === archiveFilter)
    .sort((a, b) => (a.r.inactiveAt < b.r.inactiveAt ? 1 : -1));
  const fchip = (val, label) => `<button class="chip" aria-pressed="${archiveFilter === val}" onclick="setArchiveFilter('${val}')">${esc(label)} <span class="n">${n[val]}</span></button>`;

  const rows = shown.map(({ listName, r }) => {
    const title = r.customer || r.name || r.materialName || r.description || '—';
    const amount = r.total ?? r.amount ?? r.pricePerUnit ?? r.price;
    const when = new Date(r.inactiveAt);
    return `<tr>
      <td><div class="cell-strong">${esc(r.id)}</div><div class="cell-sub">${esc(ARCHIVE_KIND[listName][th ? 1 : 0])}</div></td>
      <td><div class="cell-strong">${esc(title)}</div><div class="cell-sub">${esc(r.date || '')}</div></td>
      <td class="num tnum">${amount != null ? baht(amount) : '—'}</td>
      <td><span class="pill ${r.inactiveReason === 'archived' ? 'pill-neutral' : 'pill-rejected'}">${r.inactiveReason === 'archived' ? (th ? 'เก็บเข้าคลัง' : 'Archived') : (th ? 'ลบแล้ว' : 'Deleted')}</span>
        <div class="cell-sub">${esc(when.toLocaleDateString(th ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }))} · ${esc((r.inactiveBy || '').split('@')[0] || '—')}</div></td>
      <td><button class="act act-pos" onclick="restoreFromArchive('${listName}','${esc(r.id)}')">${th ? 'กู้คืน' : 'Restore'}</button></td>
    </tr>`;
  }).join('');

  return `<div class="stack">
    <div class="card card-pad stack">
      <span class="card-title">${th ? 'เก็บข้อมูลเก่าเข้าคลัง' : 'Archive old records'}</span>
      <div class="notice">${th
        ? 'ค้นหาเอกสารที่ปิดแล้ว (อนุมัติ/ปฏิเสธ) และใบสั่งซื้อที่เสร็จสิ้นซึ่งเก่ากว่าที่กำหนด แล้วย้ายเข้าคลัง ข้อมูลไม่ถูกลบ แต่จะไม่ถูกโหลดตอนเปิดแอป ทำให้แอปเร็วขึ้นเมื่อข้อมูลมากขึ้น'
        : 'Finds closed documents (approved or rejected) and completed purchase orders older than the cut-off and moves them to the archive. Nothing is erased, but archived records are no longer downloaded when the app starts, so it stays fast as data grows.'}</div>
      <div class="filters">
        <label class="field"><span class="field-label">${th ? 'เก่ากว่า' : 'Older than'}</span>
          <select class="select" onchange="setArchiveMonths(this.value)">
            ${[3, 6, 12, 24].map(m => `<option value="${m}" ${archiveMonths === m ? 'selected' : ''}>${m} ${th ? 'เดือน' : 'months'}</option>`).join('')}
          </select>
        </label>
        <div class="field"><span class="field-label">${th ? 'ตรงเงื่อนไข' : 'Matches'}</span>
          <div style="padding:8px 0;font-size:var(--t-meta);"><b>${dead.quotations.length}</b> ${th ? 'เอกสาร' : 'documents'} · <b>${dead.purchaseOrders.length}</b> POs <span class="cell-sub">(${th ? 'ก่อน' : 'before'} ${esc(dead.cutoff)})</span></div>
        </div>
        <button class="btn btn-primary" ${deadN ? '' : 'disabled'} onclick="archiveOldRecords()">${icon('box', '')}${th ? `เก็บเข้าคลัง ${deadN} รายการ` : `Archive ${deadN} record${deadN === 1 ? '' : 's'}`}</button>
      </div>
    </div>

    <div class="card">
      <div class="card-head" style="flex-wrap:wrap;gap:8px;">
        <span class="card-title">${th ? 'ข้อมูลที่ลบและเก็บเข้าคลัง' : 'Deleted & archived records'}</span>
        <div class="chips">${fchip('all', L('allFilter'))}${fchip('deleted', th ? 'ลบแล้ว' : 'Deleted')}${fchip('archived', th ? 'เก็บเข้าคลัง' : 'Archived')}
          <button class="chip" onclick="refreshArchive()">${th ? 'รีเฟรช' : 'Refresh'}</button></div>
      </div>
      ${!archiveLoaded ? `<div class="card-pad"><p class="muted" style="font-size:var(--t-meta);">${th ? 'กำลังโหลด…' : 'Loading…'}</p></div>`
        : shown.length ? `<div class="table-wrap"><table class="table" style="min-width:680px;">
            <thead><tr><th>${th ? 'รายการ' : 'Record'}</th><th>${th ? 'ชื่อ / วันที่' : 'Name / date'}</th><th class="num">${L('total')}</th><th>${L('statusCol')}</th><th></th></tr></thead>
            <tbody>${rows}</tbody></table></div>`
        : emptyBody(th ? 'คลังว่างเปล่า' : 'Archive is empty', th ? 'รายการที่ลบหรือเก็บเข้าคลังจะแสดงที่นี่และกู้คืนได้' : 'Deleted and archived records appear here and can be restored.')}
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

      const rc = document.getElementById('au_rolecounts');
      if (rc) {
        const k = { total: 0, sales: 0, technician: 0, manager: 0, admin: 0 };
        Object.values(data).forEach(u => { k.total++; if (k[u.role] != null) k[u.role]++; });
        const th = getLang() === 'th';
        rc.innerHTML = `
          <div class="rc"><div class="n">${k.total}</div><div class="l">${th ? 'สมาชิก' : 'Members'}</div></div>
          <div class="rc"><div class="n">${k.sales}</div><div class="l">Sales</div></div>
          <div class="rc"><div class="n">${k.technician}</div><div class="l">Technician</div></div>
          <div class="rc"><div class="n">${k.manager}</div><div class="l">Manager</div></div>
          <div class="rc"><div class="n">${k.admin}</div><div class="l">Admin</div></div>`;
      }
    }).catch(err => {
      container.innerHTML = `<p class="alert-err">Error: ${esc(err.message)}</p>`;
    });
  }
}

function adminSaveRole(uid, currentRole, sel) {
  const newRole = sel.value;
  const isManager = sessionStorage.getItem('userRole') === 'manager';
  if (isManager && (newRole === 'admin' || newRole === 'manager')) {
    showNotification('⚠️ Managers cannot assign Admin or Manager roles');
    sel.value = currentRole; return;
  }
  database.ref('users/' + uid + '/role').set(newRole)
    .then(() => showNotification('Role updated to ' + newRole))
    .catch(err => showNotification('❌ Could not update role', { detail: err.message }));
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
function poResultsHTML() {
  const role = sessionStorage.getItem('userRole') || 'sales';
  const canEdit = role === 'sales' || role === 'admin' || role === 'manager';

  let list = poFiltered();
  if (poStatusFilter !== 'all') list = list.filter(p => p.status === poStatusFilter);
  if (poSearchQuery) {
    const s = poSearchQuery.toLowerCase();
    list = list.filter(p => p.id.toLowerCase().includes(s) || (p.customer || '').toLowerCase().includes(s) || p.items.some(i => (i.name || '').toLowerCase().includes(s)));
  }
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

  return resultCount('po', list.length) + (list.length === 0
    ? emptyState(purchaseOrders.length === 0 ? L('noOrders') : 'No orders match your filter.', canEdit ? 'Create a purchase order to get started.' : '', 'po')
    : `<div class="card"><div class="table-wrap"><table class="table" style="min-width:760px;">
        <thead><tr>
          <th>${L('poId')}</th><th>${L('date')}</th><th>${L('customer')}</th><th>${L('itemsCol')}</th>
          <th class="num">${L('total')}</th><th>${L('statusCol')}</th><th>${L('actions')}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table></div></div>`);
}

// Customer + date range filters for POs (status and search are applied on top).
function poFiltered() {
  const f = listFilters.po;
  return purchaseOrders.filter(p => (!f.name || p.customer === f.name) && inDateRange(p.date, f));
}

function renderPOView() {
  const role = sessionStorage.getItem('userRole') || 'sales';
  const canEdit = role === 'sales' || role === 'admin' || role === 'manager';

  const facet = poFiltered();
  const counts = { all: facet.length, open: 0, 'in-progress': 0, completed: 0 };
  facet.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++; });
  const poChip = (val, label) => `<button class="chip" aria-pressed="${poStatusFilter === val}" onclick="poStatusFilter='${val}';renderApp()">${esc(label)} <span class="n">${counts[val]}</span></button>`;

  return `
    <div class="view-head">
      <div><h1>${L('po')}</h1><p>${purchaseOrders.length} ${L('ordersCount')}</p></div>
      ${canEdit ? `<button class="btn btn-primary" onclick="openPOForm()">${icon('plus')}${L('newPO')}</button>` : ''}
    </div>

    <div class="card card-pad stack">
      ${searchBox('po', 'Search by PO ID, customer, item…')}
      ${filterBar('po', L('customer2'), purchaseOrders.map(p => p.customer))}
      <div class="chips">
        ${poChip('all', L('allFilter'))}${poChip('open', L('open'))}${poChip('in-progress', L('inProgress'))}${poChip('completed', L('completed'))}
      </div>
    </div>

    <div id="searchResults">${poResultsHTML()}</div>`;
}

// ═══════════════════════════════════════════════════════════════
// MATERIAL COST PER SUPPLIER
// ═══════════════════════════════════════════════════════════════
function matGrouped() {
  const f = listFilters.mat;
  let list = materialPrices.filter(m => (!f.name || m.supplier === f.name) && inDateRange(m.date, f));
  if (matSearchQuery) {
    const s = matSearchQuery.toLowerCase();
    list = list.filter(m => (m.materialName || '').toLowerCase().includes(s) || (m.supplier || '').toLowerCase().includes(s));
  }
  const grouped = {};
  list.forEach(m => { (grouped[m.materialName] = grouped[m.materialName] || []).push(m); });
  return grouped;
}

function matResultsHTML() {
  const grouped = matGrouped();
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

  const n = Object.values(grouped).reduce((s, e) => s + e.length, 0);
  if (Object.keys(grouped).length === 0 && materialPrices.length) {
    return resultCount('mat', 0) + emptyState(L('noResults'), L('tryFilter2'), 'box');
  }
  return Object.keys(grouped).length === 0
    ? `<div class="card"><div class="empty">
        <span class="empty-ico">${icon('box','')}</span>
        <h3>${L('noMaterialsMsg')}</h3>
        <p>Open a Purchase Order → <b>${L('costs')}</b> → add a <b>${L('material')}</b> cost with a supplier name.</p>
      </div></div>`
    : resultCount('mat', n) + `<div class="stack">${blocks}</div>`;
}

function renderMaterialsView() {
  return `
    <div class="view-head">
      <div><h1>${L('materialCostTitle')}</h1><p>${Object.keys(matGrouped()).length} ${L('materialsTracked')}</p></div>
      <button class="btn btn-primary" onclick="openAddMaterialForm()">${icon('plus')}${L('addMaterial')}</button>
    </div>

    <div class="card card-pad stack">
      ${searchBox('mat', 'Search by material or supplier…')}
      ${filterBar('mat', L('supplierCol'), materialPrices.map(m => m.supplier))}
    </div>

    <div id="searchResults">${matResultsHTML()}</div>`;
}

function deleteMaterialPrice(id) {
  removeWithUndo('materialPrices', id, L('entryDeleted'));
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

// ═══════════════════════════════════════════════════════════════
// CONFIRM DIALOG — styled replacement for confirm() / prompt()
// Resolves true/false, or with `input` the entered text (null on cancel).
// ═══════════════════════════════════════════════════════════════
function confirmDialog({ title, message = '', confirmLabel, cancelLabel = L('cancel'), danger = false, input = null }) {
  return new Promise(resolve => {
    document.getElementById('confirmModal')?.remove();
    const wrap = document.createElement('div');
    wrap.id = 'confirmModal';
    wrap.className = 'scrim scrim-dialog';
    wrap.innerHTML = `
      <div class="sheet dialog" role="alertdialog" aria-modal="true" aria-labelledby="cfTitle" aria-describedby="cfMsg">
        <form class="sheet-body">
          <div>
            <div id="cfTitle" class="dialog-title">${esc(title)}</div>
            ${message ? `<p id="cfMsg" class="dialog-msg">${esc(message)}</p>` : ''}
          </div>
          ${input ? `<div class="field"><span class="field-label">${esc(input.label)}</span><textarea id="cfInput" class="textarea" rows="3" required></textarea></div>` : ''}
          <div class="dialog-foot">
            <button type="button" class="btn btn-secondary" data-cf="cancel">${esc(cancelLabel)}</button>
            <button type="submit" class="btn ${danger ? 'btn-danger-solid' : 'btn-primary'}">${esc(confirmLabel || 'OK')}</button>
          </div>
        </form>
      </div>`;

    const cancelValue = input ? null : false;
    const done = value => {
      document.removeEventListener('keydown', onKey, true);
      wrap.remove();
      resolve(value);
    };
    const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); done(cancelValue); } };
    wrap.addEventListener('click', e => {
      if (e.target === wrap || e.target.closest('[data-cf="cancel"]')) done(cancelValue);
    });
    wrap.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      if (!input) return done(true);
      const v = wrap.querySelector('#cfInput').value.trim();
      if (v) done(v);
    });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(wrap);
    (wrap.querySelector('#cfInput') || wrap.querySelector('button[type="submit"]')).focus();
  });
}

// ═══════════════════════════════════════════════════════════════
// CUSTOMER PANEL — side drawer (bottom sheet on phones)
// ═══════════════════════════════════════════════════════════════
function viewCustomer(id) {
  const c = customers.find(x => x.id === id);
  if (!c) return;
  closeCustomerPanel();
  const key = (c.name || '').trim().toLowerCase();
  const docs = quotations.filter(q => (q.customer || '').trim().toLowerCase() === key);
  const billed = docs.reduce((s, q) => s + (q.total || 0), 0);
  const line = (label, value, cls = '') => value
    ? `<div class="kv"><span class="field-label">${label}</span><span class="${cls}">${esc(value)}</span></div>` : '';

  const html = `
  <div id="customerPanel" class="scrim scrim-side" onclick="if(event.target.id==='customerPanel')closeCustomerPanel()">
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="cpName">
      <div class="sheet-head">
        <div><div class="k">${L(c.type === 'company' ? 'company' : 'individual')}</div><div id="cpName" class="h">${esc(c.name)}</div></div>
        <button class="sheet-x" onclick="closeCustomerPanel()" aria-label="${L('close')}">${icon('x','')}</button>
      </div>
      <div class="sheet-body">
        <div class="grid-2">
          <div class="stat" style="--stat-accent:var(--accent);"><div class="stat-label">${L('docsCount')}</div><div class="stat-value">${docs.length}</div></div>
          <div class="stat" style="--stat-accent:var(--pos);"><div class="stat-label">${L('totalBilled')}</div><div class="stat-value tnum">${baht(billed)}</div></div>
        </div>
        <div class="stack" style="gap:10px;">
          ${line(L('email'), c.email)}
          ${line(L('phone'), c.phone)}
          ${line(L('taxId'), c.taxId, 'tnum')}
          ${line(L('address'), c.address)}
        </div>
        <div>
          <div class="card-title" style="margin-bottom:6px;">${L('recentDocs')}</div>
          ${docs.length ? `<div class="card">${docs.slice(0, 6).map(q => `
            <button class="row row-btn" onclick="closeCustomerPanel();viewQuotation('${q.id}')">
              <div class="row-main"><div class="t">${esc(q.id)}</div><div class="s">${esc(q.date)} · ${(q.items || []).length} ${L('itemsCol')}</div></div>
              <div class="row-end"><div class="tnum" style="font-weight:600;">${baht(q.total)}</div>${getStatusPill(q.status)}</div>
            </button>`).join('')}</div>`
          : `<p class="muted" style="font-size:var(--t-meta);">${L('noDocsYet')}</p>`}
        </div>
      </div>
      <div class="sheet-foot drawer-foot">
        <button class="btn btn-primary btn-block" onclick="startDocForCustomer('${c.id}')">${icon('plus')}${L('newDocForCustomer')}</button>
        <button class="btn btn-secondary" onclick="editCustomer('${c.id}')">${icon('edit')}${L('edit')}</button>
      </div>
    </aside>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.addEventListener('keydown', customerPanelKey);
}

function customerPanelKey(e) { if (e.key === 'Escape') closeCustomerPanel(); }

function closeCustomerPanel() {
  document.getElementById('customerPanel')?.remove();
  document.removeEventListener('keydown', customerPanelKey);
}

async function startDocForCustomer(id) {
  const c = customers.find(x => x.id === id);
  closeCustomerPanel();
  await switchView('new');
  const input = document.getElementById('customerName');
  if (c && input) { input.value = c.name; fillCustomerInfo(input); }
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTS — list shown under Customers
// ═══════════════════════════════════════════════════════════════
function renderProductsPanel() {
  return `
    <div class="view-head" style="margin-top:var(--s3);">
      <div><h2 class="section-title">${L('products')}</h2><p>${L('productsHint')}</p></div>
      <button class="btn btn-secondary" onclick="showAddProductModal()">${icon('plus')}${L('addProduct')}</button>
    </div>
    ${!products.length ? emptyState(L('noProducts'), L('productsHint'), 'box') : `
    <div class="card">
      <div class="table-wrap">
        <table class="table" style="min-width:560px;">
          <thead><tr>
            <th>${L('name')}</th><th>${L('descriptionLbl')}</th><th>${L('unit')}</th><th class="num">${L('priceCol')}</th><th>${L('actions')}</th>
          </tr></thead>
          <tbody>${products.map(p => `
            <tr>
              <td class="cell-strong">${esc(p.name)}</td>
              <td class="muted">${esc(p.description) || '—'}</td>
              <td class="muted">${esc(p.unit) || '—'}</td>
              <td class="num cell-strong tnum">${baht(p.price)}</td>
              <td style="white-space:nowrap;">
                <button class="act act-warn" onclick="editProduct('${p.id}')">${L('edit')}</button>
                <button class="act act-danger" onclick="deleteProduct('${p.id}')">${L('delete')}</button>
              </td>
            </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`}`;
}

// ═══════════════════════════════════════════════════════════════
// COMMAND PALETTE — Ctrl/⌘ + K: jump to any document, customer,
// product or view, or run a quick action.
// ═══════════════════════════════════════════════════════════════
let paletteItems = [];
let paletteIndex = 0;

function isMac() { return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent); }

function paletteSource() {
  const role = sessionStorage.getItem('userRole') || 'sales';
  const canDocs = role === 'sales' || role === 'admin' || role === 'manager';
  const canOps = canDocs || role === 'technician';
  const canUsers = role === 'admin' || role === 'manager';
  const go = L('goTo') + ' ';
  const out = [];
  const add = (group, ico, label, sub, run, keywords = '') =>
    out.push({ group, ico, label, sub, run, hay: (label + ' ' + sub + ' ' + keywords).toLowerCase() });

  const A = L('actionsGrp');
  if (canDocs) add(A, 'plus', L('newDoc'), '', () => switchView('new'), 'create new document bill invoice');
  if (role === 'admin') add(A, 'dashboard', go + L('dashboard'), '', () => switchView('dashboard'));
  add(A, 'bills', go + L('bills'), '', () => switchView('bills'));
  if (canDocs) add(A, 'users', go + L('customers'), '', () => switchView('customers'));
  if (canOps) add(A, 'po', go + L('po'), '', () => switchView('po'));
  if (canOps) add(A, 'box', go + L('materials'), '', () => switchView('materials'));
  if (canUsers) add(A, 'shield', go + L('manageUsers'), '', () => switchView('users'));
  if (canDocs) add(A, 'plus', L('addCustomer'), '', () => showAddCustomerModal());
  if (canDocs) add(A, 'plus', L('addProduct'), '', () => showAddProductModal());
  add(A, getMode() === 'dark' ? 'sun' : 'moon', L('toggleTheme'), '', toggleMode, 'theme dark light');
  add(A, 'dot', L('switchLang'), '', () => setLang(getLang() === 'en' ? 'th' : 'en'), 'language thai english ภาษา');

  quotations.forEach(q => add(L('bills'), 'bills', q.id, `${q.customer} · ${q.date} · ฿${fmt(q.total)}`,
    () => viewQuotation(q.id), (q.items || []).map(i => i.name).join(' ') + ' ' + q.status));
  if (canDocs) {
    customers.forEach(c => add(L('customers'), 'user', c.name, [c.email, c.phone].filter(Boolean).join(' · '),
      () => viewCustomer(c.id), c.taxId || ''));
    products.forEach(p => add(L('products'), 'box', p.name, `฿${fmt(p.price)}${p.unit ? ' / ' + p.unit : ''}`,
      () => editProduct(p.id), p.description || ''));
  }
  return out;
}

function openPalette() {
  if (document.getElementById('cmdk')) return;
  const html = `
  <div id="cmdk" class="scrim scrim-top" onclick="if(event.target.id==='cmdk')closePalette()">
    <div class="cmdk" role="dialog" aria-modal="true" aria-label="${L('search')}">
      <div class="cmdk-search">
        ${icon('search', '')}
        <input id="cmdkInput" autocomplete="off" spellcheck="false" placeholder="${esc(L('palettePh'))}"
          role="combobox" aria-expanded="true" aria-controls="cmdkList" oninput="renderPalette()">
        <kbd>Esc</kbd>
      </div>
      <div id="cmdkList" class="cmdk-list" role="listbox"></div>
      <div class="cmdk-foot"><kbd>↑</kbd><kbd>↓</kbd> <kbd>↵</kbd> <kbd>Esc</kbd> <span>${L('paletteHint')}</span></div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  const input = document.getElementById('cmdkInput');
  input.addEventListener('keydown', paletteKey);
  renderPalette();
  input.focus();
}

function closePalette() { document.getElementById('cmdk')?.remove(); }

function renderPalette() {
  const q = (document.getElementById('cmdkInput')?.value || '').trim().toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  const all = paletteSource();
  // No query: actions + a few recent documents. With a query: every term must match.
  paletteItems = terms.length
    ? all.filter(it => terms.every(t => it.hay.includes(t))).slice(0, 40)
    : all.filter(it => it.group === L('actionsGrp')).concat(all.filter(it => it.group === L('bills')).slice(0, 5));
  paletteIndex = 0;

  const list = document.getElementById('cmdkList');
  if (!paletteItems.length) { list.innerHTML = `<div class="cmdk-empty">${L('noResults')}</div>`; return; }
  let lastGroup = '';
  list.innerHTML = paletteItems.map((it, i) => {
    const head = it.group !== lastGroup ? `<div class="cmdk-group">${esc(it.group)}</div>` : '';
    lastGroup = it.group;
    return `${head}<div class="cmdk-item" role="option" id="cmdk-${i}" data-i="${i}" aria-selected="${i === 0}"
        onmousemove="setPaletteIndex(${i})" onclick="runPaletteItem(${i})">
      <span class="cmdk-ico">${icon(it.ico, '')}</span>
      <span class="cmdk-text"><span class="cmdk-label">${esc(it.label)}</span>${it.sub ? `<span class="cmdk-sub">${esc(it.sub)}</span>` : ''}</span>
    </div>`;
  }).join('');
}

function setPaletteIndex(i) {
  if (i === paletteIndex) return;
  document.getElementById('cmdk-' + paletteIndex)?.setAttribute('aria-selected', 'false');
  paletteIndex = i;
  const el = document.getElementById('cmdk-' + i);
  el?.setAttribute('aria-selected', 'true');
  el?.scrollIntoView({ block: 'nearest' });
}

function runPaletteItem(i) {
  const it = paletteItems[i];
  if (!it) return;
  closePalette();
  it.run();
}

function paletteKey(e) {
  if (e.key === 'ArrowDown') { e.preventDefault(); setPaletteIndex(Math.min(paletteIndex + 1, paletteItems.length - 1)); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); setPaletteIndex(Math.max(paletteIndex - 1, 0)); }
  else if (e.key === 'Enter') { e.preventDefault(); runPaletteItem(paletteIndex); }
  else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
}

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    if (!document.getElementById('app')?.children.length) return;   // not signed in / not rendered
    e.preventDefault();
    document.getElementById('cmdk') ? closePalette() : openPalette();
  }
});
