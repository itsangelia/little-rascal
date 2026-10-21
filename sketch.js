// BACKGROUND MUSIC
let bgm;
let musicButton;
let musicMuted = false;

function startBGM() {
  if (bgm && !musicMuted && bgm.paused) {
    bgm.play().catch(() => {});
  }
}

function toggleBGM() {
  musicMuted = !musicMuted;
  bgm.muted = musicMuted;

  musicButton.html(musicMuted ? "Music: OFF" : "Music: ON");

  if (!musicMuted) {
    startBGM();
  }
}// ============================================================
// LITTLE RASCAL
// COMPLETE TERRARIUM VERSION
// p5.js 2.0
//
// REQUIRED FILES:
// map.jpg
// kid.png
// kid happy.png
// kid cry.png
//
// MOVEMENT:
//
// groundX = left / right on floor
// groundY = front / back on floor
// jumpOffset = vertical height
//
// REAL JUMP:
//
// jumpVelocity += gravity
// jumpOffset += jumpVelocity
//
// ============================================================



// ============================================================
// IMAGES
// ============================================================

let mapImg;
let poopImg;
let deathImg;

// Neglect timers use active game seconds, not wall-clock time in hidden tabs.
const DEATH_RULES = {
  starvationSeconds: 8,
  sadnessSeconds: 8,
  poopSmellSeconds: 6,
  poopFatalSeconds: 13
};
let isDead = false;
let deathCause = "";
let starvationTime = 0;
let sadnessTime = 0;
let deathTime = 0;
let companionshipSeconds = 0;
const DEATH_ART = { x: 281, y: 190, width: 1261, height: 563 };

// Visible artwork bounds inside the original transparent image.
const POOP_ART = { x: 1010, y: 884, width: 341, height: 230 };

let petNormalImg;
let petHappyImg;
let petCryImg;
let teenNormalImg;
let teenHappyImg;
let teenCryImg;
let teenMadImg;

const GROWTH_RULES = { feeds: 2, care: 2, feedThreshold: 95 };
let lifeStage = "child";
let growthFeeds = 0;
let growthCare = 0;
let lastGrowthCareTime = -Infinity;
let growthStartedAt = -Infinity;
let growthSleepPending = false;
let growthWakeReady = false;
let growthPopupOpen = false;
let growthPopupOpenedAt = 0;



// ============================================================
// CANVAS
// ============================================================

const CANVAS_W = 900;
const CANVAS_H = 640;



// ============================================================
// PET SIZE
// ============================================================

let BASE_PET_WIDTH = 300
  ;



// ============================================================
// PET FLOOR POSITION
// ============================================================

let groundX = 450;
let groundY = 420;



// ============================================================
// JUMP PHYSICS
// ============================================================

// 0 = floor
// negative = above floor

let jumpOffset = 0;

let jumpVelocity = 0;


let gravity = 0.35;


let normalJumpPower = -6.5;

let playJumpPower = -7.2;


// Movement across floor plane

let floorVX = 0;

let floorVY = 0;


// Destination of current hop

let jumpTargetX = groundX;

let jumpTargetY = groundY;



// ============================================================
// MOVEMENT STATE
// ============================================================

let movementState = "land";

// land
// pause
// jump

let landTimer = 8;

let pauseTimer = 0;



// ============================================================
// SQUASH / STRETCH
// ============================================================

let squashX = 1;

let squashY = 1;

let petAngle = 0;



// ============================================================
// FLOOR
// ============================================================

const FLOOR_TOP = 290;

const FLOOR_BOTTOM = 535;


const BACK_LEFT = 245;

const BACK_RIGHT = 665;


const FRONT_LEFT = 55;

const FRONT_RIGHT = 845;



// ============================================================
// BED
// ============================================================

const BED_X = 660;

const BED_Y = 325;



// ============================================================
// STATS
// ============================================================

let hunger = 85;

let happiness = 85;

let energy = 85;


// Faster drain

let hungerDrain = 0.90;

let happinessDrain = 0.45;

let energyDrain = 0.30;



// ============================================================
// NEED THRESHOLDS
// ============================================================

// Below 35 hunger:
// Mood falls faster.

const LOW_HUNGER_THRESHOLD = 35;


// Below 30 mood:
// Pet cries and stops moving.

const CRY_THRESHOLD = 30;


// Extra mood loss when hungry

const HUNGRY_MOOD_DRAIN = 1.10;



// ============================================================
// INTERACTION
// ============================================================

let interactionMode = "none";


let isEating = false;

let isBeingPetted = false;

let isPlaying = false;


let actionEndTime = 0;



// ============================================================
// PLAY
// ============================================================

let playHopsRemaining = 0;



// ============================================================
// SLEEP
// ============================================================

let goingToSleep = false;

let isSleeping = false;



// ============================================================
// POOP
// ============================================================

let poops = [];


let nextPoopTime = 0;

let mealPoopTime = 0;


let isPooping = false;


let poopEndTime = 0;


let poopCreatedThisTime = false;


const MAX_POOPS = 5;



// ============================================================
// EFFECTS
// ============================================================

let hearts = [];

let sparkles = [];



// ============================================================
// UI BUTTONS
// ============================================================

const toolbarButtons = [

  {
    type: "feed",
    label: "FEED",
    x: 270,
    y: 595
  },

  {
    type: "pet",
    label: "PET",
    x: 360,
    y: 595
  },

  {
    type: "play",
    label: "PLAY",
    x: 450,
    y: 595
  },

  {
    type: "sleep",
    label: "SLEEP",
    x: 540,
    y: 595
  },

  {
    type: "clean",
    label: "CLEAN",
    x: 630,
    y: 595
  }

];



// ============================================================
// DEBUG
// ============================================================

const DEBUG_FLOOR = false;



// ============================================================
// SETUP
// ============================================================

async function setup() {
  imageMode(CENTER);
  textFont("Arial");



  nextPoopTime = millis() + random(18000, 30000);


  createCanvas(
    CANVAS_W,
    CANVAS_H
  );


  imageMode(CENTER);

  rectMode(CORNER);

  textFont("Arial");


  // ==========================================================
  // LOAD IMAGES
  // ==========================================================

  mapImg =
    await loadImage(
      "map.jpg"
    );


  petNormalImg =
    await loadImage(
      "kid.png"
    );


  petHappyImg =
    await loadImage(
      "kid happy.png"
    );


  petCryImg =
    await loadImage(
      "kid cry.png"
    );


  teenNormalImg = await loadImage("teenager.png");
  teenHappyImg = await loadImage("teenager happy.png");
  teenCryImg = await loadImage("teenager cry.png");
  teenMadImg = await loadImage("teenager mad.png");

  poopImg = await loadImage("shit.png");
  deathImg = await loadImage("design-options/death-a3-cross-eyes.png");


  // First random poop

  nextPoopTime =
    millis() +
    random(
      18000,
      30000
    );

}



// ============================================================
// DRAW
// ============================================================

