<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<title>Shot Timer</title>
<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0; padding: 0;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
}
html, body { height: 100%; background: #0d0d0d; }
body {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

/* ── Header ── */
#header {
  text-align: center;
  padding-top: max(env(safe-area-inset-top), 14px);
  padding-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #3a3a3a;
  text-transform: uppercase;
  flex-shrink: 0;
}

/* ── Mode toggle ── */
#mode-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px 14px 4px;
  flex-shrink: 0;
}
.mode-btn {
  flex: 1;
  max-width: 140px;
  height: 36px;
  border: 1.5px solid #2a2a2a;
  border-radius: 10px;
  background: #181818;
  color: #555;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  -webkit-appearance: none;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.mode-btn.active {
  background: #222;
  color: #fff;
  border-color: #555;
}
.mode-btn:disabled { opacity: 0.3; }

/* ── Sensitivity row ── */
#sens-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 18px;
  flex-shrink: 0;
}
#sens-row label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: #555;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}
#sens-slider {
  flex: 1;
  -webkit-appearance: none;
  height: 4px;
  border-radius: 2px;
  background: #2a2a2a;
  outline: none;
}
#sens-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #4ade80;
  cursor: pointer;
}
#sens-val {
  font-size: 12px;
  font-weight: 600;
  color: #4ade80;
  width: 28px;
  text-align: right;
  flex-shrink: 0;
}
#btn-cal {
  height: 28px; padding: 0 10px;
  border: 1.5px solid #4ade80; border-radius: 8px;
  background: transparent; color: #4ade80;
  font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; cursor: pointer;
  -webkit-appearance: none; flex-shrink: 0;
  transition: background 0.15s;
}
#btn-cal:disabled { opacity: 0.3; }
#btn-cal.listening { background: rgba(74,222,128,0.13); }

/* ── Time display ── */
#display-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 20px 8px;
  flex-shrink: 0;
}
#time-display {
  font-size: clamp(68px, 21vw, 108px);
  font-weight: 100;
  letter-spacing: -3px;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
  color: #ddd;
  line-height: 1;
}
#time-display.state-waiting {
  font-size: clamp(34px, 10vw, 52px);
  font-weight: 300;
  letter-spacing: 3px;
  color: #f59e0b;
  animation: pulse 0.75s ease-in-out infinite alternate;
}
#time-display.state-running { color: #4ade80; }
#time-display.state-stopped { color: #64748b; }

@keyframes pulse { from { opacity: 1; } to { opacity: 0.45; } }
@keyframes flash { 0% { opacity:1; } 45% { opacity:0.15; } 100% { opacity:1; } }
.flash-anim { animation: flash 0.13s ease-out; }

#status-line {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #444;
  text-transform: uppercase;
  min-height: 16px;
  text-align: center;
}

/* ── Mic level bar ── */
#mic-bar-wrap {
  width: 80%;
  max-width: 300px;
  height: 6px;
  background: #1a1a1a;
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}
#mic-bar {
  height: 100%;
  width: 0%;
  background: #4ade80;
  border-radius: 3px;
  transition: width 0.05s, background 0.1s;
}

/* ── Splits ── */
#splits-wrap {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 14px;
}
#splits-list { display: flex; flex-direction: column; gap: 7px; padding-bottom: 10px; }
.split-row {
  display: flex;
  align-items: center;
  background: #181818;
  border: 1px solid #232323;
  border-radius: 14px;
  padding: 11px 16px;
}
.split-label {
  font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
  color: #444; text-transform: uppercase; width: 46px; flex-shrink: 0;
}
.split-time {
  flex: 1;
  font-size: clamp(22px, 7vw, 30px);
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
  color: #ddd;
}
.split-row:first-child .split-time { color: #4ade80; }
.split-delta { font-size: 13px; color: #444; width: 68px; text-align: right; font-variant-numeric: tabular-nums; }

/* ── Hint ── */
#tap-hint {
  text-align: center;
  font-size: 11px;
  letter-spacing: 2px;
  color: #2e2e2e;
  padding: 5px 0 2px;
  text-transform: uppercase;
  flex-shrink: 0;
  min-height: 22px;
}

/* ── Buttons ──
   No display:none in CSS — JS controls visibility exclusively via inline style.
──────────────────────────────────────────────────────────── */
#btn-area {
  display: flex;
  gap: 10px;
  padding: 10px 14px;
  padding-bottom: max(env(safe-area-inset-bottom), 20px);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}
