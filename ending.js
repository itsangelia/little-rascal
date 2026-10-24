// Farewell is an active-time sequence. The letter waits for the player's choice.
const FAREWELL_SECONDS = { still: 1, dissolve: 3, rise: 3.8, scatter: 1.8,
  gather: 3.4, newborn: 1.8 };
const LETTER_CLOSE = { x: 340, y: 490, w: 220, h: 46 };
let farewell = null;
let farewellSoul;

async function initializeFarewellArtwork() {
  // Use the exact approved F drawing, rather than regenerating the character.
  const sheet = await loadImage("design-options/farewell-options.png");
  const soul = sheet.get(1080, 580, 415, 345);
  soul.loadPixels();
  // Remove the pale green concept paper at render time; preserve cream and ochre.
  for (let i = 0; i < soul.pixels.length; i += 4) {
    const r = soul.pixels[i], g = soul.pixels[i + 1], b = soul.pixels[i + 2];
    if (g >= r - 4 && g > b + 5) soul.pixels[i + 3] = 0;
  }
  soul.updatePixels();
  farewellSoul = trimStageSprite(soul);
}

function startFarewell() {
  const stageScale = lifeStage === "child" ? CHILD_MODEL_SCALE : 1;
  const bodyWidth = BASE_PET_WIDTH * getScaleAtY(groundY) * (651 / 2732) * stageScale;
  farewell = {
    phase: "still", elapsed: 0, x: groundX, y: groundY, bodyWidth,
    name: petName, cause: deathCause, stage: lifeStage,
    seconds: floor(companionshipSeconds)
  };
}

function initializeFarewellPreview() {
  // Only the dedicated preview opts in. Normal game links always start at the egg.
  if (document.body.dataset.previewEnding !== "farewell") return;
  companionshipSeconds = 240;
  die("sadness");
}

function farewellNoise(i) {
  const value = sin(i * 127.1 + 311.7) * 43758.5453;
  return value - floor(value);
}

function updateFarewell(seconds = deltaTime / 1000) {
  if (!farewell || farewell.phase === "letter" || document.hidden) return;
  farewell.elapsed += constrain(seconds, 0, 0.1);
  const duration = FAREWELL_SECONDS[farewell.phase];
  if (farewell.elapsed < duration) return;
  const next = { still: "dissolve", dissolve: "rise", rise: "scatter",
    scatter: "letter", gather: "newborn" }[farewell.phase];
  if (farewell.phase === "newborn") {
    restartPet();
    return;
  }
  farewell.phase = next;
  farewell.elapsed = 0;
}

function drawFarewellRoom() {
  imageMode(CORNER);
  image(mapImg, 0, 0, width, height);
  const gathering = farewell.phase === "gather" || farewell.phase === "newborn";
  const fade = farewell.phase === "newborn" ? 0 : gathering
    ? 1 - hatchSmooth(farewell.elapsed / FAREWELL_SECONDS.gather) : 1;
  if (fade > 0) {
    push();
    tint(255, fade * 255);
    const objects = poops.map(poop => ({ y: poop.y, draw: () => drawPoop(poop) }));
    objects.push({ y: toyBall.y, draw: drawToyBall });
    objects.sort((a, b) => a.y - b.y);
    for (const object of objects) object.draw();
    pop();
  }
}

