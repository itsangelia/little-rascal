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
  if (teenAngryUntil > 0) teenAngryUntil += pausedFor;
  if (ballChaseUntil > 0) ballChaseUntil += pausedFor;
  if (adultAffectionUntil > 0) adultAffectionUntil += pausedFor;
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
  ellipseMode(CENTER);
  stroke(174, 153, 105);
  strokeWeight(1.4);
  fill(hover ? color(250, 228, 164, 245) : color(252, 247, 225, 230));
  circle(b.x + b.w / 2, b.y + b.h / 2, b.w);
  noStroke();
  fill(113, 97, 64);
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
  fill(107, 88, 59);
  textStyle(BOLD);
  textSize(28);
  text(title, width / 2, 179);
  textStyle(NORMAL);
  textSize(15);
  fill(126, 131, 100);
  text(subtitle, width / 2, 213);
}

function helpDrawAbout() {
  helpHeading("A little life, in your hands", "Care for Little Rascal and discover each growing stage.");
  const stages = [
    { x: 235, img: petNormalImg, label: "LITTLE ONE" },
    { x: 450, img: teenNormalImg, label: "TEENAGER" },
    { x: 665, img: adultSprites.normal, label: "GROWN UP" }
  ];
  for (const stage of stages) {
    stroke(222, 213, 177);
    strokeWeight(1);
    fill(250, 246, 228);
    rect(stage.x - 83, 245, 166, 139, 20);
    helpDrawSprite(stage.img, stage.x, 306, 78);
    noStroke();
    fill(119, 124, 91);
    textSize(12);
    textStyle(BOLD);
    text(stage.label, stage.x, 361);
  }
  stroke(186, 178, 139);
  strokeWeight(2);
  for (const x of [342, 557]) {
    line(x - 10, 309, x + 10, 309);
    line(x + 10, 309, x + 4, 303);
    line(x + 10, 309, x + 4, 315);
  }
  noStroke();
  textStyle(BOLD);
  textSize(17);
  fill(111, 91, 60);
  text("Two useful feeds + two other care actions", width / 2, 419);
  textStyle(NORMAL);
  textSize(15);
  text("Pet, play or clean. Then let them sleep — they grow on waking.", width / 2, 447);
}

function helpControlRow(type, title, body, y) {
  noStroke();
  fill(239, 230, 198);
  circle(172, y, 42);
  drawToolbarIcon(type, 172, y);
  textAlign(LEFT, CENTER);
  fill(111, 91, 60);
  textStyle(BOLD);
  textSize(16);
  text(title, 210, y - 10);
  textStyle(NORMAL);
  textSize(14);
  fill(121, 123, 99);
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
    { y: 244, title: "TIME FOR A MEAL", lines: ["Below 20 hunger, your pet starts to flatten from hunger.", "A meal helps them fill out again. Zero hunger for 8 seconds is fatal."] },
    { y: 322, title: "A LITTLE COMFORT", lines: ["Pet or play with them to lift their mood. Let them sleep for energy.", "Mood at zero for 8 seconds can also end their little life."] },
    { y: 400, title: "KEEP THEIR HOME FRESH", lines: ["Waste attracts flies after 6 seconds; 7 more seconds can cause fatal illness.", "Smelly waste makes them cry. Clean every smelly pile to comfort them."] }
  ];
  for (const card of cards) {
    noStroke();
    fill(240, 237, 215);
    rect(139, card.y, 622, 69, 12);
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(12);
    fill(117, 123, 88);
    text(card.title, 157, card.y + 15);
    textStyle(NORMAL);
    textSize(13);
    fill(114, 98, 74);
    text(card.lines[0], 157, card.y + 35);
    text(card.lines[1], 157, card.y + 53);
  }
  textAlign(CENTER, CENTER);
}

function helpDrawNavButton(label, x, w, primary) {
  const hover = helpContains(x, 496, w, 43);
  stroke(primary ? color(184, 148, 78) : color(198, 191, 157));
  strokeWeight(1.3);
  fill(primary ? (hover ? color(250, 222, 137) : color(242, 216, 156))
    : (hover ? color(239, 237, 216) : color(248, 245, 229)));
  rect(x, 496, w, 43, 19);
  noStroke();
  fill(105, 88, 58);
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
  fill(58, 59, 43, 88);
  rect(0, 0, width, height);
  fill(75, 66, 43, 24);
  rect(96, 102, 720, 470, 24);
  stroke(183, 162, 113);
  strokeWeight(1.7);
  fill(253, 250, 237);
  rect(90, 94, 720, 470, 24);
  noFill();
  stroke(234, 225, 195);
  strokeWeight(1);
  rect(99, 103, 702, 452, 19);
  for (let i = 0; i < helpTabs.length; i++) {
    const x = 139 + i * 199;
    noStroke();
    fill(i === helpPage ? color(238, 224, 175) : color(244, 240, 221));
    rect(x, 112, 185, 34, 12);
    fill(i === helpPage ? color(106, 86, 53) : color(141, 138, 109));
    textStyle(BOLD);
    textSize(13);
    text(helpTabs[i], x + 92.5, 129);
  }
  const closeHover = helpContains(766, 109, 30, 30);
  stroke(closeHover ? color(136, 99, 61) : color(171, 154, 112));
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
  fill(153, 148, 117);
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
