# Little Rascal development instructions

## Project

Little Rascal is a p5.js virtual pet game developed for a university assignment. It uses 2D programming with pseudo-3D spatial movement. Preserve its hand-drawn, soft watercolor, cute and playful visual style.

These instructions apply to the entire repository and all future Codex tasks.

## Development rules

1. Preserve all existing gameplay features unless the user explicitly requests changes.
2. Never change the canvas dimensions (currently 900 × 640), image proportions, or interface layout without the user's permission.
3. Keep the hunger, mood, energy, feeding, petting, playing, sleeping, waste, and cleaning systems functional.
4. Preserve all character image assets and growth-stage designs. Do not remove unused stage artwork or assume that a stage is implemented merely because its assets exist.
5. Integrate new mechanics with the existing game rather than replacing it.
6. Avoid duplicate `setup()`, `draw()`, or event-handler functions. Extend the existing handlers or delegate to clearly named helpers.
7. Keep background music compatible with browser autoplay restrictions. Handle rejected playback promises and allow playback to start after a user gesture.
8. Use clear English comments in the code.
9. Test for JavaScript errors after making changes. For gameplay changes, run the game through a local HTTP server, inspect the browser console, and exercise the affected interactions. Preserve the current visual layout and verify that existing systems still work. Report checks that could not be completed.
10. Explain which files were modified and how to test the changes in the final response.

## Working practices

- Read the existing implementation before editing. Keep changes focused on the user's request.
- Use the existing checkout; each cloud task already runs in an isolated environment. Do not create a Git worktree unless the user explicitly requests one.
- Preserve existing user changes and do not commit unrelated files.
- Do not introduce build tools or dependencies unless the task requires them.
- For local validation, serve the repository with `python3 -m http.server 8000` from its root. A syntax check such as `node --check sketch.js` complements browser testing but does not replace it for gameplay changes.

## Approved elderly appearance

- Use the approved artwork and expression choices in [design-options/elder-approved.md](design-options/elder-approved.md) for future elderly-stage work.
- Preserve the selected A body, line style, two stars and eye-corner creases. The approved expressions are kind (A), tired sigh (F), and happy with the baby happy mouth while retaining A's eyes and creases.
- The active growth sequence is child → adult → elder (three stages). The former third-stage adult is now the second stage. Teenage assets/prototypes are archived, not part of the current lifecycle; do not restore the teenage stage. The owner has explicitly moved its refusal behavior to adults (see below). Each transition uses two effective feeds and two other care actions, followed by the next waking. Hide the “Two useful feeds + two other care actions” line in ABOUT, but keep these actual growth rules and the following care/sleep explanation. Elder is final. The owner has now requested natural old-age death; `ending.js` counts 80 visible active seconds in the senior stage, then waits for a grounded, non-busy moment. Preserve neglect priority. The four-stage version remains backed up at tag `backup-2026-10-24-78cbbb3`.
- Senior autonomous movement is a deliberate burst of three small airborne hops: shorter travel distances and about 0.65 seconds of landing/settling between hops, then a full three-second stationary stop before the next burst. The movement burst itself must be slow too. Do not stop for three seconds after every individual hop. This supersedes the earlier 30% time budget. Keep normal gravity; the owner rejected slow-motion physics and grounded walking. Care and sleep remain responsive; player-requested pursuit keeps the slower hop cadence and sigh face, followed by the contact-timed gentle kick. Seniors never initiate ball play or its early demonstration.

## Approved adult appearance

- Follow the owner's adult reference description in [design-options/adult-approved.md](design-options/adult-approved.md).
- Preserve the round cream body, its visible black outer contour (including both side bumps and the bottom), and flat drawing style, with the large head star and the smaller star beside the right cheek. Both stars retain their warm ochre outlines. Adult artwork has no elderly eye-corner creases.
- The original transparent PNG contains a black body outline that can disappear visually against a black image-viewer background. Inspect it on a light or gray background. Never instruct image generation to remove the black body outline.
- The adult happy face uses open tilted black oval eyes and a tiny omega-shaped upper mouth joined to a narrow vertical pink U-shaped open mouth, following the owner's happy reference. Keep both adult stars. Do not substitute closed smiling eyes.

## Current size and play balance

- Child world artwork renders at 85% of its former width and height, including its birth reveal, hungry and death poses. Preserve image proportions and keep its hitbox and shadow aligned. Guide/naming portraits and the other life stages keep their existing sizes.
- A rewarded physical toy interaction costs 5 energy points; accepted toolbar PLAY costs 32. Preserve the existing reward cooldown and energy clamping. Refused play does not charge energy. See [docs/play-balance.md](docs/play-balance.md).

