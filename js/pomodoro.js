const DURATIONS = {
  work: 25,
  short: 5,
  long: 10,
};

let secondsLeft = DURATIONS.work * 60;
let running = false;
let loopMode = false;
let currentBlock = "work";
let tickId = null;


const minEye = document.getElementById("minEyes");
const secEye = document.getElementById("secEyes"); 
const srTimer = document.getElementById("srTimer");

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");

const pomodoroBtn = document.getElementById("pomodoroBtn");
const shortBtn = document.getElementById("shortBtn");
const longBtn = document.getElementById("longBtn");
const loopBtn = document.getElementById("loopBtn");

function pad2(n) { return String(n).padStart(2, "0"); }

function renderDigits() {
  const mins = Math.max(0, Math.floor(secondsLeft / 60));
  const secs = Math.max(0, secondsLeft % 60);
  if (minEye) minEye.textContent = pad2(mins);
  if (secEye) secEye.textContent = pad2(secs);
  if (srTimer) srTimer.textContent = `${pad2(mins)}:${pad2(secs)}`;
}

function tick() {
  if (secondsLeft > 0) {
    secondsLeft -= 1;
    renderDigits();
  } else {
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
}

function start() {
  if (running) return;
  running = true;
  renderDigits();
  tickId = setInterval(tick, 1000);
}

function stop() {
  running = false;
  clearInterval(tickId);
  tickId = null;
}

function setMode(mode) {
  currentBlock = mode;
  const mins = DURATIONS[mode];
  secondsLeft = mins * 60;
  stop();
  renderDigits();
}

playBtn?.addEventListener("click", start);
pauseBtn?.addEventListener("click", stop);

pomodoroBtn?.addEventListener("click", () => setMode("work"));
shortBtn?.addEventListener("click",    () => setMode("short"));
longBtn?.addEventListener("click",     () => setMode("long"));

loopBtn?.addEventListener("click", () => {
  loopMode = !loopMode;
  loopBtn.setAttribute("aria-pressed", String(loopMode));
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    running ? stop() : start();
  }
});

renderDigits();