function draw() {
  if (growthPopupOpen && !isDead) {
    imageMode(CENTER);
    image(mapImg, width / 2, height / 2, width, height);
    drawWorld();
    drawStats();
    drawToolbar();
    drawGrowthPopup();
    return;
  }
  if (isDead) {
    drawDeathSummary();
    return;
  }


  // ==========================================================
  // BACKGROUND
  // ==========================================================

  imageMode(CENTER);


  image(
    mapImg,
    width / 2,
    height / 2,
    width,
    height
  );


  // ==========================================================
  // LOGIC
  // ==========================================================

  if (!isDead) {
    companionshipSeconds += constrain(deltaTime / 1000, 0, 0.25);
    updateStats();
    updateNeglect();
    if (!isDead) {
      updateMovement();
      updateActionTimer();
      updatePoopSystem();
      updateGrowth();
    }
  }

  if (isDead) {
    drawDeathSummary();
    return;
  }

  // ==========================================================
  // DEBUG
  // ==========================================================

  if (DEBUG_FLOOR) {

    drawDebugFloor();

  }


  // ==========================================================
  // WORLD
  // ==========================================================

  drawWorld();

  if (!isDead) {
    drawEffects();
    drawGrowthEffect();
  }


  // ==========================================================
  // UI
  // ==========================================================

  drawStats();


  drawToolbar();

  drawCustomCursor();
  if (growthPopupOpen) drawGrowthPopup();

}



// ============================================================
// IS PET CRYING?
// ============================================================

function isPetCrying() {

  return (

    happiness < CRY_THRESHOLD &&

    !isSleeping &&

    !goingToSleep &&

    !isEating &&

    !isBeingPetted

  );

}



// ============================================================
// UPDATE STATS
// ============================================================

function updateStats() {

  let seconds = constrain(deltaTime / 1000, 0, 0.25);


  // ==========================================================
  // NORMAL DRAIN
  // ==========================================================

  if (
    !isSleeping &&
    !goingToSleep
  ) {


    // Hunger

    hunger -=
      hungerDrain *
      seconds;


    // Mood

    happiness -=
      happinessDrain *
      seconds;


    // Energy

    energy -=
      energyDrain *
      seconds;


    // ========================================================
    // LOW HUNGER DAMAGES MOOD
    // ========================================================

    if (
      hunger <
      LOW_HUNGER_THRESHOLD
    ) {

      happiness -=
        HUNGRY_MOOD_DRAIN *
        seconds;

    }


    // ========================================================
    // POOP DAMAGES MOOD
    // ========================================================

    happiness -=

      poops.length *

      0.08 *

      seconds;

  }


  // ==========================================================
  // SLEEP RECOVERY
  // ==========================================================

  if (isSleeping) {

    energy +=
      10 *
      seconds;


    if (
      energy >= 80
    ) {

      energy = 80;


      isSleeping = false;
      growthWakeReady = growthWakeReady || growthSleepPending ||
        (lifeStage === "child" && growthFeeds >= GROWTH_RULES.feeds &&
         growthCare >= GROWTH_RULES.care);
      growthSleepPending = false;


      movementState =
        "pause";


      pauseTimer = 25;

    }

  }


  // ==========================================================
  // LIMIT VALUES
  // ==========================================================

  hunger =
    constrain(
      hunger,
      0,
      100
    );


  happiness =
    constrain(
      happiness,
      0,
      100
    );


  energy =
    constrain(
      energy,
      0,
      100
    );


  // ==========================================================
  // AUTO SLEEP
  // ==========================================================

  if (

    energy <= 8 &&

    !isSleeping &&

    !goingToSleep &&

    !isEating &&

    !isBeingPetted &&

    !isPlaying &&

    !isPooping &&

    !isPetCrying()

  ) {

    startSleeping();

  }

}



// ============================================================
// MOVEMENT
// ============================================================

function updateMovement() {


  // ==========================================================
  // CRYING
  // ==========================================================
  //
  // Mood below threshold:
  //
  // STOP.
  // Stay in current floor position.
  // Cry in place.
  //
  // ==========================================================

  if (
    isPetCrying()
  ) {

    jumpOffset = 0;

    jumpVelocity = 0;


    floorVX = 0;

    floorVY = 0;


    movementState =
      "pause";


    isPlaying = false;


    playHopsRemaining = 0;


    return;

  }


  // ==========================================================
  // SLEEP
  // ==========================================================

  if (isSleeping) {

    groundX = BED_X;

    groundY = BED_Y;


    jumpOffset = 0;

    jumpVelocity = 0;


    floorVX = 0;

    floorVY = 0;


    return;

  }


  // ==========================================================
  // STATIC ACTION
  // ==========================================================

  if (
    isEating ||
    isBeingPetted ||
    isPooping
  ) {

    return;

  }


  // ==========================================================
  // JUMP
  // ==========================================================

  if (
    movementState ===
    "jump"
  ) {

    updatePhysicsJump();

    return;

  }


  // ==========================================================
  // GOING TO SLEEP
  // ==========================================================

  if (
    goingToSleep
  ) {

    continueGoingToBed();

    return;

  }


  // ==========================================================
  // PLAY
  // ==========================================================

  if (
    isPlaying
  ) {

    updatePlayMovement();

    return;

  }


  // ==========================================================
  // LAND
  // ==========================================================

  if (
    movementState ===
    "land"
  ) {

    landTimer--;


    if (
      landTimer <= 0
    ) {


      // Sometimes pause

      if (
        random() <
        0.15
      ) {

        movementState =
          "pause";


        pauseTimer =
          floor(
            random(
              35,
              85
            )
          );

      }


      else {

        startRandomPlaneJump(
          false
        );

      }

    }


    return;

  }


  // ==========================================================
  // PAUSE
  // ==========================================================

  if (
    movementState ===
    "pause"
  ) {

    pauseTimer--;


    if (
      pauseTimer <= 0
    ) {

      startRandomPlaneJump(
        false
      );

    }

  }

}



// ============================================================
// REAL PHYSICS JUMP
// ============================================================

function updatePhysicsJump() {

  let frameScale =
    deltaTime /
    16.6667;


  // ==========================================================
  // FLOOR PLANE MOVEMENT
  // ==========================================================

  groundX +=
    floorVX *
    frameScale;


  groundY +=
    floorVY *
    frameScale;


  // ==========================================================
  // GRAVITY
  // ==========================================================

  jumpVelocity +=
    gravity *
    frameScale;


  jumpOffset +=
    jumpVelocity *
    frameScale;


  // ==========================================================
  // LAND
  // ==========================================================

  if (

    jumpOffset >= 0 &&

    jumpVelocity > 0

  ) {

    jumpOffset = 0;


    jumpVelocity = 0;


    groundX =
      jumpTargetX;


    groundY =
      jumpTargetY;


    floorVX = 0;

    floorVY = 0;


    movementState =
      "land";


    landTimer =
      isPlaying
        ? 3
        : 7;


    // ========================================================
    // BED ARRIVAL
    // ========================================================

    if (
      goingToSleep
    ) {

      let d =
        dist(
          groundX,
          groundY,
          BED_X,
          BED_Y
        );


      if (
        d < 14
      ) {

        groundX =
          BED_X;


        groundY =
          BED_Y;


        goingToSleep =
          false;


        isSleeping =
          true;

      }

    }

  }

}



// ============================================================
// START RANDOM PLANE JUMP
// ============================================================

function startRandomPlaneJump(
  fast
) {

  let target =
    findRandomWalkableTarget(
      fast
    );


  let power =
    fast
      ? playJumpPower
      : normalJumpPower;


  startJumpTo(

    target.x,

    target.y,

    power

  );

}



// ============================================================
// FIND RANDOM POSITION
// ============================================================

