const bootLines = [
  '>>> 秘文ターミナル BIOS 0x0F 起動',
  '>>> 量子ジョーク同期中 ........ ok',
  '>>> 表情認識: 無表情 (推奨)',
  '>>> まじめなBGM: 読み込み失敗 (仕様)',
  '>>> 国家機密らしきデータ: 90% 冗談',
];

const missions = [
  {
    title: '作戦壱',
    codename: 'WASABI-Σ',
    intro:
      '第一任務: 司令部はキッチンを脅かす謎のスパイスカルトを恐れている。真面目に対応せよ。',
    target: '敵ノラーメンスープヲ偽装シ鼻ニツンワリヲ与エヨ',
    punchline:
      '解析結果: ただのわさび職人感謝祭だった。鼻を守れ。',
  },
  {
    title: '作戦弐',
    codename: 'NEON-FUJI',
    intro:
      '第二任務: 夜景ハック犯が富士山の影を歪めた模様。大至急デバッグせよ。',
    target: '富士山ノシルエットニレーザーネコヲ投影セヨ',
    punchline: '解析結果: ネコは可愛い。犯人は観光客。写真はバズった。',
  },
  {
    title: '作戦参',
    codename: 'ODEN-∞',
    intro:
      '最終任務: 屋台諜報部より緊急連絡。おでん汁に時空の歪み。',
    target: '大根ヲワープポータル化シ月面ニおでん屋台ヲ開店セヨ',
    punchline:
      '解析結果: 宇宙でも売れる。領収書は「月面出張」で申請済み。',
  },
];

const state = {
  missionIndex: -1,
  decodedChars: 0,
  cool: 100,
  noise: 0,
  ready: false,
};

const bootLogEl = document.getElementById('boot-log');
const missionLabel = document.getElementById('mission-label');
const missionStory = document.getElementById('mission-story');
const decoderOutput = document.getElementById('decoder-output');
const resultText = document.getElementById('result-text');
const coolMeter = document.getElementById('cool-meter');
const noiseMeter = document.getElementById('noise-meter');
const nextMissionBtn = document.getElementById('next-mission');
const dotButtons = Array.from(document.querySelectorAll('.dot-btn'));

function appendLog(text) {
  const line = document.createElement('p');
  line.textContent = text;
  bootLogEl.appendChild(line);
  bootLogEl.scrollTop = bootLogEl.scrollHeight;
}

function bootSequence() {
  bootLines.forEach((line, i) => {
    setTimeout(() => appendLog(line), i * 600);
  });

  setTimeout(() => {
    appendLog('>>> 解析アルゴリズム: いいかんじに適当');
    startMission();
  }, bootLines.length * 600 + 500);
}

function startMission() {
  state.missionIndex += 1;
  state.decodedChars = 0;
  state.noise = Math.floor(Math.random() * 5);
  state.ready = true;
  nextMissionBtn.disabled = true;

  if (state.missionIndex >= missions.length) {
    missionLabel.textContent = '任務完遂';
    missionStory.textContent = '端末は満足してスリープに入った。';
    decoderOutput.textContent = 'MISSION OVER';
    resultText.textContent = '全任務完了。あなたの冷静さ: ' + state.cool + '%';
    dotButtons.forEach((btn) => (btn.disabled = true));
    return;
  }

  const mission = missions[state.missionIndex];
  missionLabel.textContent = `${mission.title} / ${mission.codename}`;
  missionStory.textContent = mission.intro;
  decoderOutput.textContent = '▒'.repeat(mission.target.length);
  resultText.textContent = '復号手順: ドットを押して真実(?)を暴け。';
  updateMeters();
  dotButtons.forEach((btn) => (btn.disabled = false));
  appendLog(`>>> ${mission.codename} 読み込み完了`);
}

function updateMeters() {
  coolMeter.textContent = `${state.cool}%`;
  noiseMeter.textContent = `${state.noise}%`;
}

function handleToggle(event) {
  if (!state.ready) return;
  const mission = missions[state.missionIndex];
  if (!mission) return;

  event.currentTarget.classList.add('glitch');
  setTimeout(() => event.currentTarget.classList.remove('glitch'), 220);

  state.noise = Math.min(99, state.noise + Math.floor(Math.random() * 6) + 2);
  updateMeters();

  if (state.decodedChars >= mission.target.length) return;

  const current = decoderOutput.textContent.split('');
  const index = current.indexOf('▒');
  if (index !== -1) {
    current[index] = mission.target[index];
    state.decodedChars += 1;
    decoderOutput.textContent = current.join('');
  }

  if (Math.random() > 0.6) {
    resultText.textContent = glitchHint();
  }

  if (state.decodedChars >= mission.target.length) {
    completeMission(mission);
  }
}

function completeMission(mission) {
  state.ready = false;
  dotButtons.forEach((btn) => (btn.disabled = true));
  resultText.textContent = mission.punchline;
  missionStory.textContent = mission.punchline;
  appendLog(`>>> ${mission.codename} - 真面目指数: 0%`);

  const coolDrop = Math.floor(Math.random() * 10) + 7;
  state.cool = Math.max(0, state.cool - coolDrop);
  updateMeters();

  if (state.missionIndex < missions.length - 1) {
    nextMissionBtn.disabled = false;
    nextMissionBtn.textContent = '次の任務へ';
  } else {
    nextMissionBtn.disabled = false;
    nextMissionBtn.textContent = '任務ログを保存 (脳内)';
  }
}

function glitchHint() {
  const hints = [
    '翻訳メモ: 「機密」は「きみつな味」かもしれない。',
    '量子ゆらぎ検出: ドットのリズムがファンキー。',
    '警告: 真面目センサーが退屈している。',
    '補足: 機密は8割ギャグで構成されています。',
  ];
  return hints[Math.floor(Math.random() * hints.length)];
}

nextMissionBtn.addEventListener('click', () => {
  appendLog('>>> 次なる茶番を準備中...');
  setTimeout(startMission, 400);
});

dotButtons.forEach((btn) => btn.addEventListener('click', handleToggle));

bootSequence();
