// The owner chooses the emotional meaning of each excerpt by listening.
const chosen = { pet: "C", play: "B", idle: null };

function updateVoiceSelection() {
  document.getElementById("selected").textContent =
    `当前试听：摸摸 ${chosen.pet} · 玩球 ${chosen.play} · 闲时哼哼 ${chosen.idle || "未选择"}`;
  const query = new URLSearchParams({ pet: chosen.pet, play: chosen.play, v: "voice-bank-2" });
  if (chosen.idle) query.set("idle", chosen.idle);
  document.getElementById("try-game").href = "../previews/sounds/?" + query;
  for (const button of document.querySelectorAll("[data-kind]")) {
    button.setAttribute("aria-pressed", String(chosen[button.dataset.kind] === button.dataset.clip));
  }
}

function renderVoiceClip(clip) {
  if (!/^[A-P]$/.test(clip.id)) return;
  const card = document.createElement("section");
  card.className = "card";
  const start = Number(clip.sourceStartSeconds).toFixed(2);
  const end = Number(clip.sourceEndSeconds).toFixed(2);
  const duration = Number(clip.durationSeconds).toFixed(2);
  card.innerHTML = `<h3>片段 ${clip.id}</h3>
    <div class="time">原音频 ${start}–${end} 秒 · 时长 ${duration} 秒</div>
    <audio preload="metadata" src="voice-samples/${clip.id}.wav"></audio>
    <button class="listen" type="button" data-listen="${clip.id}">▶ 试听 ${clip.id}</button>
    <div class="choices">
      <button type="button" data-kind="pet" data-clip="${clip.id}" aria-pressed="false">摸摸用 ${clip.id}</button>
      <button type="button" data-kind="play" data-clip="${clip.id}" aria-pressed="false">玩球用 ${clip.id}</button>
      <button type="button" data-kind="idle" data-clip="${clip.id}" aria-pressed="false">哼哼用 ${clip.id}</button>
    </div>`;
  const player = card.querySelector("audio");
  player.addEventListener("play", () => {
    for (const other of document.querySelectorAll("audio")) if (other !== player) other.pause();
  });
  document.getElementById(clip.id <= "D" ? "previous-clips" : "new-clips").append(card);
}

document.getElementById("clips").addEventListener("click", event => {
  const listen = event.target.closest("[data-listen]");
  if (listen) {
    const player = listen.closest(".card").querySelector("audio");
    for (const other of document.querySelectorAll("audio")) if (other !== player) other.pause();
    player.currentTime = 0;
    player.play().catch(() => {
      document.getElementById("status").textContent = "暂时无法播放，请再点一次试听。";
    });
    return;
  }
  const button = event.target.closest("[data-kind]");
  if (!button) return;
  chosen[button.dataset.kind] = button.dataset.clip;
  updateVoiceSelection();
  document.getElementById("status").textContent = "已更新试听组合，正式游戏尚未改动。";
});

document.getElementById("clear-idle").addEventListener("click", () => {
  chosen.idle = null;
  updateVoiceSelection();
  document.getElementById("status").textContent = "本次游戏试听不播放闲时哼哼。";
});

document.getElementById("copy").addEventListener("click", async () => {
  const text = `摸摸（笑声）用片段 ${chosen.pet}，玩球用片段 ${chosen.play}，` +
    (chosen.idle ? `闲时自发哼哼用片段 ${chosen.idle}。` : "闲时哼哼暂未选择。");
  try {
    await navigator.clipboard.writeText(text);
    document.getElementById("status").textContent = "已复制，粘贴回聊天即可。";
  } catch (_) {
    document.getElementById("status").textContent = text + " 可以直接把这句话发回聊天。";
  }
});

updateVoiceSelection();
fetch("voice-samples/manifest.json?v=voice-bank-2")
  .then(response => {
    if (!response.ok) throw new Error("The audition list did not load.");
    return response.json();
  })
  .then(manifest => {
    for (const clip of manifest.samples) renderVoiceClip(clip);
    updateVoiceSelection();
  })
  .catch(() => {
    document.getElementById("status").textContent = "试听列表暂时没加载成功，请刷新页面重试。";
  })
  .finally(() => document.getElementById("clips").setAttribute("aria-busy", "false"));