function findRandomWalkableTarget(
  fast
) {


  let minimumDistance =
    fast
      ? 55
      : 70;


  let maximumXDistance =
    fast
      ? 140
      : 120;


  let maximumYDistance =
    fast
      ? 95
      : 80;


  for (
    let attempt = 0;
    attempt < 80;
    attempt++
  ) {


    // ========================================================
    // FRONT / BACK
    // ========================================================

    let targetY =

      groundY +

      random(
        -maximumYDistance,
        maximumYDistance
      );


    targetY =
      constrain(

        targetY,

        FLOOR_TOP + 12,

        FLOOR_BOTTOM - 12

      );


    let bounds =
      getFloorBounds(
        targetY
      );


    // ========================================================
    // LEFT / RIGHT
    // ========================================================

    let targetX =

      groundX +

      random(
        -maximumXDistance,
        maximumXDistance
      );


    targetX =
      constrain(

        targetX,

        bounds.left + 25,

        bounds.right - 25

      );


    let movementDistance =
      dist(

        groundX,

        groundY,

        targetX,

        targetY

      );


    if (

      movementDistance >=
      minimumDistance &&

      !isBlockedPosition(
        targetX,
        targetY
      )

    ) {

      return {

        x: targetX,

        y: targetY

      };

    }

  }


  return {

    x: 450,

    y: 420

  };

}



// ============================================================
// START JUMP
// ============================================================

function startJumpTo(

  targetX,

  targetY,

  power =
    normalJumpPower

) {

  let flightFrames =

    (
      -2 *
      power
    ) /

    gravity;


  flightFrames =
    max(
      flightFrames,
      1
    );


  floorVX =

    (
      targetX -
      groundX
    ) /

    flightFrames;


  floorVY =

    (
      targetY -
      groundY
    ) /

    flightFrames;


  jumpTargetX =
    targetX;


  jumpTargetY =
    targetY;


  jumpVelocity =
    power;


  jumpOffset =
    -0.01;


  movementState =
    "jump";

}



// ============================================================
// PLAY MOVEMENT
// ============================================================

function updatePlayMovement() {


  if (
    movementState ===
    "land"
  ) {

    landTimer--;


    if (
      landTimer <= 0
    ) {


      if (
        playHopsRemaining > 0
      ) {

        playHopsRemaining--;


        startRandomPlaneJump(
          true
        );

      }


      else {

        isPlaying = false;


        movementState =
          "pause";


        pauseTimer = 20;

      }

    }

  }


  else if (
    movementState ===
    "pause"
  ) {

    pauseTimer--;


    if (
      pauseTimer <= 0
    ) {


      if (
        playHopsRemaining > 0
      ) {

        playHopsRemaining--;


        startRandomPlaneJump(
          true
        );

      }


      else {

        isPlaying =
          false;

      }

    }

  }

}



// ============================================================
// GO TO BED
// ============================================================

function continueGoingToBed() {


  let distanceToBed =
    dist(

      groundX,

      groundY,

      BED_X,

      BED_Y

    );


  if (
    distanceToBed < 14
  ) {

    groundX =
      BED_X;


    groundY =
      BED_Y;


    jumpOffset = 0;


    movementState =
      "land";


    goingToSleep =
      false;


    isSleeping =
      true;


    return;

  }


  let stepDistance =
    min(
      distanceToBed,
      100
    );


  let dx =
    BED_X -
    groundX;


  let dy =
    BED_Y -
    groundY;


  let vectorLength =
    sqrt(

      dx * dx +

      dy * dy

    );


  let targetX =

    groundX +

    dx /
    vectorLength *
    stepDistance;


  let targetY =

    groundY +

    dy /
    vectorLength *
    stepDistance;


  startJumpTo(

    targetX,

    targetY,

    -6.1

  );

}



// ============================================================
// FLOOR BOUNDS
// ============================================================

function getFloorBounds(y) {

  let amount =
    map(

      y,

      FLOOR_TOP,

      FLOOR_BOTTOM,

      0,

      1

    );


  amount =
    constrain(
      amount,
      0,
      1
    );


  return {

    left:

      lerp(

        BACK_LEFT,

        FRONT_LEFT,

        amount

      ),


    right:

      lerp(

        BACK_RIGHT,

        FRONT_RIGHT,

        amount

      )

  };

}



// ============================================================
// OBSTACLES
// ============================================================

function isBlockedPosition(
  x,
  y
) {


  // Left plant

  if (

    x < 275 &&

    y < 365

  ) {

    return true;

  }


  // Bed

  if (

    x > 565 &&

    x < 755 &&

    y < 360

  ) {

    return true;

  }


  // Right cave

  if (

    x > 750 &&

    y < 420

  ) {

    return true;

  }


  // Poop

  for (
    let poop of poops
  ) {

    if (

      dist(

        x,
        y,

        poop.x,
        poop.y

      ) < 38

    ) {

      return true;

    }

  }


  return false;

}



// ============================================================
// DEPTH SCALE
// ============================================================

function getScaleAtY(y) {

  let scaleAmount =
    map(

      y,

      FLOOR_TOP,

      FLOOR_BOTTOM,

      0.72,

      1.10

    );


  return constrain(

    scaleAmount,

    0.70,

    1.12

  );

}



// ============================================================
// PET IMAGE
// ============================================================

function getCurrentPetImage() {


  // ==========================================================
  // POSITIVE INTERACTION
  // ==========================================================

  if (

    isEating ||

    isBeingPetted ||

    isPlaying

  ) {

    return lifeStage === "teenager" ? teenHappyImg : petHappyImg;

  }


  // ==========================================================
  // CRY
  // ==========================================================

  if (
    happiness <
    CRY_THRESHOLD
  ) {

    return lifeStage === "teenager" ? teenCryImg : petCryImg;

  }


  return lifeStage === "teenager" ? teenNormalImg : petNormalImg;

}



// ============================================================
// DRAW WORLD
// ============================================================

function drawWorld() {


  // Poop behind pet

  for (
    let poop of poops
  ) {

    if (
      poop.y <=
      groundY
    ) {

      drawPoop(
        poop
      );

    }

  }


  drawPet();


  // Poop in front

  for (
    let poop of poops
  ) {

    if (
      poop.y >
      groundY
    ) {

      drawPoop(
        poop
      );

    }

  }

}



// ============================================================
// DRAW PET
// ============================================================

