// Farewell uses active time. Both the envelope and letter wait for the player.
const FAREWELL_SECONDS = { still: 3, soften: 4, dissolve: 3, rise: 3.8, scatter: 1.8,
  gather: 3.4, newborn: 1.8 };
const LETTER_CLOSE = { x: 360, y: 563, w: 180, h: 40 };
const NATURAL_LIFESPAN_SECONDS = 80;
let elderAgeSeconds = 0;
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

// Only active, visible gameplay ages the senior; dialogs and birth do not.
function updateNaturalAging(seconds = deltaTime / 1000) {
  if (isDead || lifeStage !== "elder" || document.hidden) return;
  const activeSeconds = constrain(seconds, 0, 0.25);
  elderAgeSeconds += activeSeconds;
  updateElderPetRequests(activeSeconds);
  if (elderAgeSeconds < NATURAL_LIFESPAN_SECONDS) return;
  // Let the last hop land and finish ongoing care. Neglect retains priority.
  if (movementState === "jump" || isSleeping || goingToSleep || isEating ||
      isBeingPetted || isPlaying || isPooping || toyBall.dragging || toyPlayAction ||
      hunger <= 0 || happiness <= 0 || isStinkCrying()) return;
  if (!elderPetRequestsFinished()) return;
  die("oldAge");
}

function startFarewell() {
  const sprite = elderSprites.normal;
  const art = getPetArtwork(sprite);
  const bodyWidth = art.width * petRenderFactor(sprite) * getScaleAtY(groundY);
  farewell = {
    phase: "still", elapsed: 0, x: groundX, y: groundY, bodyWidth, sprite, art,
    name: petName
  };
}

// Neglect keeps the earlier result screen. Only natural death receives a letter.
function drawDeathEnding() {
  if (deathCause === "oldAge") drawFarewell();
  else drawDeathSummary();
}

function initializeFarewellPreview() {
  // Only the dedicated preview opts in. Normal game links always start at the egg.
  if (document.body.dataset.previewEnding !== "farewell") return;
  companionshipSeconds = 240;
  die("oldAge");
}

function farewellNoise(i) {
  const value = sin(i * 127.1 + 311.7) * 43758.5453;
  return value - floor(value);
}

