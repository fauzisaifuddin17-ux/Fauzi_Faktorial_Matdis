/* ═══════════════════════════════════════════════════════════
   FACTORIAL VISUALIZER — script.js
   Vanilla JS — No Dependencies
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ─── STATE GLOBAL ────────────────────────────────────────────
const state = {
  method:       'iterative',    // 'iterative' | 'recursive' | 'visual'
  animSpeed:    400,            // ms per langkah
  history:      [],             // [{n, result, method, time, formula, timestamp}]
  isRunning:    false,          // animasi sedang berjalan
  lastN:        null,
  lastResult:   null,
  lastFormula:  null,
  vizTimeout:   null,           // untuk cancel
  stats: { total: 0, maxN: -1, methodCount: { iterative:0, recursive:0, visual:0 } }
};

// ─── PARTIKEL CANVAS ─────────────────────────────────────────
(function initParticles() {
  const canvas  = document.getElementById('particles-canvas');
  const ctx     = canvas.getContext('2d');
  let particles = [];
  const SYMBOLS = ['n!', '∑', '∏', '×', '=', '0!', '!', '∞', 'n'];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function createParticle() {
    return {
      x:      Math.random() * canvas.width,
      y:      canvas.height + 20,
      vx:     (Math.random() - .5) * .5,
      vy:     -(Math.random() * .6 + .2),
      alpha:  Math.random() * .5 + .1,
      size:   Math.random() * 12 + 8,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      hue:    Math.random() > .5 ? '200' : '280'
    };
  }

  for (let i = 0; i < 30; i++) {
    const p = createParticle();
    p.y = Math.random() * canvas.height;
    particles.push(p);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, idx) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = `hsl(${p.hue}, 100%, 70%)`;
      ctx.font        = `${p.size}px 'Orbitron', monospace`;
      ctx.fillText(p.symbol, p.x, p.y);
      ctx.restore();

      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= .0005;

      if (p.y < -20 || p.alpha <= 0) particles[idx] = createParticle();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ─── NAVBAR SCROLL EFFECT ────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

// ─── REVEAL ON SCROLL ─────────────────────────────────────────
(function initReveal() {
  const targets = document.querySelectorAll('.glass-card, .edu-card, .section-header');
  targets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: .1 });
  targets.forEach(el => io.observe(el));
})();

// ─── NAV ACTIVE ON SCROLL ────────────────────────────────────
window.addEventListener('scroll', () => {
  const sections = ['hero','calculator','history','education'];
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 150) current = id;
  });
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
});

// ─── INPUT & SLIDER SYNC ─────────────────────────────────────
const numberInput  = document.getElementById('numberInput');
const numberSlider = document.getElementById('numberSlider');

numberInput.addEventListener('input', () => {
  clearError();
  const v = parseInt(numberInput.value, 10);
  if (!isNaN(v) && v >= 0 && v <= 20) numberSlider.value = v;
  updateSliderFill();
});

numberSlider.addEventListener('input', () => {
  numberInput.value = numberSlider.value;
  clearError();
  updateSliderFill();
});

function updateSliderFill() {
  const pct = (numberSlider.value / 20) * 100;
  numberSlider.style.background =
    `linear-gradient(to right, var(--neon-blue) ${pct}%, rgba(0,212,255,.1) ${pct}%)`;
}
updateSliderFill();

// ─── PILIH METODE ────────────────────────────────────────────
function selectMethod(el) {
  document.querySelectorAll('.method-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  state.method = el.dataset.method;
}

// ─── PILIH KECEPATAN ─────────────────────────────────────────
function setSpeed(el) {
  document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  state.animSpeed = parseInt(el.dataset.speed, 10);
}

// ─── VALIDASI ────────────────────────────────────────────────
function validate(val) {
  if (val === '' || val === null || val === undefined) return 'Input tidak boleh kosong.';
  if (isNaN(val)) return 'Masukkan angka yang valid.';
  const n = parseInt(val, 10);
  if (n < 0)   return 'Angka tidak boleh negatif.';
  if (n > 170) return 'Angka maksimal adalah 170.';
  return null; // valid
}

function showError(msg) {
  const el = document.getElementById('inputError');
  el.textContent = '⚠ ' + msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 500);
  numberInput.style.outline = '1px solid var(--neon-pink)';
  showToast(msg, 'error');
}

function clearError() {
  document.getElementById('inputError').textContent = '';
  numberInput.style.outline = '';
}

// ─── FAKTORIAL (BigInt untuk angka besar) ────────────────────

/** Iteratif — O(n) waktu, O(1) ruang */
function factorialIterative(n) {
  let result = 1n;
  for (let i = 2; i <= n; i++) result *= BigInt(i);
  return result;
}