function drawPet() {
  if (isDead) {
    drawDeadPet();
    return;
  }


  let petImg =
    getCurrentPetImage();


  let depthScale =
    getScaleAtY(
      groundY
    );


  let jumpHeight =
    -jumpOffset;


  // ==========================================================
  // SHADOW
  // ==========================================================

  let shadowWidth =
    map(

      jumpHeight,

      0,

      80,

      112,

      66

    );


  shadowWidth =
    constrain(

      shadowWidth,

      66,

      112

    );


  let shadowAlpha =
    map(

      jumpHeight,

      0,

      80,

      38,

      14

    );


  shadowAlpha =
    constrain(

      shadowAlpha,

      14,

      38

    );


  noStroke();


  fill(
    0,
    shadowAlpha
  );


  ellipse(

    groundX,

    groundY + 8,

    shadowWidth *
    depthScale,

    17 *
    depthScale

  );


  // ==========================================================
  // SQUASH / STRETCH
  // ==========================================================

  let targetScaleX = 1;

  let targetScaleY = 1;

  let targetAngle = 0;



  // ==========================================================
  // CRYING BODY
  // ==========================================================

  if (
    isPetCrying()
  ) {

    // Small trembling motion

    targetScaleX =
      1 +
      sin(
        frameCount *
        0.28
      ) *
      0.015;


    targetScaleY =
      0.98 +
      sin(
        frameCount *
        0.22
      ) *
      0.01;


    targetAngle =
      sin(
        frameCount *
        0.18
      ) *
      0.012;

  }


  // ==========================================================
  // LAND
  // ==========================================================

  else if (
    movementState ===
    "land"
  ) {

    targetScaleX =
      1.10;


    targetScaleY =
      0.90;


    targetAngle =
      0;

  }


  // ==========================================================
  // PAUSE
  // ==========================================================

  else if (
    movementState ===
    "pause"
  ) {

    targetScaleX =
      1;


    targetScaleY =
      1;


    targetAngle =
      0;

  }


  // ==========================================================
  // JUMP
  // ==========================================================

  else if (
    movementState ===
    "jump"
  ) {


    // Rising

    if (
      jumpVelocity <
      -1.2
    ) {

      targetScaleX =
        0.94;


      targetScaleY =
        1.08;


      targetAngle =

        0.035 *

        Math.sign(
          floorVX
        );

    }


    // Highest point

    else if (

      jumpVelocity >= -1.2 &&

      jumpVelocity <= 1.2

    ) {

      targetScaleX =
        1;


      targetScaleY =
        1;


      targetAngle =
        0;

    }


    // Falling

    else {

      targetScaleX =
        0.97;


      targetScaleY =
        1.04;


      targetAngle =

        -0.02 *

        Math.sign(
          floorVX
        );

    }

  }



  // ==========================================================
  // POOP SQUAT
  // ==========================================================

  if (
    isPooping
  ) {

    targetScaleX =

      1.07 +

      sin(
        frameCount *
        0.5
      ) *

      0.02;


    targetScaleY =
      0.93;

  }



  // ==========================================================
  // SMOOTH BODY
  // ==========================================================

  squashX =
    lerp(

      squashX,

      targetScaleX,

      0.22

    );


  squashY =
    lerp(

      squashY,

      targetScaleY,

      0.22

    );


  petAngle =
    lerp(

      petAngle,

      targetAngle,

      0.18

    );



  // ==========================================================
  // IMAGE SIZE
  // ==========================================================

  let ratio =

    petImg.height /

    petImg.width;


  let drawWidth =

    BASE_PET_WIDTH *

    depthScale *

    squashX;


  let drawHeight =

    BASE_PET_WIDTH *

    ratio *

    depthScale *

    squashY;


  let characterBottomY =

    groundY +

    jumpOffset;



  // ==========================================================
  // DRAW PET
  // ==========================================================

  push();


  translate(

    groundX,

    characterBottomY

  );


  if (
    isSleeping
  ) {

    rotate(
      0.16
    );

  }

  else {

    rotate(
      petAngle
    );

  }


  imageMode(CORNER);


  image(

    petImg,

    -drawWidth / 2,

    -drawHeight,

    drawWidth,

    drawHeight

  );


  pop();


  imageMode(CENTER);



  // ==========================================================
  // CRYING TEARS
  // ==========================================================

  if (
    isPetCrying()
  ) {

    drawCryingTears(

      drawWidth,

      drawHeight,

      depthScale

    );

  }



  // ==========================================================
  // SLEEP ZZZ
  // ==========================================================

  if (
    isSleeping
  ) {

    push();


    fill(
      70
    );


    textAlign(
      CENTER,
      CENTER
    );


    textSize(
      17
    );


    text(

      "z",

      groundX + 42,

      groundY - 72

    );


    textSize(
      24
    );


    text(

      "Z",

      groundX + 58,

      groundY - 95

    );


    pop();

  }



  // ==========================================================
  // PLAY STAR
  // ==========================================================

  if (
    isPlaying
  ) {

    push();


    fill(
      235,
      175,
      58
    );


    textAlign(
      CENTER,
      CENTER
    );


    textSize(
      21
    );


    text(

      "★",

      groundX,

      characterBottomY -
      drawHeight -
      14

    );


    pop();

  }

}



// ============================================================
// CRYING TEARS
// ============================================================

function drawCryingTears(

  drawWidth,

  drawHeight,

  depthScale

) {


  push();


  let topY =

    groundY -

    drawHeight;


  // Continuous looping tear

  let fall1 =

    (
      frameCount %
      45
    ) /

    45;


  let fall2 =

    (
      (
        frameCount + 22
      ) %
      45
    ) /

    45;


  let tearStartY =

    topY +

    drawHeight *
    0.47;


  noStroke();


  fill(
    92,
    185,
    235,
    220
  );


  // Left tear

  ellipse(

    groundX -
    drawWidth *
    0.17,

    tearStartY +
    fall1 *
    38 *
    depthScale,

    7 *
    depthScale,

    12 *
    depthScale

  );


  // Right tear

  ellipse(

    groundX +
    drawWidth *
    0.17,

    tearStartY +
    fall2 *
    38 *
    depthScale,

    7 *
    depthScale,

    12 *
    depthScale

  );


  pop();

}



// ============================================================
// STOP MOVEMENT
// ============================================================

function stopCurrentMovement() {

  jumpOffset = 0;


  jumpVelocity = 0;


  floorVX = 0;


  floorVY = 0;


  movementState =
    "land";


  landTimer = 8;

}



// ============================================================
// FEED
// ============================================================

function performFeed() {
  if (isDead) return;
  if (hunger <= GROWTH_RULES.feedThreshold &&
      !isEating && !isBeingPetted && !isPlaying && !isPooping &&
      !isSleeping && !goingToSleep && lifeStage === "child") {
    growthFeeds++;
  }

  interactionMode =
    "none";


  cursor(
    ARROW
  );


  stopCurrentMovement();


  isEating =
    true;


  hunger +=
    30;


  happiness +=
    6;


  hunger =
    constrain(
      hunger,
      0,
      100
    );


  happiness =
    constrain(
      happiness,
      0,
      100
    );


  createHeart();


  // Poop soon after food

  mealPoopTime =

    millis() +

    random(
      5000,
      8500
    );


  actionEndTime =
    millis() +
    1300;

}



// ============================================================
// PET / STROKE
// ============================================================

function performPet() {
  if (isDead) return;
  if (!isEating && !isBeingPetted && !isPlaying && !isPooping &&
      !isSleeping && !goingToSleep) recordGrowthCare();

  interactionMode =
    "none";


  cursor(
    ARROW
  );


  stopCurrentMovement();


  isBeingPetted =
    true;


  // Not too much,
  // so crying does not disappear instantly.

  happiness +=
    15;


  happiness =
    constrain(
      happiness,
      0,
      100
    );


  createHeart();

  createHeart();


  actionEndTime =
    millis() +
    1300;

}



// ============================================================
// PLAY
// ============================================================

function performPlay() {
  if (isDead) return;


  interactionMode =
    "none";


  cursor(
    ARROW
  );


  // ==========================================================
  // TOO SAD TO PLAY
  // ==========================================================

  if (
    happiness <
    CRY_THRESHOLD
  ) {

    return;

  }


  if (
    energy <= 10
  ) {

    startSleeping();

    return;

  }


  if (!isEating && !isBeingPetted && !isPlaying && !isPooping &&
      !isSleeping && !goingToSleep) recordGrowthCare();

  stopCurrentMovement();


  isPlaying =
    true;


  playHopsRemaining =
    5;


  happiness +=
    22;


  energy -=
    26;


  hunger -=
    4;


  happiness =
    constrain(
      happiness,
      0,
      100
    );


  energy =
    constrain(
      energy,
      0,
      100
    );


  hunger =
    constrain(
      hunger,
      0,
      100
    );


  landTimer =
    2;

}



