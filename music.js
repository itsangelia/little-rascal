// Music is enabled on each fresh visit; the browser may wait for a first gesture.
let musicEnabled = true;
const musicAudio = new Audio("bgm.mp3");
const musicButtonBounds = { x: 842, y: 574, w: 38, h: 38 };
musicAudio.loop = true;
musicAudio.volume = 0.3;
musicAudio.autoplay = true;

function startBackgroundMusic() {
  if (!musicEnabled || !musicAudio.paused) return Promise.resolve();
  try {
    return Promise.resolve(musicAudio.play()).then(() => {
      // A queued play request must never override a later mute click.
      if (!musicEnabled) musicAudio.pause();
    }).catch(() => {
      // Browser autoplay denial is retried after a trusted user gesture.
    });
  } catch (_) {
    return Promise.resolve();
  }
}

function isOverMusicButton() {
  const b = musicButtonBounds;
  const dx = mouseX - (b.x + b.w / 2);
  const dy = mouseY - (b.y + b.h / 2);
  return dx * dx + dy * dy <= (b.w / 2) * (b.w / 2);
}

// Called from the existing mouse handler before gameplay or modal hit tests.
function handleMusicClick() {
  if (!isOverMusicButton()) return false;
  musicEnabled = !musicEnabled;
  if (musicEnabled) startBackgroundMusic();
  else musicAudio.pause();
  return true;
}

function drawSpeakerIcon(enabled) {
  noStroke();
  fill(UI_THEME.ink);
  rectMode(CORNER);
  rect(-11, -4, 5, 8, 1);
  beginShape();
  vertex(-7, -4);
  vertex(0, -9);
  vertex(0, 9);
  vertex(-7, 4);
  endShape(CLOSE);
  noFill();
  stroke(UI_THEME.ink);
  strokeWeight(1.45);
  strokeCap(ROUND);
  if (enabled) {
    // Exactly three sound waves accompany the enabled speaker.
    for (const diameter of [10, 19, 28]) {
      arc(1, 0, diameter, diameter, -PI / 3, PI / 3);
    }
  } else {
    // Muted: all sound waves disappear, leaving one clear diagonal slash.
    strokeWeight(2);
    line(-12, 11, 13, -11);
  }
}

function drawMusicButton() {
  const b = musicButtonBounds;
  const hover = isOverMusicButton();
  push();
  uiPaperCircle(b.x + b.w / 2, b.y + b.h / 2, b.w, {
    hover, pressed: hover && mouseIsPressed, tone: "cream"
  });
  translate(b.x + b.w / 2, b.y + b.h / 2);
  scale(0.92);
  drawSpeakerIcon(musicEnabled);
  pop();
  if (hover) cursor(HAND);
}

// Preserve eager startup and gesture unlocking without ever overriding mute.
musicAudio.addEventListener("canplaythrough", startBackgroundMusic);
for (const gesture of ["pointerdown", "pointerup", "click", "touchend", "keydown"]) {
  document.addEventListener(gesture, startBackgroundMusic, true);
}
startBackgroundMusic();
