// ============================================================
// LITTLE RASCAL
// COMPLETE TERRARIUM VERSION
// p5.js 2.0
//
// REQUIRED FILES:
// assets/room-background-v1.png (approved first refinement; original map.jpg retained)
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
let toyBallImg;
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
let hungryPetImg;
const HUNGRY_ART = { x: 116, y: 100, width: 1305, height: 813 };
let adultSprites = {};
let elderSprites = {};
let adultApproach = null;
let adultNextActionAt = 0;
let adultActionCount = 0;
let adultAffectionUntil = 0;
let adultInvitingBall = false;
// The archived teenager's mischievous refusals now belong to the adult stage.
const ADULT_REFUSAL = { feed: 0.25, pet: 0.25, play: 0.25 };
const YOUTH_BOREDOM = { resetSeconds: 8 };
const YOUTH_REFUSAL_MOOD_LOSS = { bored: 3, angry: 5 };
// Treat rounded-full bars as full despite one frame of passive drain.
const YOUTH_FULL_THRESHOLD = 99.5;
let youthInteractionClock = 0;
let youthInteractionStreak = { action: null, count: 0, limit: 0, lastAt: -Infinity };
let adultRefusalMood = "angry";
let adultAngryUntil = 0;
let adultReaction = null;

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
let toyBall = makeToyBall();
let ballChaseUntil = 0;
let ballChaseSpeed = 0;
let ballChaseStride = 0;
let ballChaseFacing = 1;
let ballChaseSide = 0;
let toyPlayAction = null;
let lastBallRewardAt = -Infinity;



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
// Keep the approved mature width independent of archived stage assets.
const GROWN_MODEL_WIDTH_FACTOR = 771 / 2732;



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

// Align the sleeping baseline with the hollow in the approved first background.
const BED_Y = 300;



// ============================================================
// STATS
// ============================================================

let hunger = 85;

let happiness = 85;

let energy = 85;


// Faster drain

let hungerDrain = 0.90;

let happinessDrain = 0.5175;

let energyDrain = 0.345;
const PLAY_ENERGY_COST = { button: 32, toy: 5 };



// ============================================================
// NEED THRESHOLDS
// ============================================================

// Below 35 hunger:
// Mood falls faster.

const LOW_HUNGER_THRESHOLD = 35;
const HUNGER_FLATTEN_THRESHOLD = 30;
let helpHasBeenShown = false;

// Hunger selects its artwork independently of sleep, care and neglect timers.
function isHungryPose() {
  return !!hungryPetImg && !isDead && hunger < HUNGER_FLATTEN_THRESHOLD;
}


// Youth cries below 25 mood; the other stages retain their threshold of 30.

const CRY_THRESHOLD = 30;
const YOUTH_MOOD = { cry: 25, angry: 40 };

function getCryThreshold() {
  return lifeStage === "adult" ? YOUTH_MOOD.cry : CRY_THRESHOLD;
}


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
const MIN_SLEEP_SECONDS = 3;
let sleepElapsedSeconds = 0;



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
      "assets/room-background-v1.png"
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


  hungryPetImg = await loadImage("assets/hungry-pet-a.png");

  const stageArtwork = await loadApprovedStageArtwork();
  adultSprites = stageArtwork.adult;
  elderSprites = stageArtwork.elder;

  toyBallImg = trimToyBallArtwork(await loadImage("assets/toyball.png"));
  poopImg = await loadImage("shit.png");
  deathImg = await loadImage("design-options/death-a3-cross-eyes.png");
  await initializeHatching();
  await initializeFarewellArtwork();
  initializeStagePreview();
  initializeFarewellPreview();


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
  drawGameFrame();
  // Keep one music control available across the egg, dialogs and gameplay.
  drawMusicButton();
}