function updateFarewell(seconds = deltaTime / 1000) {
  if (!farewell || farewell.phase === "letter" || document.hidden) return;
  if (farewell.phase === "envelope") {
    // Keep a visible-time clock for the idle sway while waiting for a click.
    farewell.elapsed += constrain(seconds, 0, 0.1);
    return;
  }
  farewell.elapsed += constrain(seconds, 0, 0.1);
  const duration = FAREWELL_SECONDS[farewell.phase];
  if (farewell.elapsed < duration) return;
  const next = { still: "soften", soften: "dissolve", dissolve: "rise", rise: "scatter",
    scatter: "envelope", gather: "newborn" }[farewell.phase];
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

function farewellBodyShape(softness) {
  const p = hatchSmooth(softness);
  return { width: farewell.bodyWidth * (1 + 0.04 * p),
    height: farewell.bodyWidth * farewell.art.height / farewell.art.width * (1 - 0.15 * p) };
}

function drawFarewellBody(progress, softness = 1) {
  const f = farewell, shape = farewellBodyShape(softness);
  const w = shape.width, h = shape.height;
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
  image(f.sprite, left, top, w, h, f.art.x, f.art.y, f.art.width, f.art.height);
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

function farewellEnvelopeBounds() {
  return { x: farewell.x - 48, y: farewell.y - 58, w: 96, h: 64 };
}

function isOverFarewellEnvelope() {
  if (farewell?.phase !== "envelope") return false;
  const b = farewellEnvelopeBounds();
  return helpContains(b.x, b.y, b.w, b.h);
}

function drawFarewellEnvelope() {
  const opacity = hatchSmooth(farewell.elapsed / 0.8);
  const hover = isOverFarewellEnvelope();
  push();
  translate(farewell.x, farewell.y - 26);
  noStroke();
  fill(96, 77, 53, opacity * 25);
  ellipse(0, 29, 86, 10);
  // Rock gently around the bottom edge; the floor shadow stays planted.
  const sway = sin(farewell.elapsed * TWO_PI / 2.8) * 0.03 * opacity;
  translate(0, 27);
  rotate(-0.055 + sway);
  translate(0, -27);
  // A cream paper envelope with a folded flap and the pet's little star seal.
  stroke(174, 143, 95, opacity * 230);
  strokeWeight(1.4);
  strokeJoin(ROUND);
  fill(hover ? color(255, 247, 218, opacity * 255) : color(253, 247, 229, opacity * 255));
  beginShape();
  vertex(-43, -27); vertex(42, -26); vertex(44, 26);
  vertex(-42, 27); vertex(-43, -27);
  endShape(CLOSE);
  stroke(194, 164, 117, opacity * 200);
  noFill();
  beginShape();
  vertex(-42, 25); vertex(-6, -2); vertex(6, -2); vertex(43, 25);
  endShape();
  fill(248, 236, 207, opacity * 255);
  beginShape();
  vertex(-42, -26); vertex(42, -25); vertex(4, 5); vertex(-3, 5);
  endShape(CLOSE);
  drawFarewellStar(0, 3, 8, opacity * 245);
  if (hover) {
    noFill();
    stroke(226, 190, 113, opacity * 130);
    strokeWeight(1);
    rect(-48, -32, 96, 64, 5);
  }
  pop();
  cursor(hover ? HAND : ARROW);
}

function openFarewellEnvelope() {
  if (farewell?.phase !== "envelope") return;
  farewell.phase = "letter";
  farewell.elapsed = 0;
  cursor(ARROW);
}

// Keep the owner's wording exactly; only visual line wrapping may vary.
const FAREWELL_LETTER = [
  "Dear Friend,",
  "Thank you for taking care of me.",
  "I had a wonderful time with you.",
  "Even when I was naughty, you stayed by my side.",
  "I'm glad we met.",
  "PS: I will leave a little starlight in your room.",
  "Love, Little Rascal"
];

function drawFarewellLetter() {
  noStroke();
  fill(58, 59, 43, 75);
  rect(0, 0, width, height);
  // An unfolded sheet, with a folded corner, faint rules and a warm paper edge.
  fill(75, 66, 43, 28);
  rect(184, 51, 550, 502, 2);
  stroke(202, 183, 144);
  strokeWeight(1);
  fill(255, 251, 237);
  beginShape();
  vertex(175, 42); vertex(693, 42); vertex(725, 74);
  vertex(725, 544); vertex(175, 544);
  endShape(CLOSE);
  fill(239, 228, 200);
  triangle(693, 42, 693, 74, 725, 74);
  stroke(222, 209, 177, 80);
  for (let y = 144; y <= 494; y += 25) line(210, y, 690, y);
  stroke(224, 192, 164, 90);
  line(210, 76, 210, 510);
  noStroke();
  fill(104, 84, 59);
  textFont("Georgia");
  textStyle(NORMAL);
  textAlign(LEFT, CENTER);
  textSize(24);
  text(FAREWELL_LETTER[0], 230, 103);
  textSize(18);
  text(FAREWELL_LETTER[1], 230, 178);
  text(FAREWELL_LETTER[2], 230, 228);
  text(FAREWELL_LETTER[3], 230, 278);
  text(FAREWELL_LETTER[4], 230, 353);
  textSize(16);
  text(FAREWELL_LETTER[5], 230, 415);
  textStyle(ITALIC);
  textSize(22);
  text(FAREWELL_LETTER[6], 430, 478);
  drawFarewellStar(674, 488, 8, 170);
  const b = LETTER_CLOSE, hover = helpContains(b.x, b.y, b.w, b.h);
  stroke(183, 145, 72);
  strokeWeight(1.3);
  fill(hover ? color(250, 224, 145) : color(242, 218, 158));
  rect(b.x, b.y, b.w, b.h, 18);
  noStroke();
  fill(100, 78, 49);
  textFont("Arial");
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  textSize(14);
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
  if (phase === "still") drawFarewellBody(0, 0);
  else if (phase === "soften") drawFarewellBody(0, p);
  else if (phase === "dissolve") drawFarewellBody(p);
  else if (phase === "rise") drawFarewellSoul(p, min(1, p * 5) * 205);
  else if (phase === "scatter") {
    drawFarewellSoul(1, 205 * (1 - hatchSmooth(min(1, p * 1.7))));
    drawSoulStars(p);
  } else if (phase === "envelope") drawFarewellEnvelope();
  else if (phase === "letter") drawFarewellLetter();
  else if (phase === "gather") drawRebirth(p);
  else if (phase === "newborn") {
    drawRebirth(1);
    noStroke();
    fill(112, 89, 60, 255 * sin(constrain(p, 0, 1) * PI));
    textFont("Arial");
    textStyle(NORMAL);
    textSize(26);
    textAlign(CENTER, CENTER);
    text("A New Beginning", EGG_X, FLOOR_Y + 55);
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
  if (farewell?.phase === "envelope") {
    if (isOverFarewellEnvelope()) openFarewellEnvelope();
    return;
  }
  if (farewell?.phase !== "letter") return;
  const b = LETTER_CLOSE;
  if (helpContains(b.x, b.y, b.w, b.h)) closeFarewellLetter();
}

// Extend input without introducing another p5 keyPressed() handler.
document.addEventListener("keydown", event => {
  if (typeof isDead === "undefined" || !isDead || !farewell || event.repeat) return;
  if (farewell.phase === "envelope" && ["Enter", " "].includes(event.key)) {
    event.preventDefault();
    openFarewellEnvelope();
    return;
  }
  if (farewell.phase === "letter" && ["Enter", "Escape", " "].includes(event.key)) {
    event.preventDefault();
    closeFarewellLetter();
  }
});