## Approved farewell and rebirth

- Natural old-age death alone receives the farewell and letter. Starvation, sadness and illness retain the earlier death result screen and restart button. Do not send neglect deaths into the thank-you letter.
- Preserve `ending.js`: actual senior model stands still for 3 seconds → body gently softens over 4 seconds (85% height, 104% width, floor baseline anchored) → dissolution → F winged soul rises and scatters into stars → envelope on the floor waits for the player to click → thank-you letter → player closes letter → stars gather into the C egg → “A New Beginning” → existing clickable egg, meteor and naming flow.
- Never use the crossed-eyes death/result illustration as the natural farewell body. Reuse the current senior character art; gradual squash is the requested animation, not a change to source artwork or normal model proportions.
- Reuse F directly from `design-options/farewell-options.png`; preserve its closed eyes, wings, cheeks, head star and ghost silhouette. Keep all original art files intact.
- Render the letter as an unfolded cream sheet with a folded corner, faint rules and serif text. Keep the exact owner-provided `FAREWELL_LETTER` text, including “Dear Friend,”, “PS:” and “Love, Little Rascal”. Do not add a cause, stage or statistics to the letter.
- Pause care, movement, growth and lifetime counters throughout farewell, the letter and rebirth. Neither the envelope nor the letter advances automatically. Click the envelope to open the letter (Enter/Space also work); keep the letter open until the player closes it. Keep music available. The dedicated `previews/farewell/` page demonstrates natural death; normal game pages begin at the egg.

## Adult refusal behavior

- The former teenage refusals now apply only to adults: 25% baseline refusal for feeding, petting or playing, including player-thrown toys. Keep the adult artwork and red anger mark. The life stages remain child → adult → elder.
- Random angry refusals retain the escape hop for petting and contact-only kick for play. Unimpressed refusals remain still, with no escape, kick or wobble. A refusal gives no hunger/care reward and costs no play energy. Interaction-triggered unimpressed refusals reduce mood by 3; angry refusals reduce mood by 5, exactly once per request. Keep accepted play's existing run, gentle tap and 32/5 energy costs.
- The second stage is displayed as Youth (青年); keep the internal `adult` key and approved artwork. The first eligible request is not a repeat. One or two subsequent repeats (second or third total attempt) make the streak boring: use the unimpressed face, stay still, and refuse with one mood penalty. Toolbar play and floor-ball throws share one play streak; autonomous behavior never counts. Switching care, successful cleaning, or eight active seconds between attempts resets it. Sleep/death/growth/restart also clear it.
- Full corresponding need bars also produce a stationary unimpressed refusal (food→hunger, pet/play→mood, player-requested sleep→energy). Values at or above 99.5 count as rounded-full to tolerate passive drain. Full sleep applies only to player requests, not automatic recovery. Fullness, repetition and randomness never stack penalties. Priority is critical-mood comfort → full-need stationary refusal → random angry refusal → repetitive stationary refusal → acceptance. Keep random anger reachable during repetition. The owner subsequently set youth mood faces: below 25 cries and stays still; 25–39 shows angry; at least 40 uses normal/action faces unless a timed refusal is active. Youth uses a crying threshold of 25 for movement, play/sleep eligibility and guaranteed petting comfort. Child and elder retain 30.
- Critical-mood petting remains accepted and clears the repeated-petting streak. Smelly-waste crying and the hungry pose keep their visual priority. Sleep, death, stage changes and restart clear reactions; the help popup pauses reactions and their anger deadline.

## Senior affection requests

- Seniors show three randomly timed comic thought bubbles: three small circles lead to a wide white comic oval with a soft bottom tip, dark outline, and a small hand and heart inside (no text) before natural death. Schedules use fractions of the 80-second active senior life: early, middle and late. Each cue lasts six visible eligible seconds and has at least a four-second gap. Sleeping, care, play, dragging, distress, dialogs and hidden tabs defer or pause cues so unseen time does not consume them.
- Both clicking the bubble and using the existing PET tool run the normal petting action once, hide the bubble and show the existing happy response. No extra reward or penalty is added. Missing a cue has no extra penalty.
- Natural death waits until all three cues have actually appeared and the last cue is resolved or expires. Ordinary scheduling finishes before 80 seconds; exceptionally delayed cues can postpone natural death. Neglect deaths keep their existing rules and take priority.
- Reset requests on growth, restart and direct stage preview initialization. Hide them during death/farewell. Preserve senior hop/rest pacing and no autonomous ball play.