/** Rekursif — O(n) waktu, O(n) ruang (stack) */
function factorialRecursive(n) {
  if (n <= 1) return 1n;
  return BigInt(n) * factorialRecursive(n - 1);
}

/** Buat string formula: "5! = 5 × 4 × 3 × 2 × 1" */
function buildFormula(n) {
  if (n === 0) return '0! = 1';
  const parts = [];
  for (let i = n; i >= 1; i--) parts.push(i);
  return `${n}! = ${parts.join(' × ')}`;
}

// ─── HITUNG ──────────────────────────────────────────────────
async function calculate() {
  if (state.isRunning) { stopVisualization(); return; }

  const raw = numberInput.value.trim();
  const err = validate(raw);
  if (err) { showError(err); return; }

  const n = parseInt(raw, 10);
  clearError();
  state.isRunning = true;

  const btnCalc = document.getElementById('btnCalculate');
  btnCalc.disabled = false;
  btnCalc.querySelector('.btn-calc-icon').textContent = '■';
  btnCalc.childNodes[1].textContent = ' Stop';

  // Sembunyikan hasil lama
  document.getElementById('resultContent').style.display  = 'none';
  document.getElementById('resultPlaceholder').style.display = 'flex';
  document.getElementById('progressWrap').style.display   = 'block';
  document.getElementById('vizSection').style.display     = 'none';

  const tStart = performance.now();
  let result;

  if (state.method === 'iterative') {
    result = factorialIterative(n);
  } else if (state.method === 'recursive') {
    result = factorialRecursive(n);
  } else {
    result = factorialIterative(n); // visual juga hasilkan via iteratif
  }

  const elapsed = (performance.now() - tStart).toFixed(3);
  const formula  = buildFormula(n);

  state.lastN = n;
  state.lastResult = result;
  state.lastFormula = formula;

  // Tampilkan hasil
  showResult(n, result, formula, elapsed);

  // Simpan history
  addHistory({ n, result, method: state.method, time: elapsed, formula });

  // Visualisasi
  await runVisualization(n, result);

  btnCalc.querySelector('.btn-calc-icon').textContent = '▶';
  btnCalc.childNodes[1].textContent = ' Hitung';
  state.isRunning = false;
}

// ─── TAMPILKAN HASIL ─────────────────────────────────────────
function showResult(n, result, formula, elapsed) {
  document.getElementById('resultPlaceholder').style.display = 'none';
  const content = document.getElementById('resultContent');
  content.style.display = 'block';

  // Animasi counter untuk angka kecil (≤ 20)
  document.getElementById('resultN').textContent = n;
  document.getElementById('metaTime').textContent   = elapsed + ' ms';
  document.getElementById('metaIter').textContent   = n === 0 ? 1 : n;
  document.getElementById('metaDigits').textContent  = result.toString().length;
  document.getElementById('metaMethod').textContent  =
    state.method === 'iterative' ? 'Iteratif' :
    state.method === 'recursive' ? 'Rekursif' : 'Visual';

  // Formula (potong jika terlalu panjang)
  const fShort = formula.length > 120 ? formula.slice(0, 120) + '…' : formula;
  document.getElementById('resultFormula').textContent = fShort;

  // Animasi angka hasil
  const valEl = document.getElementById('resultVal');
  const fullStr = result.toString();
  if (fullStr.length > 50) {
    valEl.textContent = fullStr.slice(0,24) + '…' + fullStr.slice(-8)
      + ` (${fullStr.length} digit)`;
  } else {
    animateCounter(valEl, fullStr);
  }

  // Update stats
  updateStats(n);
}

/** Animasi teks angka satu per satu */
function animateCounter(el, finalStr) {
  if (finalStr.length > 18) { el.textContent = finalStr; return; }
  el.textContent = '';
  let i = 0;
  const iv = setInterval(() => {
    if (i >= finalStr.length) { clearInterval(iv); return; }
    el.textContent += finalStr[i++];
  }, 40);
}

// ─── PROGRESS BAR ────────────────────────────────────────────
function setProgress(pct, info) {
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressPct').textContent  = Math.round(pct) + '%';
  if (info) document.getElementById('progressStepInfo').textContent = info;
}

