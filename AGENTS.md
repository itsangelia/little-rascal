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
- The integrated growth sequence is child → teenager → adult → elder. Each transition uses two effective feeds and two other care actions, followed by the next waking. Elder is the final growth stage; do not add automatic old-age death without a separate request.
- Senior autonomous movement is a deliberate burst of three small airborne hops: shorter travel distances and about 0.65 seconds of landing/settling between hops, then a full three-second stationary stop before the next burst. The movement burst itself must be slow too. Do not stop for three seconds after every individual hop. This supersedes the earlier 30% time budget. Keep normal gravity; the owner rejected slow-motion physics and grounded walking. Care and sleep remain responsive; player-requested pursuit keeps the slower hop cadence and sigh face, followed by the contact-timed gentle kick. Seniors never initiate ball play or its early demonstration.

## Approved adult appearance

- Follow the owner's adult reference description in [design-options/adult-approved.md](design-options/adult-approved.md).
- Preserve the round cream body, its visible black outer contour (including both side bumps and the bottom), and flat drawing style, with the large head star and the smaller star beside the right cheek. Both stars retain their warm ochre outlines. Adult artwork has no elderly eye-corner creases.
- The original transparent PNG contains a black body outline that can disappear visually against a black image-viewer background. Inspect it on a light or gray background. Never instruct image generation to remove the black body outline.
- The adult happy face uses open tilted black oval eyes and a tiny omega-shaped upper mouth joined to a narrow vertical pink U-shaped open mouth, following the owner's happy reference. Keep both adult stars. Do not substitute closed smiling eyes.