// ============================================================
// ACTION TIMER
// ============================================================

function updateActionTimer() {

  if (

    actionEndTime > 0 &&

    millis() >=
    actionEndTime

  ) {

    isEating =
      false;


    isBeingPetted =
      false;


    actionEndTime =
      0;


    movementState =
      "pause";


    pauseTimer =
      18;

  }

}



// ============================================================
// SLEEP
// ============================================================

function startSleeping() {
  if (isDead) return;


  if (
    isSleeping ||
    goingToSleep
  ) {

    return;

  }


  // Too sad:
  // stay crying instead of automatically sleeping.

  if (
    happiness <
    CRY_THRESHOLD
  ) {

    return;

  }


  interactionMode =
    "none";


  cursor(
    ARROW
  );


  isEating =
    false;


  isBeingPetted =
    false;


  isPlaying =
    false;


  isPooping =
    false;


  actionEndTime =
    0;


  playHopsRemaining =
    0;


  stopCurrentMovement();


  growthSleepPending = lifeStage === "child" &&
    growthFeeds >= GROWTH_RULES.feeds && growthCare >= GROWTH_RULES.care;

  goingToSleep =
    true;

}



// ============================================================
// POOP SYSTEM
// ============================================================

function updatePoopSystem() {


  // ==========================================================
  // POOPING
  // ==========================================================

  if (
    isPooping
  ) {

    if (

      !poopCreatedThisTime &&

      millis() >=
      poopEndTime - 250

    ) {

      createPoop();


      poopCreatedThisTime =
        true;

    }


    if (
      millis() >=
      poopEndTime
    ) {

      isPooping =
        false;


      poopCreatedThisTime =
        false;


      movementState =
        "pause";


      pauseTimer =
        22;

    }


    return;

  }



  // ==========================================================
  // CANNOT POOP
  // ==========================================================

  if (

    isSleeping ||

    goingToSleep ||

    isEating ||

    isBeingPetted ||

    isPlaying ||

    isPetCrying() ||

    movementState ===
    "jump"

  ) {

    return;

  }



  let mealDue =

    mealPoopTime > 0 &&

    millis() >=
    mealPoopTime;


  let randomDue =

    millis() >=
    nextPoopTime;



  if (

    (
      mealDue ||
      randomDue
    ) &&

    poops.length <
    MAX_POOPS

  ) {

    startPooping();

  }


  else if (

    poops.length >=
    MAX_POOPS &&

    randomDue

  ) {

    nextPoopTime =

      millis() +

      random(
        12000,
        18000
      );

  }

}



// ============================================================
// START POOP
// ============================================================

function startPooping() {

  stopCurrentMovement();


  interactionMode =
    "none";


  cursor(
    ARROW
  );


  isPooping =
    true;


  poopCreatedThisTime =
    false;


  poopEndTime =
    millis() +
    950;


  mealPoopTime =
    0;


  nextPoopTime =

    millis() +

    random(
      18000,
      30000
    );

}



// ============================================================
// CREATE POOP
// ============================================================

function createPoop() {

  if (
    poops.length >=
    MAX_POOPS
  ) {

    return;

  }


  let poopY =
    constrain(

      groundY + 9,

      FLOOR_TOP,

      FLOOR_BOTTOM

    );


  let bounds =
    getFloorBounds(
      poopY
    );


  let poopX =
    constrain(

      groundX + 18,

      bounds.left + 15,

      bounds.right - 15

    );


  poops.push({

    x: poopX,

    y: poopY,

    ageSeconds: 0

  });

}



// ============================================================
// DRAW POOP
// ============================================================

function drawPoop(
  poop
) {

  // Waste keeps a fixed size at every floor depth.
  push();


  translate(
    poop.x,
    poop.y
  );




  // Shadow

  noStroke();


  fill(
    60,
    40,
    30,
    30
  );


  ellipse(
    0,
    7,
    31,
    10
  );


  // Render the hand-drawn asset without its transparent outer padding.
  // Keep its artwork proportions and align its base with the ground shadow.
  const artWidth = 36 * 1.30 * 2 * 0.70;
  const artHeight = artWidth * POOP_ART.height / POOP_ART.width;
  imageMode(CORNER);
  image(
    poopImg,
    -artWidth / 2,
    8 - artHeight,
    artWidth,
    artHeight,
    POOP_ART.x,
    POOP_ART.y,
    POOP_ART.width,
    POOP_ART.height
  );

  if ((poop.ageSeconds || 0) >= DEATH_RULES.poopSmellSeconds) {
    drawPoopStink();
  }
  pop();

}



// ============================================================
// CLEAN POOP
// ============================================================

function cleanPoopAtMouse() {
  if (isDead) return false;

  for (

    let i =
      poops.length - 1;

    i >= 0;

    i--

  ) {

    let poop =
      poops[i];


    if (

      dist(

        mouseX,

        mouseY,

        poop.x,

        poop.y

      ) <

      42

    ) {

      createSparkles(

        poop.x,

        poop.y - 8

      );


      recordGrowthCare();

      poops.splice(
        i,
        1
      );


      happiness +=
        5;


      happiness =
        constrain(
          happiness,
          0,
          100
        );


      if (
        poops.length === 0
      ) {

        interactionMode =
          "none";


        cursor(
          ARROW
        );

      }


      return true;

    }

  }


  return false;

}



// ============================================================
// HEART
// ============================================================

function createHeart() {

  hearts.push({

    x:

      groundX +

      random(
        -16,
        16
      ),


    y:

      groundY +

      jumpOffset -

      110,


    life:
      60

  });

}



// ============================================================
// SPARKLES
// ============================================================

function createSparkles(
  x,
  y
) {

  for (
    let i = 0;
    i < 7;
    i++
  ) {

    sparkles.push({

      x:

        x +

        random(
          -12,
          12
        ),


      y:

        y +

        random(
          -8,
          8
        ),


      vx:

        random(
          -0.8,
          0.8
        ),


      vy:

        random(
          -1.4,
          -0.5
        ),


      life:

        random(
          35,
          55
        ),


      size:

        random(
          8,
          14
        )

    });

  }

}



// ============================================================
// EFFECTS
// ============================================================

function drawEffects() {


  // ==========================================================
  // HEARTS
  // ==========================================================

  for (

    let i =
      hearts.length - 1;

    i >= 0;

    i--

  ) {

    let heart =
      hearts[i];


    push();


    textAlign(
      CENTER,
      CENTER
    );


    textSize(
      22
    );


    fill(

      231,

      112,

      143,

      map(

        heart.life,

        0,

        60,

        0,

        255

      )

    );


    text(

      "♥",

      heart.x,

      heart.y

    );


    pop();


    heart.y -=
      0.7;


    heart.life--;


    if (
      heart.life <= 0
    ) {

      hearts.splice(
        i,
        1
      );

    }

  }



  // ==========================================================
  // SPARKLES
  // ==========================================================

  for (

    let i =
      sparkles.length - 1;

    i >= 0;

    i--

  ) {

    let sparkle =
      sparkles[i];


    push();


    fill(

      255,

      245,

      180,

      map(

        sparkle.life,

        0,

        55,

        0,

        255

      )

    );


    noStroke();


    textAlign(
      CENTER,
      CENTER
    );


    textSize(
      sparkle.size
    );


    text(

      "✦",

      sparkle.x,

      sparkle.y

    );


    pop();


    sparkle.x +=
      sparkle.vx;


    sparkle.y +=
      sparkle.vy;


    sparkle.life--;


    if (
      sparkle.life <= 0
    ) {

      sparkles.splice(
        i,
        1
      );

    }

  }

}



