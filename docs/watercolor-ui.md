# Watercolor UI and visible sleep

The status cards, five care tools, help button, music button, naming form and nameplate share a matte cream, sage, dusty rose and warm ochre palette through `ui-theme.js`. Original canvas dimensions, control coordinates and hitboxes are unchanged. Need bars retain low/red and medium/amber warnings; the current rounded value is shown beside each label. Tool outlines and a small dot show selection, and hover/press states remain subtle. The existing five tool symbols, music waves/slash and all character/background artwork remain recognizable and functional.

`sketch.js` continues to own the existing handlers and gameplay. `help.js`, `music.js` and `naming.js` only receive cosmetic changes; help still pauses the game, naming still uses a blank native input with a visible caret and IME support, and music remains enabled by default with browser-gesture unlocking.

The owner also reported that clicking SLEEP at high energy showed almost no sleep. Previously the first update after reaching the bed woke the pet whenever energy was at least 80, and forced it back to 80. An accepted sleep now spends at least three visible active seconds actually asleep at the shared `(660, 300)` nest anchor, and wakes only when energy has also recovered to at least 80. The counter starts at zero on an accepted sleep request and advances only after arrival. Help and hidden-tab time do not advance the minimum rest. Recovery is capped at 100 and never lowers a well-rested pet's energy. Automatic low-energy rest, Youth's full-energy refusal, growth on waking, and restart/death resets remain functional.

Verification: native egg/naming, all help pages, all five toolbar actions and unchanged hitboxes, speaker ON/OFF icon rules, accepted high-energy sleep in all stages, automatic low-energy recovery, help pause, growth after actual waking, farewell/letter/rebirth, and JavaScript errors.

## Window and fullscreen display

`style.css` fits and centers the existing 900 × 640 canvas inside the available window, keeping its aspect ratio. This changes CSS display size only: all game coordinates, hitboxes, physics, artwork and control positions stay unchanged. Different screen proportions may leave cream margins rather than stretching or cropping the game. The native naming form already follows the canvas bounding rectangle and remains aligned during resize/fullscreen.

`viewport.js` adds a small full-screen corner icon in the unused upper-right gutter. It requests fullscreen only from a user click, uses the document root so the native naming form stays visible, supports exit through the same button or browser Escape, and isolates its events from game actions. Browsers without the Fullscreen API still receive window fitting. Archived prototypes keep their earlier scripts; current entries and direct stage/farewell previews share the new display controls.

Checks cover desktop/portrait/landscape window sizes, unchanged internal dimensions, fullscreen entry/exit without accidentally hatching, name input alignment and editing after resize, and scaled care/music/help/toy pointer coordinates.
