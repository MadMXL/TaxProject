// ═══════════════════════════════════════════════════════════════
// Baigamgab · SmartLedger — Accessibility settings (display only)
//
// Loaded in <head> of index.html and login.html so the settings apply before
// the first paint. No dependencies. The settings sheet itself is in prefs.js.
//
//   text     100 | 115 | 130 | 150   size of all text, in percent
//   colors   default | safe | mono   safe = colour-blind safe, mono = black and white
//   contrast false | true            darker text and stronger lines
//   marks    false | true            a symbol on every status, not only a colour
//   motion   false | true            true = no animation
//
// Kept in this browser for each user (a11y:<uid>), so people who share a
// computer keep their own. 'a11y' is the last one used: the sign-in page, where
// nobody is known yet, and a user's first visit start from it.
// ═══════════════════════════════════════════════════════════════
const A11Y_TEXT = [100, 115, 130, 150];
const A11Y_COLORS = ['default', 'safe', 'mono'];
const A11Y_DEFAULTS = { text: 100, colors: 'default', contrast: false, marks: false, motion: false };

function a11yKey() {
  try { const uid = sessionStorage.getItem('userId'); return uid ? 'a11y:' + uid : 'a11y'; } catch (e) { return 'a11y'; }
}

function getA11y() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(a11yKey()) || localStorage.getItem('a11y') || '{}') || {}; } catch (e) {}
  return {
    text: A11Y_TEXT.includes(saved.text) ? saved.text : A11Y_DEFAULTS.text,
    colors: A11Y_COLORS.includes(saved.colors) ? saved.colors : A11Y_DEFAULTS.colors,
    contrast: saved.contrast === true,
    marks: saved.marks === true,
    motion: saved.motion === true,
  };
}

// These settings bring some status colours closer together, so the symbols are always on with them.
function marksForced(a) { return a.contrast || a.colors !== 'default'; }

function applyA11y(a = getA11y()) {
  const el = document.documentElement;
  el.style.setProperty('--text-scale', a.text / 100);
  el.dataset.text = a.text;
  el.dataset.colors = a.colors;
  el.dataset.contrast = a.contrast ? 'high' : 'normal';
  el.dataset.marks = a.marks || marksForced(a) ? 'on' : 'off';
  el.dataset.motion = a.motion ? 'reduce' : 'full';
}

function setA11y(patch) {
  const a = { ...getA11y(), ...patch };
  try {
    localStorage.setItem(a11yKey(), JSON.stringify(a));
    localStorage.setItem('a11y', JSON.stringify(a));
  } catch (e) {}
  applyA11y(a);
  return a;
}

applyA11y();