// ============================================================
// STAT UI
// ============================================================

function drawStats() {

  drawStatBar(

    55,

    28,

    185,

    hunger,

    "HUNGER"

  );


  drawStatBar(

    357,

    28,

    185,

    happiness,

    "MOOD"

  );


  drawStatBar(

    660,

    28,

    185,

    energy,

    "ENERGY"

  );

}



// ============================================================
// STAT BAR
// ============================================================

function drawStatBar(

  x,

  y,

  barWidth,

  value,

  label

) {

  push();


  // Card

  noStroke();


  fill(
    255,
    255,
    255,
    205
  );


  rect(

    x - 10,

    y - 15,

    barWidth + 20,

    42,

    16

  );


  // Label

  fill(
    75,
    74,
    68
  );


  textAlign(
    LEFT,
    CENTER
  );


  textSize(
    9
  );


  text(

    label,

    x,

    y - 5

  );


  // Empty

  fill(
    220,
    226,
    218,
    220
  );


  rect(

    x,

    y + 5,

    barWidth,

    10,

    7

  );


  // ==========================================================
  // BAR COLOUR
  // ==========================================================

  if (
    value < 30
  ) {

    fill(
      220,
      112,
      112,
      235
    );

  }

  else if (
    value < 50
  ) {

    fill(
      224,
      180,
      92,
      235
    );

  }

  else {

    fill(
      108,
      184,
      154,
      235
    );

  }


  rect(

    x,

    y + 5,

    barWidth *
    value /
    100,

    10,

    7

  );


  pop();

}



// ============================================================
// TOOLBAR
// ============================================================

function drawToolbar() {

  push();


  // Yellow base

  noStroke();


  fill(
    218,
    188,
    105,
    238
  );


  rect(

    220,

    566,

    460,

    62,

    30

  );


  fill(
    244,
    222,
    145,
    235
  );


  rect(

    229,

    573,

    442,

    45,

    23

  );


  for (
    let button of toolbarButtons
  ) {

    drawToolbarButton(
      button
    );

  }


  pop();

}



// ============================================================
// TOOLBAR BUTTON
// ============================================================

function drawToolbarButton(
  button
) {

  let selected =

    interactionMode ===
    button.type;


  push();


  if (
    selected
  ) {

    noStroke();


    fill(
      255,
      223,
      75,
      150
    );


    ellipse(

      button.x,

      button.y,

      72,

      54

    );

  }


  stroke(
    44,
    133,
    177
  );


  strokeWeight(
    2
  );


  fill(
    67,
    181,
    222
  );


  ellipse(

    button.x,

    button.y,

    60,

    44

  );


  noStroke();


  fill(
    135,
    220,
    241
  );


  ellipse(

    button.x,

    button.y - 1,

    52,

    36

  );


  // Shine

  fill(
    255,
    255,
    255,
    130
  );


  ellipse(

    button.x - 12,

    button.y - 10,

    18,

    8

  );


  drawToolbarIcon(

    button.type,

    button.x,

    button.y - 1

  );


  fill(
    68,
    69,
    65
  );


  textAlign(
    CENTER,
    CENTER
  );


  textSize(
    8
  );


  text(

    button.label,

    button.x,

    button.y + 29

  );


  pop();

}



// ============================================================
// ICONS
// ============================================================

function drawToolbarIcon(

  type,

  x,

  y

) {

  push();


  translate(
    x,
    y
  );


  // ==========================================================
  // FEED
  // ==========================================================

  if (
    type === "feed"
  ) {

    noStroke();


    fill(
      244,
      175,
      66
    );


    ellipse(
      0,
      -5,
      23,
      9
    );


    fill(
      211,
      103,
      65
    );


    rect(
      -13,
      -1,
      26,
      8,
      3
    );


    ellipse(
      0,
      7,
      26,
      8
    );


    fill(
      255,
      219,
      110
    );


    circle(
      -6,
      -5,
      4
    );


    circle(
      0,
      -6,
      4
    );


    circle(
      6,
      -4,
      4
    );

  }


  // ==========================================================
  // PET
  // ==========================================================

  else if (
    type === "pet"
  ) {

    noStroke();


    fill(
      236,
      90,
      135
    );


    circle(
      -6,
      -3,
      12
    );


    circle(
      6,
      -3,
      12
    );


    triangle(

      -12,
      0,

      12,
      0,

      0,
      15

    );


    fill(
      255,
      190,
      210,
      170
    );


    circle(
      -6,
      -6,
      4
    );

  }


  // ==========================================================
  // PLAY
  // ==========================================================

  else if (
    type === "play"
  ) {

    stroke(
      210,
      140,
      34
    );


    strokeWeight(
      1.5
    );


    fill(
      250,
      190,
      47
    );


    circle(
      0,
      0,
      24
    );


    noFill();


    arc(

      0,

      0,

      17,

      17,

      -0.9,

      1.1

    );


    noStroke();


    fill(
      255,
      232,
      120
    );


    circle(
      -5,
      -6,
      6
    );

  }


  // ==========================================================
  // SLEEP
  // ==========================================================

  else if (
    type === "sleep"
  ) {

    noStroke();


    fill(
      255,
      220,
      74
    );


    circle(
      0,
      0,
      24
    );


    fill(
      135,
      220,
      241
    );


    circle(
      8,
      -5,
      21
    );

  }


  // ==========================================================
  // CLEAN
  // ==========================================================

  else if (
    type === "clean"
  ) {

    stroke(
      110,
      78,
      50
    );


    strokeWeight(
      3
    );


    line(

      -5,
      9,

      7,
      -11

    );


    noStroke();


    fill(
      250,
      205,
      84
    );


    quad(

      -11,
      7,

      -3,
      12,

      6,
      3,

      -3,
      -1

    );

  }


  pop();

}



// ============================================================
// INSTRUCTION
// ============================================================