// ─── VISUALISASI UTAMA ───────────────────────────────────────
async function runVisualization(n, result) {
  const sec = document.getElementById('vizSection');
  sec.style.display = 'block';
  sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  document.getElementById('vizMethodTag').textContent =
    state.method === 'iterative' ? 'Iteratif' :
    state.method === 'recursive' ? 'Rekursif' : 'Visual Loop';

  clearViz();

  if      (state.method === 'iterative') await vizIterative(n);
  else if (state.method === 'recursive') await vizRecursive(n);
  else                                   await vizVisual(n);

  setProgress(100, n === 0 ? '0! = 1 selesai.' : `${n}! = ${result.toString().slice(0,20)}${result.toString().length>20?'…':''} selesai.`);
}

function clearViz() {
  document.getElementById('vizBoxes').innerHTML     = '';
  document.getElementById('vizOperators').innerHTML = '';
  document.getElementById('stepsList').innerHTML    = '';
  document.getElementById('stackFrames').innerHTML  = '';
  document.getElementById('vizStack').style.display = 'none';
  setProgress(0, '');
}

// ─── VIZ: ITERATIF ───────────────────────────────────────────
async function vizIterative(n) {
  if (n === 0) {
    addStepItem(1, 'Base case: 0! = 1', 'complete');
    setProgress(100, '0! = 1');
    return;
  }

  const steps   = [];
  let   acc     = 1n;
  for (let i = 1; i <= n; i++) {
    acc *= BigInt(i);
    steps.push({ i, acc: acc.toString() });
  }

  addStepItem(0, `Inisialisasi: hasil = 1`, 'complete');
  addStepItem(0, `Loop i dari 1 hingga ${n}`, 'complete');

  const boxContainer = document.getElementById('vizBoxes');

  for (let idx = 0; idx < steps.length; idx++) {
    if (!state.isRunning) break;

    const { i, acc } = steps[idx];
    const pct = ((idx + 1) / steps.length) * 100;

    // Tambah kotak
    const wrap = document.createElement('div');
    wrap.className = 'viz-box';
    wrap.style.animationDelay = '0s';

    const numEl = document.createElement('div');
    numEl.className = 'box-num active';
    numEl.textContent = i;

    const lbl = document.createElement('div');
    lbl.className = 'box-label';
    lbl.textContent = `i=${i}`;

    wrap.appendChild(numEl);
    wrap.appendChild(lbl);

    // Tambah operator × sebelum (kecuali pertama)
    if (idx > 0) {
      const op = document.createElement('div');
      op.className = 'viz-op';
      op.textContent = '×';
      op.style.alignSelf = 'center';
      boxContainer.appendChild(op);
    }
    boxContainer.appendChild(wrap);

    // Step detail
    const resultTxt = acc.length > 18 ? acc.slice(0,15)+'…' : acc;
    const stepEl = addStepItem(idx + 1, `i=${i}: hasil = hasil × ${i} = ${resultTxt}`, 'active');
    setProgress(pct, `Langkah ${idx+1} / ${steps.length}: ${i}! menuju ${n}!`);

    await sleep(state.animSpeed);

    // Selesai — ubah status
    numEl.classList.remove('active');
    numEl.classList.add('done');
    if (stepEl) stepEl.className = 'step-item complete';

    // Hapus highlight lama jika terlalu banyak
    if (boxContainer.children.length > 60) {
      boxContainer.removeChild(boxContainer.firstChild);
    }
  }

  addStepItem(n + 1, `Loop selesai. Hasil akhir = ${n}!`, 'complete');
}

// ─── VIZ: REKURSIF ───────────────────────────────────────────
async function vizRecursive(n) {
  const stackEl  = document.getElementById('vizStack');
  const framesEl = document.getElementById('stackFrames');
  stackEl.style.display = 'block';

  // Fase memanggil (descend)
  const calls = [];
  for (let i = n; i >= 0; i--) calls.push(i);

  for (let idx = 0; idx < calls.length; idx++) {
    if (!state.isRunning) return;
    const i = calls[idx];
    const frame = document.createElement('div');
    frame.className = 'stack-frame active';
    frame.id = 'frame-' + i;
    frame.textContent = `factorial(${i})  →  ${i <= 1 ? '1 (base case)' : 'menunggu factorial(' + (i-1) + ')'}`;
    framesEl.appendChild(frame);

    addStepItem(n - i + 1,
      i <= 1 ? `Base case: factorial(0/1) = 1` : `Memanggil: factorial(${i}) = ${i} × factorial(${i-1})`,
      i <= 1 ? 'complete' : 'active');

    setProgress(((n - i + 1) / (2 * (n + 1))) * 100, `Descend: factorial(${i})`);
    await sleep(state.animSpeed);

    // Semua frame sebelumnya jadi tidak aktif
    document.querySelectorAll('.stack-frame').forEach(f => f.classList.remove('active'));
    frame.classList.add('active');
  }

  // Fase return (ascend)
  let acc = 1n;
  for (let i = 1; i <= n; i++) {
    if (!state.isRunning) return;
    acc *= BigInt(i);

    const frame = document.getElementById('frame-' + i);
    if (frame) {
      frame.classList.remove('active');
      frame.classList.add('returning');
      const short = acc.toString().length > 14 ? acc.toString().slice(0,12)+'…' : acc.toString();
      frame.textContent = `factorial(${i})  =  ${short}  ✓`;
    }

    const pct = 50 + ((i / n) * 50);
    setProgress(pct, `Return: factorial(${i}) = ${acc.toString().slice(0,16)}`);
    addStepItem(n + 1 + i, `Return: factorial(${i}) = ${acc.toString().slice(0,16)}`, 'complete');
    await sleep(state.animSpeed);
  }
}

