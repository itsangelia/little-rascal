// Load the owner's chosen artwork without changing any source PNG files.
async function loadApprovedStageArtwork() {
  const [normal, crying, happy, expressions, elderSheet] = await Promise.all([
    loadImage("assets/adult-original/normal.png"),
    loadImage("assets/adult-original/crying.png"),
    loadImage("design-options/adult-happy-open-eyes.png"),
    loadImage("design-options/adult-outlined-expression-review.png"),
    loadImage("design-options/elder-a-tired-happy.png")
  ]);

  const adult = {
    normal: trimStageSprite(normal),
    crying: trimStageSprite(crying),
    happy: trimStageSprite(happy),
    unimpressed: trimStageSprite(expressions.get(71, 100, 600, 563)),
    angry: trimStageSprite(expressions.get(695, 100, 601, 563))
  };
  // Existing sleep and affection behaviors reuse the approved expressions.
  adult.sleepy = adult.unimpressed;
  adult.affectionate = adult.happy;

  const elder = {};
  const crops = [
    { name: "normal", x: 76, width: 594 },
    { name: "tired", x: 718, width: 595 },
    { name: "happy", x: 1360, width: 595 }
  ];
  for (const crop of crops) {
    // The approved elderly sheet has a white paper background and labels.
    // Limit each viewport to the character, then clear only exterior paper.
    const sprite = elderSheet.get(crop.x, 90, crop.width, 510);
    clearExteriorPaper(sprite);
    elder[crop.name] = trimStageSprite(sprite);
  }
  return { adult, elder };
}

function trimStageSprite(img) {
  img.loadPixels();
  let left = img.width, right = -1, top = img.height, bottom = -1;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (img.pixels[(y * img.width + x) * 4 + 3] < 128) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left || bottom < top) throw new Error("Empty growth-stage artwork");
  return img.get(left, top, right - left + 1, bottom - top + 1);
}

function clearExteriorPaper(img) {
  img.loadPixels();
  const w = img.width, h = img.height;
  const visited = new Uint8Array(w * h);
  const pending = [];
  const visit = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const index = y * w + x;
    if (visited[index]) return;
    visited[index] = 1;
    const p = index * 4;
    if (img.pixels[p] < 235 || img.pixels[p + 1] < 235 || img.pixels[p + 2] < 235) return;
    pending.push(index);
  };
  for (let x = 0; x < w; x++) { visit(x, 0); visit(x, h - 1); }
  for (let y = 0; y < h; y++) { visit(0, y); visit(w - 1, y); }
  while (pending.length) {
    const index = pending.pop();
    img.pixels[index * 4 + 3] = 0;
    const x = index % w, y = Math.floor(index / w);
    visit(x - 1, y); visit(x + 1, y); visit(x, y - 1); visit(x, y + 1);
  }
  // White areas enclosed by the black contour remain part of the illustration.
  img.updatePixels();
}

const LIFE_STAGES = ["child", "teenager", "adult", "elder"];

function nextLifeStage() {
  const index = LIFE_STAGES.indexOf(lifeStage);
  return index >= 0 ? LIFE_STAGES[index + 1] || null : null;
}

function isMatureStage() {
  return lifeStage === "adult" || lifeStage === "elder";
}

function isMatureArtwork(img) {
  return Object.values(adultSprites).includes(img) || Object.values(elderSprites).includes(img);
}

const ELDER_MOVEMENT = { speedFactor: 0.4, hopPower: 0.65, hopsPerBurst: 3, restSeconds: 3 };
let elderRestRemaining = 0;
let elderHopsInBurst = 0;

function petMovementFactor() {
  return lifeStage === "elder" ? ELDER_MOVEMENT.speedFactor : 1;
}

function petHopFactor() {
  return lifeStage === "elder" ? ELDER_MOVEMENT.hopPower : 1;
}

function ballPursuitMilliseconds() {
  // Small senior hops need enough time to reach a player-thrown toy.
  return lifeStage === "elder" ? 20000 : 8000;
}

function resetElderMovement() {
  elderRestRemaining = 0;
  elderHopsInBurst = 0;
}

function elderRestPending() {
  return lifeStage === "elder" && elderRestRemaining > 0;
}

function updateElderRest() {
  if (lifeStage !== "elder" || hunger < HUNGER_FLATTEN_THRESHOLD ||
      goingToSleep || isPlaying || toyBall.dragging ||
      millis() < ballChaseUntil) return false;
  const seconds = constrain(deltaTime / 1000, 0, 0.05);
  if (elderRestRemaining <= 0 || movementState === "jump") return false;
  // A full three-second floor stop follows a short burst of autonomous hops.
  elderRestRemaining = Math.max(0, elderRestRemaining - seconds);
  if (adultApproach) adultApproach.until += seconds;
  floorVX = floorVY = jumpOffset = jumpVelocity = 0;
  movementState = "pause";
  pauseTimer = 1;
  return true;
}

// Dedicated review pages start at a stage; normal visits still begin with the egg.
function initializeStagePreview() {
  const stage = document.body.dataset.previewStage;
  if (stage !== "adult" && stage !== "elder") return;
  lifeStage = stage;
  resetElderMovement();
  hatchingComplete = petHasBeenNamed = helpHasBeenShown = true;
  hatchPhase = "complete";
  adultNextActionAt = companionshipSeconds + 12;
}
