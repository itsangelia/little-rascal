// The guide shares the existing canvas and pauses the pet while it is open.
let helpPopupOpen = false;
let helpPage = 0;
let helpOpenedAt = 0;
const helpButtonBounds = { x: 850, y: 72, w: 32, h: 32 };
const helpTabs = ["ABOUT", "HOW TO PLAY", "CARE"];

function helpContains(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

function isOverHelpButton() {
  const b = helpButtonBounds;
  return helpContains(b.x, b.y, b.w, b.h);
}

function openHelpPopup() {
  if (helpPopupOpen || isDead || growthPopupOpen) return;
  stopPetSounds();
  helpPage = 0;
  helpOpenedAt = millis();
  helpPopupOpen = true;
}

function closeHelpPopup() {
  if (!helpPopupOpen) return;
  const pausedFor = millis() - helpOpenedAt;
  // Active-second counters stop in draw(); absolute deadlines need shifting too.
  nextPoopTime += pausedFor;
  if (mealPoopTime > 0) mealPoopTime += pausedFor;
  if (actionEndTime > 0) actionEndTime += pausedFor;
  if (poopEndTime > 0) poopEndTime += pausedFor;
  if (ballChaseUntil > 0) ballChaseUntil += pausedFor;
  if (adultAffectionUntil > 0) adultAffectionUntil += pausedFor;
  if (adultAngryUntil > 0) adultAngryUntil += pausedFor;
  if (Number.isFinite(lastGrowthCareTime)) lastGrowthCareTime += pausedFor;
  if (Number.isFinite(lastBallRewardAt)) lastBallRewardAt += pausedFor;
  if (Number.isFinite(growthStartedAt)) growthStartedAt += pausedFor;
  if (toyBall.lastPointerAt > 0) toyBall.lastPointerAt += pausedFor;
  helpPopupOpen = false;
  cursor(ARROW);
}

function drawHelpButton() {
  const b = helpButtonBounds;
  const hover = isOverHelpButton();
  push();
  uiPaperCircle(b.x + b.w / 2, b.y + b.h / 2, b.w, { hover, tone: "cream" });
  noStroke();
  fill(UI_THEME.ink);
  textFont("Arial");
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("?", b.x + b.w / 2, b.y + b.h / 2);
  pop();
}

function helpDrawSprite(img, x, y, spriteWidth) {
  const art = getPetArtwork(img);
  const spriteHeight = spriteWidth * art.height / art.width;
  imageMode(CORNER);
  image(img, x - spriteWidth / 2, y - spriteHeight / 2, spriteWidth, spriteHeight,
    art.x, art.y, art.width, art.height);
}

function helpHeading(title, subtitle) {
  noStroke();
  fill(UI_THEME.ink);
  textStyle(BOLD);
  textSize(28);
  text(title, width / 2, 179);
  textStyle(NORMAL);
  textSize(15);
  fill(UI_THEME.muted);
  text(subtitle, width / 2, 213);
}

function helpDrawAbout() {
  helpHeading("A little life, in your hands", "Young pets may refuse care or get bored with repeated interactions.");
  const stages = [
    { x: 235, img: petNormalImg, label: "LITTLE ONE" },
    { x: 450, img: adultSprites.normal, label: LIFE_STAGE_LABELS.adult.toUpperCase() },
    { x: 665, img: elderSprites.normal, label: "SENIOR" }
  ];
  for (const stage of stages) {
    stroke(lerpColor(color(UI_THEME.paper), color(UI_THEME.outline), 0.55));
    strokeWeight(1);
    fill(lerpColor(color(UI_THEME.paper), color(UI_THEME.gold), 0.08));
    rect(stage.x - 83, 245, 166, 139, 20);
    helpDrawSprite(stage.img, stage.x, 306, 78);
    noStroke();
    fill(UI_THEME.muted);
    textSize(12);
    textStyle(BOLD);
    text(stage.label, stage.x, 361);
  }
  stroke(UI_THEME.outline);
  strokeWeight(2);
  for (const x of [342, 557]) {
    line(x - 10, 309, x + 10, 309);
    line(x + 10, 309, x + 4, 303);
    line(x + 10, 309, x + 4, 315);
  }
  noStroke();
  fill(UI_THEME.ink);
  textStyle(NORMAL);
  textSize(15);
  text("Pet, play or clean. Then let them sleep — they grow on waking.", width / 2, 447);
}

function helpControlRow(type, title, body, y) {
  noStroke();
  fill(lerpColor(color(UI_THEME.paper), color(UI_THEME.gold), 0.23));
  circle(172, y, 42);
  drawToolbarIcon(type, 172, y);
  textAlign(LEFT, CENTER);
  fill(UI_THEME.ink);
  textStyle(BOLD);
  textSize(16);
  text(title, 210, y - 10);
  textStyle(NORMAL);
  textSize(14);
  fill(UI_THEME.muted);
  text(body, 210, y + 12);
  textAlign(CENTER, CENTER);
}

function helpDrawControls() {
  helpHeading("Little gestures, big feelings", "Choose a tool below, then click what you want to care for.");
  helpControlRow("feed", "FEED", "Choose FEED, then click your pet to offer a meal.", 264);
  helpControlRow("pet", "PET", "Choose PET, then click your pet for a gentle stroke.", 312);
  helpControlRow("play", "PLAY", "Drag and release the floor ball, or choose PLAY and click your pet.", 360);
  helpControlRow("sleep", "SLEEP", "Click SLEEP to send your pet to bed and recover energy.", 408);
  helpControlRow("clean", "CLEAN", "Choose CLEAN, then click each pile of waste to remove it.", 456);
}

function helpDrawCare() {
  helpHeading("Notice what your pet needs", "Watch hunger, mood and energy — their body gives you clues too.");
  const cards = [
    { y: 244, title: "TIME FOR A MEAL", lines: ["Below 30 hunger, your pet looks weak and flat.", "A meal helps them fill out again. Zero hunger for 8 seconds is fatal."] },
    { y: 322, title: "A LITTLE COMFORT", lines: ["Pet or play with them to lift their mood. Let them sleep for energy.", "Mood at zero for 8 seconds can also end their little life."] },
    { y: 400, title: "KEEP THEIR HOME FRESH", lines: ["Waste attracts flies after 6 seconds; 7 more seconds can cause fatal illness.", "Smelly waste makes them cry. Clean every smelly pile to comfort them."] }
  ];
  for (const card of cards) {
    noStroke();
    fill(lerpColor(color(UI_THEME.paper), color(UI_THEME.sage), 0.12));
    rect(139, card.y, 622, 69, 12);
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(12);
    fill(UI_THEME.ink);
    text(card.title, 157, card.y + 15);
    textStyle(NORMAL);
    textSize(13);
    fill(UI_THEME.muted);
    text(card.lines[0], 157, card.y + 35);
    text(card.lines[1], 157, card.y + 53);
  }
  textAlign(CENTER, CENTER);
}

function helpDrawNavButton(label, x, w, primary) {
  const hover = helpContains(x, 496, w, 43);
  stroke(UI_THEME.outline);
  strokeWeight(1.3);
  fill(lerpColor(color(UI_THEME.paper), color(primary ? UI_THEME.gold : UI_THEME.sage),
    primary ? (hover ? 0.48 : 0.35) : (hover ? 0.17 : 0.07)));
  rect(x, 496, w, 43, 19);
  noStroke();
  fill(UI_THEME.ink);
  textSize(14);
  textStyle(BOLD);
  text(label, x + w / 2, 518);
}

function drawHelpPopup() {
  push();
  rectMode(CORNER);
  imageMode(CORNER);
  ellipseMode(CENTER);
  textFont("Arial");
  textAlign(CENTER, CENTER);
  noStroke();
  fill(72, 64, 49, 88);
  rect(0, 0, width, height);
  fill(103, 83, 61, 24);
  rect(96, 102, 720, 470, 24);
  stroke(UI_THEME.outline);
  strokeWeight(1.7);
  fill(UI_THEME.paper);
  rect(90, 94, 720, 470, 24);
  noFill();
  stroke(lerpColor(color(UI_THEME.paper), color(UI_THEME.outline), 0.35));
  strokeWeight(1);
  rect(99, 103, 702, 452, 19);
  for (let i = 0; i < helpTabs.length; i++) {
    const x = 139 + i * 199;
    noStroke();
    fill(lerpColor(color(UI_THEME.paper), color(i === helpPage ? UI_THEME.gold : UI_THEME.sage), i === helpPage ? 0.32 : 0.09));
    rect(x, 112, 185, 34, 12);
    fill(i === helpPage ? UI_THEME.ink : UI_THEME.muted);
    textStyle(BOLD);
    textSize(13);
    text(helpTabs[i], x + 92.5, 129);
  }
  const closeHover = helpContains(766, 109, 30, 30);
  stroke(closeHover ? UI_THEME.ink : UI_THEME.outline);
  strokeWeight(1.7);
  line(776, 119, 786, 129);
  line(786, 119, 776, 129);
  if (helpPage === 0) helpDrawAbout();
  else if (helpPage === 1) helpDrawControls();
  else helpDrawCare();
  if (helpPage > 0) helpDrawNavButton("BACK", 139, 110, false);
  helpDrawNavButton(helpPage === 2 ? "START PLAYING" : "NEXT", 601, 160, true);
  textStyle(NORMAL);
  textSize(12);
  noStroke();
  fill(UI_THEME.muted);
  text((helpPage + 1) + " / 3", 450, 518);
  const overTab = helpTabs.some((_, i) => helpContains(139 + i * 199, 112, 185, 34));
  const overBack = helpPage > 0 && helpContains(139, 496, 110, 43);
  cursor(closeHover || overTab || overBack || helpContains(601, 496, 160, 43) ? HAND : ARROW);
  pop();
}

function handleHelpClick() {
  if (!helpPopupOpen) {
    if (isDead || growthPopupOpen || !isOverHelpButton()) return false;
    openHelpPopup();
    return true;
  }
  if (helpContains(766, 109, 30, 30)) closeHelpPopup();
  else if (helpContains(601, 496, 160, 43)) {
    if (helpPage === 2) closeHelpPopup();
    else helpPage++;
  } else if (helpPage > 0 && helpContains(139, 496, 110, 43)) helpPage--;
  else {
    for (let i = 0; i < helpTabs.length; i++) {
      if (helpContains(139 + i * 199, 112, 185, 34)) helpPage = i;
    }
  }
  // Every click is consumed while the paper is open, including outside clicks.
  return true;
}
