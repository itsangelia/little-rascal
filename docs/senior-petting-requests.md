# Senior petting requests

The senior stage now makes three hand-and-heart bubble requests for petting during each natural lifespan. Three small thought circles lead to a wide white comic oval with a soft bottom tip and dark outline, following the owner's bubble reference. It contains a small hand and heart without text. It follows the pet's head, stays inside the canvas and can be clicked directly; the existing PET tool also fulfills it. Both paths use the normal `performPet()` effect once (+15 mood, clamped at 100, happy senior expression and hearts). No bonus reward, mood loss for ignoring it, or new character artwork is added.

`elder-care.js` randomly schedules one request in each part of the existing 80-second active life: 4.8–9.6 seconds, 30.4–38.4 seconds, and 56–64 seconds. Each remains for six visible eligible seconds, with at least four seconds between requests. The pet can keep its existing small hop/rest movement while requesting affection.

Requests wait or pause while asleep, walking to bed, eating, being petted, playing, creating waste, chasing a toy, dragging the toy, crying, hungry-flat, or behind a dialog. Hidden tabs do not advance them. Counts increase only when an eligible bubble begins appearing. A request is not consumed while hidden by another activity.

Natural death waits for all three visible opportunities and for the final request to be petted or time out. In ordinary care they finish before the existing 80-second age deadline. If activities defer the bubbles, natural death can occur later so the three requests are not skipped. Existing starvation/sadness/illness timers still take priority; early neglect death does not wait for requests.

Growth, restart and direct preview initialization reset the schedule. Death hides any outstanding bubble. Other life stages have no such requests. Existing 900 × 640 layout, artwork, movement pacing, toy behavior, music, farewell, letter and rebirth remain unchanged.

## Manual review

Open `previews/elder/` and wait about 5–10 active seconds for the first cue. Click it or select PET then click the senior: the cue should disappear and the senior should look happy. Keep feeding and cleaning through the remaining life to see three requests at varied times, then the existing natural farewell. Let a request expire to confirm there is no extra punishment. Try sleep or help during a cue: it should return with time left. Restart and younger previews should not inherit it.
