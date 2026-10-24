// Three gentle requests are spread across each senior life using active age.
const ELDER_PET_REQUEST = { count: 3, visibleSeconds: 6, gapSeconds: 4 };
let elderPetRequests = { times: [], shown: 0, active: null, nextAllowedAge: 0 };

function resetElderPetRequests() {
  elderPetRequests = { times: [], shown: 0, active: null, nextAllowedAge: 0 };
}

function initializeElderPetRequests() {
  if (elderPetRequests.times.length) return;
  elderPetRequests.times = [random(0.06, 0.12), random(0.38, 0.48), random(0.70, 0.80)]
    .map(fraction => fraction * NATURAL_LIFESPAN_SECONDS);
}

function canShowElderPetRequest() {
  return lifeStage === "elder" && !isDead && hatchingComplete && !namingPopupOpen &&
    !helpPopupOpen && !growthPopupOpen && !isSleeping && !goingToSleep &&
    !isEating && !isBeingPetted && !isPlaying && !isPooping && !toyPlayAction &&
    !toyBall.dragging && millis() >= ballChaseUntil && !isPetCrying() &&
    hunger >= HUNGER_FLATTEN_THRESHOLD;
}

function finishElderPetRequest() {
  if (!elderPetRequests.active) return;
  elderPetRequests.active = null;
  elderPetRequests.nextAllowedAge = elderAgeSeconds + ELDER_PET_REQUEST.gapSeconds;
}

function updateElderPetRequests(seconds) {
  if (lifeStage !== "elder" || isDead || document.hidden) return;
  initializeElderPetRequests();
  // Busy or distressed pets defer the cue rather than consuming unseen requests.
  if (!canShowElderPetRequest()) return;
  if (elderPetRequests.active) {
    elderPetRequests.active.visibleFor += constrain(seconds, 0, 0.25);
    if (elderPetRequests.active.visibleFor >= ELDER_PET_REQUEST.visibleSeconds) finishElderPetRequest();
    return;
  }
  const { times, shown, nextAllowedAge } = elderPetRequests;
  if (shown >= ELDER_PET_REQUEST.count || elderAgeSeconds < times[shown] || elderAgeSeconds < nextAllowedAge) return;
  elderPetRequests.active = { visibleFor: 0 };
  elderPetRequests.shown++;
}

function elderPetRequestsFinished() {
  return elderPetRequests.shown >= ELDER_PET_REQUEST.count && !elderPetRequests.active;
}

function fulfillElderPetRequest() {
  if (lifeStage === "elder") finishElderPetRequest();
}

function elderPetBubbleBounds() {
  const body = getPetBody();
  const w = 96, h = 64;
  const onRight = groundX + body.width * 0.5 + w + 12 < width - 14;
  const x = onRight ? groundX + body.width * 0.35 + 8 : groundX - body.width * 0.35 - w - 8;
  const y = constrain(groundY + jumpOffset - body.height - h - 18, 104, height - h - 112);
  return { x: constrain(x, 12, width - w - 12), y, w, h, onRight };
}

function isOverElderPetBubble() {
  if (!elderPetRequests.active || !canShowElderPetRequest()) return false;
  const b = elderPetBubbleBounds();
  const dx = (mouseX - b.x - b.w / 2) / (b.w / 2 + 4);
  const dy = (mouseY - b.y - b.h / 2) / (b.h / 2 + 4);
  return dx * dx + dy * dy <= 1;
}

function drawPettingHand(x, y) {
  // A soft four-finger cartoon glove matches the game's simple outlined art.
  const ctx = drawingContext;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.28);
  ctx.scale(0.8, 0.8);
  ctx.fillStyle = "#fff5df";
  ctx.strokeStyle = "#715b40";
  ctx.lineWidth = 2;
  ctx.lineJoin = ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, 12);
  ctx.bezierCurveTo(-12, 9, -15, 5, -18, 1);
  ctx.bezierCurveTo(-22, -5, -16, -9, -12, -4);
  ctx.lineTo(-9, -1);
  ctx.lineTo(-9, -12);
  ctx.bezierCurveTo(-9, -19, -1, -19, -1, -12);
  ctx.lineTo(-1, -15);
  ctx.bezierCurveTo(-1, -22, 7, -22, 7, -15);
  ctx.lineTo(7, -12);
  ctx.bezierCurveTo(7, -19, 15, -18, 15, -11);
  ctx.lineTo(15, -5);
  ctx.bezierCurveTo(15, 5, 12, 10, 8, 13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // One curved palm mark and a rounded cuff keep the tiny silhouette readable.
  ctx.beginPath();
  ctx.moveTo(-7, 3);
  ctx.quadraticCurveTo(-1, -1, 5, 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(-9, 10, 19, 7, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawElderPetRequest() {
  if (!elderPetRequests.active || !canShowElderPetRequest()) return;
  const b = elderPetBubbleBounds();
  const elapsed = elderPetRequests.active.visibleFor;
  const opacity = hatchSmooth(min(elapsed / 0.35, (ELDER_PET_REQUEST.visibleSeconds - elapsed) / 0.35));
  const hover = isOverElderPetBubble();
  push();
  translate(b.x, b.y);
  // A wide comic bubble has a soft bottom tip and three trailing thought dots.
  drawingContext.globalAlpha *= opacity;
  stroke(79, 75, 67);
  strokeWeight(1.6);
  fill(hover ? color(255, 252, 241) : color(255, 254, 250));
  ellipseMode(CENTER);
  const side = b.onRight ? 1 : -1;
  const tailX = b.w * (b.onRight ? 0.4 : 0.6);
  circle(tailX - side * 4, b.h + 16, 7);
  circle(tailX - side * 12, b.h + 25, 5);
  circle(tailX - side * 19, b.h + 31, 3);
  // Native curves preserve a continuous outline around the oval and its tip.
  const ctx = drawingContext;
  ctx.beginPath();
  ctx.moveTo(0, b.h / 2);
  ctx.bezierCurveTo(0, -b.h / 6, b.w, -b.h / 6, b.w, b.h / 2);
  ctx.bezierCurveTo(b.w, b.h * 0.83, b.w * 0.76, b.h, tailX + 7, b.h);
  ctx.bezierCurveTo(tailX + 4, b.h + 9, tailX - 4, b.h + 9, tailX - 7, b.h);
  ctx.bezierCurveTo(b.w * 0.18, b.h, 0, b.h * 0.8, 0, b.h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  push();
  translate(31, 31);
  scale(0.62);
  drawToolbarIcon("pet", 0, 0);
  pop();
  drawPettingHand(65, 32);
  pop();
  if (hover) cursor(HAND);
}

function handleElderPetRequestClick() {
  if (!isOverElderPetBubble()) return false;
  performPet();
  return true;
}
