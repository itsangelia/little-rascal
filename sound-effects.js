// Original wordless pet calls, synthesized quietly without changing the music track.
let petSoundContext = null;
let petSoundOutput = null;
let petSoundVoice = null;
let lastPetSoundAt = -Infinity;
const PET_SOUND_COOLDOWN = 0.65;

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
  // Context creation/resume stays inside a real gesture, never a delayed sound queue.
  if (!event && navigator.userActivation && !navigator.userActivation.isActive &&
      (!petSoundContext || petSoundContext.state !== "running")) return Promise.resolve(false);
  try {
    if (!petSoundContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return Promise.resolve(false);
      petSoundContext = new AudioContextClass();
      petSoundOutput = petSoundContext.createGain();
      petSoundOutput.gain.value = 0.8;
      petSoundOutput.connect(petSoundContext.destination);
    }
    if (petSoundContext.state === "running") return Promise.resolve(true);
    return petSoundContext.resume().then(() => petSoundIsEnabled() && petSoundContext.state === "running")
      .catch(() => false);
  } catch (_) {
    return Promise.resolve(false);
  }
}

// Harmonic pitch curves and moving formants make a small "mrr/woo", not a UI beep.
function createPetVoice(context, destination, kind, stage, when = context.currentTime) {
  const elder = stage === "elder";
  const pitchFactor = elder ? 0.72 : stage === "adult" ? 0.9 : 1;
  const duration = (kind === "pet" ? 0.36 : 0.30) * (elder ? 1.16 : 1);
  const end = when + duration;
  const basePitch = (kind === "pet" ? 288 : 312) * pitchFactor;
  const nodes = [];
  const sources = [];
  const sourceMix = context.createGain();
  sourceMix.gain.value = 0.72;
  const warmth = context.createBiquadFilter();
  warmth.type = "highpass";
  warmth.frequency.value = 95;
  warmth.Q.value = 0.5;
  const firstFormant = context.createBiquadFilter();
  firstFormant.type = "peaking";
  firstFormant.Q.value = 1.25;
  firstFormant.gain.value = 3;
  firstFormant.frequency.setValueAtTime((kind === "pet" ? 430 : 560) * pitchFactor, when);
  firstFormant.frequency.linearRampToValueAtTime(650 * pitchFactor, when + duration * 0.35);
  firstFormant.frequency.linearRampToValueAtTime(390 * pitchFactor, end);
  const secondFormant = context.createBiquadFilter();
  secondFormant.type = "peaking";
  secondFormant.frequency.value = 1250 * pitchFactor;
  secondFormant.Q.value = 1.7;
  secondFormant.gain.value = 2.5;
  const softness = context.createBiquadFilter();
  softness.type = "lowpass";
  softness.Q.value = 0.45;
  softness.frequency.setValueAtTime(1000 * pitchFactor, when);
  softness.frequency.linearRampToValueAtTime(1900 * pitchFactor, when + duration * 0.28);
  softness.frequency.linearRampToValueAtTime(750 * pitchFactor, end);
  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0, when);
  envelope.gain.linearRampToValueAtTime(kind === "pet" ? 0.055 : 0.06, when + 0.045);
  envelope.gain.linearRampToValueAtTime(0.042, when + duration * 0.48);
  envelope.gain.linearRampToValueAtTime(0, end);
  sourceMix.connect(warmth).connect(firstFormant).connect(secondFormant).connect(softness).connect(envelope).connect(destination);
  nodes.push(sourceMix, warmth, firstFormant, secondFormant, softness, envelope);
  for (const partial of [{ multiple: 1, level: 1, wave: "triangle" }, { multiple: 2, level: 0.19, wave: "sine" }]) {
    const source = context.createOscillator();
    source.type = partial.wave;
    source.frequency.setValueAtTime(basePitch * partial.multiple, when);
    source.frequency.exponentialRampToValueAtTime(basePitch * (kind === "pet" ? 1.18 : 1.30) * partial.multiple,
      when + duration * 0.3);
    source.frequency.exponentialRampToValueAtTime(basePitch * (kind === "pet" ? 0.84 : 0.92) * partial.multiple, end);
    const partialGain = context.createGain();
    partialGain.gain.value = partial.level;
    source.connect(partialGain).connect(sourceMix);
    nodes.push(source, partialGain);
    sources.push(source);
  }
  const vibrato = context.createOscillator();
  vibrato.frequency.value = elder ? 4.2 : 5.8;
  const vibratoDepth = context.createGain();
  vibratoDepth.gain.value = elder ? 7 : 5;
  vibrato.connect(vibratoDepth);
  for (const source of sources) vibratoDepth.connect(source.detune);
  nodes.push(vibrato, vibratoDepth);
  sources.push(vibrato);
  let cleaned = false;
  const voice = {
    kind, stage, end, sources,
    stop() {
      if (cleaned) return;
      const now = context.currentTime;
      if (typeof envelope.gain.cancelAndHoldAtTime === "function") envelope.gain.cancelAndHoldAtTime(now);
      else {
        envelope.gain.cancelScheduledValues(now);
        envelope.gain.setValueAtTime(envelope.gain.value, now);
      }
      envelope.gain.linearRampToValueAtTime(0, now + 0.008);
      for (const source of sources) {
        try { source.stop(now + 0.01); } catch (_) { /* The finite voice may already have ended. */ }
      }
    }
  };
  let ended = 0;
  for (const source of sources) {
    source.onended = () => {
      if (++ended < sources.length || cleaned) return;
      cleaned = true;
      for (const node of nodes) node.disconnect();
      if (petSoundVoice === voice) petSoundVoice = null;
    };
    source.start(when);
    source.stop(end + 0.01);
  }
  return voice;
}

function playPetSound(kind, stage) {
  if ((kind !== "pet" && kind !== "play") || !petSoundCanPlay()) return false;
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