.btn {
  height: 80px;
  border: none;
  border-radius: 20px;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  -webkit-appearance: none;
  flex: 1;
}
.btn:active { opacity: 0.75; transform: scale(0.97); }
#btn-start  { background: #16a34a; color: #fff; }
#btn-stop   { background: #dc2626; color: #fff; }
#btn-cancel { background: #1e1e1e; color: #666; border: 1px solid #2e2e2e; font-size: 15px; font-weight: 700; letter-spacing: 1px; flex: 0 0 88px; }
#btn-reset  { background: #1e1e1e; color: #ef4444; border: 1px solid #2e2e2e; font-size: 15px; font-weight: 700; letter-spacing: 1px; }

/* ── Tap overlay ── */
#tap-overlay {
  position: fixed; inset: 0;
  z-index: 5;
  background: transparent;
}

/* ── Help modal ── */
#modal-backdrop {
  position: fixed; inset: 0;
  z-index: 100;
  background: rgba(0,0,0,0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
#modal {
  background: #161616;
  border: 1px solid #2a2a2a;
  border-radius: 24px;
  padding: 28px 24px 24px;
  max-width: 380px;
  width: 100%;
}
#modal h1 {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #fff;
  margin-bottom: 4px;
}
#modal .modal-sub {
  font-size: 12px;
  color: #555;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 20px;
}
#modal .section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 8px;
  margin-top: 18px;
}
#modal ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
#modal ul li {
  font-size: 14px;
  color: #aaa;
  line-height: 1.5;
  padding-left: 16px;
  position: relative;
}
#modal ul li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: #333;
}
#modal ul li strong {
  color: #e0e0e0;
  font-weight: 600;
}
#modal-dismiss {
  margin-top: 24px;
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 16px;
  background: #4ade80;
  color: #000;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  -webkit-appearance: none;
}
#modal-dismiss:active { opacity: 0.8; }
</style>
</head>
<body>

<div id="modal-backdrop">
  <div id="modal">
    <h1>Shot Timer</h1>
    <div class="modal-sub">Shooting sports practice tool</div>

    <div class="section-label">How it works</div>
    <ul>
      <li>Tap <strong>Start</strong> — after a random 1–4 s delay a loud beep fires as the start signal.</li>
      <li>Your <strong>reaction time</strong> is the elapsed time from the beep to your first recorded shot.</li>
      <li><strong>Follow-up shot times</strong> appear as split rows below, each showing total time and the gap since the previous shot.</li>
      <li>Tap <strong>Stop</strong> at any point to freeze the display and review your splits.</li>
    </ul>

    <div class="section-label">Modes</div>
    <ul>
      <li><strong>Tap</strong> — tap anywhere on screen after each shot to log the time manually.</li>
      <li><strong>Mic</strong> — the microphone listens for gunshots and records splits automatically. Use the sensitivity slider to tune the detection threshold.</li>
    </ul>

    <button id="modal-dismiss">Got it</button>
  </div>
</div>

<div id="header">Shot Timer</div>

<div id="mode-row">
  <button class="mode-btn"        id="mode-tap">&#9654; Tap</button>
  <button class="mode-btn active" id="mode-mic">&#127908; Mic</button>
</div>

<div id="sens-row" style="display:flex">
  <label>Sensitivity</label>
  <input type="range" id="sens-slider" min="1" max="100" value="55">
  <span id="sens-val">55</span>
  <button id="btn-cal">Cal</button>
</div>

<div id="display-area">
  <div id="time-display">0.00</div>
  <div id="status-line">Ready</div>
  <div id="mic-bar-wrap" style="display:none"><div id="mic-bar"></div></div>
</div>

