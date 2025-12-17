const storyBox = document.getElementById("story-box");
const passwordText = document.getElementById("password-text");
const userInput = document.getElementById("user-input");
const statusEl = document.getElementById("status");
const logBox = document.getElementById("log-box");
const roundLabel = document.getElementById("round-label");
const meterFill = document.getElementById("meter-fill");
const warningWindow = document.getElementById("warning-window");
const warningMessage = document.getElementById("warning-message");
const finalWindow = document.getElementById("final-window");
const secretReport = document.getElementById("secret-report");
const memoArea = document.getElementById("memo-area");
const warningAudio = document.getElementById("warning-audio");
const fanfareAudio = document.getElementById("fanfare-audio");
const chimeAudio = document.getElementById("chime-audio");
const bootAudio = document.getElementById("boot-audio");

const rounds = [
  {
    story: "久しぶりにデータセンターに来たら業務用サーバーのパスワードを忘れた。メモ用紙がモニターに貼ってある。",
    charset: "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789",
    length: 8
  },
  {
    story: "ニ◯テンドーの新しいダウンロードソフトをコンビニで買ってきた。ダウンロード番号をストアで入力するぞ。",
    charset: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
    length: 16
  },
  {
    story: "マイナンバーカードの長い方のパスワードなんだったっけ...？財布にメモがある。",
    charset: "abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ0123456789!@#$%",
    length: 12
  },
  {
    story: "踏み台サーバーでDBにアクセスしようとしたが、クリップボード経由は禁止されているらしい。泣く泣くDBパスワードを手入力するぞ。",
    charset: "abcdefghkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,.<>?",
    length: 16
  },
  {
    story: "復活の呪文を入力せよ。 ヒント：Altを押すと記号が打てるぞい。",
    charset: "abcdefghkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,.<>?≈ç√∫˜µ≤≥÷åß∂ƒ©œ∑´®†¥¨ˆøππ“‘æ…",
    length: 24
  }
];

const secretCounters = {
  rightClicks: 0,
  drags: 0
};

let currentRound = 0;
let currentPassword = "";
let audioCtx;
let bootPlayed = false;

function logEvent(message) {
  const p = document.createElement("p");
  p.textContent = message;
  logBox.appendChild(p);
  logBox.scrollTop = logBox.scrollHeight;
}

function randomPassword({ charset, length }) {
  const chars = charset.split("");
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function startRound() {
  const { story, charset, length } = rounds[currentRound];
  storyBox.textContent = story;
  currentPassword = randomPassword({ charset, length });
  passwordText.textContent = currentPassword;
  passwordText.classList.toggle("wobble", currentRound >= 3);
  userInput.value = "";
  userInput.focus();
  roundLabel.textContent = `ラウンド ${currentRound + 1} / 5`;
  statusEl.textContent = "パスワードを入力してください。";
  meterFill.style.width = `${((currentRound) / rounds.length) * 100}%`;
  logEvent(`ラウンド${currentRound + 1}開始。文字数: ${length} / 記号混入: ${charset.replace(/[A-Za-z0-9]/g, "").length ? "あり" : "なし"}`);
}

function showToast(text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function beep(frequency = 880, duration = 0.16) {
  try {
    if (!window.AudioContext) return;
    audioCtx = audioCtx || new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.value = frequency;
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    /* ignore */
  }
}

function playAudioClip(el, { rewind = true } = {}) {
  if (!el) return false;
  try {
    if (rewind) el.currentTime = 0;
    el.play();
    return true;
  } catch (e) {
    return false;
  }
}

function playWarningSound() {
  if (playAudioClip(warningAudio)) return;
  beep(1040, 0.15);
  setTimeout(() => beep(780, 0.12), 120);
}

function playFanfare() {
  if (playAudioClip(fanfareAudio)) return;
  const notes = [660, 880, 760, 1180, 1320];
  notes.forEach((n, i) => setTimeout(() => beep(n, 0.18), i * 160));
}

function playChime() {
  if (playAudioClip(chimeAudio)) return;
  beep(880, 0.1);
}

function playBoot() {
  if (bootPlayed) return;
  bootPlayed = playAudioClip(bootAudio, { rewind: true }) || bootPlayed;
}

function showWarning(msg) {
  warningMessage.textContent = msg;
  warningWindow.classList.remove("hidden");
  playWarningSound();
}

function hideWarning() {
  warningWindow.classList.add("hidden");
}

function finishGame() {
  meterFill.style.width = "100%";
  finalWindow.classList.remove("hidden");
  secretReport.textContent = `記録: 右クリック ${secretCounters.rightClicks} 回 / ドラッグ試行 ${secretCounters.drags} 回`;
  playFanfare();
}

function handleSubmit() {
  const value = userInput.value;
  if (!value) {
    statusEl.textContent = "何か入力してください。";
    return;
  }
  if (value === currentPassword) {
    logEvent(`ラウンド${currentRound + 1} 成功。`);
    playChime();
    currentRound += 1;
    meterFill.style.width = `${(currentRound / rounds.length) * 100}%`;
    if (currentRound >= rounds.length) {
      statusEl.textContent = "全ラウンド完了！";
      finishGame();
    } else {
      statusEl.textContent = "正解！次のラウンドへ進みます。";
      setTimeout(startRound, 320);
    }
  } else {
    statusEl.textContent = "エラー。へたくそ。";
    logEvent("エラー。コピー教の信者か？");
    beep(320, 0.08);
  }
}

function recordDragAttempt(message = "ドラッグも無効だぞ") {
  secretCounters.drags += 1;
  showToast(message);
}

document.getElementById("submit-btn").addEventListener("click", handleSubmit);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSubmit();
  }
});

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  secretCounters.rightClicks += 1;
  showWarning("右クリック禁止！！");
});

memoArea.addEventListener("dragstart", (e) => {
  e.preventDefault();
  recordDragAttempt();
});

memoArea.addEventListener("selectstart", (e) => {
  e.preventDefault();
  recordDragAttempt("選択できません。");
});

memoArea.addEventListener("mousedown", (e) => {
  if (e.buttons === 1) {
    const moveHandler = () => {
      recordDragAttempt("ドラッグできません。");
      memoArea.removeEventListener("mousemove", moveHandler);
    };
    memoArea.addEventListener("mousemove", moveHandler);
    memoArea.addEventListener("mouseup", () => memoArea.removeEventListener("mousemove", moveHandler), { once: true });
  }
});

document.getElementById("warning-ok").addEventListener("click", hideWarning);
document.getElementById("warning-close").addEventListener("click", hideWarning);
warningWindow.addEventListener("click", (e) => {
  if (e.target === warningWindow) hideWarning();
});

document.getElementById("final-close").addEventListener("click", () => finalWindow.classList.add("hidden"));
document.getElementById("final-again").addEventListener("click", () => {
  currentRound = 0;
  secretCounters.rightClicks = 0;
  secretCounters.drags = 0;
  finalWindow.classList.add("hidden");
  startRound();
});

window.addEventListener("pointerdown", playBoot, { once: true });
window.addEventListener("keydown", playBoot, { once: true });
startRound();
setTimeout(playBoot, 400); // best effort for immediate boot sound