// ─── VIZ: VISUAL LOOP ────────────────────────────────────────
async function vizVisual(n) {
  if (n === 0) {
    addStepItem(1, '0! = 1 (definisi)', 'complete');
    setProgress(100);
    return;
  }

  const boxContainer = document.getElementById('vizBoxes');
  let   acc     = 1n;
  let   total   = n === 0 ? 1 : n;

  // Tampilkan semua kotak sekaligus
  for (let i = 1; i <= n; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'viz-box';
    wrap.style.animationDelay = (i * .04) + 's';

    const numEl = document.createElement('div');
    numEl.className = 'box-num';
    numEl.id = 'vbox-' + i;
    numEl.textContent = i;

    const lbl = document.createElement('div');
    lbl.className = 'box-label';
    lbl.textContent = `n=${i}`;

    wrap.appendChild(numEl);
    wrap.appendChild(lbl);

    if (i > 1) {
      const op = document.createElement('div');
      op.className = 'viz-op';
      op.textContent = '×';
      op.style.alignSelf = 'center';
      op.style.opacity = '.3';
      boxContainer.appendChild(op);
    }
    boxContainer.appendChild(wrap);
  }

  await sleep(state.animSpeed * 1.5);

  // Aktifkan satu per satu
  for (let i = 1; i <= n; i++) {
    if (!state.isRunning) break;

    acc *= BigInt(i);

    // Highlight kotak ini
    const box = document.getElementById('vbox-' + i);
    if (box) {
      box.classList.add('active');
      await sleep(state.animSpeed);
      box.classList.remove('active');
      box.classList.add('done');
    }

    const accStr = acc.toString().length > 14 ? acc.toString().slice(0,12)+'…' : acc.toString();
    addStepItem(i, `Mengalikan × ${i} → hasil = ${accStr}`, 'complete');
    setProgress((i / n) * 100, `Kalkulasi ${i}/${n}: akumulasi = ${accStr}`);

    await sleep(state.animSpeed * .5);
  }
}

// ─── HELPER STEP ITEM ────────────────────────────────────────
function addStepItem(num, text, status) {
  const list = document.getElementById('stepsList');
  const item = document.createElement('div');
  item.className = `step-item ${status}`;

  const numEl = document.createElement('span');
  numEl.className = 'step-num';
  numEl.textContent = num;

  const txt = document.createElement('span');
  txt.textContent = text;

  item.appendChild(numEl);
  item.appendChild(txt);
  list.appendChild(item);
  item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  return item;
}

// ─── SLEEP ───────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── STOP / REPLAY ───────────────────────────────────────────
function stopVisualization() {
  state.isRunning = false;
  const btnCalc = document.getElementById('btnCalculate');
  btnCalc.querySelector('.btn-calc-icon').textContent = '▶';
  btnCalc.childNodes[1].textContent = ' Hitung';
}

function replayVisualization() {
  if (state.lastN === null) return;
  numberInput.value = state.lastN;
  calculate();
}

// ─── RANDOM ──────────────────────────────────────────────────
function randomNumber() {
  const n = Math.floor(Math.random() * 21);
  numberInput.value = n;
  numberSlider.value = n;
  updateSliderFill();
  clearError();
  showToast(`Angka random: ${n}`, 'info');
}

// ─── RESET ───────────────────────────────────────────────────
function resetAll() {
  stopVisualization();
  numberInput.value  = '';
  numberSlider.value = 0;
  updateSliderFill();
  clearError();
  document.getElementById('resultContent').style.display    = 'none';
  document.getElementById('resultPlaceholder').style.display = 'flex';
  document.getElementById('progressWrap').style.display     = 'none';
  document.getElementById('vizSection').style.display       = 'none';
  state.lastN = null;
  state.lastResult = null;
  state.lastFormula = null;
  showToast('Reset berhasil', 'info');
}