<div id="splits-wrap">
  <div id="splits-list"></div>
</div>

<div id="tap-hint"></div>

<div id="btn-area">
  <button class="btn" id="btn-start">Start</button>
  <button class="btn" id="btn-stop"  style="display:none">Stop</button>
  <button class="btn" id="btn-cancel" style="display:none">Cancel</button>
  <button class="btn" id="btn-reset" style="display:none">Reset</button>
</div>

<div id="tap-overlay" style="display:none"></div>

<script>
// ── State ──────────────────────────────────────────────────────────────
let appState  = 'idle';  // idle | waiting | running | stopped
let micMode   = true;   // mic is the default mode
let startTime = 0;
let splits    = [];
let rafId     = null;
let waitTimer = null;

// Calibration
let calActive   = false;
let calStream   = null;
let calSource   = null;
let calAnalyser = null;
let calBuf      = null;
let calPeak     = 0;
let calRafId    = null;
let calTimeout  = null;
let calCountId  = null;
let calSecsLeft = 0;
const CAL_DURATION = 5; // seconds

// Audio
let audioCtx    = null;
// Mic detection
let micStream   = null;
let micSource   = null;
let micAnalyser = null;
let micBuf      = null;
let micPollId   = null;
let lastDetect  = 0;
const LOCKOUT_MS = 100;

// ── Elements ───────────────────────────────────────────────────────────
const elTime      = document.getElementById('time-display');
const elStatus    = document.getElementById('status-line');
const elSplits    = document.getElementById('splits-list');
const elHint      = document.getElementById('tap-hint');
const elOverlay   = document.getElementById('tap-overlay');
const elSensRow   = document.getElementById('sens-row');
const elSensSlide = document.getElementById('sens-slider');
const elSensVal   = document.getElementById('sens-val');
const elMicWrap   = document.getElementById('mic-bar-wrap');
const elMicBar    = document.getElementById('mic-bar');
const btnStart    = document.getElementById('btn-start');
const btnStop     = document.getElementById('btn-stop');
const btnCancel   = document.getElementById('btn-cancel');
const btnReset    = document.getElementById('btn-reset');
const btnModeTap  = document.getElementById('mode-tap');
const btnModeMic  = document.getElementById('mode-mic');
const btnCal      = document.getElementById('btn-cal');

// ── Helpers ─────────────────────────────────────────────────────────────
// Always set display explicitly — never rely on CSS defaults.
function show(el, displayVal) { el.style.display = displayVal || 'block'; }
function hide(el)              { el.style.display = 'none'; }
function fmt(ms)               { return (ms / 1000).toFixed(2); }

// ── Audio context ───────────────────────────────────────────────────────
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// Must be called synchronously inside a user-gesture handler.
// Plays a silent 1-sample buffer — the standard iOS Safari trick to fully
// unlock the audio pipeline so that later (non-gesture) calls work.
function unlockAudio() {
  const ctx = ensureAudio();
  try {
    const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  } catch(e) {}
}

function playBeep() {
  const ctx = ensureAudio();
  const t   = ctx.currentTime;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -6;
  comp.knee.value      = 2;
  comp.ratio.value     = 20;
  comp.attack.value    = 0.001;
  comp.release.value   = 0.08;
  comp.connect(ctx.destination);
  [[880, 'sawtooth', 1.8], [440, 'square', 0.7]].forEach(([freq, type, vol]) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(comp);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.55, t + 0.35);
    gain.gain.setValueAtTime(0,   t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.008);
    gain.gain.setValueAtTime(vol, t + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.start(t);
    osc.stop(t + 0.5);
  });
}

// ── Microphone ──────────────────────────────────────────────────────────
function sensitivityToThreshold(s) {
  // sensitivity 1-100 → amplitude threshold 120-3 (lower = easier to trigger)
  return Math.round(120 - (s / 100) * 117);
}

