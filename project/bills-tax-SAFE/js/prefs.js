// ═══════════════════════════════════════════════════════════════
// Baigamgab · SmartLedger — Account menu, accessibility sheet, pictures
//
// Pictures are small JPEGs kept in the Realtime Database as data URLs, one
// record each, so a new picture never rewrites a whole list:
//   userPhotos/{uid}       256 × 256, cropped to the middle  (your own; Manager / Admin see the team's)
//   stockImages/{itemId}   256 × 256, whole picture on white (Manager / Admin write)
// Every picture is redrawn on a canvas first: that fixes the size, so they all
// look the same, and drops hidden data such as the GPS position from phone photos.
// ═══════════════════════════════════════════════════════════════

Object.assign(LANG.en, {
  account: 'Account', accountMenu: 'Account menu', a11y: 'Accessibility', a11ySub: 'Text size and colours',
  a11yText: 'Text size', a11yText100: 'Normal', a11yText115: 'Large', a11yText130: 'Larger', a11yText150: 'Largest',
  a11yColors: 'Colours', a11yDefault: 'Standard', a11ySafe: 'Colour-blind safe', a11yMono: 'Black and white',
  a11yColorsHint: 'Colour-blind safe replaces red and green. It works for all common types of colour blindness.',
  a11yContrast: 'High contrast', a11yContrastHint: 'Darker text and stronger lines',
  a11yMarks: 'Symbols on statuses', a11yMarksHint: 'Shows ✓ ! ✕ as well as colour',
  a11yMarksForced: 'Always on with these settings',
  a11yMotion: 'Less movement', a11yMotionHint: 'Turns animations off',
  a11yReset: 'Reset to standard', a11yPreview: 'Preview', a11ySaved: 'Saved on this device for your account',
  photo: 'Photo', photoAdd: 'Add photo', photoChange: 'Change photo', photoRemove: 'Remove photo', myPhoto: 'Your photo',
  photoHint: 'Your photo shows at the top of the app. Managers and Admins see it on the Team page.',
  photoSaved: 'Photo saved', photoRemoved: 'Photo removed',
  imgAdd: 'Add picture', imgChange: 'Change picture', imgRemove: 'Remove', itemPicture: 'Picture',
  imgHint: 'Any photo works. It is resized to the same square size for every item.',
  imgBadType: 'Choose a photo (JPG, PNG or WebP).', imgTooBig: 'That file is larger than 12 MB. Choose a smaller photo.',
  imgUnreadable: 'This photo could not be read. Try another one.',
  imgNotSaved: 'Picture not saved', imgNotSavedHint: 'No permission or no connection. If it keeps happening, ask the Admin to publish the database rules.',
  noPicture: 'No picture',
});
Object.assign(LANG.th, {
  account: 'บัญชีผู้ใช้', accountMenu: 'เมนูบัญชีผู้ใช้', a11y: 'การช่วยการมองเห็น', a11ySub: 'ขนาดตัวอักษรและสี',
  a11yText: 'ขนาดตัวอักษร', a11yText100: 'ปกติ', a11yText115: 'ใหญ่', a11yText130: 'ใหญ่ขึ้น', a11yText150: 'ใหญ่ที่สุด',
  a11yColors: 'สี', a11yDefault: 'มาตรฐาน', a11ySafe: 'สำหรับตาบอดสี', a11yMono: 'ขาวดำ',
  a11yColorsHint: 'แบบสำหรับตาบอดสีไม่ใช้สีแดงคู่กับสีเขียว ใช้ได้กับตาบอดสีทุกชนิดที่พบบ่อย',
  a11yContrast: 'ความคมชัดสูง', a11yContrastHint: 'ตัวอักษรเข้มขึ้นและเส้นชัดขึ้น',
  a11yMarks: 'สัญลักษณ์บนสถานะ', a11yMarksHint: 'แสดง ✓ ! ✕ ควบคู่กับสี',
  a11yMarksForced: 'เปิดตลอดเมื่อใช้ค่านี้',
  a11yMotion: 'ลดการเคลื่อนไหว', a11yMotionHint: 'ปิดภาพเคลื่อนไหว',
  a11yReset: 'กลับเป็นค่ามาตรฐาน', a11yPreview: 'ตัวอย่าง', a11ySaved: 'บันทึกในเครื่องนี้สำหรับบัญชีของคุณ',
  photo: 'รูปภาพ', photoAdd: 'เพิ่มรูป', photoChange: 'เปลี่ยนรูป', photoRemove: 'ลบรูป', myPhoto: 'รูปของคุณ',
  photoHint: 'รูปของคุณแสดงที่มุมขวาบนของระบบ ผู้จัดการและผู้ดูแลเห็นรูปในหน้าทีมงาน',
  photoSaved: 'บันทึกรูปแล้ว', photoRemoved: 'ลบรูปแล้ว',
  imgAdd: 'เพิ่มรูป', imgChange: 'เปลี่ยนรูป', imgRemove: 'ลบรูป', itemPicture: 'รูปวัสดุ',
  imgHint: 'ใช้รูปใดก็ได้ ระบบปรับเป็นสี่เหลี่ยมจัตุรัสขนาดเท่ากันทุกรายการ',
  imgBadType: 'กรุณาเลือกไฟล์รูป (JPG, PNG หรือ WebP)', imgTooBig: 'ไฟล์ใหญ่เกิน 12 MB กรุณาเลือกรูปที่เล็กกว่า',
  imgUnreadable: 'อ่านรูปนี้ไม่ได้ กรุณาลองรูปอื่น',
  imgNotSaved: 'บันทึกรูปไม่สำเร็จ', imgNotSavedHint: 'ไม่มีสิทธิ์หรือไม่มีอินเทอร์เน็ต หากเกิดซ้ำ ให้ผู้ดูแลเผยแพร่กฎฐานข้อมูล',
  noPicture: 'ไม่มีรูป',
});
Object.assign(IC, {
  access: '<circle cx="12" cy="4.6" r="1.8"/><path d="M4.5 8.8c5 1.4 10 1.4 15 0M12 10v4.5M12 14.5l-3.2 6M12 14.5l3.2 6"/>',
  image: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l5-4.5 3.5 3 3.5-3.5 4.5 4"/>',
  chevD: '<path d="M6 9l6 6 6-6"/>',
});

