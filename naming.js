// Naming uses a real text field so Chinese input methods and mobile keyboards work.
let petName = "Little Rascal";
let petHasBeenNamed = false;
let namingPopupOpen = false;
let namingOpenedAt = 0;
let namingForm = null;
let namingInput = null;
let namingError = "";
let namingComposing = false;
let namingSubmitted = false;
let namingLayoutKey = "";

function petNameCharacters(value) {
  if (typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value), item => item.segment);
  }
  return Array.from(value);
}

function sanitizePetName(value) {
  const clean = String(value).replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").replace(/\s+/gu, " ").trim();
  return petNameCharacters(clean).slice(0, 16).join("");
}

function positionNamingForm() {
  if (!namingForm) return;
  const canvas = document.querySelector("canvas");
  if (!canvas) return;
  const bounds = canvas.getBoundingClientRect();
  // Keep the native text field stable while its caret and selection are active.
  const layoutKey = [bounds.left, bounds.top, bounds.width, bounds.height, width, height].join(":");
  if (layoutKey === namingLayoutKey) return;
  namingLayoutKey = layoutKey;
  const sx = bounds.width / width;
  const sy = bounds.height / height;
  Object.assign(namingForm.style, {
    left: (bounds.left + 285 * sx) + "px", top: (bounds.top + 349 * sy) + "px",
    width: (330 * sx) + "px", height: (119 * sy) + "px"
  });
  Object.assign(namingInput.style, {
    width: "100%", height: (46 * sy) + "px", fontSize: Math.max(16, 19 * sy) + "px",
    borderRadius: (12 * Math.min(sx, sy)) + "px", padding: "0 " + (14 * sx) + "px"
  });
  const button = namingForm.querySelector("button");
  Object.assign(button.style, {
    left: (55 * sx) + "px", top: (73 * sy) + "px", width: (220 * sx) + "px",
    height: (46 * sy) + "px", borderRadius: (20 * Math.min(sx, sy)) + "px",
    fontSize: Math.max(13, 16 * sy) + "px"
  });
}

function openNamingPopup() {
  if (namingPopupOpen || petHasBeenNamed) return;
  namingPopupOpen = true;
  namingOpenedAt = millis();
  namingSubmitted = false;
  namingComposing = false;
  namingError = "";
  namingForm = document.createElement("form");
  namingForm.id = "pet-naming-form";
  namingForm.setAttribute("aria-label", "Name your little friend");
  Object.assign(namingForm.style, {
    position: "fixed", zIndex: "10", margin: "0", padding: "0", border: "0", pointerEvents: "none"
  });
  namingInput = document.createElement("input");
  namingInput.id = "pet-name-input";
  namingInput.name = "pet-name";
  namingInput.type = "text";
  namingInput.autocomplete = "off";
  namingInput.spellcheck = false;
  namingInput.autofocus = true;
  namingInput.removeAttribute("placeholder");
  namingInput.setAttribute("aria-label", "Pet name, up to 16 characters");
  namingInput.setAttribute("enterkeyhint", "done");
  namingInput.setAttribute("aria-describedby", "pet-name-feedback");
  const feedback = document.createElement("span");
  feedback.id = "pet-name-feedback";
  feedback.setAttribute("aria-live", "polite");
  feedback.textContent = "Choose a name of up to 16 characters.";
  Object.assign(feedback.style, { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clipPath: "inset(50%)" });
  Object.assign(namingInput.style, {
    boxSizing: "border-box", border: "1.5px solid #c4ad78", outlineColor: "#c59c48",
    background: "#fffdf3", color: "#705b3c", fontFamily: "Arial, sans-serif",
    textAlign: "center", pointerEvents: "auto", cursor: "text", caretColor: "#705b3c",
    userSelect: "text", webkitUserSelect: "text", boxShadow: "inset 0 2px 4px #b9a77d14"
  });
  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = "LET'S BEGIN";
  Object.assign(button.style, {
    position: "absolute", boxSizing: "border-box", border: "1.5px solid #b8944e",
    background: "#f2d89c", color: "#69583a", fontFamily: "Arial, sans-serif", fontWeight: "bold",
    cursor: "pointer", pointerEvents: "auto"
  });
  button.addEventListener("mouseenter", () => { button.style.background = "#fade89"; });
  button.addEventListener("mouseleave", () => { button.style.background = "#f2d89c"; });
  // Native focus preserves the blinking caret and opens touch keyboards on a tap.
  namingInput.addEventListener("pointerdown", () => {
    if (document.activeElement !== namingInput) namingInput.focus({ preventScroll: true });
  });
  namingInput.addEventListener("compositionstart", () => { namingComposing = true; });
  namingInput.addEventListener("compositionend", () => { namingComposing = false; namingError = ""; });
  namingInput.addEventListener("input", () => {
    namingError = "";
    namingInput.removeAttribute("aria-invalid");
    feedback.textContent = "Choose a name of up to 16 characters.";
  });
  namingInput.addEventListener("keydown", event => {
    // The Enter key confirming an IME candidate must not confirm the pet name.
    if (event.key === "Enter" && (namingComposing || event.isComposing || event.keyCode === 229)) event.preventDefault();
    event.stopPropagation();
  });
  for (const type of ["pointerdown", "pointerup", "mousedown", "mouseup", "click", "touchstart", "touchend"]) {
    namingForm.addEventListener(type, event => event.stopPropagation());
  }
  namingForm.addEventListener("submit", event => {
    event.preventDefault();
    event.stopPropagation();
    if (namingComposing || namingSubmitted || !namingPopupOpen) return;
    const name = sanitizePetName(namingInput.value);
    if (!name) {
      namingError = "Please give your little friend a name.";
      namingInput.setAttribute("aria-invalid", "true");
      feedback.textContent = namingError;
      namingInput.focus();
      return;
    }
    namingInput.removeAttribute("aria-invalid");
    namingSubmitted = true;
    finishPetNaming(name);
  });
  namingForm.append(namingInput, button, feedback);
  document.body.append(namingForm);
  positionNamingForm();
  // Delayed focus is guarded so a restart cannot focus an already removed field.
  requestAnimationFrame(() => { if (namingPopupOpen && namingInput) namingInput.focus({ preventScroll: true }); });
}