function drawGameFrame() {
  if (!hatchingComplete) {
    drawHatchingIntro();
    if (hatchingComplete && !petHasBeenNamed) openNamingPopup();
    return;
  }
  if (namingPopupOpen) {
    imageMode(CENTER);
    image(mapImg, width / 2, height / 2, width, height);
    drawWorld();
    drawNamingPopup();
    return;
  }
  if (helpPopupOpen) {
    imageMode(CENTER);
    image(mapImg, width / 2, height / 2, width, height);
    drawWorld();
    drawStats();
    drawPetNameLabel();
    drawToolbar();
    drawHelpButton();
    drawHelpPopup();
    return;
  }
  if (growthPopupOpen && !isDead) {
    imageMode(CENTER);
    image(mapImg, width / 2, height / 2, width, height);
    drawWorld();
    drawStats();
    drawPetNameLabel();
    drawToolbar();
    drawGrowthPopup();
    return;
  }
  if (isDead) {
    drawDeathEnding();
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
    if (lifeStage === "adult" && !document.hidden) {
      youthInteractionClock += constrain(deltaTime / 1000, 0, 0.25);
    }
    updateStats();
    updateNeglect();
    if (!isDead) updateNaturalAging();
    if (!isDead) {
      updateToyBall();
      updateAdultBehavior();
      updateMovement();
      updateActionTimer();
      updatePoopSystem();
      updateGrowth();
    }
  }

  if (isDead) {
    drawDeathEnding();
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
  drawHelpButton();
  drawPetNameLabel();
  if (interactionMode === "none" && !growthPopupOpen) {
    cursor(toyBall.dragging || isOverToyBall() || isOverHelpButton() || getClickedToolbarButton() ? HAND : ARROW);
  }
  drawElderPetRequest();
  if (growthPopupOpen) drawGrowthPopup();

}



// ============================================================
// IS PET CRYING?
// ============================================================

function isStinkCrying() {
  return !isDead && !isSleeping && !goingToSleep &&
    poops.some(poop => (poop.ageSeconds || 0) >= DEATH_RULES.poopSmellSeconds);
}

function isPetCrying() {
  if (isStinkCrying()) return true;

  return (

    happiness < getCryThreshold() &&

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
    if (!document.hidden) sleepElapsedSeconds += seconds;
    energy = min(100, energy + 10 * seconds);
    // High-energy manual sleep must still include a readable rest, without losing energy.
    if (energy >= 80 && sleepElapsedSeconds >= MIN_SLEEP_SECONDS) {
      isSleeping = false;
      growthWakeReady = growthWakeReady || growthSleepPending ||
        (nextLifeStage() && growthFeeds >= GROWTH_RULES.feeds &&
         growthCare >= GROWTH_RULES.care);
      growthSleepPending = false;
      movementState = "pause";
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
  // An awake youth below 25 mood stops even midway through a chase or bed route.
  if (lifeStage === "adult" && happiness < YOUTH_MOOD.cry && !isSleeping) {
    if (goingToSleep) growthSleepPending = false;
    goingToSleep = false;
    adultApproach = null;
    adultInvitingBall = false;
    adultReaction = null;
    adultAngryUntil = 0;
    stopCurrentMovement();
    isPlaying = false;
    playHopsRemaining = 0;
    movementState = "pause";
    return;
  }
  if (updateAdultReaction()) return;
  if (isAdultAngry() &&
      !isSleeping && !goingToSleep) return;
  if (updateToyPlayAction()) return;


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

  if (updateElderRest()) return;

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


  // A hungry pet rests on the floor; explicit care and play still work above.
  if (hunger < HUNGER_FLATTEN_THRESHOLD) {
    floorVX = floorVY = 0;
    movementState = "pause";
    pauseTimer = 30;
    adultApproach = null;
    return;
  }

  if (updateAdultApproach()) return;
  if (updateBallChase()) return;

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
        lifeStage !== "elder" && random() <
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
        : lifeStage === "elder" ? 1 : 7;

    if (lifeStage === "elder" && !goingToSleep) {
      elderHopPauseRemaining = ELDER_MOVEMENT.betweenHopSeconds;
    }
    if (lifeStage === "elder" && !goingToSleep && !isPlaying && millis() >= ballChaseUntil) {
      elderHopsInBurst++;
      if (elderHopsInBurst >= ELDER_MOVEMENT.hopsPerBurst) {
        elderRestRemaining = ELDER_MOVEMENT.restSeconds;
        elderHopPauseRemaining = 0;
        elderHopsInBurst = 0;
      }
    }


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
    lifeStage === "elder" ? 12 : fast
      ? 55
      : 70;


  let maximumXDistance =
    lifeStage === "elder" ? (fast ? 30 : 22) : fast
      ? 140
      : 120;


  let maximumYDistance =
    lifeStage === "elder" ? (fast ? 20 : 14) : fast
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

  power *= petHopFactor();

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
      lifeStage === "elder" ? 20 : 100
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
  if (isHungryPose()) return hungryPetImg;
  if (lifeStage === "adult") {
    if (isStinkCrying()) return adultSprites.crying;
    if (isSleeping) return adultSprites.sleepy;
    if (happiness < YOUTH_MOOD.cry) return adultSprites.crying;
    if (isAdultAngry()) return adultRefusalMood === "bored" ? adultSprites.unimpressed : adultSprites.angry;
    if (happiness < YOUTH_MOOD.angry) return adultSprites.angry;
    if (isBeingPetted || millis() < adultAffectionUntil) return adultSprites.affectionate;
    if (isEating || isPlaying || toyPlayAction || (millis() < ballChaseUntil && !isPetCrying())) return adultSprites.happy;
    return energy < 30 ? adultSprites.unimpressed : adultSprites.normal;
  }
  if (lifeStage === "elder") {
    // Keep the elderly silhouette and creases even during distress or sleep.
    // Existing falling tears communicate crying without borrowing a younger body.
    if (isStinkCrying() || isPetCrying() || isSleeping) return elderSprites.tired;
    // Seniors sigh while pursuing the ball, then brighten up for the actual kick.
    if (!toyBall.dragging && millis() < ballChaseUntil) return elderSprites.tired;
    if (isEating || isBeingPetted || isPlaying || toyPlayAction ||
        millis() < adultAffectionUntil) return elderSprites.happy;
    return energy < 30 ? elderSprites.tired : elderSprites.normal;
  }
  // The first stage keeps its existing care, play and crying responses.
  if (isStinkCrying()) return petCryImg;
  if (millis() < ballChaseUntil && !isSleeping && !goingToSleep && !isPetCrying()) return petHappyImg;
  if (isEating || isBeingPetted || isPlaying || toyPlayAction) return petHappyImg;
  return happiness < getCryThreshold() ? petCryImg : petNormalImg;
}

// Draw room objects in floor-depth order.
function drawWorld() {
  const objects = poops.map(poop => ({ y: poop.y, draw: () => drawPoop(poop) }));
  objects.push({ y: groundY, draw: drawPet });
  if (!toyBall.dragging) objects.push({ y: toyBall.y, draw: drawToyBall });
  objects.sort((a, b) => a.y - b.y);
  for (const object of objects) object.draw();
  if (toyBall.dragging) drawToyBall();
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


  const art = getPetArtwork(petImg);
  const bodyWidth = art.width * petRenderFactor(petImg);

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

      bodyWidth * 0.85,

      bodyWidth * 0.50

    );


  shadowWidth =
    constrain(

      shadowWidth,

      bodyWidth * 0.50,

      bodyWidth * 0.85

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

    groundY + 4,

    shadowWidth *
    depthScale,

    17 *
    depthScale * getPetModelScale()

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



  if (movementState === "chase") {
    targetScaleX = 1.04 + sin(ballChaseStride) * 0.025;
    targetScaleY = 0.97 - sin(ballChaseStride) * 0.025;
    targetAngle = ballChaseFacing * 0.025;
  }

  if (lifeStage === "elder" && movementState === "jump") {
    const lift = constrain(-jumpOffset / 30, 0, 1);
    targetScaleX = 1 - lift * 0.025;
    targetScaleY = 1 + lift * 0.025;
    targetAngle = Math.sign(floorVX) * lift * 0.015;
  }
  if (lifeStage === "elder" && movementState === "land" && !isPlaying) {
    targetScaleX = targetScaleY = 1;
    targetAngle = 0;
  }

  if (lifeStage === "elder" && elderHopPauseRemaining > 0 &&
      elderHopPauseRemaining < 0.18 && !isPetCrying() && !isPooping && !isSleeping) {
    targetScaleX = 1.035;
    targetScaleY = 0.965;
    targetAngle = 0;
  }

  if (toyPlayAction) {
    const windingUp = toyPlayAction.phase === "windup";
    const tapping = toyPlayAction.phase === "release";
    targetScaleX = windingUp ? 0.90 : tapping ? 1.15 : 1;
    targetScaleY = windingUp ? 1.08 : tapping ? 0.90 : 1;
    targetAngle = toyPlayAction.direction * (windingUp ? -0.10 : tapping ? 0.12 : 0);
  }

  if (isAdultAngry()) {
    targetAngle = adultRefusalMood === "bored" ? 0 : sin(millis() * 0.03) * 0.06;
    if (adultRefusalMood === "bored") targetScaleX = targetScaleY = 1;
    if (adultReaction?.kind === "kick") {
      if (adultReaction.phase === "windup") {
        targetScaleX = 0.90;
        targetScaleY = 1.08;
        targetAngle = -adultReaction.direction * 0.10;
      } else if (adultReaction.phase === "strike") {
        targetScaleX = 1.15;
        targetScaleY = 0.90;
        targetAngle = adultReaction.direction * 0.12;
      }
    }
  }

  if (petImg === hungryPetImg) {
    // The new artwork is already flat: retain its proportions and add quiet breathing.
    targetScaleX = 1;
    targetScaleY = 1 + sin(millis() * 0.002) * 0.008;
    targetAngle = 0;
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

  // Draw only visible pixels, preserving their existing on-screen scale.
  const drawWidth = art.width * petRenderFactor(petImg) * depthScale * squashX;
  const drawHeight = art.height * petRenderFactor(petImg) * depthScale * squashY;

  let characterBottomY =

    groundY +

    jumpOffset - (movementState === "chase" ? abs(sin(ballChaseStride)) *
      (lifeStage === "elder" ? 0 : 2.5) : 0);



  // ==========================================================
  // DRAW PET
  // ==========================================================

  push();


  translate(

    groundX + toyKickOffsetX(),

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

    drawHeight,

    art.x, art.y, art.width, art.height

  );

  if (petImg === hungryPetImg && isMatureStage()) {
    // The adult's star is beside the cheek; the elderly star sits lower down.
    fill(255, 225, 145);
    stroke(190, 140, 70);
    strokeWeight(0.9);
    strokeJoin(ROUND);
    drawStar(drawWidth * 0.35, -drawHeight * (lifeStage === "adult" ? 0.38 : 0.13), drawWidth * 0.05);
  }

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
    (isHungryPose() ? 0.70 : isMatureStage() ? 0.61 : 0.47);


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
    (isHungryPose() ? 0.11 : 0.17),

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
    (isHungryPose() ? 0.21 : 0.17),

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
  // Care and sleep cancel a pending toy pursuit as well as its kick pose.
  toyPlayAction = null;
  ballChaseUntil = ballChaseSpeed = ballChaseSide = 0;

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
  const countsForGrowth = hunger <= GROWTH_RULES.feedThreshold &&
    !isEating && !isBeingPetted && !isPlaying && !isPooping &&
    !isSleeping && !goingToSleep && !!nextLifeStage();
  if (isDead || !preparePetInteraction("feed")) return;
  if (countsForGrowth) {
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
  if (isDead || !preparePetInteraction("pet")) return;
  fulfillElderPetRequest();
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
    getCryThreshold()
  ) {

    return;

  }


  if (lifeStage === "adult" && isYouthNeedFull("play")) {
    preparePetInteraction("play");
    return;
  }

  if (
    energy <= 10
  ) {

    startSleeping();

    return;

  }


  if (!preparePetInteraction("play")) return;

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
    PLAY_ENERGY_COST.button;


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

function startSleeping(playerRequested = false) {
  if (isDead) return;


  if (
    isSleeping ||
    goingToSleep
  ) {

    return;

  }


  if (playerRequested && lifeStage === "adult" && isYouthNeedFull("sleep")) {
    if (isPooping || growthPopupOpen) return;
    resetYouthInteractionStreak();
    refuseYouthInteraction("sleep", "bored");
    return;
  }

  // Too sad:
  // stay crying instead of automatically sleeping.

  if (
    happiness <
    getCryThreshold()
  ) {

    return;

  }


  adultApproach = null;
  adultInvitingBall = false;
  adultReaction = null;
  adultAngryUntil = 0;
  adultRefusalMood = "angry";
  resetYouthInteractionStreak();

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


  sleepElapsedSeconds = 0;
  growthSleepPending = !!nextLifeStage() &&
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

    adultReaction || isAdultAngry() ||

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
      if (lifeStage === "adult") resetYouthInteractionStreak();

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

function drawStatBar(x, y, barWidth, value, label) {
  const amount = constrain(value, 0, 100);
  const fillColor = amount < 30 ? "#cf8b80" : amount < 50 ? UI_THEME.gold : UI_THEME.sage;
  push();
  rectMode(CORNER);
  uiPaperPanel(x - 10, y - 15, barWidth + 20, 42, 14, "rgba(255,249,235,0.95)");
  noStroke();
  fill(fillColor);
  circle(x + 3, y - 5, 5);
  fill(UI_THEME.ink);
  textFont("Arial");
  textStyle(BOLD);
  textSize(9);
  textAlign(LEFT, CENTER);
  text(label, x + 12, y - 5);
  textStyle(NORMAL);
  textAlign(RIGHT, CENTER);
  fill(UI_THEME.muted);
  text(Math.round(amount), x + barWidth, y - 5);
  fill(UI_THEME.track);
  rect(x, y + 5, barWidth, 10, 5);
  if (amount > 0) {
    fill(fillColor);
    rect(x, y + 5, barWidth * amount / 100, 10, min(5, barWidth * amount / 200));
  }
  pop();
}

// The five familiar tools retain their original positions and click areas.
function drawToolbar() {
  push();
  rectMode(CORNER);
  uiPaperPanel(220, 566, 460, 62, 29, "rgba(255,249,235,0.97)");
  for (const button of toolbarButtons) drawToolbarButton(button);
  pop();
}

function drawToolbarButton(button) {
  const selected = interactionMode === button.type;
  const active = selected || (button.type === "sleep" && (isSleeping || goingToSleep)) ||
    (button.type === "play" && isPlaying);
  const hover = dist(mouseX, mouseY, button.x, button.y) < 32;
  const pressed = hover && mouseIsPressed;
  const tones = { feed: "sand", pet: "rose", play: "honey", sleep: "lavender", clean: "leaf" };
  push();
  uiPaperOval(button.x, button.y, 60, 44, { hover, active, pressed, tone: tones[button.type] });
  drawToolbarIcon(button.type, button.x, button.y - 1 + (pressed ? 0.7 : 0));
  noStroke();
  fill(active ? UI_THEME.ink : UI_THEME.muted);
  textFont("Arial");
  textStyle(active ? BOLD : NORMAL);
  textAlign(CENTER, CENTER);
  textSize(8);
  text(button.label, button.x, button.y + 29);
  if (selected) {
    fill(UI_THEME.gold);
    circle(button.x, button.y + 22, 3);
  }
  pop();
}


// ============================================================
// ICONS
// ============================================================

function drawToolbarIcon(type, x, y) {
  push();
  translate(x, y);
  strokeWeight(1.2);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  if (type === "feed") {
    stroke("#a77e56");
    fill("#d5b978");
    ellipse(0, -4, 23, 9);
    fill("#c38e70");
    rectMode(CORNER);
    rect(-13, -1, 26, 10, 4);
    noStroke();
    fill("#f5df9c");
    for (const point of [[-6,-5],[0,-6],[6,-4]]) circle(point[0], point[1], 3.5);
    stroke("#f1d4bb");
    line(-8, 3, 8, 3);
  } else if (type === "pet") {
    // The same soft heart is reused by the petting cursor and senior thought bubble.
    noStroke();
    fill(UI_THEME.pink);
    circle(-6, -3, 12);
    circle(6, -3, 12);
    triangle(-12, 0, 12, 0, 0, 15);
  } else if (type === "play") {
    stroke("#b48d4c");
    fill("#ead296");
    circle(0, 0, 24);
    noFill();
    arc(-7, 0, 23, 24, -1.05, 1.05);
  } else if (type === "sleep") {
    // A real crescent leaves the paper behind it clear in every UI state.
    const ctx = drawingContext;
    ctx.save();
    ctx.fillStyle = "#e7cc85";
    ctx.strokeStyle = "#b48d4c";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(4, -11);
    ctx.bezierCurveTo(-10, -14, -16, 6, -4, 11);
    ctx.bezierCurveTo(3, 15, 11, 11, 13, 5);
    ctx.bezierCurveTo(0, 10, -5, -4, 4, -11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if (type === "clean") {
    stroke(UI_THEME.ink);
    strokeWeight(2.3);
    line(-5, 9, 7, -11);
    stroke("#ad8b50");
    strokeWeight(1);
    fill("#dcc18b");
    quad(-11, 7, -3, 12, 6, 3, -3, -1);
    line(-8, 7, -4, 9);
    line(-5, 4, -1, 7);
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
  drawFittedPetText(petName, width / 2, 88, 760, 48);
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
  if (handleMusicClick()) return;
  // Audio gestures work immediately; game hit tests wait for image loading.
  if (!deathImg || namingPopupOpen) return;
  if (helpPopupOpen) {
    handleHelpClick();
    return;
  }
  if (!hatchingComplete) {
    handleHatchingClick();
    return;
  }
  if (growthPopupOpen && !isDead) {
    if (mouseX >= 340 && mouseX <= 560 && mouseY >= 455 && mouseY <= 507 &&
        millis() - growthPopupOpenedAt >= 500) closeGrowthPopup();
    return;
  }
  if (isDead) {
    if (deathCause === "oldAge") handleFarewellClick();
    else if (millis() - deathTime >= 1000 && mouseX >= 340 && mouseX <= 560 &&
        mouseY >= 522 && mouseY <= 574) restartPet();
    return;
  }


  if (handleElderPetRequestClick()) return;

  if (isOverHelpButton()) {
    openHelpPopup();
    return;
  }

  if (isOverToyBall()) {
    toyPlayAction = null;
    toyBall.dragHeight = max(16, toyBall.height || 0);
    toyBall.height = toyBall.verticalSpeed = toyBall.impact = 0;
    toyBall.dragging = true;
    toyBall.moved = false;
    toyBall.used = true;
    toyBall.startX = mouseX;
    toyBall.startY = mouseY;
    toyBall.offsetX = toyBall.x - mouseX;
    toyBall.offsetY = toyBall.y - mouseY;
    toyBall.lastPointerAt = millis();
    toyBall.vx = toyBall.vy = 0;
    interactionMode = "none";
    cursor(HAND);
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

      startSleeping(true);

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
  const body = getPetBody();
  // Invert the same rotation used for drawing around the ground anchor.
  const angle = isSleeping ? 0.16 : petAngle;
  const dx = mouseX - (groundX + toyKickOffsetX());
  const dy = mouseY - (groundY + jumpOffset);
  const localX = dx * cos(angle) + dy * sin(angle);
  const localY = -dx * sin(angle) + dy * cos(angle);
  return abs(localX) <= body.width / 2 + 4 &&
    localY >= -body.height - 4 && localY <= 4;
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

}
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
  elderPetRequests.active = null;
  adultReaction = null;
  adultAngryUntil = 0;
  adultRefusalMood = "angry";
  resetYouthInteractionStreak();
  adultApproach = null;
  adultInvitingBall = false;
  toyBall.dragging = false;
  toyBall.vx = toyBall.vy = 0;
  ballChaseUntil = 0;
  isDead = true;
  growthPopupOpen = false;
  deathCause = cause;
  deathTime = millis();
  stopCurrentMovement();
  isEating = isBeingPetted = isPlaying = isPooping = false;
  isSleeping = goingToSleep = false;
  sleepElapsedSeconds = 0;
  playHopsRemaining = 0;
  actionEndTime = mealPoopTime = poopEndTime = 0;
  poopCreatedThisTime = false;
  interactionMode = "none";
  hearts.length = sparkles.length = 0;
  cursor(ARROW);
  if (cause === "oldAge") startFarewell();
  else farewell = null;
}

function drawDeadPet() {
  const depth = getScaleAtY(groundY);
  const stageScale = getPetModelScale();
  // Match the current stage size and baseline without changing the original art.
  const artWidth = BASE_PET_WIDTH * depth * (651 / 2732) * stageScale;
  const artHeight = artWidth * DEATH_ART.height / DEATH_ART.width;
  const bottomY = groundY;
  push();
  noStroke();
  fill(0, 25);
  ellipse(groundX, groundY + 8, 112 * depth * stageScale, 17 * depth * stageScale);
  imageMode(CORNER);
  image(deathImg, groundX - artWidth / 2, bottomY - artHeight,
    artWidth, artHeight, DEATH_ART.x, DEATH_ART.y, DEATH_ART.width, DEATH_ART.height);
  pop();
}

function restartPet() {
  adultReaction = null;
  adultAngryUntil = 0;
  adultRefusalMood = "angry";
  resetYouthInteractionStreak();
  farewell = null;
  elderAgeSeconds = 0;
  resetPetNaming();
  resetElderMovement();
  resetElderPetRequests();
  hatchingComplete = false;
  hatchStartedAt = null;
  hatchPhase = "idle";
  adultApproach = null;
  adultNextActionAt = adultActionCount = adultAffectionUntil = 0;
  adultInvitingBall = false;
  toyBall = makeToyBall();
  ballChaseUntil = 0;
  ballChaseSpeed = ballChaseStride = 0;
  toyPlayAction = null;
  lastBallRewardAt = -Infinity;
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
  sleepElapsedSeconds = 0;
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
  if (!nextLifeStage() || isDead || millis() - lastGrowthCareTime < 1300) return;
  growthCare++;
  lastGrowthCareTime = millis();
}

function updateGrowth() {
  const nextStage = nextLifeStage();
  if (isDead || !growthWakeReady || !nextStage || growthFeeds < GROWTH_RULES.feeds ||
      growthCare < GROWTH_RULES.care) return;
  // Never interrupt a jump, care action, sleep, or waste creation.
  if (isEating || isBeingPetted || isPlaying || isSleeping || goingToSleep ||
      isPooping || toyBall.dragging || toyPlayAction ||
      movementState === "jump" || adultReaction || isAdultAngry()) return;
  lifeStage = nextStage;
  adultReaction = null;
  adultAngryUntil = 0;
  adultRefusalMood = "angry";
  resetYouthInteractionStreak();
  elderAgeSeconds = 0;
  resetElderMovement();
  resetElderPetRequests();
  growthFeeds = growthCare = 0;
  lastGrowthCareTime = -Infinity;
  adultNextActionAt = companionshipSeconds + 12;
  adultApproach = null;
  adultInvitingBall = false;
  adultAffectionUntil = 0;
  stopCurrentMovement();
  growthSleepPending = false;
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
  text(lifeStage === "elder" ? "GROWING OLDER!" : "GROWING UP!", width / 2, 190);
  // Source bounds remove padding without changing the illustration proportions.
  imageMode(CORNER);
  const spriteWidth = 155;
  const grownImage = lifeStage === "elder" ? elderSprites.happy : adultSprites.happy;
  const art = getPetArtwork(grownImage);
  const spriteHeight = spriteWidth * art.height / art.width;
  image(grownImage, (width - spriteWidth) / 2, 225, spriteWidth, spriteHeight,
    art.x, art.y, art.width, art.height);
  textStyle(NORMAL);
  textSize(20);
  fill(101, 115, 83);
  const growthMessage = petName + " has reached the " + LIFE_STAGE_LABELS[lifeStage].toLowerCase() + " stage.";
  drawFittedPetText(growthMessage, width / 2, 395, 470, 20);
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

function resetYouthInteractionStreak() {
  youthInteractionClock = 0;
  youthInteractionStreak = { action: null, count: 0, limit: 0, lastAt: -Infinity };
}

function recordYouthInteraction(action) {
  if (!(action in ADULT_REFUSAL)) return false;
  // Active gameplay time excludes the guide, growth popups and hidden-tab gaps.
  const now = youthInteractionClock;
  const streak = youthInteractionStreak;
  if (streak.action !== action || now - streak.lastAt >= YOUTH_BOREDOM.resetSeconds || now < streak.lastAt) {
    streak.action = action;
    streak.count = 0;
    streak.limit = random() < 0.5 ? 1 : 2;
  }
  // The first request is not a repetition. Count one or two further repeats.
  streak.count = min(streak.limit + 1, streak.count + 1);
  streak.lastAt = now;
  return streak.count > streak.limit;
}

function isAdultAngry() {
  // The guide pauses the visible expression as well as the reaction clock.
  return lifeStage === "adult" && (helpPopupOpen ? helpOpenedAt : millis()) < adultAngryUntil;
}

function isYouthNeedFull(action) {
  if (action === "feed") return hunger >= YOUTH_FULL_THRESHOLD;
  if (action === "pet" || action === "play") return happiness >= YOUTH_FULL_THRESHOLD;
  if (action === "sleep") return energy >= YOUTH_FULL_THRESHOLD;
  return false;
}

function refuseYouthInteraction(action, mood) {
  stopCurrentMovement();
  adultApproach = null;
  adultInvitingBall = false;
  adultNextActionAt = companionshipSeconds + 12;
  adultReaction = null;
  adultAffectionUntil = 0;
  isEating = isBeingPetted = isPlaying = false;
  actionEndTime = playHopsRemaining = 0;
  adultAngryUntil = millis() + 2000;
  adultRefusalMood = mood;
  // Charge once per refused request, never per frame or reaction phase.
  happiness = constrain(happiness - YOUTH_REFUSAL_MOOD_LOSS[mood], 0, 100);
  hearts.length = 0;
  interactionMode = "none";
  cursor(ARROW);
  if (mood === "bored") {
    // Unimpressed means staying still; only actual anger evades or kicks.
    squashX = squashY = 1;
    petAngle = 0;
  } else {
    if (action === "pet") startAdultEvade();
    if (action === "play") startAdultKick();
  }
  return false;
}

// Youth may randomly refuse, or become bored by repeating the same interaction.
function preparePetInteraction(action, roll) {
  if (!isMatureStage()) return true;
  if (isDead || growthPopupOpen || isSleeping || goingToSleep || isPooping) return false;
  adultApproach = null;
  adultInvitingBall = false;
  adultNextActionAt = companionshipSeconds + 12;
  isEating = isBeingPetted = isPlaying = false;
  actionEndTime = playHopsRemaining = 0;
  ballChaseUntil = 0;
  if (lifeStage !== "adult") return true;
  if (adultReaction) stopCurrentMovement();
  adultReaction = toyPlayAction = null;
  adultAngryUntil = adultAffectionUntil = 0;
  adultRefusalMood = "angry";
  // Critical mood must always be recoverable through comforting petting.
  const needsComfort = action === "pet" && happiness <= getCryThreshold();
  let repetitive = false;
  if (needsComfort) resetYouthInteractionStreak();
  else repetitive = recordYouthInteraction(action);
  if (needsComfort) return true;
  if (isYouthNeedFull(action)) return refuseYouthInteraction(action, "bored");
  // An eligible random angry refusal must remain reachable even during repetition.
  if ((roll === undefined ? random() : roll) < (ADULT_REFUSAL[action] || 0)) {
    return refuseYouthInteraction(action, "angry");
  }
  if (repetitive) return refuseYouthInteraction(action, "bored");
  return true;
}

// Angry refusals jump away or kick on contact; bored refusals stay still.
function startAdultEvade() {
  let awayX = groundX - mouseX;
  let awayY = (groundY - getPetBody().height / 2) - mouseY;
  if (abs(awayX) + abs(awayY) < 10) {
    awayX = groundX < width / 2 ? 1 : -1;
    awayY = 0.15;
  }
  const direction = atan2(awayY, awayX);
  for (const turn of [0, 0.7, -0.7, 1.4, -1.4, PI]) {
    const target = ballPosition(groundX + cos(direction + turn) * 110,
      groundY + sin(direction + turn) * 80);
    if (!target.blocked && dist(groundX, groundY, target.x, target.y) >= 30) {
      adultReaction = { kind: "evade", elapsed: 0 };
      startJumpTo(target.x, target.y, -4.8);
      return;
    }
  }
}

function startAdultKick() {
  if (toyBall.dragging) return;
  toyBall.used = toyBall.demonstrated = true;
  adultReaction = { kind: "kick", phase: "approach", phaseTime: 0,
    elapsed: 0, direction: toyBall.x >= groundX ? 1 : -1 };
}

function finishAdultReaction() {
  adultReaction = null;
  adultAngryUntil = millis() + 700;
  movementState = "pause";
  pauseTimer = 18;
}

function updateAdultReaction(elapsedSeconds = deltaTime / 1000) {
  if (!adultReaction) return false;
  if (lifeStage !== "adult" || isDead || isSleeping || goingToSleep || isPooping || isPetCrying()) {
    adultReaction = null;
    adultAngryUntil = 0;
    stopCurrentMovement();
    return false;
  }
  const reaction = adultReaction;
  const seconds = constrain(elapsedSeconds, 0, 0.05);
  reaction.elapsed += seconds;
  adultAngryUntil = millis() + 400;

  if (reaction.kind === "evade") {
    if (movementState === "jump") updatePhysicsJump();
    if (movementState !== "jump") finishAdultReaction();
    return true;
  }
  if (toyBall.dragging) {
    // The player can pick up the toy to interrupt the kick safely.
    stopCurrentMovement();
    finishAdultReaction();
    return true;
  }
  if (reaction.phase === "approach") {
    if (movementState === "jump") {
      updatePhysicsJump();
    } else if (petTouchesBall()) {
      reaction.phase = "windup";
      reaction.phaseTime = 0;
      reaction.direction = toyBall.x >= groundX ? 1 : -1;
      toyBall.vx = toyBall.vy = 0;
      stopCurrentMovement();
    } else if (reaction.elapsed > 6 || !approachToyBall()) {
      stopCurrentMovement();
      finishAdultReaction();
    }
  } else if (reaction.phase === "windup") {
    reaction.phaseTime += seconds;
    if (reaction.phaseTime >= 0.22) {
      if (!petTouchesBall()) {
        reaction.phase = "approach";
        return true;
      }
      // Only actual body contact applies the strong impulse; no play rewards.
      toyBall.vx = reaction.direction * 280;
      toyBall.vy = constrain((toyBall.y - groundY) * 2, -70, 70);
      launchToyBounce(toyBall);
      reaction.phase = "strike";
      reaction.phaseTime = 0;
    }
  } else {
    reaction.phaseTime += seconds;
    if (reaction.phaseTime >= 0.25) finishAdultReaction();
  }
  return true;
}

// ============================================================
// ROOM TOY: CLICK, DRAG, ROLL AND CHASE
// ============================================================
function makeToyBall() {
  return { x: 560, y: 470, vx: 0, vy: 0, angle: 0, radius: 20.7,
    height: 0, verticalSpeed: 0, impact: 0, dragHeight: 16,
    dragging: false, moved: false, used: false, demonstrated: false };
}

function isOverToyBall() {
  const lift = getToyBallVisual(toyBall).lift * getScaleAtY(toyBall.y);
  const radius = toyBall.radius * getScaleAtY(toyBall.y);
  return dist(mouseX, mouseY, toyBall.x, toyBall.y - radius - lift) <=
    toyBall.radius * getScaleAtY(toyBall.y) + 8;
}

function ballPosition(x, y) {
  y = constrain(y, FLOOR_TOP + 24, FLOOR_BOTTOM - 22);
  const bounds = getFloorBounds(y);
  x = constrain(x, bounds.left + 24, bounds.right - 24);
  return { x, y, blocked: isBlockedPosition(x, y) };
}

function mouseDragged() {
  if (!toyBall.dragging || isDead || growthPopupOpen || helpPopupOpen || namingPopupOpen) return;
  const position = ballPosition(mouseX + toyBall.offsetX, mouseY + toyBall.offsetY);
  const dt = max((millis() - toyBall.lastPointerAt) / 1000, 0.016);
  if (!position.blocked) {
    toyBall.vx = lerp(toyBall.vx, constrain((position.x - toyBall.x) / dt, -430, 430), 0.65);
    toyBall.vy = lerp(toyBall.vy, constrain((position.y - toyBall.y) / dt, -300, 300), 0.65);
    toyBall.x = position.x;
    toyBall.y = position.y;
  }
  toyBall.lastPointerAt = millis();
  if (dist(mouseX, mouseY, toyBall.startX, toyBall.startY) > 5) toyBall.moved = true;
  return false;
}

function mouseReleased() {
  if (namingPopupOpen || helpPopupOpen || !toyBall.dragging) return;
  toyBall.dragging = false;
  if (isDead || growthPopupOpen) return;
  if (!toyBall.moved) {
    // A simple click works too, so discovering drag is not a prerequisite.
    toyBall.vx = toyBall.x > width / 2 ? -100 : 100;
    toyBall.vy = -25;
  } else if (millis() - toyBall.lastPointerAt > 150) {
    toyBall.vx = toyBall.vy = 0;
  }
  toyBall.height = toyBall.dragHeight;
  launchToyBounce(toyBall);
  requestBallPlay();
}

function requestBallPlay() {
  if (isDead || isSleeping || goingToSleep || isPooping ||
      isEating || isBeingPetted || isPetCrying()) return;
  if (energy <= 10 && !(lifeStage === "adult" && isYouthNeedFull("play"))) return;
  if (!preparePetInteraction("play")) {
    ballChaseUntil = 0;
    return;
  }
  // A thrown toy takes priority over the toolbar's remaining random play hops.
  if (lifeStage === "elder") elderHopPauseRemaining = 0;
  isPlaying = false;
  playHopsRemaining = 0;
  actionEndTime = 0;
  toyPlayAction = null;
  ballChaseSpeed = 65 * petMovementFactor();
  ballChaseSide = 0;
  ballChaseUntil = millis() + ballPursuitMilliseconds();
}

function updateToyBall() {
  if (toyBall.dragging && !mouseIsPressed) mouseReleased();
  // One early pet-initiated demonstration tells the player this is a toy.
  if (lifeStage !== "elder" && !adultReaction && !isAdultAngry() &&
      !toyBall.demonstrated && !toyBall.used && companionshipSeconds >= 4 &&
      !isSleeping && !goingToSleep && !isPetCrying() && !isEating &&
      !isBeingPetted && !isPooping && !isPlaying) {
    toyBall.demonstrated = true;
    ballChaseSide = 0;
    ballChaseUntil = millis() + ballPursuitMilliseconds();
  }
  if (toyBall.dragging) return;
  const dt = constrain(deltaTime / 1000, 0, 0.05);
  const canChase = millis() < ballChaseUntil && !isDead && !isSleeping &&
    !goingToSleep && !isEating && !isBeingPetted && !isPooping && !isPetCrying() && energy > 10 &&
    hunger >= HUNGER_FLATTEN_THRESHOLD && !toyPlayAction;
  const speedFactor = petMovementFactor();
  ballChaseSpeed = canChase ? min(180 * speedFactor, ballChaseSpeed + 260 * speedFactor * dt) : 0;
  advanceToyBallPhysics(toyBall, dt);
}

function updateBallChase() {
  if (millis() >= ballChaseUntil || toyBall.dragging || energy <= 10) {
    ballChaseSpeed = ballChaseSide = 0;
    if (movementState === "chase") { movementState = "pause"; pauseTimer = 12; }
    return false;
  }
  if (isInFriendlyToyReach()) {
    // Wait beside the ball's floor position, without circling underneath a bounce.
    if (toyBall.height <= 1 && petTouchesBall()) {
      stopCurrentMovement();
      movementState = "pause";
      toyBall.vx = toyBall.vy = toyBall.verticalSpeed = toyBall.height = 0;
      toyPlayAction = { phase: "windup", elapsed: 0, kicked: false,
        direction: toyBall.x >= groundX ? 1 : -1 };
    }
    movementState = "pause";
    pauseTimer = 12;
    return true;
  }
  if (approachToyBall(lifeStage !== "elder")) return true;
  ballChaseUntil = 0;
  return false;
}

// Each successful chase ends with a short preparation, one tap, and a rest.
function updateToyPlayAction() {
  if (!toyPlayAction) return false;
  if (isDead || toyBall.dragging || isSleeping || goingToSleep || isPooping ||
      isEating || isBeingPetted || isPetCrying() ||
      energy <= 10 || hunger < HUNGER_FLATTEN_THRESHOLD) {
    toyPlayAction = null;
    ballChaseUntil = ballChaseSpeed = 0;
    movementState = "pause";
    pauseTimer = 12;
    return false;
  }
  const action = toyPlayAction;
  action.elapsed += constrain(deltaTime / 1000, 0, 0.05);
  floorVX = floorVY = jumpOffset = jumpVelocity = 0;
  movementState = "pause";
  if (action.phase === "windup" && action.elapsed >= 0.22) {
    action.phase = "release";
    action.elapsed = 0;
  } else if (action.phase === "release" && !action.kicked && action.elapsed >= 0.06) {
    // Apply the impulse as the pet leans forward, rather than before its kick.
    if (!petTouchesBall()) {
      toyPlayAction = null;
      ballChaseUntil = ballChaseSpeed = 0;
      return false;
    }
    let dx = toyBall.x - (groundX + toyKickOffsetX());
    let dy = (toyBall.y - groundY) * 0.6;
    if (isMatureStage() && adultInvitingBall) {
      dx = (mouseY >= FLOOR_TOP && mouseY <= FLOOR_BOTTOM ? mouseX : width / 2) - toyBall.x;
      dy = 0;
    }
    if (Math.hypot(dx, dy) < 1) dx = action.direction;
    const length = Math.hypot(dx, dy);
    toyBall.vx = dx / length * 55;
    toyBall.vy = dy / length * 55;
    toyBall.height = 0;
    toyBall.verticalSpeed = 40;
    toyBall.impact = 0.12;
    // Every throw can receive a physical tap; rewards keep their existing cooldown.
    if (millis() - lastBallRewardAt >= 1500) {
      lastBallRewardAt = millis();
      happiness = constrain(happiness + 4, 0, 100);
      energy = constrain(energy - PLAY_ENERGY_COST.toy, 0, 100);
      hunger = constrain(hunger - 0.5, 0, 100);
      // A completed player-started ball interaction is care too; idle demos are not.
      if (toyBall.used && !adultInvitingBall) recordGrowthCare();
      createHeart();
    }
    ballChaseUntil = ballChaseSpeed = 0;
    adultInvitingBall = false;
    action.kicked = true;
  } else if (action.phase === "release" && action.elapsed >= 0.25) {
    action.phase = "rest";
    action.elapsed = 0;
  } else if (action.phase === "rest" && action.elapsed >= 0.7) {
    toyPlayAction = null;
    pauseTimer = 45;
  }
  return true;
}

// A small body lunge makes the existing squash-and-lean kick readable.
function toyKickOffsetX() {
  if (!toyPlayAction) return 0;
  const action = toyPlayAction;
  if (action.phase === "windup") return -action.direction * 2 * constrain(action.elapsed / 0.22, 0, 1);
  if (action.phase === "release") return action.direction * 6 * sin(constrain(action.elapsed / 0.25, 0, 1) * PI);
  return 0;
}

function isInFriendlyToyReach() {
  if (toyBall.dragging || movementState === "jump" || abs(jumpOffset) > 1) return false;
  const body = getPetBody();
  return abs(toyBall.y - groundY) <= max(16, body.height * 0.4) &&
    abs(toyBall.x - groundX) >= body.width * 0.20 && petToyOverlap(0, 0.82);
}

function approachToyBall(running = false) {
  // Running follows the moving ball; refusal kicks retain their existing hops.
  const body = getPetBody();
  const ballRadius = toyBall.radius * getScaleAtY(toyBall.y);
  const approach = body.width * 0.35 + ballRadius - 6;
  const targetY = toyBall.y + body.height / 2 - ballRadius;
  if (running) {
    // Choose one side for this chase; do not swap left and right every frame.
    if (!ballChaseSide) ballChaseSide = groundX <= toyBall.x ? -1 : 1;
    let target = ballPosition(toyBall.x + ballChaseSide * approach, targetY);
    if (target.blocked || abs(target.x - toyBall.x) < body.width * 0.20) {
      const opposite = ballPosition(toyBall.x - ballChaseSide * approach, targetY);
      if (opposite.blocked || abs(opposite.x - toyBall.x) < body.width * 0.20) return false;
      ballChaseSide *= -1;
      target = opposite;
    }
    return runTowardToyBall(target);
  }
  const side = groundX <= toyBall.x ? -1 : 1;
  for (const offset of [side * approach, -side * approach, side * approach * 0.8, -side * approach * 0.8]) {
    const target = ballPosition(toyBall.x + offset, targetY);
    if (!target.blocked) {
      const dx = target.x - groundX;
      const dy = target.y - groundY;
      const ratio = min(1, (lifeStage === "elder" ? 18 : 95) / max(sqrt(dx * dx + dy * dy), 1));
      const step = ballPosition(groundX + dx * ratio, groundY + dy * ratio);
      if (!step.blocked) {
        startJumpTo(step.x, step.y, normalJumpPower);
        return true;
      }
    }
  }
  return false;
}

// Small floor steps allow acceleration and steering without a remote kick.
function runTowardToyBall(target) {
  const dx = target.x - groundX, dy = target.y - groundY;
  const distance = Math.hypot(dx, dy);
  const seconds = constrain(deltaTime / 1000, 0, 0.05);
  const travel = min(distance, max(65 * petMovementFactor(), ballChaseSpeed) * seconds);
  const steps = max(1, ceil(travel / 5));
  let moved = 0;
  for (let i = 0; i < steps && distance > 0.1; i++) {
    const sx = dx / distance * travel / steps, sy = dy / distance * travel / steps;
    let next = ballPosition(groundX + sx, groundY + sy);
    if (next.blocked) {
      const alternatives = [ballPosition(groundX + sx, groundY), ballPosition(groundX, groundY + sy)]
        .filter(point => !point.blocked)
        .sort((a, b) => dist(a.x, a.y, target.x, target.y) - dist(b.x, b.y, target.x, target.y));
      if (!alternatives.length) break;
      next = alternatives[0];
    }
    moved += dist(groundX, groundY, next.x, next.y);
    groundX = next.x;
    groundY = next.y;
  }
  floorVX = floorVY = jumpOffset = jumpVelocity = 0;
  if (abs(dx) > 4) ballChaseFacing = dx > 0 ? 1 : -1;
  ballChaseStride += moved * TWO_PI / 42;
  movementState = moved > 0.01 ? "chase" : "pause";
  pauseTimer = 8;
  return true;
}

function drawToyBall() {
  const depth = getScaleAtY(toyBall.y);
  const visual = getToyBallVisual(toyBall);
  push();
  translate(toyBall.x, toyBall.y);
  noStroke();
  fill(76, 66, 43, visual.shadowAlpha);
  ellipse(0, 4 * depth, toyBall.radius * 1.89 * depth * visual.shadowScale,
    toyBall.radius * 0.5 * depth * visual.shadowScale);
  translate(0, -visual.lift * depth);
  scale(depth);
  if (isOverToyBall() || (!toyBall.used && floor(companionshipSeconds) % 5 === 0)) {
    noFill();
    stroke(244, 206, 94, 150);
    strokeWeight(2);
    circle(0, -toyBall.radius, toyBall.radius * 2 + 11);
  }
  // Deform around the bottom so landing compression stays on the floor.
  scale(visual.scaleX, visual.scaleY);
  translate(0, -toyBall.radius);
  const wiggle = !toyBall.used && toyBall.vx === 0 ? sin(millis() * 0.003) * 0.08 : 0;
  rotate(toyBall.angle + wiggle);
  imageMode(CENTER);
  const diameter = toyBall.radius * 2;
  image(toyBallImg, 0, 0, diameter, diameter * toyBallImg.height / toyBallImg.width);
  pop();
}

// Visible source bounds: files remain unchanged, including their transparent padding.
function getPetArtwork(img) {
  if (img === hungryPetImg) return HUNGRY_ART;
  if (isMatureArtwork(img)) return { x: 0, y: 0, width: img.width, height: img.height };
  if (img === petNormalImg) return { x: 970, y: 780, width: 651, height: 609 };
  if (img === petHappyImg) return { x: 955, y: 772, width: 667, height: 625 };
  if (img === petCryImg) return { x: 990, y: 788, width: 623, height: 584 };
  return { x: 0, y: 0, width: img.width, height: img.height };
}

function getPetBody() {
  const img = getCurrentPetImage();
  const art = getPetArtwork(img);
  const factor = petRenderFactor(img) * getScaleAtY(groundY);
  return { width: art.width * factor * squashX,
    height: art.height * factor * squashY };
}

function petTouchesBall() {
  if (toyBall.dragging || toyBall.height > 18 || movementState === "jump" || abs(jumpOffset) > 1) return false;
  return petToyOverlap((toyBall.height || 0) * getScaleAtY(toyBall.y));
}

function petToyOverlap(lift, limit = 1) {
  const body = getPetBody();
  const ballRadius = toyBall.radius * getScaleAtY(toyBall.y);
  const dx = (toyBall.x - groundX - toyKickOffsetX()) / (body.width * 0.48 + ballRadius);
  const dy = (toyBall.y - ballRadius - lift - (groundY - body.height / 2)) /
    (body.height * 0.45 + ballRadius);
  return dx * dx + dy * dy <= limit;
}

function petRenderFactor(img) {
  if (img === hungryPetImg) {
    const stageWidth = lifeStage === "child" ? 651 : 771;
    const stageScale = getPetModelScale();
    return (BASE_PET_WIDTH * stageWidth / 2732) * 1.18 * stageScale / HUNGRY_ART.width;
  }
  if (isMatureArtwork(img)) {
    const stageScale = Object.values(elderSprites).includes(img) ? ELDER_MODEL_SCALE : 1;
    return (BASE_PET_WIDTH * GROWN_MODEL_WIDTH_FACTOR * stageScale) / img.width;
  }
  const stageScale = [petNormalImg, petHappyImg, petCryImg].includes(img) ? CHILD_MODEL_SCALE : 1;
  return BASE_PET_WIDTH * stageScale / img.width;
}

// Adults alternate between approaching the player and initiating ball play.
function updateAdultBehavior() {
  if (!isMatureStage() || isDead || growthPopupOpen) return;
  if (elderRestPending() || adultReaction || isAdultAngry()) return;
  if (isPetCrying() || isSleeping || goingToSleep || isEating || isBeingPetted ||
      isPlaying || isPooping || toyBall.dragging || millis() < ballChaseUntil) {
    adultApproach = null;
    adultNextActionAt = max(adultNextActionAt, companionshipSeconds + 3);
    return;
  }
  if (adultApproach || companionshipSeconds < adultNextActionAt || energy < 35 || hunger < 35) return;
  adultNextActionAt = companionshipSeconds + 12;
  adultActionCount++;
  if (lifeStage !== "elder" && adultActionCount % 2 === 0) {
    adultInvitingBall = true;
    ballChaseSide = 0;
    ballChaseUntil = millis() + ballPursuitMilliseconds();
    return;
  }
  if (mouseY < FLOOR_TOP + 24 || mouseY > FLOOR_BOTTOM - 22) return;
  const target = ballPosition(mouseX, mouseY);
  if (!target.blocked && dist(groundX, groundY, target.x, target.y) > 50) {
    adultApproach = { x: target.x, y: target.y, until: companionshipSeconds + 6 / petMovementFactor() };
  }
}

function updateAdultApproach() {
  if (!isMatureStage() || !adultApproach) return false;
  if (isPetCrying() || companionshipSeconds >= adultApproach.until ||
      isBlockedPosition(adultApproach.x, adultApproach.y)) {
    adultApproach = null;
    return false;
  }
  const dx = adultApproach.x - groundX;
  const dy = adultApproach.y - groundY;
  const distance = sqrt(dx * dx + dy * dy);
  if (distance <= 45) {
    adultApproach = null;
    adultAffectionUntil = millis() + 1800;
    createHeart();
    movementState = "pause";
    pauseTimer = 35;
    return true;
  }
  const ratio = min(1, (lifeStage === "elder" ? 20 : 75) / distance);
  const target = ballPosition(groundX + dx * ratio, groundY + dy * ratio);
  if (target.blocked) { adultApproach = null; return false; }
  startJumpTo(target.x, target.y, -5.4);
  return true;
}

// Naming is part of birth, before any care timers begin running.
function finishPetNaming(name) {
  if (!namingPopupOpen || petHasBeenNamed) return;
  petName = name;
  petHasBeenNamed = true;
  const pausedFor = millis() - namingOpenedAt;
  nextPoopTime += pausedFor;
  closeNamingPopup();
  if (!helpHasBeenShown) {
    helpHasBeenShown = true;
    openHelpPopup();
  }
}

function drawFittedPetText(label, x, y, maxWidth, preferredSize) {
  textSize(preferredSize);
  const measured = textWidth(label);
  if (measured > maxWidth) textSize(preferredSize * maxWidth / measured);
  text(label, x, y);
}