// ── Pictures: shared ─────────────────────────────────────────
const IMG_SIDE = 256;                       // px, square
const IMG_MAX_FILE = 12 * 1024 * 1024;
const IMG_MAX_CHARS = 60000;                // same limit as database.rules.json

// Anything read back from storage is checked before it reaches an <img>.
function isPicture(v) {
  return typeof v === 'string' && v.length < IMG_MAX_CHARS && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(v);
}

function loadPictureFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, done: () => URL.revokeObjectURL(url) });
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(L('imgUnreadable'))); };
    img.src = url;                          // browsers turn phone photos the right way up here
  });
}

// fit 'cover'   = fill the square, cutting the edges (faces)
// fit 'contain' = show the whole picture on white (materials)
async function pictureFromFile(file, fit) {
  if (!file || !/^image\//.test(file.type || '') || /svg/.test(file.type)) throw new Error(L('imgBadType'));
  if (file.size > IMG_MAX_FILE) throw new Error(L('imgTooBig'));
  const { img, done } = await loadPictureFile(file);
  try {
    const w = img.naturalWidth, h = img.naturalHeight;
    if (!w || !h) throw new Error(L('imgUnreadable'));
    const c = document.createElement('canvas');
    c.width = c.height = IMG_SIDE;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, IMG_SIDE, IMG_SIDE);
    ctx.imageSmoothingQuality = 'high';
    const k = fit === 'cover' ? Math.max(IMG_SIDE / w, IMG_SIDE / h) : Math.min(IMG_SIDE / w, IMG_SIDE / h);
    ctx.drawImage(img, (IMG_SIDE - w * k) / 2, (IMG_SIDE - h * k) / 2, w * k, h * k);
    for (const q of [0.82, 0.7, 0.55, 0.4]) {
      const out = c.toDataURL('image/jpeg', q);
      if (isPicture(out)) return out;
    }
    throw new Error(L('imgUnreadable'));
  } finally { done(); }
}