// micStream must already be obtained in the user-gesture handler (START tap).
// This function just wires up the analyser and starts polling.
function startMic() {
  if (!micStream) { elStatus.textContent = 'No mic stream'; return; }
  const ctx = ensureAudio();
  micSource   = ctx.createMediaStreamSource(micStream);
  micAnalyser = ctx.createAnalyser();
  micAnalyser.fftSize = 512;
  micBuf = new Uint8Array(micAnalyser.frequencyBinCount);
  micSource.connect(micAnalyser);
  pollMic();
}

function pollMic() {
  if (appState !== 'running') return;
  micAnalyser.getByteTimeDomainData(micBuf);
  let peak = 0;
  for (let i = 0; i < micBuf.length; i++) {
    const amp = Math.abs(micBuf[i] - 128);
    if (amp > peak) peak = amp;
  }
  // Update level bar
  const pct = Math.min(100, (peak / 128) * 100);
  elMicBar.style.width = pct + '%';
  elMicBar.style.background = pct > 60 ? '#ef4444' : pct > 30 ? '#f59e0b' : '#4ade80';

  const threshold = sensitivityToThreshold(parseInt(elSensSlide.value));
  const now = performance.now();
  if (peak >= threshold && (now - lastDetect) > LOCKOUT_MS) {
    lastDetect = now;
    recordSplit();
  }
  micPollId = requestAnimationFrame(pollMic);
}

function stopMic() {
  if (micPollId) { cancelAnimationFrame(micPollId); micPollId = null; }
  if (micSource) { micSource.disconnect(); micSource = null; }
  if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
  micAnalyser = null;
  micBuf      = null;
  lastDetect  = 0;
  elMicBar.style.width = '0%';
}

// ── Timer display loop ──────────────────────────────────────────────────
function tick() {
  if (appState !== 'running') return;
  elTime.textContent = fmt(performance.now() - startTime);
  rafId = requestAnimationFrame(tick);
}

// ── Splits ──────────────────────────────────────────────────────────────
function recordSplit() {
  if (appState !== 'running') return;
  const elapsed = performance.now() - startTime;
  const prev    = splits.length ? splits[splits.length - 1].elapsed : 0;
  splits.push({ elapsed, delta: elapsed - prev });
  renderSplits();
  elTime.classList.remove('flash-anim');
  void elTime.offsetWidth;
  elTime.classList.add('flash-anim');
}

function renderSplits() {
  elSplits.innerHTML = '';
  splits.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'split-row';
    const lbl   = document.createElement('div'); lbl.className = 'split-label'; lbl.textContent = `S${i + 1}`;
    const time  = document.createElement('div'); time.className = 'split-time'; time.textContent = fmt(s.elapsed);
    const delta = document.createElement('div'); delta.className = 'split-delta'; delta.textContent = i > 0 ? `+${fmt(s.delta)}` : '';
    row.append(lbl, time, delta);
    elSplits.appendChild(row);
  });
  document.getElementById('splits-wrap').scrollTop = 9999;
}

// ── State machine ────────────────────────────────────────────────────────
function enterIdle() {
  appState = 'idle';
  if (rafId)     { cancelAnimationFrame(rafId); rafId = null; }
  if (waitTimer) { clearTimeout(waitTimer); waitTimer = null; }
  stopMic();
  splits = []; startTime = 0;

  elTime.className = '';
  elTime.textContent = '0.00';
  elStatus.textContent = 'Ready';
  elHint.textContent = '';
  elSplits.innerHTML = '';
  hide(elOverlay);
  hide(elMicWrap);

  show(btnStart, 'block');
  hide(btnStop); hide(btnCancel); hide(btnReset);
  btnStart.disabled = false;
  btnModeTap.disabled = false;
  btnModeMic.disabled = false;
  btnCal.disabled = false;
}

function enterWaiting() {
  appState = 'waiting';
  splits = [];

  elTime.className = 'state-waiting';
  elTime.textContent = 'READY...';
  elStatus.textContent = 'Wait for the beep';
  elHint.textContent = '';
  elSplits.innerHTML = '';
  hide(elOverlay);
  hide(elMicWrap);

  hide(btnStart); hide(btnStop); hide(btnReset);
  show(btnCancel, 'block');
  btnModeTap.disabled = true;
  btnModeMic.disabled = true;
  btnCal.disabled = true;

  const delay = 1000 + Math.random() * 3000;
  waitTimer = setTimeout(() => {
    playBeep();
    startTime = performance.now();
    enterRunning();
  }, delay);
}

