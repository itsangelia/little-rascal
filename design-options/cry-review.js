let selectedCry = null;
const cryStatus = document.getElementById("status");

document.getElementById("clips").addEventListener("click", event => {
  const listen = event.target.closest("[data-listen]");
  if (listen) {
    const player = listen.closest(".card").querySelector("audio");
    for (const other of document.querySelectorAll("audio")) if (other !== player) other.pause();
    player.currentTime = 0;
    player.volume = 0.9;
    player.play().catch(() => { cryStatus.textContent = "暂时无法播放，请再点一次试听。"; });
    return;
  }
  const choose = event.target.closest("[data-choose]");
  if (!choose) return;
  selectedCry = choose.dataset.choose;
  document.getElementById("chosen").textContent = `哭声选择：片段 ${selectedCry}`;
  document.getElementById("copy").disabled = false;
  for (const button of document.querySelectorAll("[data-choose]")) {
    button.setAttribute("aria-pressed", String(button.dataset.choose === selectedCry));
  }
  cryStatus.textContent = "复制选择发回聊天，就能按这段接入哭泣状态。";
});

document.getElementById("copy").addEventListener("click", async () => {
  if (!selectedCry) return;
  const text = `哭声用片段 ${selectedCry}，接入游戏。`;
  try {
    await navigator.clipboard.writeText(text);
    cryStatus.textContent = "已复制，粘贴回聊天即可。";
  } catch (_) {
    cryStatus.textContent = text + " 可以直接把这句话发回聊天。";
  }
});

fetch("voice-samples/manifest.json?v=cry-candidates-1")
  .then(response => {
    if (!response.ok) throw new Error("The excerpt list did not load.");
    return response.json();
  })
  .then(manifest => {
    for (const clip of manifest.samples.filter(item => /^[Q-T]$/.test(item.id))) {
      const card = document.createElement("section");
      card.className = "card";
      card.innerHTML = `<h2>片段 ${clip.id}</h2>
        <div class="time">原音频 ${Number(clip.sourceStartSeconds).toFixed(2)}–${Number(clip.sourceEndSeconds).toFixed(2)} 秒 · 时长 ${Number(clip.durationSeconds).toFixed(2)} 秒</div>
        <audio preload="metadata" src="voice-samples/${clip.id}.wav"></audio>
        <button class="listen" type="button" data-listen="${clip.id}">▶ 试听 ${clip.id}</button>
        <button type="button" data-choose="${clip.id}" aria-pressed="false">选 ${clip.id} 做哭声</button>`;
      document.getElementById("clips").append(card);
    }
  })
  .catch(() => { cryStatus.textContent = "试听列表暂时没加载成功，请刷新重试。"; })
  .finally(() => document.getElementById("clips").setAttribute("aria-busy", "false"));
