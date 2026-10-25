// Owner-approved clips use the same native media playback as the audition page.
let petSoundVoice = null;
let lastPetSoundAt = -Infinity;
let lastPetSoundKind = null;
const PET_SOUND_COOLDOWN = 0.65;
const PET_SOUND_VOLUME = 0.9;
const recordedPetSoundPlayers = {};
let recordedPetSoundsReady = false;
let recordedPetSoundPreparation = null;
let recordedPetSoundLoadError = "";
const recordedPetSampleRoot = new URL("assets/sounds/", document.currentScript ? document.currentScript.src
  : new URL("sound-effects.js", document.baseURI));
const activePetSoundAuditionConfig = document.body && document.body.dataset.soundAudition === "true"
  ? window.petSoundAuditionConfig || null : null;
const recordedPetSoundSelection = activePetSoundAuditionConfig
  ? {
    pet: recordedPetSoundChoice(activePetSoundAuditionConfig.selection.pet, "C"),
    angry: recordedPetSoundChoice(activePetSoundAuditionConfig.selection.angry, "B"),
    cry: recordedPetSoundChoice(activePetSoundAuditionConfig.selection.cry, "A"),
    play: recordedPetSoundChoice(activePetSoundAuditionConfig.selection.play, "D"),
    idle: activePetSoundAuditionConfig.selection.idle === null ? null
      : recordedPetSoundChoice(activePetSoundAuditionConfig.selection.idle, "L")
  }
  : { pet: "C", angry: "B", cry: "A", play: "D", idle: "L" };
const recordedPetSoundFiles = { C: "pet-C.wav", B: "angry-B.wav", A: "cry-A.wav", D: "kick-D.wav", L: "idle-L.wav" };
let petSoundAngryFaceLatched = false;
let petSoundCryingLatched = false;
let recordedIdlePetSoundElapsed = 0;
let recordedIdlePetSoundStage = "child";
let recordedIdlePetSoundDelay = 8 + Math.random() * 4;
let petSoundMusicVolume = null;

function resetIdlePetSoundTimer() {
  recordedIdlePetSoundStage = typeof lifeStage === "undefined" ? "child" : lifeStage;
  recordedIdlePetSoundElapsed = 0;
  recordedIdlePetSoundDelay = recordedIdlePetSoundStage === "child"
    ? 8 + Math.random() * 4 : 10 + Math.random() * 8;
}

function recordedPetSoundChoice(value, fallback) {
  const id = String(value || "").toUpperCase();
  return /^[A-P]$/.test(id) ? id : fallback;
}

function recordedPetSoundURL(id) {
  if (activePetSoundAuditionConfig && activePetSoundAuditionConfig.files[id]) {
    return new URL(activePetSoundAuditionConfig.files[id], document.baseURI);
  }
  return new URL(recordedPetSoundFiles[id], recordedPetSampleRoot);
}

function selectedPetSoundIds() {
  return [...new Set(Object.values(recordedPetSoundSelection).filter(Boolean))];
}

function refreshPetSoundReadiness() {
  recordedPetSoundsReady = selectedPetSoundIds().every(id => {
    const entry = recordedPetSoundPlayers[id];
    return entry && !entry.failed && entry.audio.readyState >= 2;
  });
  return recordedPetSoundsReady;
}

function getPetSoundPlayer(id) {
  if (!id) return null;
  if (recordedPetSoundPlayers[id]) return recordedPetSoundPlayers[id];
  const audio = new Audio();
  const entry = { audio, id, token: 0, warming: false, authorized: false, failed: false };
  recordedPetSoundPlayers[id] = entry;
  audio.preload = "auto";
  audio.loop = false;
  audio.playbackRate = audio.defaultPlaybackRate = 1;
  audio.volume = 0;
  audio.src = recordedPetSoundURL(id).href;
  audio.addEventListener("loadeddata", () => { entry.failed = false; refreshPetSoundReadiness(); });
  audio.addEventListener("canplay", refreshPetSoundReadiness);
  audio.addEventListener("error", () => {
    entry.failed = true;
    recordedPetSoundLoadError = "Could not load voice sample " + id + ".";
    refreshPetSoundReadiness();
  });
  audio.load();
  return entry;
}

