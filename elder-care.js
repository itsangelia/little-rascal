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
  const w = 72, h = 72;
  const onRight = groundX + body.width * 0.5 + w + 12 < width - 14;
  const x = onRight ? groundX + body.width * 0.35 + 8 : groundX - body.width * 0.35 - w - 8;
  const y = constrain(groundY + jumpOffset - body.height - h - 18, 104, height - h - 112);
  return { x: constrain(x, 12, width - w - 12), y, w, h, onRight };
}

function isOverElderPetBubble() {
  if (!elderPetRequests.active || !canShowElderPetRequest()) return false;
  const b = elderPetBubbleBounds();
  return dist(mouseX, mouseY, b.x + b.w / 2, b.y + b.h / 2) <= b.w / 2 + 4;
}

function drawPettingHand(x, y) {
  // Canvas curves keep this small outlined hand compatible with p5 2's renderer.
  const ctx = drawingContext;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#9f7f53";
  ctx.fillStyle = "#f9e8c8";
  ctx.lineWidth = 1.3;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-6, 12); ctx.lineTo(-12, 2);
  ctx.bezierCurveTo(-15, -3, -10, -5, -7, 0);
  ctx.lineTo(-5, 2); ctx.lineTo(-5, -10);
  ctx.bezierCurveTo(-5, -14, -1, -14, -1, -10);
  ctx.lineTo(-1, -2); ctx.lineTo(-1, -14);
  ctx.bezierCurveTo(-1, -17, 3, -17, 3, -14);
  ctx.lineTo(3, -2); ctx.lineTo(3, -12);
  ctx.bezierCurveTo(3, -15, 7, -15, 7, -12);
  ctx.lineTo(7, 0); ctx.lineTo(7, -7);
  ctx.bezierCurveTo(7, -10, 11, -10, 11, -7);
  ctx.lineTo(11, 4); ctx.bezierCurveTo(11, 10, 7, 13, 5, 14);
  ctx.closePath();
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
  // Three small thought circles lead to the large circle containing only icons.
  drawingContext.globalAlpha *= opacity;
  stroke(184, 158, 109);
  strokeWeight(1.4);
  fill(hover ? color(255, 248, 225) : color(254, 250, 236));
  ellipseMode(CENTER);
  const side = b.onRight ? 1 : -1;
  const tailX = b.onRight ? 3 : b.w - 3;
  circle(tailX - side * 9, b.h + 15, 4);
  circle(tailX - side * 3, b.h + 8, 6);
  circle(tailX + side * 5, b.h + 1, 9);
  circle(b.w / 2, b.h / 2, b.w);
  push();
  translate(22, 35);
  scale(0.62);
  drawToolbarIcon("pet", 0, 0);
  pop();
  drawPettingHand(48, 36);
  pop();
  if (hover) cursor(HAND);
}

function handleElderPetRequestClick() {
  if (!isOverElderPetBubble()) return false;
  performPet();
  return true;
}