// ─── COPY ────────────────────────────────────────────────────
function copyResult() {
  if (!state.lastResult) return;
  const txt = `${state.lastN}! = ${state.lastResult.toString()}`;
  navigator.clipboard.writeText(txt).then(() => showToast('Hasil disalin!', 'success'));
}
function copyFormula() {
  if (!state.lastFormula) return;
  navigator.clipboard.writeText(state.lastFormula)
    .then(() => showToast('Formula disalin!', 'success'));
}

// ─── HISTORY ─────────────────────────────────────────────────
function addHistory({ n, result, method, time, formula }) {
  const entry = {
    n, result: result.toString(), method, time, formula,
    timestamp: new Date().toLocaleTimeString()
  };
  state.history.unshift(entry);
  if (state.history.length > 50) state.history.pop();
  renderHistory();
}

function renderHistory() {
  const list  = document.getElementById('historyList');
  const count = document.getElementById('historyCount');
  count.textContent = state.history.length + ' Entri';

  if (!state.history.length) {
    list.innerHTML = `
      <div class="history-empty">
        <span class="empty-icon">📋</span>
        <p>Belum ada riwayat perhitungan</p>
      </div>`;
    return;
  }

  list.innerHTML = state.history.map((e, i) => {
    const resultShort = e.result.length > 20
      ? e.result.slice(0,18) + '…'
      : e.result;
    const formulaShort = e.formula.length > 50
      ? e.formula.slice(0,48) + '…'
      : e.formula;
    const methodLabel = e.method === 'iterative' ? 'Iteratif' :
                        e.method === 'recursive' ? 'Rekursif' : 'Visual';
    return `
      <div class="history-item" onclick="reuseHistory(${i})" title="Klik untuk gunakan kembali">
        <div class="h-badge">${e.n}!</div>
        <div class="h-info">
          <div class="h-equation">${e.n}! = ${resultShort}</div>
          <div class="h-meta">
            <span class="h-method-tag ${e.method}">${methodLabel}</span>
            <span>${e.time} ms</span>
            <span>${e.result.length} digit</span>
          </div>
        </div>
        <div class="h-time">${e.timestamp}</div>
      </div>`;
  }).join('');
}

function reuseHistory(idx) {
  const e = state.history[idx];
  if (!e) return;
  numberInput.value = e.n;
  numberSlider.value = Math.min(e.n, 20);
  updateSliderFill();
  // Pilih method
  document.querySelectorAll('.method-card').forEach(c => {
    c.classList.toggle('active', c.dataset.method === e.method);
  });
  state.method = e.method;
  showToast(`Dimuat: ${e.n}! dengan metode ${e.method}`, 'info');
  document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
}

function clearHistory() {
  state.history = [];
  renderHistory();
  showToast('Riwayat dihapus', 'info');
}

// ─── STATISTIK ───────────────────────────────────────────────
function updateStats(n) {
  state.stats.total++;
  state.stats.methodCount[state.method]++;
  if (n > state.stats.maxN) state.stats.maxN = n;

  document.getElementById('statTotal').textContent = state.stats.total;
  document.getElementById('statMax').textContent   =
    state.stats.maxN >= 0 ? state.stats.maxN + '!' : '—';

  // Metode favorit
  const mc = state.stats.methodCount;
  const fav = Object.entries(mc).sort((a,b) => b[1]-a[1])[0];
  const favLabel = fav[0] === 'iterative' ? 'Iter' :
                   fav[0] === 'recursive' ? 'Rekur' : 'Visual';
  document.getElementById('statMethod').textContent = fav[1] > 0 ? favLabel : '—';
}

// ─── TOAST NOTIFICATIONS ─────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success:'✓', error:'✕', info:'ℹ' };
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// ─── TOMBOL CLEAR INPUT ──────────────────────────────────────
document.getElementById('btnClear').addEventListener('click', () => {
  numberInput.value = '';
  clearError();
  numberInput.focus();
});

// ─── KEYBOARD SHORTCUT ───────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement === numberInput) calculate();
  if (e.key === 'Escape') resetAll();
});

// ─── INIT ────────────────────────────────────────────────────
(function init() {
  renderHistory();
  // Set slider fill awal
  updateSliderFill();
  // Tampilkan welcome toast setelah sebentar
  setTimeout(() => showToast('Selamat datang di FactorialLab! 🚀', 'info'), 800);
})();