function preparePetSounds() {
  if (refreshPetSoundReadiness()) return Promise.resolve(true);
  if (recordedPetSoundPreparation) return recordedPetSoundPreparation;
  recordedPetSoundLoadError = "";
  recordedPetSoundPreparation = Promise.all(selectedPetSoundIds().map(id => {
    const entry = getPetSoundPlayer(id), audio = entry.audio;
    if (audio.readyState >= 2 && !entry.failed) return Promise.resolve(true);
    return new Promise(resolve => {
      const finish = ready => {
        clearTimeout(timeout);
        audio.removeEventListener("loadeddata", loaded);
        audio.removeEventListener("error", failed);
        resolve(ready);
      };
      const loaded = () => finish(true);
      const failed = () => finish(false);
      const timeout = setTimeout(() => {
        entry.failed = true;
        recordedPetSoundLoadError = "Voice sample " + id + " is not ready yet.";
        finish(false);
      }, 12000);
      audio.addEventListener("loadeddata", loaded, { once: true });
      audio.addEventListener("error", failed, { once: true });
      if (entry.failed || audio.networkState === 3) {
        entry.failed = false;
        audio.load();
      }
    });
  })).then(() => refreshPetSoundReadiness()).catch(error => {
    recordedPetSoundLoadError = error.message;
    return false;
  }).finally(() => { recordedPetSoundPreparation = null; });
  return recordedPetSoundPreparation;
}

// Keep the previous preparation entry point for callers of the shared engine.
function preparePetSoundBuffers() { return preparePetSounds(); }

function petSoundIsEnabled() {
  // The speaker controls background music only; pet calls have no mute toggle.
  return !document.hidden;
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
  if (document.readyState !== "complete") return Promise.resolve(false);
  if (!event && navigator.userActivation && !navigator.userActivation.isActive) return Promise.resolve(false);
  preparePetSounds();
  const requests = selectedPetSoundIds().map(id => {
    const entry = getPetSoundPlayer(id), audio = entry.audio;
    if (entry.authorized || entry.warming || (petSoundVoice && petSoundVoice.entry === entry)) return Promise.resolve(entry.authorized);
    const token = ++entry.token;
    entry.warming = true;
    audio.volume = 0;
    audio.muted = true;
    try {
      // A silent, reusable element is authorized inside this actual user gesture.
      // The token prevents its eventual promise from pausing a newer audible call.
      return Promise.resolve(audio.play()).then(() => {
        if (entry.token !== token) return false;
        entry.authorized = true;
        entry.warming = false;
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
        return true;
      }).catch(() => {
        if (entry.token === token) {
          entry.warming = false;
          audio.pause();
          audio.muted = false;
        }
        return false;
      });
    } catch (_) {
      entry.warming = false;
      return Promise.resolve(false);
    }
  });
  return Promise.all(requests).then(results => results.some(Boolean));
}

function duckMusicForPetSound() {
  if (typeof musicAudio === "undefined") return;
  if (petSoundMusicVolume === null) petSoundMusicVolume = musicAudio.volume;
  // Never start/stop music or change its enabled setting while making room for a call.
  musicAudio.volume = Math.min(petSoundMusicVolume, 0.135);
}

function restoreMusicAfterPetSound() {
  if (petSoundMusicVolume === null) return;
  if (typeof musicAudio !== "undefined") musicAudio.volume = petSoundMusicVolume;
  petSoundMusicVolume = null;
}