function drawFarewellBody(progress) {
  const f = farewell, w = f.bodyWidth, h = w * DEATH_ART.height / DEATH_ART.width;
  const left = f.x - w / 2, top = f.y - h;
  noStroke();
  fill(96, 77, 53, 25 * (1 - progress));
  ellipse(f.x, f.y + 5, w * 0.9, 10);
  // Small clipped cells disappear from the upper right towards the lower left.
  const ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 24; col++) {
      const threshold = ((23 - col) / 23 * 0.4 + row / 11 * 0.35 +
        farewellNoise(row * 24 + col) * 0.25) * 0.9 + 0.05;
      if (progress < threshold) ctx.rect(left + col * w / 24, top + row * h / 12, w / 24 + 0.3, h / 12 + 0.3);
    }
  }
  ctx.clip();
  push();
  tint(255, 255 * (1 - progress * 0.45));
  image(deathImg, left, top, w, h, DEATH_ART.x, DEATH_ART.y, DEATH_ART.width, DEATH_ART.height);
  pop();
  ctx.restore();
  if (progress <= 0) return;
  for (let i = 0; i < 24; i++) {
    const p = constrain((progress - farewellNoise(i) * 0.65) / 0.35, 0, 1);
    if (p <= 0 || p >= 1) continue;
    drawFarewellStar(left + farewellNoise(i + 40) * w + p * 15,
      top + farewellNoise(i + 80) * h - p * 30, 1.5 + i % 3, sin(p * PI) * 175, i * 0.3);
  }
}

function drawFarewellStar(x, y, radius, opacity, angle = -Math.PI / 2) {
  push();
  stroke(196, 151, 75, opacity * 0.75);
  strokeWeight(0.8);
  strokeJoin(ROUND);
  fill(255, 225, 148, opacity);
  drawStar(x, y, radius, angle);
  pop();
}

function soulPosition(progress) {
  const distance = min(230, farewell.y - 130);
  return { x: farewell.x + sin(progress * PI * 2) * 9,
    y: farewell.y - 35 - hatchSmooth(progress) * distance };
}

function drawFarewellSoul(progress, opacity) {
  const point = soulPosition(progress);
  const w = max(100, farewell.bodyWidth * 1.5);
  const h = w * farewellSoul.height / farewellSoul.width;
  push();
  tint(255, opacity);
  image(farewellSoul, point.x - w / 2, point.y - h, w, h);
  pop();
}

function drawSoulStars(progress) {
  const point = soulPosition(1);
  for (let i = 0; i < 15; i++) {
    const angle = -PI + farewellNoise(i) * PI;
    const distance = hatchEaseOut(progress) * (30 + farewellNoise(i + 20) * 90);
    drawFarewellStar(point.x + cos(angle) * distance,
      point.y - 45 + sin(angle) * distance - progress * 25,
      3 + i % 4, 220 * (1 - hatchSmooth(progress)), i * 0.6 + progress * 0.2);
  }
}

function drawFarewellLetter() {
  noStroke();
  fill(58, 59, 43, 80);
  rect(0, 0, width, height);
  fill(75, 66, 43, 24);
  rect(201, 94, 510, 466, 25);
  stroke(183, 162, 113);
  strokeWeight(1.7);
  fill(253, 250, 237);
  rect(195, 86, 510, 466, 25);
  noFill();
  stroke(234, 225, 195);
  strokeWeight(1);
  rect(204, 95, 492, 448, 19);
  drawFarewellStar(450, 126, 12, 230);
  noStroke();
  textFont("Arial");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(107, 88, 59);
  textSize(28);
  text("Thank you for being my person", 450, 171);
  textStyle(NORMAL);
  textSize(16);
  fill(114, 98, 74);
  text("Our little time together has come to an end.\nThank you for sharing your world with me.", 450, 233);
  const reasons = {
    starvation: "My little tummy stayed empty for too long.",
    sadness: "I needed more company, and my heart grew too sad.",
    illness: "The uncleaned room made me too ill to stay."
  };
  textSize(14);
  text(reasons[farewell.cause] || "It is time for me to say goodbye.", 450, 298);
  fill(139, 142, 110);
  textSize(13);
  const stage = { child: "Child", adult: "Adult", elder: "Senior" }[farewell.stage];
  const minutes = floor(farewell.seconds / 60), seconds = farewell.seconds % 60;
  text("Time together: " + minutes + "m " + seconds + "s  ·  " + stage, 450, 339);
  fill(114, 98, 74);
  textSize(16);
  text("I will leave a little starlight in your room.", 450, 384);
  textStyle(BOLD);
  drawFittedPetText("With love, " + farewell.name, 450, 432, 420, 21);
  const b = LETTER_CLOSE, hover = helpContains(b.x, b.y, b.w, b.h);
  stroke(183, 145, 72);
  strokeWeight(1.5);
  fill(hover ? color(250, 224, 145) : color(242, 218, 158));
  rect(b.x, b.y, b.w, b.h, 21);
  noStroke();
  fill(100, 78, 49);
  textSize(16);
  text("CLOSE LETTER", 450, b.y + b.h / 2);
  cursor(hover ? HAND : ARROW);
}