// The result screen uses the same canvas and the selected hand-drawn death asset.
function drawDeathSummary() {
  push();
  background(250, 247, 235);
  noStroke();
  // Subtle radial rays echo the reference without replacing the watercolor palette.
  for (let i = 0; i < 40; i++) {
    const angle = i * TWO_PI / 40;
    const spread = 0.035;
    fill(203, 214, 180, 55);
    triangle(width / 2, 330,
      width / 2 + cos(angle - spread) * 1200, 330 + sin(angle - spread) * 1200,
      width / 2 + cos(angle + spread) * 1200, 330 + sin(angle + spread) * 1200);
  }
  noFill();
  stroke(191, 169, 123);
  strokeWeight(2);
  rectMode(CORNER);
  rect(22, 20, width - 44, height - 40, 24);

  textFont("Arial");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  stroke(112, 89, 60);
  strokeWeight(3);
  fill(255, 253, 241);
  textSize(48);
  text("LITTLE RASCAL", width / 2, 88);
  noStroke();
  fill(112, 89, 60);
  textSize(36);
  text("HAS DIED", width / 2, 143);

  const causes = {
    starvation: "Starvation",
    sadness: "A broken heart",
    illness: "Illness from uncleaned poop"
  };
  textStyle(NORMAL);
  textSize(21);
  fill(101, 115, 83);
  text("Cause: " + causes[deathCause], width / 2, 204);

  const artWidth = 340;
  const artHeight = artWidth * DEATH_ART.height / DEATH_ART.width;
  fill(117, 99, 63, 22);
  ellipse(width / 2, 394, 310, 20);
  imageMode(CORNER);
  image(deathImg, (width - artWidth) / 2, 390 - artHeight, artWidth, artHeight,
    DEATH_ART.x, DEATH_ART.y, DEATH_ART.width, DEATH_ART.height);

  const totalSeconds = floor(companionshipSeconds);
  const minutes = floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  fill(112, 89, 60);
  textSize(18);
  text("Time together: " + minutes + "m " + seconds + "s", width / 2, 452);

  const ready = millis() - deathTime >= 1000;
  const hover = mouseX >= 340 && mouseX <= 560 && mouseY >= 522 && mouseY <= 574;
  cursor(ready && hover ? HAND : ARROW);
  stroke(183, 145, 72);
  strokeWeight(2);
  fill(ready && hover ? color(250, 224, 145) : color(242, 218, 158));
  rect(340, 522, 220, 52, 23);
  noStroke();
  fill(100, 78, 49);
  textStyle(BOLD);
  textSize(18);
  text("START AGAIN", width / 2, 548);
  pop();
}

// Mouse input is shared by the existing tools and the result screen.
function mousePressed() {
  if (growthPopupOpen && !isDead) {
    if (mouseX >= 340 && mouseX <= 560 && mouseY >= 455 && mouseY <= 507 &&
        millis() - growthPopupOpenedAt >= 500) closeGrowthPopup();
    return;
  }
  if (isDead) {
    // Avoid restarting from the last care click as the result screen appears.
    if (millis() - deathTime >= 1000 && mouseX >= 340 && mouseX <= 560 &&
        mouseY >= 522 && mouseY <= 574) {
      restartPet();
    }
    return;
  }


  // ==========================================================
  // TOOLBAR
  // ==========================================================

  let button =
    getClickedToolbarButton();


  if (
    button !== null
  ) {

    handleToolbarButton(
      button.type
    );


    return;

  }


  // ==========================================================
  // CLEAN MODE
  // ==========================================================

  if (
    interactionMode ===
    "clean"
  ) {

    cleanPoopAtMouse();

    return;

  }


  // ==========================================================
  // BLOCKED
  // ==========================================================

  if (

    isSleeping ||

    goingToSleep ||

    isPooping

  ) {

    return;

  }


  // ==========================================================
  // PET CLICK
  // ==========================================================

  if (
    mouseOverPet()
  ) {


    if (
      interactionMode ===
      "feed"
    ) {

      performFeed();

    }


    else if (
      interactionMode ===
      "pet"
    ) {

      performPet();

    }


    else if (
      interactionMode ===
      "play"
    ) {

      performPlay();

    }

  }

}



// ============================================================
// TOOLBAR HITBOX
// ============================================================

function getClickedToolbarButton() {

  for (
    let button of toolbarButtons
  ) {

    let d =
      dist(

        mouseX,

        mouseY,

        button.x,

        button.y

      );


    if (
      d < 32
    ) {

      return button;

    }

  }


  return null;

}



// ============================================================
// HANDLE BUTTON
// ============================================================

function handleToolbarButton(
  type
) {
  if (isDead) return;
  // Cleaning remains available during sleep and other stationary actions.
  if (type === "clean") {
    selectInteraction(type);
    return;
  }



  // ==========================================================
  // SLEEP
  // ==========================================================

  if (
    type === "sleep"
  ) {

    if (

      !isSleeping &&

      !goingToSleep

    ) {

      startSleeping();

    }


    return;

  }


  if (

    isSleeping ||

    goingToSleep ||

    isPooping

  ) {

    return;

  }


  selectInteraction(
    type
  );

}



// ============================================================
// SELECT INTERACTION
// ============================================================

function selectInteraction(
  mode
) {


  if (
    interactionMode ===
    mode
  ) {

    interactionMode =
      "none";


    cursor(
      ARROW
    );


    return;

  }


  interactionMode =
    mode;


  noCursor();

}



// ============================================================
// PET HITBOX
// ============================================================

function mouseOverPet() {

  let depthScale =
    getScaleAtY(
      groundY
    );


  let petImg =
    getCurrentPetImage();


  let ratio =

    petImg.height /

    petImg.width;


  let approximateWidth =

    BASE_PET_WIDTH *

    depthScale;


  let approximateHeight =

    BASE_PET_WIDTH *

    ratio *

    depthScale;


  let centerY =

    groundY +

    jumpOffset -

    approximateHeight /
    2;


  return (

    abs(
      mouseX -
      groundX
    ) <

    approximateWidth *
    0.48


    &&


    abs(
      mouseY -
      centerY
    ) <

    approximateHeight *
    0.48

  );

}



// ============================================================
// CUSTOM CURSOR
// ============================================================

function drawCustomCursor() {

  if (
    interactionMode ===
    "none"
  ) {

    return;

  }


  push();


  noStroke();


  fill(
    255,
    255,
    255,
    220
  );


  circle(

    mouseX,

    mouseY,

    40

  );


  if (
    interactionMode ===
    "feed"
  ) {

    drawToolbarIcon(

      "feed",

      mouseX,

      mouseY

    );

  }


  else if (
    interactionMode ===
    "pet"
  ) {

    drawToolbarIcon(

      "pet",

      mouseX,

      mouseY

    );

  }


  else if (
    interactionMode ===
    "play"
  ) {

    drawToolbarIcon(

      "play",

      mouseX,

      mouseY

    );

  }


  else if (
    interactionMode ===
    "clean"
  ) {

    drawToolbarIcon(

      "clean",

      mouseX,

      mouseY

    );

  }


  pop();

}



// ============================================================
// DEBUG FLOOR
// ============================================================

function drawDebugFloor() {

  push();


  noFill();


  stroke(
    255,
    0,
    0
  );


  strokeWeight(
    2
  );


  quad(

    BACK_LEFT,
    FLOOR_TOP,

    BACK_RIGHT,
    FLOOR_TOP,

    FRONT_RIGHT,
    FLOOR_BOTTOM,

    FRONT_LEFT,
    FLOOR_BOTTOM

  );


  noStroke();


  fill(
    255,
    0,
    0
  );


  circle(

    groundX,

    groundY,

    8

  );


  pop();

}(() => {
  const bgm = new Audio("bgm.mp3");

  bgm.loop = true;
  bgm.volume = 0.3;
  bgm.autoplay = true;

  function startMusic() {
    if (bgm.paused) {
      bgm.play().catch(() => {
        console.log("Waiting for browser audio permission");
      });
    }
  }

  // Try playing immediately
  startMusic();

  // Retry automatically when audio becomes available
  bgm.addEventListener("canplaythrough", startMusic);

  // Fallback for browser autoplay restrictions
  document.addEventListener("pointerdown", startMusic);
  document.addEventListener("keydown", startMusic);
})();
// ============================================================
// NEGLECT, DEATH AND RESTART
// ============================================================

