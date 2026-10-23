// Isolated visual prototype: no changes to the playable game's lifecycle or rules.
const HATCH_W = 900;
const HATCH_H = 640;
const EGG_X = 450;
const FLOOR_Y = 455;
const EGG_Y = FLOOR_Y - 40;
const PET_ART = { x: 970, y: 780, width: 651, height: 609 };
const HAPPY_ART = { x: 955, y: 772, width: 667, height: 625 };
let roomImage, childImage, happyImage;
let hatchStartedAt = null;
let hatchPhase = "loading";

async function setup() {
  createCanvas(HATCH_W, HATCH_H);
  roomImage = await loadImage("map.jpg");
  childImage = await loadImage("kid.png");
  happyImage = await loadImage("kid happy.png");
  hatchPhase = "idle";
}

function hatchEaseOut(t) { return 1 - pow(1 - constrain(t, 0, 1), 3); }
function hatchSmooth(t) { t = constrain(t, 0, 1); return t * t * (3 - 2 * t); }

function draw() {
  if (!roomImage || !childImage || !happyImage) return;
  imageMode(CORNER);
  image(roomImage, 0, 0, width, height);
  const time = hatchStartedAt === null ? -1 : millis() - hatchStartedAt;
  hatchPhase = time < 0 ? "idle" : time < 350 ? "shake" : time < 1400 ? "meteor"
    : time < 1800 ? "crack" : time < 2450 ? "reveal" : "alive";

  noStroke();
  fill(88, 71, 40, 30);
  ellipse(EGG_X, FLOOR_Y + 4, 68, 13);

  // The original room remains visible; only a mild dusk wash emphasizes the star.
  if (time >= 350 && time < 2100) {
    const dim = sin(constrain((time - 350) / 1750, 0, 1) * PI);
    fill(83, 103, 99, dim * 28);
    rect(0, 0, width, height);
  }

  if (time < 1800) {
    const shake = time >= 0 && time < 350 ? sin(time * 0.055) * 0.09 : 0;
    const glow = time >= 0 ? 0.5 + 0.5 * sin(time * 0.008) : 0;
    drawEgg(shake, glow);
    if (time >= 1400) drawCrack(hatchSmooth((time - 1400) / 400));
  }
  if (time >= 350 && time < 1400) drawMeteor((time - 350) / 1050);
  if (time >= 1400 && time < 2450) drawStarBurst((time - 1400) / 1050);
  if (time >= 1800) {
    const reveal = hatchEaseOut((time - 1800) / 650);
    drawShells(reveal);
    drawHatchedPet(reveal, time);
  }
  if (time >= 2450) drawReplay();

  const overEgg = abs(mouseX - EGG_X) < 42 && mouseY > FLOOR_Y - 91 && mouseY < FLOOR_Y + 8;
  const overReplay = dist(mouseX, mouseY, width / 2, 574) < 24;
  cursor((hatchPhase === "idle" && overEgg) || (hatchPhase === "alive" && overReplay) ? HAND : ARROW);
}

function drawStar(x, y, radius, rotation = -HALF_PI) {
  beginShape();
  for (let i = 0; i < 10; i++) {
    const angle = rotation + i * PI / 5;
    const r = i % 2 === 0 ? radius : radius * 0.48;
    vertex(x + cos(angle) * r, y + sin(angle) * r);
  }
  endShape(CLOSE);
}

function eggOutline() {
  beginShape();
  for (let i = 0; i <= 48; i++) {
    const angle = i * TWO_PI / 48;
    vertex(sin(angle) * 34 * (1 + cos(angle) * 0.12), cos(angle) * 43);
  }
  endShape(CLOSE);
}

function drawEgg(angle, glow) {
  push();
  translate(EGG_X, EGG_Y);
  rotate(angle);
  if (hatchPhase === "idle") {
    noFill();
    stroke(232, 196, 106, 65 + sin(millis() * 0.003) * 25);
    strokeWeight(2);
    ellipse(0, 4, 83, 101);
  }
  fill(255, 248, 234);
  stroke(171, 126, 66);
  strokeWeight(2);
  eggOutline();
  fill(250, 220, 130);
  strokeWeight(1.6);
  drawStar(0, 2, 13);
  noStroke();
  fill(255, 234, 160, glow * 55);
  circle(0, 2, 36);
  pop();
}

function meteorPoint(t) {
  return { x: lerp(65, EGG_X, t), y: lerp(62, EGG_Y, t) - sin(t * PI) * 45 };
}