function closeNamingPopup() {
  namingPopupOpen = false;
  if (namingForm) namingForm.remove();
  namingForm = namingInput = null;
  namingLayoutKey = "";
  namingComposing = false;
  cursor(ARROW);
}

function resetPetNaming() {
  closeNamingPopup();
  petName = "Little Rascal";
  petHasBeenNamed = false;
  namingOpenedAt = 0;
  namingSubmitted = false;
  namingError = "";
}

function drawNamingPopup() {
  push();
  rectMode(CORNER);
  noStroke();
  fill(58, 59, 43, 88);
  rect(0, 0, width, height);
  fill(75, 66, 43, 24);
  rect(201, 118, 510, 420, 25);
  stroke(183, 162, 113);
  strokeWeight(1.7);
  fill(253, 250, 237);
  rect(195, 110, 510, 420, 25);
  noFill();
  stroke(234, 225, 195);
  strokeWeight(1);
  rect(204, 119, 492, 402, 19);
  noStroke();
  textFont("Arial");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(29);
  fill(107, 88, 59);
  text("Hello, little one!", width / 2, 157);
  const art = getPetArtwork(petHappyImg);
  const spriteWidth = 94;
  const spriteHeight = spriteWidth * art.height / art.width;
  imageMode(CORNER);
  image(petHappyImg, (width - spriteWidth) / 2, 242 - spriteHeight / 2, spriteWidth, spriteHeight,
    art.x, art.y, art.width, art.height);
  textStyle(NORMAL);
  textSize(17);
  fill(114, 98, 74);
  text("What shall we call your little friend?", width / 2, 318);
  textSize(12);
  fill(namingError ? color(172, 102, 79) : color(142, 143, 113));
  text(namingError || "Choose a name of up to 16 characters.", width / 2, 407);
  textSize(13);
  fill(139, 142, 110);
  text("A tiny name for a whole little life.", width / 2, 496);
  pop();
  cursor(ARROW);
  positionNamingForm();
}

function drawPetNameLabel() {
  if (!petHasBeenNamed) return;
  push();
  textFont("Arial");
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  fill(112, 89, 60, 225);
  let fontSize = 16;
  textSize(fontSize);
  while (textWidth(petName) > 220 && fontSize > 12) textSize(--fontSize);
  const letters = petNameCharacters(petName);
  let label = petName;
  while (textWidth(label) > 220 && letters.length > 0) {
    letters.pop();
    label = letters.join("") + "…";
  }
  text(label, width / 2, 77);
  pop();
}
