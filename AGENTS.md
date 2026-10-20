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