function enterRunning() {
  appState = 'running';

  elTime.className = 'state-running';
  elTime.textContent = '0.00';

  hide(btnStart); hide(btnCancel); hide(btnReset);
  show(btnStop, 'block');

  if (micMode) {
    elStatus.textContent = 'Listening for shots';
    elHint.textContent = '— mic active —';
    hide(elOverlay);
    show(elMicWrap, 'block');
    startMic();
  } else {
    elStatus.textContent = 'Tap screen for shots';
    elHint.textContent = '— tap anywhere —';
    show(elOverlay, 'block');
    hide(elMicWrap);
  }

  tick();
}

function enterStopped() {
  appState = 'stopped';
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  stopMic();

  const elapsed = performance.now() - startTime;
  elTime.className = 'state-stopped';
  elTime.textContent = fmt(elapsed);
  const n = splits.length;
  elStatus.textContent = n ? `${n} shot${n !== 1 ? 's' : ''} recorded` : 'Stopped';
  elHint.textContent = '';
  hide(elOverlay);
  hide(elMicWrap);

  hide(btnStart); hide(btnStop); hide(btnCancel);
  show(btnReset, 'block');
  btnReset.style.flex = '1';
  btnModeTap.disabled = false;
  btnModeMic.disabled = false;
}

// ── Calibration ──────────────────────────────────────────────────────────
function pollCal() {
  if (!calActive) return;
  calAnalyser.getByteTimeDomainData(calBuf);
  let peak = 0;
  for (let i = 0; i < calBuf.length; i++) {
    const amp = Math.abs(calBuf[i] - 128);
    if (amp > peak) peak = amp;
  }
  const pct = Math.min(100, (peak / 128) * 100);
  elMicBar.style.width = pct + '%';
  elMicBar.style.background = pct > 60 ? '#ef4444' : pct > 30 ? '#f59e0b' : '#4ade80';
  if (peak > calPeak) calPeak = peak;
  calRafId = requestAnimationFrame(pollCal);
}

function finishCalibration() {
  calActive = false;
  if (calRafId)   { cancelAnimationFrame(calRafId); calRafId = null; }
  if (calCountId) { clearInterval(calCountId);      calCountId = null; }
  if (calTimeout) { clearTimeout(calTimeout);       calTimeout = null; }
  if (calSource)  { calSource.disconnect();         calSource = null; }
  if (calStream)  { calStream.getTracks().forEach(t => t.stop()); calStream = null; }
  calAnalyser = null; calBuf = null;

  // If a session started while calibration was running, leave all UI alone.
  if (appState !== 'idle') return;

  elMicBar.style.width = '0%';
  hide(elMicWrap);
  btnCal.disabled = false;
  btnCal.classList.remove('listening');
  btnStart.disabled = false;
  btnModeTap.disabled = false;
  btnModeMic.disabled = false;

  if (calPeak > 5) {
    // threshold = 80% of peak; invert sensitivityToThreshold formula
    const thr = Math.max(3, Math.round(calPeak * 0.80));
    let s = Math.round((120 - thr) / 117 * 100);
    s = Math.max(1, Math.min(100, s));
    elSensSlide.value     = s;
    elSensVal.textContent = s;
    elStatus.textContent  = 'Sensitivity set';
  } else {
    elStatus.textContent = 'No shot detected';
  }
  elHint.textContent = '';
}

// ── Button wiring ────────────────────────────────────────────────────────
// Use touchend on iOS — it's a confirmed user-gesture for AudioContext
// unlock AND getUserMedia. preventDefault stops the synthetic click.
function wire(el, fn) {
  el.addEventListener('touchend', e => { e.preventDefault(); fn(); }, { passive: false });
  el.addEventListener('click', fn); // desktop/mouse fallback only
}