function drawMeteor(progress) {
  const t = hatchSmooth(progress);
  push();
  noFill();
  // Short layered hand-drawn trails, not a full-screen flash.
  for (let i = 16; i >= 1; i--) {
    const a = meteorPoint(max(0, t - i * 0.009));
    const b = meteorPoint(max(0, t - (i - 1) * 0.009));
    stroke(239, 193, 91, 145 * (1 - i / 18));
    strokeWeight(2 + (1 - i / 17) * 6);
    line(a.x, a.y, b.x, b.y);
  }
  const head = meteorPoint(t);
  fill(255, 228, 132);
  stroke(198, 149, 65);
  strokeWeight(1.2);
  drawStar(head.x, head.y, 10, -HALF_PI + progress * 0.35);
  for (let i = 1; i <= 3; i++) {
    const point = meteorPoint(max(0, t - i * 0.045));
    noStroke();
    fill(255, 223, 132, 120 * (1 - progress));
    drawStar(point.x + sin(i * 3) * 12, point.y + cos(i * 2) * 12, 3);
  }
  pop();
}

function drawCrack(progress) {
  push();
  stroke(171, 126, 66);
  strokeWeight(1.8);
  noFill();
  const points = [[-28,-4],[-16,-10],[-7,0],[4,-7],[15,2],[28,-5]];
  beginShape();
  for (let i = 0; i < points.length; i++) {
    if (i / (points.length - 1) <= progress) vertex(EGG_X + points[i][0], EGG_Y + points[i][1]);
  }
  endShape();
  pop();
}

function drawStarBurst(progress) {
  push();
  noStroke();
  for (let i = 0; i < 9; i++) {
    const angle = -PI + i * TWO_PI / 9;
    const radius = 15 + hatchEaseOut(progress) * 65;
    fill(244, 202, 104, (1 - progress) * 200);
    drawStar(EGG_X + cos(angle) * radius,
      EGG_Y + sin(angle) * radius - progress * 16, 3 + (i % 3));
  }
  pop();
}

function drawShells(progress) {
  if (progress >= 1) return;
  push();
  for (const side of [-1, 1]) {
    push();
    translate(EGG_X + side * (20 + progress * 45), FLOOR_Y - 10 - sin(progress * PI) * 18);
    rotate(side * progress * 0.9);
    stroke(171, 126, 66, (1 - progress) * 210);
    strokeWeight(1.5);
    fill(255, 248, 234, (1 - progress) * 255);
    beginShape();
    vertex(-17,-10); vertex(-7,-3); vertex(0,-11); vertex(8,-3); vertex(17,-10);
    for (let j = 0; j <= 12; j++) {
      const angle = j * PI / 12;
      vertex(cos(angle) * 17, -10 + sin(angle) * 22);
    }
    endShape(CLOSE);
    pop();
  }
  pop();
}

function drawHatchedPet(progress, time) {
  const happy = time < 3900;
  const img = happy ? happyImage : childImage;
  const art = happy ? HAPPY_ART : PET_ART;
  const baseWidth = 82;
  const w = baseWidth * (0.75 + progress * 0.25);
  const h = w * art.height / art.width;
  const hop = time < 2450 ? sin(progress * PI) * 22 : 0;
  const breathe = time >= 2450 ? 1 + sin((time - 2450) * 0.002) * 0.012 : 1;
  push();
  tint(255, 255 * progress);
  imageMode(CORNER);
  image(img, EGG_X - w / 2, FLOOR_Y - h * breathe - hop, w, h * breathe,
    art.x, art.y, art.width, art.height);
  pop();
}

function drawReplay() {
  push();
  translate(width / 2, 574);
  fill(249, 234, 184, 235);
  stroke(183, 145, 72);
  strokeWeight(1.5);
  circle(0, 0, 38);
  noFill();
  stroke(112, 89, 60);
  strokeWeight(2);
  arc(0, 0, 17, 17, -PI / 3, PI * 1.5);
  noStroke(); fill(112, 89, 60);
  triangle(4,-10,4,-3,10,-6);
  pop();
}

function beginHatching() {
  if (hatchPhase === "idle") hatchStartedAt = millis();
}

function resetHatching() {
  hatchStartedAt = null;
  hatchPhase = "idle";
}

function mousePressed() {
  if (hatchPhase === "idle" && abs(mouseX - EGG_X) < 42 &&
      mouseY > FLOOR_Y - 91 && mouseY < FLOOR_Y + 8) beginHatching();
  else if (hatchPhase === "alive" && dist(mouseX, mouseY, width / 2, 574) < 24) resetHatching();
}

function keyPressed(event) {
  if (event.key === "Enter" || event.key === " ") {
    if (hatchPhase === "alive") resetHatching();
    else beginHatching();
    return false;
  }
  if ((event.key === "r" || event.key === "R") && hatchPhase === "alive") resetHatching();
}