function pictureError(e) {
  showNotification('❌ ' + L('imgNotSaved'), { type: 'error', detail: e && e.message && !e.code ? e.message : L('imgNotSavedHint') });
}

// Opens the file chooser (camera or gallery on a phone) and returns the resized picture, or null.
function choosePicture(fit) {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/*';
    input.style.display = 'none';
    const finish = v => { input.remove(); resolve(v); };
    input.addEventListener('change', async () => {
      try { finish(input.files[0] ? await pictureFromFile(input.files[0], fit) : null); }
      catch (e) { pictureError(e); finish(null); }
    });
    input.addEventListener('cancel', () => finish(null));
    document.body.appendChild(input);
    input.click();
  });
}

// ── Your photo ───────────────────────────────────────────────
let myPhoto = '';

function myUid() { return sessionStorage.getItem('userId') || ''; }
function myPhotoKey() { return 'userPhoto:' + myUid(); }
function firebaseOn() { return typeof isFirebaseEnabled !== 'undefined' && isFirebaseEnabled; }

function initials(name) {
  const parts = String(name || '').replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean);
  if (!parts.length) return '?';
  // Thai names: skip a leading vowel so the letter reads correctly on its own.
  const first = w => [...w.replace(/^[เแโใไ]/, '')][0] || [...w][0];
  return (first(parts[0]) + (parts[1] ? first(parts[1]) : '')).toUpperCase();
}

function avatar(name, photo, cls = '') {
  return isPicture(photo)
    ? `<span class="avatar ${cls}"><img src="${photo}" alt=""></span>`
    : `<span class="avatar ${cls}" aria-hidden="true">${esc(initials(name))}</span>`;
}

function loadMyPhoto() {
  try { const v = localStorage.getItem(myPhotoKey()); if (isPicture(v)) myPhoto = v; } catch (e) {}
  if (!firebaseOn() || !myUid()) return;
  database.ref('userPhotos/' + myUid()).on('value', snap => {
    const v = isPicture(snap.val()) ? snap.val() : '';
    if (v === myPhoto) return;
    myPhoto = v;
    cacheMyPhoto();
    refreshAccountChip();
  }, e => console.warn('photo load', e && e.code));
}

function cacheMyPhoto() {
  try { if (myPhoto) localStorage.setItem(myPhotoKey(), myPhoto); else localStorage.removeItem(myPhotoKey()); } catch (e) {}
}

async function saveMyPhoto(v) {
  if (firebaseOn()) {
    try { await database.ref('userPhotos/' + myUid()).set(v || null); }
    catch (e) { pictureError(e); return false; }
  }
  myPhoto = v || '';
  cacheMyPhoto();
  refreshAccountChip();
  showNotification('✅ ' + L(v ? 'photoSaved' : 'photoRemoved'));
  return true;
}

async function changeMyPhoto() {
  const v = await choosePicture('cover');
  if (v && await saveMyPhoto(v) && document.getElementById('accountSheet')) openAccount();
}
async function removeMyPhoto() {
  if (await saveMyPhoto('') && document.getElementById('accountSheet')) openAccount();
}

// Updates only the chip, so a photo arriving never redraws a form someone is filling in.
function refreshAccountChip() {
  const el = document.getElementById('accountChip');
  if (el) el.outerHTML = accountChip();
}

function accountChip() {
  const role = sessionStorage.getItem('userRole') || 'sales';
  const name = sessionStorage.getItem('userName') || sessionStorage.getItem('userEmail') || '';
  return `<button id="accountChip" class="account-chip" onclick="openAccount()" aria-haspopup="dialog" aria-label="${esc(L('accountMenu') + ': ' + name + ', ' + getRoleLabel(role))}">
    <span class="account-text"><span class="account-name">${esc(name)}</span><span class="account-role">${esc(getRoleLabel(role))}</span></span>
    ${avatar(name, myPhoto)}
  </button>`;
}

// ── Account sheet ────────────────────────────────────────────
let sheetOpener = null;

function prefSheet(id, titleId, title, body) {
  closePrefSheets();
  document.body.insertAdjacentHTML('beforeend', `
  <div id="${id}" class="scrim" onclick="if(event.target.id==='${id}')closePrefSheets(true)">
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="${titleId}" style="max-width:460px;">
      <div class="sheet-head"><div id="${titleId}" class="h">${esc(title)}</div>
        <button class="sheet-x" onclick="closePrefSheets(true)" aria-label="${L('close')}">${icon('x', '')}</button></div>
      ${body}
    </div>
  </div>`);
  document.addEventListener('keydown', prefSheetKey);
  document.querySelector(`#${id} .sheet-x`).focus({ preventScroll: true });
}
function prefSheetKey(e) {
  if (e.key === 'Escape') return closePrefSheets(true);
  if (e.key !== 'Tab') return;
  // Keep the Tab key inside the open sheet.
  const box = document.querySelector('#accountSheet .sheet, #a11ySheet .sheet');
  const f = box ? [...box.querySelectorAll('button:not(:disabled), input, select, a[href]')] : [];
  if (!f.length) return;
  const i = f.indexOf(document.activeElement);
  if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
  else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
}
function closePrefSheets(giveFocusBack) {
  document.getElementById('accountSheet')?.remove();
  document.getElementById('a11ySheet')?.remove();
  document.removeEventListener('keydown', prefSheetKey);
  if (giveFocusBack) document.getElementById(sheetOpener || 'accountChip')?.focus();
}

function openAccount() {
  sheetOpener = 'accountChip';
  const role = sessionStorage.getItem('userRole') || 'sales';
  const email = sessionStorage.getItem('userEmail') || '';
  const name = sessionStorage.getItem('userName') || email;
  const dark = getMode() === 'dark';
  const row = (ico, t, s, js) => `<button class="row row-btn" onclick="${js}"><span class="row-ico">${icon(ico, '')}</span>
      <span class="row-main"><span class="t">${esc(t)}</span>${s ? `<span class="s" style="display:block;">${esc(s)}</span>` : ''}</span>${icon('chevR', 'more-chev')}</button>`;
  prefSheet('accountSheet', 'accTitle', L('account'), `
    <div class="sheet-body">
      <div class="acc-head">
        ${avatar(name, myPhoto, 'avatar-xl')}
        <div class="acc-id"><div class="acc-name">${esc(name)}</div><div class="cell-sub">${esc(email)}</div>
          <span class="pill pill-plain pill-neutral">${esc(getRoleLabel(role))}</span></div>
      </div>
      <div class="acc-btns">
        <button class="btn btn-primary btn-sm" onclick="changeMyPhoto()">${icon('image')}${L(myPhoto ? 'photoChange' : 'photoAdd')}</button>
        ${myPhoto ? `<button class="btn btn-secondary btn-sm" onclick="removeMyPhoto()">${L('photoRemove')}</button>` : ''}
      </div>
      <p class="cell-sub">${esc(L('photoHint'))}</p>
    </div>
    <div class="acc-rows">
      ${row('access', L('a11y'), L('a11ySub'), 'openA11y()')}
      ${row(dark ? 'sun' : 'moon', L('toggleTheme'), '', 'closePrefSheets();toggleMode()')}
      ${row('dot', L('switchLang'), '', "closePrefSheets();setLang(getLang()==='en'?'th':'en')")}
      ${row('logout', L('signOut'), '', 'logout()')}
    </div>`);
}

// ── Accessibility sheet ──────────────────────────────────────
function openA11y(from) {
  if (from) sheetOpener = from;
  const a = getA11y();
  const forced = marksForced(a);
  const toggle = (key, on, label, hint, off) => `<button type="button" class="switch-row" role="switch" aria-checked="${on}" ${off ? 'disabled' : ''} data-a11y="${key}" onclick="changeA11y('${key}', ${!on})">
      <span><span class="switch-label">${esc(label)}</span><span class="cell-sub" style="display:block;">${esc(hint)}</span></span><span class="switch-track" aria-hidden="true"></span></button>`;
  prefSheet('a11ySheet', 'a11yTitle', L('a11y'), `
    <div class="sheet-body">
      <div role="group" aria-labelledby="a11yTextL"><div id="a11yTextL" class="field-label">${L('a11yText')}</div>
        <div class="size-grid">${A11Y_TEXT.map(t => `<button type="button" class="size-btn" aria-pressed="${a.text === t}" data-a11y="text-${t}" onclick="changeA11y('text', ${t})">
          <span class="size-a" style="font-size:${(t / 100 * 18).toFixed(1)}px;" aria-hidden="true">Aก</span><span>${L('a11yText' + t)}</span></button>`).join('')}</div></div>
      <div role="group" aria-labelledby="a11yColL"><div id="a11yColL" class="field-label">${L('a11yColors')}</div>
        <div class="size-grid size-grid-3">${A11Y_COLORS.map(c => `<button type="button" class="size-btn" aria-pressed="${a.colors === c}" data-a11y="colors-${c}" onclick="changeA11y('colors', '${c}')">
          <span class="swatches sw-${c}" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>${L({ default: 'a11yDefault', safe: 'a11ySafe', mono: 'a11yMono' }[c])}</span></button>`).join('')}</div>
        <p class="cell-sub" style="margin-top:6px;">${esc(L('a11yColorsHint'))}</p></div>
      <div class="switches">
        ${toggle('contrast', a.contrast, L('a11yContrast'), L('a11yContrastHint'))}
        ${toggle('marks', a.marks || forced, L('a11yMarks'), forced ? L('a11yMarksForced') : L('a11yMarksHint'), forced)}
        ${toggle('motion', a.motion, L('a11yMotion'), L('a11yMotionHint'))}
      </div>
      <div><div class="field-label">${L('a11yPreview')}</div>
        <div class="a11y-preview"><span class="pill pill-approved">${esc(L('approved'))}</span><span class="pill pill-pending">${esc(L('pending'))}</span><span class="pill pill-rejected">${esc(L('rejected'))}</span><span class="pill pill-draft">${esc(L('draft'))}</span></div></div>
      <div class="dialog-foot" style="align-items:center;"><span class="cell-sub" style="margin-right:auto;">${esc(L('a11ySaved'))}</span>
        <button type="button" class="btn btn-secondary" onclick="resetA11y()">${L('a11yReset')}</button></div>
    </div>`);
}

function changeA11y(key, value) {
  setA11y({ [key]: value });
  redrawA11y(typeof value === 'boolean' ? key : key + '-' + value);
}
function resetA11y() { setA11y(A11Y_DEFAULTS); redrawA11y('text-100'); }
function redrawA11y(focusKey) {
  const y = document.querySelector('#a11ySheet .sheet')?.scrollTop || 0;
  openA11y();
  const box = document.querySelector('#a11ySheet .sheet');
  if (box) box.scrollTop = y;
  document.querySelector(`#a11ySheet [data-a11y="${focusKey}"]`)?.focus({ preventScroll: true });
}

// ── Stock pictures ───────────────────────────────────────────
let stockImages = {};          // { itemId: data URL }
const CAT_ICON = { electrical: 'alert', steel: 'box', construction: 'building', maintenance: 'stock', other: 'box' };

function stockImageOf(id) { return isPicture(stockImages[id]) ? stockImages[id] : ''; }

// One fixed square for every item, with or without a picture.
function stockThumb(s, cls = '') {
  const v = s ? stockImageOf(s.id) : '';
  return v
    ? `<span class="thumb ${cls}"><img src="${v}" alt="" loading="lazy"></span>`
    : `<span class="thumb thumb-empty ${cls}" aria-hidden="true">${icon(s && s.category === 'electrical' ? 'image' : CAT_ICON[s && s.category] || 'image', '')}</span>`;
}

function loadStockImages() {
  if (currentRole() === 'sales') return;             // Sales has no Stock page
  if (!firebaseOn()) {
    try { const v = JSON.parse(localStorage.getItem('stockImages') || '{}'); if (v && typeof v === 'object') stockImages = v; } catch (e) {}
    return;
  }
  // Child events: a changed picture downloads that one picture, not all of them.
  const ref = database.ref('stockImages');
  const put = snap => {
    if (!isSafeId(snap.key) || !isPicture(snap.val()) || stockImages[snap.key] === snap.val()) return;
    stockImages[snap.key] = snap.val();
    stockImagesChanged();
  };
  const fail = e => console.warn('stock picture load', e && e.code);
  ref.on('child_added', put, fail);
  ref.on('child_changed', put, fail);
  ref.on('child_removed', snap => { delete stockImages[snap.key]; stockImagesChanged(); }, fail);
}
function stockImagesChanged() { if (currentView === 'stock' || currentView === 'purchases') debouncedRender(); }

async function saveStockImage(id, v) {
  if (firebaseOn()) {
    try { await database.ref('stockImages/' + id).set(v || null); }
    catch (e) { pictureError(e); return false; }
  }
  if (v) stockImages[id] = v; else delete stockImages[id];
  if (!firebaseOn()) { try { localStorage.setItem('stockImages', JSON.stringify(stockImages)); } catch (e) { console.warn('picture not kept', e); } }
  stockImagesChanged();
  return true;
}

// In the Add / Edit item form the picture is only a preview until Save.
let itemPicture = null;        // null = unchanged, '' = remove, data URL = new

function itemPictureField(s) {
  itemPicture = null;
  return `<div class="field"><span class="field-label">${L('itemPicture')}</span><div id="siPic" class="pic-field">${itemPictureInner(s)}</div>
    <span class="cell-sub">${esc(L('imgHint'))}</span></div>`;
}
function itemPictureInner(s) {
  const v = itemPicture === null ? (s ? stockImageOf(s.id) : '') : itemPicture;
  const id = s ? `'${s.id}'` : '';
  return `${v ? `<span class="thumb thumb-lg"><img src="${v}" alt="${esc(L('itemPicture'))}"></span>` : `<span class="thumb thumb-lg thumb-empty" aria-hidden="true">${icon('image', '')}</span>`}
    <span class="acc-btns"><button type="button" class="btn btn-secondary btn-sm" onclick="pickItemPicture(${id})">${icon('image')}${L(v ? 'imgChange' : 'imgAdd')}</button>
    ${v ? `<button type="button" class="btn btn-secondary btn-sm" onclick="clearItemPicture(${id})">${L('imgRemove')}</button>` : ''}</span>`;
}
function redrawItemPicture(id) {
  const el = document.getElementById('siPic');
  if (el) el.innerHTML = itemPictureInner(id ? stockItems.find(x => x.id === id) : null);
}
async function pickItemPicture(id) {
  const v = await choosePicture('contain');
  if (v) { itemPicture = v; redrawItemPicture(id); }
}
function clearItemPicture(id) { itemPicture = ''; redrawItemPicture(id); }
// Called by saveStockItem once the item has an id.
function commitItemPicture(id) {
  const v = itemPicture;
  itemPicture = null;
  if (v === null || (v === '' && !stockImageOf(id))) return Promise.resolve(true);
  return saveStockImage(id, v);
}
