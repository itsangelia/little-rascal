// AUDITION ONLY: recorded excerpts awaiting the owner's interaction mapping.
// The official index/play pages continue loading the existing sound-effects.js.
let petSoundContext = null;
let petSoundOutput = null;
let petSoundVoice = null;
let lastPetSoundAt = -Infinity;
const PET_SOUND_COOLDOWN = 0.65;
const recordedPetSoundBuffers = {};
let recordedPetSoundsReady = false;
let recordedPetSoundPreparation = null;
let recordedPetSoundLoadError = "";
let recordedPetDecodeContext = null;
const recordedPetSampleRoot = new URL("voice-samples/", document.currentScript ? document.currentScript.src
  : new URL("design-options/recorded-sound-effects.js", document.baseURI));
const recordedPetSoundQuery = new URLSearchParams(location.search);
const recordedPetSoundSelection = {
  pet: recordedPetSoundChoice(recordedPetSoundQuery.get("pet"), "C"),
  play: recordedPetSoundChoice(recordedPetSoundQuery.get("play"), "B")
};

function recordedPetSoundChoice(value, fallback) {
  const id = String(value || "").toUpperCase();
  return /^[A-D]$/.test(id) ? id : fallback;
}

function preparePetSoundBuffers() {
  if (recordedPetSoundsReady) return Promise.resolve(true);
  if (recordedPetSoundPreparation) return recordedPetSoundPreparation;
  recordedPetSoundLoadError = "";
  recordedPetSoundPreparation = (async () => {
    // Decode before the first care action, without starting an audible context.
    const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!recordedPetDecodeContext) {
      if (!OfflineContext) throw new Error("Recorded audio decoding is unavailable in this browser.");
      recordedPetDecodeContext = new OfflineContext(2, 1, 44100);
    }
    const selectedIds = [...new Set(Object.values(recordedPetSoundSelection))];
    await Promise.all(selectedIds.map(async id => {
      if (recordedPetSoundBuffers[id]) return;
      const response = await fetch(new URL(id + ".wav", recordedPetSampleRoot));
      if (!response.ok) throw new Error("Could not load voice sample " + id + ".");
      const buffer = await response.arrayBuffer();
      recordedPetSoundBuffers[id] = await recordedPetDecodeContext.decodeAudioData(buffer);
    }));
    recordedPetSoundsReady = selectedIds.every(id => !!recordedPetSoundBuffers[id]);
    return recordedPetSoundsReady;
  })().catch(error => {
    recordedPetSoundLoadError = error.message;
    return false;
  }).finally(() => { recordedPetSoundPreparation = null; });
  return recordedPetSoundPreparation;
}

function petSoundIsEnabled() {
  return typeof musicEnabled !== "undefined" && musicEnabled && !document.hidden;
}

function petSoundCanPlay() {
  if (!petSoundIsEnabled()) return false;
  if (typeof isDead !== "undefined" && isDead) return false;
  if (typeof hatchingComplete !== "undefined" && !hatchingComplete) return false;
  if (typeof namingPopupOpen !== "undefined" && namingPopupOpen) return false;
  if (typeof helpPopupOpen !== "undefined" && helpPopupOpen) return false;
  if (typeof growthPopupOpen !== "undefined" && growthPopupOpen) return false;
  if (typeof isSleeping !== "undefined" && isSleeping) return false;
  if (typeof goingToSleep !== "undefined" && goingToSleep) return false;
  if (typeof isPooping !== "undefined" && isPooping) return false;
  return true;
}

function unlockPetSounds(event) {
  if ((event && !event.isTrusted) || !petSoundIsEnabled()) return Promise.resolve(false);
  if (!event && navigator.userActivation && !navigator.userActivation.isActive &&
      (!petSoundContext || petSoundContext.state !== "running")) return Promise.resolve(false);
  preparePetSoundBuffers();
  try {
    if (!petSoundContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return Promise.resolve(false);
      petSoundContext = new AudioContextClass();
      petSoundOutput = petSoundContext.createGain();
      // Files use a common 0.6 gain; this audition level keeps live call RMS near 0.02–0.04.
      petSoundOutput.gain.value = 0.45;
      petSoundOutput.connect(petSoundContext.destination);
    }
    if (petSoundContext.state === "running") return Promise.resolve(true);
    return petSoundContext.resume().then(() => petSoundIsEnabled() && petSoundContext.state === "running")
      .catch(() => false);
  } catch (_) {
    return Promise.resolve(false);
  }
}

function createPetVoice(context, destination, kind, stage, when = context.currentTime) {
  const sampleId = recordedPetSoundSelection[kind];
  const buffer = recordedPetSoundBuffers[sampleId];
  if (!buffer) throw new Error("The selected recorded voice is not ready.");
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = false;
  // Preserve the owner's original recording in every life stage.
  source.playbackRate.value = 1;
  if (source.detune) source.detune.value = 0;
  const envelope = context.createGain();
  envelope.gain.setValueAtTime(1, when);
  source.connect(envelope).connect(destination);
  let cleaned = false;
  const voice = {
    kind, stage, sampleId, source, buffer, sources: [source], end: when + buffer.duration,
    stop() {
      if (cleaned) return;
      const now = context.currentTime;
      if (typeof envelope.gain.cancelAndHoldAtTime === "function") envelope.gain.cancelAndHoldAtTime(now);
      else {
        envelope.gain.cancelScheduledValues(now);
        envelope.gain.setValueAtTime(envelope.gain.value, now);
      }
      envelope.gain.linearRampToValueAtTime(0, now + 0.008);
      try { source.stop(now + 0.01); } catch (_) { /* The finite clip may already have ended. */ }
    }
  };
  source.onended = () => {
    cleaned = true;
    source.disconnect();
    envelope.disconnect();
    if (petSoundVoice === voice) petSoundVoice = null;
  };
  source.start(when);
  return voice;
}

function playPetSound(kind, stage) {
  if ((kind !== "pet" && kind !== "play") || !petSoundCanPlay()) return false;
  if (!recordedPetSoundsReady) {
    preparePetSoundBuffers();
    return false;
  }
  if (!petSoundContext || petSoundContext.state !== "running") {
    unlockPetSounds();
    return false;
  }
  const now = petSoundContext.currentTime;
  if (petSoundVoice || now - lastPetSoundAt < PET_SOUND_COOLDOWN) return false;
  const currentStage = stage || (typeof lifeStage === "undefined" ? "child" : lifeStage);
  try {
    petSoundVoice = createPetVoice(petSoundContext, petSoundOutput, kind, currentStage, now);
    lastPetSoundAt = now;
    return true;
  } catch (_) {
    petSoundVoice = null;
    return false;
  }
}

function stopPetSounds() {
  if (petSoundVoice) petSoundVoice.stop();
  petSoundVoice = null;
  lastPetSoundAt = -Infinity;
}

for (const gesture of ["pointerdown", "pointerup", "touchend", "keydown"]) {
  document.addEventListener(gesture, unlockPetSounds, true);
}
document.addEventListener("visibilitychange", () => { if (document.hidden) stopPetSounds(); });
window.addEventListener("pagehide", stopPetSounds);
preparePetSoundBuffers();