// START: async so we can await mic permission, but BOTH critical calls
// (unlockAudio and getUserMedia) happen synchronously before the first await,
// preserving the user-gesture activation that iOS Safari requires.
wire(btnStart, async () => {
  if (appState !== 'idle') return;

  // 1. Unlock AudioContext while still inside the user-gesture handler.
  unlockAudio();

  if (micMode) {
    elStatus.textContent = 'Allow mic access…';
    btnStart.disabled = true;
    try {
      // getUserMedia() call is synchronous here (before any await),
      // so iOS grants permission. The await just waits for the dialog.
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch(e) {
      elStatus.textContent = 'Mic access denied';
      btnStart.disabled = false;
      return;
    }
  }

  enterWaiting();
});

wire(btnStop, () => {
  if (appState === 'running') enterStopped();
});

wire(btnCancel, () => {
  if (appState === 'waiting') enterIdle();
});

wire(btnReset, () => {
  btnReset.style.flex = '';
  enterIdle();
});

wire(btnCal, async () => {
  if (appState !== 'idle' || calActive) return;
  unlockAudio();
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      video: false
    });
  } catch(e) {
    elStatus.textContent = 'Mic access denied';
    return;
  }
  calActive = true; calPeak = 0; calSecsLeft = CAL_DURATION;
  calStream = stream;
  const ctx   = ensureAudio();
  calSource   = ctx.createMediaStreamSource(calStream);
  calAnalyser = ctx.createAnalyser();
  calAnalyser.fftSize = 2048; // 46 ms window at 44 kHz — no gaps between 60 fps polls
  calBuf = new Uint8Array(calAnalyser.fftSize);
  calSource.connect(calAnalyser);

  btnCal.disabled   = true;
  btnCal.classList.add('listening');
  btnStart.disabled   = true;  // prevent starting a session mid-calibration
  btnModeTap.disabled = true;
  btnModeMic.disabled = true;

  elStatus.textContent = 'Fire a shot!';
  elHint.textContent   = `— ${calSecsLeft}s —`;
  show(elMicWrap, 'block');

  calCountId = setInterval(() => {
    calSecsLeft--;
    if (calSecsLeft > 0) elHint.textContent = `— ${calSecsLeft}s —`;
  }, 1000);
  calTimeout = setTimeout(finishCalibration, CAL_DURATION * 1000);
  pollCal();
});

// Mode toggle
wire(btnModeTap, () => {
  if (appState !== 'idle') return;
  micMode = false;
  btnModeTap.classList.add('active');
  btnModeMic.classList.remove('active');
  hide(elSensRow);
});

wire(btnModeMic, () => {
  if (appState !== 'idle') return;
  micMode = true;
  btnModeMic.classList.add('active');
  btnModeTap.classList.remove('active');
  show(elSensRow, 'flex');
});

// Sensitivity slider
elSensSlide.addEventListener('input', () => {
  elSensVal.textContent = elSensSlide.value;
});

// ── Tap overlay for shot recording ────────────────────────────────────────
function aboveBtnArea(y) {
  return y < document.getElementById('btn-area').getBoundingClientRect().top;
}
elOverlay.addEventListener('touchstart', e => {
  e.preventDefault();
  if (aboveBtnArea(e.touches[0].clientY)) recordSplit();
}, { passive: false });
elOverlay.addEventListener('click', e => {
  if (aboveBtnArea(e.clientY)) recordSplit();
});

// ── Help modal dismiss ────────────────────────────────────────────────────
const modalBackdrop = document.getElementById('modal-backdrop');
const modalDismiss  = document.getElementById('modal-dismiss');
function closeModal() { hide(modalBackdrop); }
modalDismiss.addEventListener('touchend', e => { e.preventDefault(); closeModal(); }, { passive: false });
modalDismiss.addEventListener('click', closeModal);

// Re-resume AudioContext when page comes back into view (e.g. after screen
// lock or app-switch). iOS suspends the context on backgrounding.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && audioCtx) audioCtx.resume();
});

// ── Init ──────────────────────────────────────────────────────────────────
enterIdle();
</script>
</body>
</html>