function playPetSound(kind, stage) {
  if (kind === "angry") petSoundAngryFaceLatched = true;
  if (kind === "cry") petSoundCryingLatched = true;
  if (!["pet", "play", "angry", "cry", "idle"].includes(kind) || !petSoundCanPlay()) return false;
  if (kind === "cry" && !petHasCryingSoundFace()) return false;
  if (kind === "idle" && !canPlayIdlePetSound()) return false;
  const entry = getPetSoundPlayer(recordedPetSoundSelection[kind]);
  // Loading is preparation only: never queue an old interaction behind its download.
  if (!entry || entry.failed || entry.audio.readyState < 2) {
    preparePetSounds();
    return false;
  }
  // The crying-state latch limits A to one cue per episode, including a new
  // episode that starts shortly after the previous one has ended.
  const priorityEmotion = kind === "cry" || (kind === "angry" && lastPetSoundKind !== kind);
  if (petSoundVoice && ((kind !== "idle" && (petSoundVoice.kind === "idle" ||
      (petSoundVoice.kind === "cry" && kind !== "cry"))) ||
      (["angry", "cry"].includes(kind) && petSoundVoice.kind !== kind))) stopPetSounds();
  const now = performance.now() / 1000;
  if (petSoundVoice || (!priorityEmotion && now - lastPetSoundAt < PET_SOUND_COOLDOWN)) return false;
  const audio = entry.audio, token = ++entry.token;
  entry.warming = false;
  let finished = false;
  let startupTimer;
  const voice = {
    kind, stage: stage || (typeof lifeStage === "undefined" ? "child" : lifeStage),
    sampleId: entry.id, entry, audio, started: false, end: now + audio.duration,
    stop() { finish(true); }
  };
  const finish = pause => {
    if (finished) return;
    finished = true;
    clearTimeout(startupTimer);
    audio.removeEventListener("ended", ended);
    audio.removeEventListener("error", failed);
    audio.removeEventListener("playing", playing);
    audio.removeEventListener("pause", paused);
    if (entry.token === token) {
      ++entry.token;
      if (pause) audio.pause();
      audio.volume = 0;
      // Leave a naturally ended clip buffered; the next cue seeks to zero.
      if (pause) {
        try { audio.currentTime = 0; } catch (_) { /* A failed media load can prevent seeking. */ }
      }
    }
    if (petSoundVoice === voice) {
      petSoundVoice = null;
      restoreMusicAfterPetSound();
    }
  };
  const ended = () => finish(false);
  const failed = () => {
    recordedPetSoundLoadError = "Voice sample " + entry.id + " could not play.";
    finish(true);
  };
  const playing = () => {
    if (entry.token !== token || !petSoundCanPlay() || (kind === "idle" && !canPlayIdlePetSound())) {
      finish(true);
      return;
    }
    voice.started = entry.authorized = true;
    if (refreshPetSoundReadiness()) recordedPetSoundLoadError = "";
    clearTimeout(startupTimer);
  };
  const paused = () => {
    // An external media interruption must not leave the one-voice slot occupied.
    if (voice.started && audio.paused) finish(false);
  };
  audio.addEventListener("ended", ended);
  audio.addEventListener("error", failed);
  audio.addEventListener("playing", playing);
  audio.addEventListener("pause", paused);
  try {
    audio.currentTime = 0;
    audio.playbackRate = 1;
    audio.muted = false;
    audio.volume = PET_SOUND_VOLUME * (kind === "idle" ? 0.65 : 1);
    petSoundVoice = voice;
    lastPetSoundAt = now;
    lastPetSoundKind = kind;
    resetIdlePetSoundTimer();
    duckMusicForPetSound();
    // Do not revive this request if a browser postpones it beyond the action.
    startupTimer = setTimeout(() => { if (!voice.started) finish(true); }, 500);
    Promise.resolve(audio.play()).then(() => {
      if (entry.token !== token || finished) return;
      playing();
    }).catch(error => {
      if (entry.token !== token || finished) return;
      entry.authorized = false;
      recordedPetSoundLoadError = error.message;
      finish(true);
    });
    return true;
  } catch (error) {
    recordedPetSoundLoadError = error.message;
    finish(true);
    return false;
  }
}

function stopPetSounds() {
  if (petSoundVoice) petSoundVoice.stop();
  petSoundVoice = null;
  for (const entry of Object.values(recordedPetSoundPlayers)) {
    if (!entry.warming) continue;
    ++entry.token;
    entry.warming = false;
    entry.audio.pause();
    entry.audio.volume = 0;
  }
  restoreMusicAfterPetSound();
  lastPetSoundAt = -Infinity;
  lastPetSoundKind = null;
  resetIdlePetSoundTimer();
}

function resetPetSoundState() {
  petSoundAngryFaceLatched = false;
  petSoundCryingLatched = false;
}

function petHasAngrySoundFace() {
  return typeof lifeStage !== "undefined" && lifeStage === "adult" &&
    typeof isDead !== "undefined" && !isDead &&
    typeof hatchingComplete !== "undefined" && hatchingComplete &&
    typeof adultSprites !== "undefined" && !!adultSprites.angry &&
    typeof getCurrentPetImage === "function" && getCurrentPetImage() === adultSprites.angry;
}

