# Approved interaction sounds

The official game now plays four owner-selected excerpts from the uploaded
`提取的音频.m4a`. `sound-effects.js` uses reusable native HTML audio players and preloads
small WAV files from `assets/sounds/`. These files are byte-for-byte copies of
the approved audition clips. All life stages retain the recording's original
pitch and speed, with no synthetic voice fallback or pitch shifting.

| Owner's clip | Event | Trigger |
| --- | --- | --- |
| C | Accepted petting | Once when normal petting or a senior affection request is accepted |
| B | Anger | Once per angry refusal, or once on entering the visible Youth angry face |
| D | Playing with the floor ball | Once at a successful friendly contact kick, independently of the care reward cooldown |
| L | Spontaneous humming | Occasionally after 10–18 visible, eligible idle seconds, at a quieter level |

Selecting PLAY or throwing a ball does not play D before contact. An angry
refusal uses B; its refusal kick does not receive a friendly D response. Bored
refusals remain silent. Anger does not loop once per frame while the angry face
stays visible. Audio changes do not alter needs, care rewards, refusal
probabilities, growth, movement or toy physics.

The existing speaker controls **background music only**. Turning it off pauses
`bgm.mp3`; C, B, D and L remain enabled. The pet's media players are prepared by a real gesture independently of the
background music setting. No separate Web Audio context or offline decoder is
required. Rejected playback
and loading failures are handled without queuing missed calls for later replay.

Only one pet call plays at a time. Explicit care and anger take priority over
an idle hum. Idle humming pauses or stops during sleep, care, crying, hunger,
refusals, chasing/dragging a toy, dialogs and death. Hidden tabs do not bank
idle time or calls. Death, restart and growth reset the relevant sound state;
no calls carry into the letter, rebirth or a new egg. Opening the guide stops
current effects. Existing speakers and controls keep their positions.

## Checking the change

Serve the game over HTTP and complete hatching and naming. Accept petting to
hear C. Throw the toy and wait for actual friendly contact to hear D. In Youth,
check an angry refusal for B and a bored refusal for silence. Leave a comfortable
pet idle to hear L occasionally. Turn off the speaker and verify that background
music stops while new pet calls still work. Turning background music back on
must not replay an old call. Check help, sleep, death and hidden tabs for idle
suppression. The canvas remains 900 × 640 internally.

`design-options/voice-review.html` retains all 16 candidate excerpts.
`previews/sounds/` uses the same engine with an explicit audition configuration;
its alternate query selections never override the official game's fixed map.
The audition config is `design-options/recorded-sound-effects.js`; the old second
engine and draw wrapper have been removed to keep idle time advancing once.

Automated browser checks verify native media playback time, event timing, background
music isolation, priority, silence in excluded states, loading retries and
console errors. Native audio is also checked with Web Audio APIs unavailable and
with background music actually playing. Calls use volume 0.9; idle calls use 65%
of that. During a call, background music is lowered to at most 0.135, then its
prior volume returns. This does not change the music toggle or resume paused
music. Silent gesture warmups never become audible calls.

Four additional Q–T excerpts are available at `design-options/cry-review.html`.
They are neutral candidates pending the owner identifying a cry; no unverified
clip is yet assigned to the official crying state. The owner judges timbre and
balance on their playback device.

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
