// The audition page configures the same engine used by the official game.
// Only the explicitly marked audition page may override the approved mapping.
(() => {
  const query = new URLSearchParams(location.search);
  const choose = (key, fallback) => {
    const value = (query.get(key) || "").toUpperCase();
    return /^[A-P]$/.test(value) ? value : fallback;
  };
  const selection = {
    pet: choose("pet", "C"),
    angry: choose("angry", "B"),
    cry: choose("cry", "A"),
    play: choose("play", "D"),
    idle: query.get("idle") === "off" ? null : choose("idle", "L")
  };
  const sampleRoot = new URL("voice-samples/", document.currentScript.src);
  const files = {};
  for (const id of Object.values(selection).filter(Boolean)) {
    files[id] = new URL(id + ".wav", sampleRoot).href;
  }
  window.petSoundAuditionConfig = { selection, files };
})();
