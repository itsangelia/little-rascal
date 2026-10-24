# Natural farewell and rebirth

Only natural old-age death enters the thank-you-letter ending. Starvation (8 seconds at zero hunger), sadness (8 seconds at zero mood), and illness (6 seconds until flies, then 7 more until death) keep the original result screen and START AGAIN button. All artwork, the watercolor room, normal models, layout and 900 × 640 canvas remain intact.

## Natural lifespan

`NATURAL_LIFESPAN_SECONDS` in `ending.js` is initially 90 seconds after entering the senior stage. This is visible active gameplay time; birth, naming, help, growth announcements, hidden tabs and endings do not count. The clock resets on entering the stage and starting a new life. At the deadline, finish the last airborne hop and ongoing care or sleep before stopping. Zero hunger/mood or stinky waste defer natural death so neglect remains meaningful.

## Animation and letter

The actual senior model stands on the floor for 3 seconds. It then gently softens over 4 seconds: its height gradually falls to 45%, width expands to 116%, and its bottom stays fixed on the floor. Only this requested animation changes the drawn proportions; PNG files and normal gameplay proportions are unchanged. The death/result illustration is never used in this sequence.

The softened body dissolves for 3 seconds. The existing approved F soul rises for 3.8 seconds and scatters into stars for 1.8 seconds. It is cropped from the original concept sheet with its paper removed at runtime.

The thank-you letter uses the owner's exact seven text lines in `FAREWELL_LETTER`. It resembles unfolded cream stationery with a folded corner, faint rules and serif type. No cause, stage or statistics appear. It waits indefinitely for CLOSE LETTER, Enter, Space or Escape. The music control remains usable.

Closing the letter starts 3.4 seconds of starlight gathering into the C egg, followed by a 1.8-second “A New Beginning” reveal. Reset only after the reveal; the egg waits for a fresh click and retains its rocking, meteor, extended hatch reveal and editable naming flow.

## Checks

- Open `previews/farewell/` to watch natural death immediately. Verify the real senior stands for 3 seconds, softens gradually without floating, dissolves, then becomes the rising F soul and stars.
- Check the exact English letter, stationery, indefinite pause and music. Close it and confirm starlight, the English title, a clickable egg, meteor and a new name.
- In `play.html`, raise the pet to senior and care for it through its 90-second active lifespan. Help/growth dialogs must pause aging; young stages do not age toward this deadline.
- Trigger each neglect death: the earlier result screen should appear without a thank-you letter, and START AGAIN should return to the egg.
