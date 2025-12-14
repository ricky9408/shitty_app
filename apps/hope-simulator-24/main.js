"use strict";
const hopeEl = document.getElementById("hopeValue");
const dayEl = document.getElementById("day");
const rateEl = document.getElementById("rate");
const logEl = document.getElementById("log");
const statusEl = document.getElementById("statusText");
const hintEl = document.getElementById("hint");
const upgradesEl = document.getElementById("upgrades");
const hopeBtn = document.getElementById("hopeBtn");
const advanceBtn = document.getElementById("advanceBtn");
const scrambleBtn = document.getElementById("scrambleBtn");
const beamEl = document.getElementById("beam");
const flareEl = document.getElementById("flare");
const portholeLabel = document.getElementById("portholeLabel");
const podModel = document.getElementById("podModel");
const pieceEls = {
    antenna: document.getElementById("piece-antenna"),
    amplifier: document.getElementById("piece-amplifier"),
    coil: document.getElementById("piece-coil"),
    mirror: document.getElementById("piece-mirror"),
};
const state = {
    hope: 12,
    rate: 0,
    click: 1,
    day: 1,
    restBonus: 0,
    finale: false,
    inflation: 1,
    fakeGlow: 0,
    locked: false,
    clicksTowardDay: 0,
    visuals: {
        antenna: false,
        amplifier: false,
        coil: false,
        mirror: false,
    },
};
const upgrades = [
    {
        id: "antenna",
        name: "歪んだアンテナ",
        desc: "ポッド外殻から掘り出して再接続。<br>希望獲得量をわずかに増やす。",
        price: 24,
        visual: "antenna",
        apply: () => (state.click += 1),
    },
    {
        id: "amplifier",
        name: "パルス増幅器",
        desc: "廃配線を束ね直して増幅。<br>毎秒 +2 Hope を送信。",
        price: 38,
        visual: "amplifier",
        apply: () => (state.rate += 2),
    },
    {
        id: "cryobed",
        name: "睡眠抑制剤",
        desc: "緊急時用の睡眠抑制剤。命をすこし削る。<br>日数経過時の Hope を追加獲得。",
        price: 46,
        apply: () => (state.restBonus += 8),
    },
    {
        id: "mirror",
        name: "反射パネル",
        desc: "内側のガラスを磨き反射効果を強化。<br>効果は未知数。",
        price: 30,
        visual: "mirror",
        apply: () => (state.fakeGlow += 10),
    },
    {
        id: "coil",
        name: "磁気収束コイル",
        desc: "非常食のアルミホイルを使って磁気を収束させ送信速度アップ。<br>精度はイマイチ。",
        price: 55,
        visual: "coil",
        apply: () => {
            state.rate += 4;
            state.inflation += 0.08;
        },
    },
];
const phaseOfDay = (day) => {
    if (day <= 3)
        return "calm";
    if (day <= 7)
        return "uneasy";
    if (day <= 12)
        return "betrayal";
    if (day <= 17)
        return "collapse";
    if (day <= 23)
        return "descent";
    return "gift";
};
function formatHope(value) {
    if (!Number.isFinite(value))
        return "HOPE = ∞";
    const phase = phaseOfDay(state.day);
    let text = Math.round(value).toLocaleString("ja-JP");
    if (phase === "betrayal" && Math.random() < 0.3) {
        text = text.replace(/0/g, "O").replace(/1/g, "I");
    }
    if (phase === "collapse") {
        const distortion = ["#", "?", "!", "Ξ"];
        text = text
            .split("")
            .map((c, i) => (i % 3 === 0 && Math.random() < 0.35 ? distortion[Math.floor(Math.random() * distortion.length)] : c))
            .join("");
    }
    if (phase === "descent" && Math.random() < 0.2) {
        text = "─" + text + "─";
    }
    return text;
}
function log(message, mood = "soft") {
    const li = document.createElement("li");
    const tag = document.createElement("span");
    tag.className = `tag tag-${mood}`;
    tag.textContent = mood.toUpperCase();
    li.appendChild(tag);
    li.append(message);
    logEl.appendChild(li);
    if (logEl.children.length > 9 && logEl.firstChild) {
        logEl.removeChild(logEl.firstChild);
    }
}
function renderDashboard() {
    const phase = phaseOfDay(state.day);
    const flux = Math.max(0.1, Math.min(0.8, Math.abs(state.rate) / 12 + state.click / 20));
    beamEl.style.opacity = (phase === "gift" ? 0.5 : flux).toString();
    flareEl.style.opacity = (0.25 + flux / 3).toString();
    if (podModel) {
        const spinSeconds = Math.max(9, 18 - flux * 8);
        podModel.style.animationDuration = `${spinSeconds}s`;
        podModel.style.filter = `drop-shadow(0 0 6px rgba(116,242,255,${0.2 + flux / 3}))`;
    }
    Object.entries(state.visuals).forEach(([id, on]) => {
        const el = pieceEls[id];
        if (!el)
            return;
        el.classList.toggle("active", on);
    });
    const captions = {
        calm: "ダッシュボード：ビーコンは静かに点灯している。",
        uneasy: "ダッシュボード：星が滲む。アンテナが軋む音。",
        betrayal: "ダッシュボード：光が捻じれる。値札が浮かんだ気がする。",
        collapse: "ダッシュボード：火花が散る。希望が逆流中。",
        descent: "ダッシュボード：視界が揺れている。揺れているのは自分かも。",
        gift: "ダッシュボード：真っ白。もう測定の必要はない。",
    };
    portholeLabel.textContent = captions[phase];
}
function renderUpgrades() {
    upgradesEl.innerHTML = "";
    const phase = phaseOfDay(state.day);
    upgrades.forEach((u) => {
        const card = document.createElement("div");
        card.className = "upgrade";
        const title = document.createElement("h3");
        title.textContent = u.name;
        const desc = document.createElement("p");
        desc.innerHTML = u.desc;
        const button = document.createElement("button");
        button.textContent = `購入 ${Math.round(u.price)} Hope`;
        button.onclick = () => buyUpgrade(u);
        if (u.bought) {
            button.textContent = "購入済み";
            button.disabled = true;
        }
        if (state.locked && phase === "collapse" && Math.random() < 0.6) {
            card.style.opacity = "0.35";
            button.disabled = true;
            button.textContent = "ロック中";
        }
        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(button);
        upgradesEl.appendChild(card);
    });
}
function render() {
    const phase = phaseOfDay(state.day);
    hopeEl.textContent = formatHope(state.hope + state.fakeGlow);
    dayEl.textContent = `${state.day} / 24`;
    rateEl.textContent = `${state.rate >= 0 ? "+" : ""}${state.rate.toFixed(1)}/s`;
    const statusByPhase = {
        calm: "信号は素直に伸びている。今のうちに稼げ。",
        uneasy: "アンテナがきしむ。数字が揺れてきた。",
        betrayal: "装置が勝手に値札を書き換えている。",
        collapse: "配線が焼ける匂い。希望が逆流し始めた。",
        descent: "操作遅延。アップグレードが嘘を吐く。",
        gift: "静寂だけが残った。誰かがきっと聞いている。",
    };
    statusEl.textContent = statusByPhase[phase];
    hintEl.textContent = {
        calm: "クリックで希望を集め、少しずつ改善しよう。",
        uneasy: "価格が微妙に上がる。ログのささやきを見逃すな。",
        betrayal: "購入すると希望が半減することがある。疑え。",
        collapse: "希望は負の数にもなる。UIも信用するな。",
        descent: "全てが揺れる。日数を進めるほど終わりに近づく。",
        gift: "もう計測しなくていい。終わりは突然に訪れる。",
    }[phase];
    const phases = ["calm", "uneasy", "betrayal", "collapse", "descent", "gift"];
    phases.forEach((p) => document.body.classList.remove(`phase-${p}`));
    document.body.classList.add(`phase-${phase}`);
    renderDashboard();
}
function collectHope() {
    if (state.finale)
        return;
    const phase = phaseOfDay(state.day);
    let gain = state.click;
    if (phase === "uneasy")
        gain += (Math.random() - 0.5) * 1.5;
    if (phase === "collapse")
        gain -= Math.random() * 2;
    if (phase === "descent" && Math.random() < 0.25)
        gain *= -1;
    state.hope += gain;
    if (phase === "betrayal" && Math.random() < 0.18) {
        state.hope *= 0.5;
        log("アップグレード装置が熱暴走。希望が半減。", "bad");
    }
    if (phase === "collapse" && Math.random() < 0.15) {
        state.locked = !state.locked;
        log(state.locked ? "システムが勝手に鍵をかけた。" : "鍵が外れた。ほんとに？", "soft");
    }
    state.clicksTowardDay += 1;
    if (state.clicksTowardDay >= 5 && !state.finale) {
        const steps = Math.floor(state.clicksTowardDay / 5);
        state.clicksTowardDay = state.clicksTowardDay % 5;
        for (let i = 0; i < steps; i++) {
            advanceDay("auto");
            if (state.finale)
                break;
        }
    }
    render();
}
function buyUpgrade(upgrade) {
    if (state.finale || upgrade.bought)
        return;
    const cost = upgrade.price * state.inflation;
    if (state.hope < cost) {
        log("希望が足りない。数字を増やせ。", "bad");
        return;
    }
    const phase = phaseOfDay(state.day);
    state.hope -= cost;
    if (phase === "betrayal" && Math.random() < 0.22) {
        state.hope *= 0.5;
        log("購入の瞬間に謎の減衰。希望がまた消えた。", "bad");
    }
    if (phase === "descent" && Math.random() < 0.18) {
        log("装置が「もう買った」と主張している。何？", "bad");
        upgrade.bought = true;
        renderUpgrades();
        render();
        return;
    }
    upgrade.apply();
    upgrade.bought = true;
    upgrade.price *= 1.6;
    if (upgrade.visual)
        state.visuals[upgrade.visual] = true;
    log(`${upgrade.name} をポッド内プリンタで生成・接続。`, "good");
    renderUpgrades();
    render();
}
function advanceDay(source = "manual") {
    if (state.finale)
        return;
    if (state.day >= 24)
        return;
    state.day += 1;
    state.hope += 5 + state.restBonus;
    log(source === "auto"
        ? `Day ${state.day} に自動で移行。計器が勝手に刻んでいる。`
        : `Day ${state.day} に移行。ポッドがきしんでいる。`, "soft");
    if (state.day === 4)
        log("UIにちらつき。気のせいか？", "bad");
    if (state.day === 8)
        log("購入すると希望が落ちる噂。", "bad");
    if (state.day === 13)
        log("数値が負にもなる。危険。", "bad");
    if (state.day === 18)
        log("画面が揺れているのは船体か心か。", "bad");
    if (state.day === 24) {
        triggerFinale();
        return;
    }
    renderUpgrades();
    render();
}
function scramble() {
    if (state.finale)
        return;
    const phase = phaseOfDay(state.day);
    const chaos = (Math.random() - 0.3) * 18;
    state.hope += chaos;
    state.rate = Math.max(-2, state.rate - 0.4);
    log("ノイズをばらまいた。Hopeが揺れ、送信レートがわずかに低下。", chaos > 0 ? "good" : "bad");
    if (phase === "descent")
        document.body.classList.add("shake");
    setTimeout(() => document.body.classList.remove("shake"), 500);
    render();
}
function tick() {
    if (state.finale)
        return;
    const phase = phaseOfDay(state.day);
    let delta = state.rate;
    if (phase === "uneasy")
        delta += (Math.random() - 0.5) * 2;
    if (phase === "betrayal")
        delta += (Math.random() - 0.5) * 4;
    if (phase === "collapse")
        delta += (Math.random() - 0.5) * 6;
    if (phase === "descent")
        delta += (Math.random() - 0.5) * 12;
    state.hope += delta;
    if (phase === "descent" && Math.random() < 0.08) {
        state.hope -= Math.abs(state.hope) * 0.2;
        log("希望が漏電している。", "bad");
    }
    if (phase !== "gift" && Math.random() < 0.08) {
        document.body.classList.toggle("flicker");
        setTimeout(() => document.body.classList.remove("flicker"), 600);
    }
    render();
}
function chaosPulse() {
    if (state.finale)
        return;
    const phase = phaseOfDay(state.day);
    if (phase === "collapse" && Math.random() < 0.25) {
        state.hope -= Math.abs(state.hope) * 0.1;
        log("希望が逆流。計器が焼ける音。", "bad");
    }
    if (phase === "betrayal" && Math.random() < 0.16) {
        state.inflation += 0.12;
        log("価格が勝手に跳ね上がった。", "bad");
    }
    if (phase === "descent" && Math.random() < 0.14) {
        state.day = Math.max(1, state.day - 1);
        log("日付が巻き戻った。時計を信用するな。", "bad");
    }
    renderUpgrades();
    render();
}
function triggerFinale() {
    state.finale = true;
    state.hope = Infinity;
    clearInterval(tickTimer);
    clearInterval(chaosTimer);
    document.body.classList.add("phase-gift");
    log("白い光がすべてを包む。希望はもう測れない。", "soft");
    statusEl.textContent = "「やめた瞬間に届いた」";
    hintEl.textContent = "HOPE = INFINITE";
    render();
    hopeBtn.disabled = true;
    if (advanceBtn)
        advanceBtn.disabled = true;
    scrambleBtn.disabled = true;
}
hopeBtn.addEventListener("click", collectHope);
scrambleBtn.addEventListener("click", scramble);
const tickTimer = window.setInterval(tick, 950);
const chaosTimer = window.setInterval(chaosPulse, 3600);
log("救難ビーコン起動。希望を送信するしかない。", "good");
log("ポッド内プリンタがスクラップを素材として起動。希望が通貨。", "soft");
log("24日後、何かが変わるとメモが残っている。", "soft");
renderUpgrades();
render();
