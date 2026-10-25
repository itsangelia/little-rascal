# Interaction sounds

The pet now gives two quiet, wordless responses in addition to the existing
background music. `sound-effects.js` synthesizes the calls with the native Web
Audio API; there are no downloaded recordings, new dependencies or changes to
the approved artwork.

| Event | Response |
| --- | --- |
| Accepted petting, including a senior affection request | A soft, rising then falling contented hum |
| Accepted toolbar play | A shorter, brighter playful call |
| Friendly physical contact kick | The playful call at the actual kick, independently of the care reward cooldown |
| A thrown ball before contact, an angry kick, or a refused interaction | No happy call |

Child, Youth and Senior use the same sound character, with a slightly lower
pitch as they grow. Senior calls are also slightly longer. Calls last about
0.30–0.42 seconds, have a soft attack and release, and never overlap. A 650 ms
cooldown limits repeated calls. No continuous vocal loop is added.

The existing speaker controls both music and interaction sounds and remains on
at the start of a fresh visit. Browser audio restrictions are respected: a real
gesture unlocks the sound context, rejected playback is handled, and missed
calls are never queued for later replay. Muting, opening the guide, a Youth
refusal, death, restart, and hiding the page stop the current call. Muting does
not change care rewards, growth, refusal probabilities or ball physics.

## Checking the change

Serve the game over HTTP. Complete hatching and naming, then use PET and PLAY on
the pet. Throw the floor ball and wait for a real friendly kick. The calls should
follow accepted actions rather than tool selection or ball release. Turn off
the existing speaker; both music and new calls should stop. Turn it back on and
perform a new action; an old call should not replay. Check Youth refusals and
Senior petting as well as the first stage.

Automated browser checks can verify events, audio signal output, muting,
non-overlap and console errors. The final timbre and balance should also be
judged by listening on the player's device.

## Proposed needs visualization

The teacher's suggestion is to let the character communicate needs directly,
in addition to communicating a numeric value through a bar. For example, a
food icon in a thought bubble can accompany the hungry pose; a crescent can
signal tiredness; a heart can request comfort. An empty bar alone requires the
player to interpret the number before deciding what to do.

This sound update does **not** replace the bars or add these generic bubbles.
The recommended next step is to keep the current bars for precision and add
occasional, icon-only thought bubbles matching the approved senior request.
Only one should appear at a time. It should disappear after the need improves,
pause during dialogs and actions, and yield to the existing senior affection
requests. Waste-induced crying should indicate cleaning rather than incorrectly
asking for comfort. Thresholds and scheduling remain a separate design choice.