function drawRebirth(progress) {
  const p = hatchSmooth(progress);
  for (let i = 0; i < 30; i++) {
    const startX = 90 + farewellNoise(i) * 720;
    const startY = 120 + farewellNoise(i + 50) * 370;
    const endAngle = i * TWO_PI / 30;
    const targetX = EGG_X + sin(endAngle) * 31;
    const targetY = EGG_Y + cos(endAngle) * 40;
    const x = lerp(startX, targetX, p) + sin(progress * PI) * sin(i) * 25;
    const y = lerp(startY, targetY, p) - sin(progress * PI) * 20;
    const opacity = min(1, progress * 5) * (1 - constrain((progress - 0.75) / 0.25, 0, 1));
    drawFarewellStar(x, y, 3 + i % 3, opacity * 240, i + p);
  }
  if (progress > 0.55) {
    const opacity = hatchSmooth((progress - 0.55) / 0.45);
    push();
    noStroke();
    fill(88, 71, 40, opacity * 30);
    ellipse(EGG_X, FLOOR_Y + 4, 68, 13);
    tint(255, 255 * opacity);
    drawEgg(0, 0);
    pop();
  }
}

function drawFarewell() {
  if (!farewell) startFarewell();
  updateFarewell();
  if (!farewell) { drawHatchingIntro(); return; }
  push();
  imageMode(CORNER);
  rectMode(CORNER);
  ellipseMode(CENTER);
  drawFarewellRoom();
  cursor(ARROW);
  const phase = farewell.phase;
  const p = farewell.elapsed / (FAREWELL_SECONDS[phase] || 1);
  if (phase === "still") drawFarewellBody(0);
  else if (phase === "dissolve") drawFarewellBody(p);
  else if (phase === "rise") drawFarewellSoul(p, min(1, p * 5) * 205);
  else if (phase === "scatter") {
    drawFarewellSoul(1, 205 * (1 - hatchSmooth(min(1, p * 1.7))));
    drawSoulStars(p);
  } else if (phase === "letter") drawFarewellLetter();
  else if (phase === "gather") drawRebirth(p);
  else if (phase === "newborn") {
    drawRebirth(1);
    noStroke();
    fill(112, 89, 60, 255 * sin(constrain(p, 0, 1) * PI));
    textFont("Arial");
    textStyle(NORMAL);
    textSize(26);
    textAlign(CENTER, CENTER);
    text("新生", EGG_X, FLOOR_Y + 55);
  }
  pop();
}

function closeFarewellLetter() {
  if (!farewell || farewell.phase !== "letter") return;
  farewell.phase = "gather";
  farewell.elapsed = 0;
  cursor(ARROW);
}

function handleFarewellClick() {
  if (farewell?.phase !== "letter") return;
  const b = LETTER_CLOSE;
  if (helpContains(b.x, b.y, b.w, b.h)) closeFarewellLetter();
}

// Extend input without introducing another p5 keyPressed() handler.
document.addEventListener("keydown", event => {
  if (typeof isDead === "undefined" || !isDead || farewell?.phase !== "letter" || event.repeat) return;
  if (["Enter", "Escape", " "].includes(event.key)) {
    event.preventDefault();
    closeFarewellLetter();
  }
});