function updateNeglect(elapsedSeconds = deltaTime / 1000) {
  if (isDead) return;
  // A background tab must not kill the pet with one oversized frame.
  const seconds = constrain(elapsedSeconds, 0, 0.25);
  starvationTime = hunger <= 0 ? starvationTime + seconds : 0;
  sadnessTime = happiness <= 0 ? sadnessTime + seconds : 0;

  // Each pile has its own clock. Cleaning one never resets another pile.
  for (const poop of poops) {
    poop.ageSeconds = (poop.ageSeconds || 0) + seconds;
  }

  // Stable priority makes simultaneous causes deterministic.
  if (starvationTime >= DEATH_RULES.starvationSeconds) die("starvation");
  else if (sadnessTime >= DEATH_RULES.sadnessSeconds) die("sadness");
  else if (poops.some(poop => poop.ageSeconds >= DEATH_RULES.poopFatalSeconds)) {
    die("illness");
  }
}

function die(cause) {
  if (isDead) return;
  isDead = true;
  growthPopupOpen = false;
  deathCause = cause;
  deathTime = millis();
  stopCurrentMovement();
  isEating = isBeingPetted = isPlaying = isPooping = false;
  isSleeping = goingToSleep = false;
  playHopsRemaining = 0;
  actionEndTime = mealPoopTime = poopEndTime = 0;
  poopCreatedThisTime = false;
  interactionMode = "none";
  hearts.length = sparkles.length = 0;
  cursor(ARROW);
}

function drawDeadPet() {
  const depth = getScaleAtY(groundY);
  // Match the visible child's size and baseline without changing its original art.
  const artWidth = BASE_PET_WIDTH * depth * (651 / 2732);
  const artHeight = artWidth * DEATH_ART.height / DEATH_ART.width;
  const bottomY = groundY - BASE_PET_WIDTH * depth * (659 / 2732);
  push();
  noStroke();
  fill(0, 25);
  ellipse(groundX, groundY + 8, 112 * depth, 17 * depth);
  imageMode(CORNER);
  image(deathImg, groundX - artWidth / 2, bottomY - artHeight,
    artWidth, artHeight, DEATH_ART.x, DEATH_ART.y, DEATH_ART.width, DEATH_ART.height);
  pop();
}

function restartPet() {
  lifeStage = "child";
  growthFeeds = growthCare = 0;
  lastGrowthCareTime = growthStartedAt = -Infinity;
  growthSleepPending = growthWakeReady = growthPopupOpen = false;
  growthPopupOpenedAt = 0;
  isDead = false;
  deathCause = "";
  deathTime = starvationTime = sadnessTime = companionshipSeconds = 0;
  hunger = happiness = energy = 85;
  groundX = 450;
  groundY = 420;
  stopCurrentMovement();
  jumpTargetX = groundX;
  jumpTargetY = groundY;
  movementState = "land";
  landTimer = 8;
  pauseTimer = 0;
  squashX = squashY = 1;
  petAngle = 0;
  isEating = isBeingPetted = isPlaying = isPooping = false;
  isSleeping = goingToSleep = false;
  actionEndTime = playHopsRemaining = mealPoopTime = poopEndTime = 0;
  poopCreatedThisTime = false;
  interactionMode = "none";
  poops.length = hearts.length = sparkles.length = 0;
  nextPoopTime = millis() + random(18000, 30000);
  cursor(ARROW);
}

// Simple hand-drawn odor trails and orbiting flies for each rotten pile.
function drawPoopStink() {
  const time = isDead ? deathTime / 1000 : millis() / 1000;
  push();
  scale(0.70);
  noFill();
  stroke(117, 139, 82, 170);
  strokeWeight(2);
  for (let i = 0; i < 3; i++) {
    const x = -23 + i * 23;
    const sway = sin(time * 2 + i) * 4;
    bezier(x, -48, x - 10 + sway, -60, x + 10 + sway, -70, x + sway, -82);
  }
  for (let i = 0; i < 3; i++) {
    const angle = time * 3 + i * TWO_PI / 3;
    const x = cos(angle) * 42;
    const y = -38 + sin(angle * 1.3) * 15;
    noStroke();
    fill(238, 241, 221, 210);
    ellipse(x - 3, y - 3, 7, 4);
    ellipse(x + 3, y - 3, 7, 4);
    fill(62, 57, 45);
    ellipse(x, y, 5, 7);
  }
  pop();
}

// Care contributes to growth only once per completed interaction interval.
function recordGrowthCare() {
  if (lifeStage !== "child" || isDead || millis() - lastGrowthCareTime < 1300) return;
  growthCare++;
  lastGrowthCareTime = millis();
}

function updateGrowth() {
  if (isDead || !growthWakeReady || lifeStage !== "child" || growthFeeds < GROWTH_RULES.feeds ||
      growthCare < GROWTH_RULES.care) return;
  // Never interrupt a jump, care action, sleep, or waste creation.
  if (isEating || isBeingPetted || isPlaying || isSleeping || goingToSleep ||
      isPooping || movementState === "jump") return;
  lifeStage = "teenager";
  growthWakeReady = false;
  growthStartedAt = millis();
  growthPopupOpen = true;
  growthPopupOpenedAt = millis();
  interactionMode = "none";
  cursor(ARROW);
  createSparkles(groundX, groundY - 95 * getScaleAtY(groundY));
}

function drawGrowthEffect() {
  const elapsed = millis() - growthStartedAt;
  if (isDead || elapsed < 0 || elapsed >= 1500) return;
  const progress = elapsed / 1500;
  const depth = getScaleAtY(groundY);
  push();
  noFill();
  stroke(246, 214, 118, 180 * (1 - progress));
  strokeWeight(3 * (1 - progress));
  ellipse(groundX, groundY - 95 * depth,
    (75 + 65 * progress) * depth, (75 + 65 * progress) * depth);
  pop();
}

// Pause all game updates while the player reads the growth announcement.
function drawGrowthPopup() {
  push();
  rectMode(CORNER);
  noStroke();
  fill(62, 58, 43, 85);
  rect(0, 0, width, height);
  stroke(190, 165, 111);
  strokeWeight(2);
  fill(251, 248, 232);
  rect(185, 135, 530, 400, 26);
  noStroke();
  textFont("Arial");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(32);
  fill(112, 89, 60);
  text("GROWING UP!", width / 2, 190);
  // Source bounds remove padding without changing the illustration proportions.
  imageMode(CORNER);
  const spriteWidth = 155;
  const spriteHeight = spriteWidth * 722 / 771;
  image(teenHappyImg, (width - spriteWidth) / 2, 225, spriteWidth, spriteHeight,
    971, 642, 771, 722);
  textStyle(NORMAL);
  textSize(20);
  fill(101, 115, 83);
  text("Little Rascal is now a teenager.", width / 2, 395);
  textSize(16);
  text("Your care helped them grow.", width / 2, 425);
  const hover = mouseX >= 340 && mouseX <= 560 && mouseY >= 455 && mouseY <= 507;
  cursor(hover ? HAND : ARROW);
  stroke(183, 145, 72);
  fill(hover ? color(250, 224, 145) : color(242, 218, 158));
  rect(340, 455, 220, 52, 23);
  noStroke();
  fill(100, 78, 49);
  textStyle(BOLD);
  textSize(18);
  text("CONTINUE", width / 2, 481);
  pop();
}

function closeGrowthPopup() {
  const pausedFor = millis() - growthPopupOpenedAt;
  // Absolute event deadlines must also move forward when gameplay resumes.
  nextPoopTime += pausedFor;
  if (mealPoopTime > 0) mealPoopTime += pausedFor;
  growthPopupOpen = false;
  growthStartedAt = millis();
  cursor(ARROW);
}
