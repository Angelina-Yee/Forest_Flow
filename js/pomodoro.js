//local Storage
const DEFAULT_DURATIONS = { work: 25, short: 5, long: 10 };
const STORAGE_KEY = "pomodoroDurations";

function loadDurations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DURATIONS };
    const parsed = JSON.parse(raw);
    return {
      work: Number(parsed.work)  || DEFAULT_DURATIONS.work,
      short: Number(parsed.short) || DEFAULT_DURATIONS.short,
      long: Number(parsed.long)   || DEFAULT_DURATIONS.long,
    };
  } catch {
    return { ...DEFAULT_DURATIONS };
  }
}
function saveDurations(durs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(durs));
}

let DURATIONS = loadDurations();

//States
let secondsLeft = DURATIONS.work * 60;
let running     = false;
let loopMode    = false;
let currentBlock = "work";
let tickId      = null;
let alarmLock   = false;

//Elements
const minEye = document.getElementById("minEyes");
const secEye = document.getElementById("secEyes");
const srTimer = document.getElementById("srTimer");

const playBtn  = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");

const pomodoroBtn = document.getElementById("pomodoroBtn");
const shortBtn    = document.getElementById("shortBtn");
const longBtn     = document.getElementById("longBtn");
const loopBtn     = document.getElementById("loopBtn");

//Custom Timer UI
const customBtn   = document.getElementById("customBtn");
const customModal = document.getElementById("customModal");
const customForm  = document.getElementById("customForm");
const inWork      = document.getElementById("inWork");
const inShort     = document.getElementById("inShort");
const inLong      = document.getElementById("inLong");

//Utilities
function pad2(n) { return String(n).padStart(2, "0"); }

function renderDigits() {
  const mins = Math.max(0, Math.floor(secondsLeft / 60));
  const secs = Math.max(0, secondsLeft % 60);
  if (minEye) minEye.textContent = pad2(mins);
  if (secEye) secEye.textContent = pad2(secs);
  if (srTimer) srTimer.textContent = `${pad2(mins)}:${pad2(secs)}`;
}

function setPressed(el, pressed) {
  if (el) el.setAttribute("aria-pressed", String(pressed));
}

function updatePressedStates() {
  // thought bubbles
  setPressed(playBtn,  running);
  setPressed(pauseBtn, !running);

  //pill buttons
  setPressed(pomodoroBtn, currentBlock === "work");
  setPressed(shortBtn,     currentBlock === "short");
  setPressed(longBtn,      currentBlock === "long");

  //loop button
  setPressed(loopBtn, loopMode);
}

//Alarm helpers
function getAlarmEl() {
  return document.getElementById("alarmSound");
}
function stopAlarm() {
  const alarm = getAlarmEl();
  if (!alarm) return;
  alarm.pause();
  alarm.currentTime = 0;
}

//Timer logic
function handleTimeUp() {
  if (!alarmLock) {
    const alarm = getAlarmEl();
    if (alarm) {
      alarm.currentTime = 0;
      alarm.play().catch(() => {});
    }
    alarmLock = true;
  }

  stop();

  if (loopMode) {
    if (currentBlock === "work") {
      setMode("short");
      start();
    } else {
      setMode("work");
      start();
    }
  }
}

function tick() {
  if (secondsLeft <= 0) {
    handleTimeUp();
    return;
  }
  secondsLeft = Math.max(0, secondsLeft - 1);
  renderDigits();
  if (secondsLeft === 0) handleTimeUp();
}

function start() {
  if (running) return;
  running = true;
  alarmLock = false;
  renderDigits();
  updatePressedStates();
  tickId = setInterval(tick, 1000);
}

function stop() {
  if (!running && tickId == null) { updatePressedStates(); return; }
  running = false;
  clearInterval(tickId);
  tickId = null;
  updatePressedStates();
}

function setMode(mode) {
  stopAlarm();
  alarmLock = false;

  currentBlock = mode;
  const mins = DURATIONS[mode];
  secondsLeft = mins * 60;
  stop();
  renderDigits();
  updatePressedStates();
}

function openCustomModal() {
  if (!customModal) return;
  inWork.value  = DURATIONS.work;
  inShort.value = DURATIONS.short;
  inLong.value  = DURATIONS.long;

  customModal.hidden = false;
  customModal.setAttribute("aria-hidden", "false");
  inWork.focus();

  document.addEventListener("keydown", escCloseHandler);
}
function closeCustomModal() {
  if (!customModal) return;
  customModal.hidden = true;
  customModal.setAttribute("aria-hidden", "true");
  document.removeEventListener("keydown", escCloseHandler);
}
function escCloseHandler(e) {
  if (e.key === "Escape") closeCustomModal();
}

customModal?.addEventListener("click", (e) => {
  if (e.target.closest("[data-close-modal]")) closeCustomModal();
});

//Events
playBtn?.addEventListener("click", start);
pauseBtn?.addEventListener("click", stop);

pomodoroBtn?.addEventListener("click", () => setMode("work"));
shortBtn?.addEventListener("click",    () => setMode("short"));
longBtn?.addEventListener("click",     () => setMode("long"));

loopBtn?.addEventListener("click", () => {
  loopMode = !loopMode;
  updatePressedStates();
});

customBtn?.addEventListener("click", openCustomModal);

customForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const w = clampInt(inWork.value,  1, 180);
  const s = clampInt(inShort.value, 1, 180);
  const l = clampInt(inLong.value,  1, 180);

  DURATIONS = { work: w, short: s, long: l };
  saveDurations(DURATIONS);

  const wasRunning = running;
  stop();
  secondsLeft = DURATIONS[currentBlock] * 60;
  renderDigits();
  if (wasRunning) start();

  if (srTimer) srTimer.textContent = `Saved custom durations. Work ${w} minutes, short ${s}, long ${l}.`;
  closeCustomModal();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    running ? stop() : start();
  }
});

function clampInt(v, min, max){
  const n = Math.floor(Number(v));
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

//Toggle in Media query
const mq1Small = window.matchMedia('(max-width: 720px)');

function updateBubbleIcon(){
  const icon = pauseBtn?.querySelector('.icon');
  if (!icon || !pauseBtn) return;

  if (mq1Small.matches){
    icon.classList.remove('icon-play', 'icon-pause');
    icon.classList.add(running ? 'icon-pause' : 'icon-play');
    pauseBtn.setAttribute('aria-label', running ? 'Pause' : 'Play');
  }
  else {
    icon.classList.remove('icon-play');
    icon.classList.add('icon-pause');
    pauseBtn.setAttribute('aria-label','Pause');
  }
}

function handleToggleClick(){
  running ? stop() : start();
}

function applyResponsiveControls() {
  if(!pauseBtn) return;
  if(mq1Small.matches) {
    pauseBtn.removeEventListener('click', stop);
    pauseBtn.addEventListener('click', handleToggleClick);
  }
  else {
    pauseBtn.removeEventListener('click', handleToggleCLick);
    pauseBtn.addEventListener('click', stop);
  }
  updateBubbleIcon();
}

mq1Small.addEventListener('change', applyResponsiveControls);

function updatePressedStates() {
  setPressed(playBtn, running);
  setPressed(pauseBtn, !running);

  setPressed(pomodoroBtn, currentBlock === "work");
  setPressed(shortBtn, currentBlock === "short");
  setPressed(longBtn, currentBlock === "long");

  setPressed(loopBtn, loopMode);

  updateBubbleIcon();
}



//Initialize
renderDigits();
updatePressedStates();
applyResponsiveControls();