function updatePetSoundState() {
  const angryFace = petHasAngrySoundFace();
  const entered = angryFace && !petSoundAngryFaceLatched;
  petSoundAngryFaceLatched = angryFace;
  const activeCare = (typeof isBeingPetted !== "undefined" && isBeingPetted) ||
    (typeof isEating !== "undefined" && isEating) ||
    (typeof isPlaying !== "undefined" && isPlaying) ||
    (typeof toyPlayAction !== "undefined" && !!toyPlayAction);
  const crying = petHasCryingSoundFace();
  const startedCrying = crying && !petSoundCryingLatched;
  petSoundCryingLatched = crying;
  // One cry per visible episode; accepted care keeps its own response.
  if (startedCrying && !activeCare) return playPetSound("cry");
  return entered && !activeCare ? playPetSound("angry") : false;
}

function petHasCryingSoundFace() {
  const visiblePet = typeof isDead !== "undefined" && !isDead &&
    typeof hatchingComplete !== "undefined" && hatchingComplete &&
    typeof isHungryPose === "function" && !isHungryPose();
  if (!visiblePet || typeof getCurrentPetImage !== "function") return false;
  // Follow the face actually drawn: Youth may still look tearful during care,
  // while a child can briefly smile before returning to a new crying episode.
  if (lifeStage === "adult") return !!adultSprites.crying && getCurrentPetImage() === adultSprites.crying;
  if (lifeStage === "elder") return typeof isPetCrying === "function" && isPetCrying();
  return typeof petCryImg !== "undefined" && !!petCryImg && getCurrentPetImage() === petCryImg;
}

function canPlayIdlePetSound() {
  if (!recordedPetSoundSelection.idle || !petSoundCanPlay()) return false;
  if (typeof farewell !== "undefined" && farewell) return false;
  if (typeof isEating !== "undefined" && isEating) return false;
  if (typeof isBeingPetted !== "undefined" && isBeingPetted) return false;
  if (typeof isPlaying !== "undefined" && isPlaying) return false;
  if (typeof toyPlayAction !== "undefined" && toyPlayAction) return false;
  if (typeof toyBall !== "undefined" && toyBall.dragging) return false;
  if (typeof adultApproach !== "undefined" && adultApproach) return false;
  if (typeof adultReaction !== "undefined" && adultReaction) return false;
  if (typeof isAdultAngry === "function" && isAdultAngry()) return false;
  if (typeof lifeStage !== "undefined" && lifeStage === "adult" &&
      typeof YOUTH_MOOD !== "undefined" && happiness < YOUTH_MOOD.angry) return false;
  if (typeof isPetCrying === "function" && isPetCrying()) return false;
  if (typeof isHungryPose === "function" && isHungryPose()) return false;
  if (typeof energy !== "undefined" && energy <= 10) return false;
  if (typeof ballChaseUntil !== "undefined" && typeof millis === "function" && millis() < ballChaseUntil) return false;
  return true;
}

function updateIdlePetSound(elapsedSeconds) {
  // Preview changes, growth and rebirth all pick the current stage's rhythm.
  if (typeof lifeStage !== "undefined" && lifeStage !== recordedIdlePetSoundStage) resetIdlePetSoundTimer();
  if (!canPlayIdlePetSound()) {
    if (petSoundVoice && petSoundVoice.kind === "idle") stopPetSounds();
    return false;
  }
  const entry = recordedPetSoundPlayers[recordedPetSoundSelection.idle];
  if (petSoundVoice || !entry || entry.failed || entry.audio.readyState < 2) return false;
  const seconds = Math.max(0, Math.min(Number(elapsedSeconds) || 0, 0.25));
  recordedIdlePetSoundElapsed += seconds;
  if (recordedIdlePetSoundElapsed < recordedIdlePetSoundDelay) return false;
  return playPetSound("idle");
}

for (const gesture of ["pointerdown", "pointerup", "touchend", "keydown"]) {
  document.addEventListener(gesture, unlockPetSounds, true);
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopPetSounds();
  petSoundAngryFaceLatched = petHasAngrySoundFace();
  petSoundCryingLatched = petHasCryingSoundFace();
});
window.addEventListener("pagehide", stopPetSounds);
// Detached media can delay window.load. Begin preloading after p5 may start,
// so a slow/failed voice download never prevents the game from opening.
if (document.readyState === "complete") preparePetSounds();
else window.addEventListener("load", preparePetSounds, { once: true });
