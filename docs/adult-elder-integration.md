# Adult and elderly stage integration

The owner approved the current adult/elderly appearance overview and requested both later stages in the playable game on 24 October 2026 (Perth time).

## Behavior

- The sequence is child → teenager → adult → elder. During each of the first three stages, two effective feeds (hunger at or below 95) and two other care actions prepare the next transition. The pet grows after its next sleep and waking, with the existing announcement popup. Counters reset for the new stage, and the name and needs carry over.
- Petting, cleaning and toolbar play count as other care. A completed, rewarded kick after a player uses the floor ball also counts. Autonomous demonstrations and pet-initiated invitations do not contribute to growth.
- The adult uses the owner's original normal/crying images, outlined unimpressed/angry designs and approved open-eye happy face. Feeding, affection and play show happy; mood 30–49 shows angry, mood below 30 shows crying, and energy below 30 shows unimpressed. Sleep uses unimpressed plus the existing Z animation.
- The elder uses the approved kind, tired and happy images. Sleep, low energy and chasing the ball use tired/sigh; reaching and kicking the ball uses happy. Crying retains the elderly tired body and adds the existing falling tears. Smelly-waste crying ends after the smelly piles are cleaned.
- Hunger below 30 still uses the shared flat pose. Existing hunger/mood deaths at eight seconds, flies after six seconds and fatal illness after seven more seconds are preserved. The elder is the final growth stage. Death from natural aging is not introduced.
- Both mature stages retain the existing autonomous approaches, ball invitations, care actions and physical ball kick. Death/restart returns to a new egg and naming sequence.
- The senior now moves at 40% speed with lower hops. Approximately 30% of free autonomous activity is spent resting on the floor, after completing the current hop. Care actions, sleep and an explicit ball pursuit take priority over these rests. Senior pursuit allows 20 seconds (younger stages retain eight seconds), and autonomous approaches allow proportionally more time. The toy's bounce, roll and gentle kick impulse remain unchanged.

## Files

- `stages.js`: load and crop approved artwork in memory, remove only exterior white paper from the elderly sheet, and define stage/preview helpers. Original source PNG files are unchanged.
- `sketch.js`: select expressions, continue growth into elder, carry care/sleep progress, align mature tears, and preserve mature interactions.
- `help.js`: show adult and senior inside the existing last stage card, preserving the guide panel and main interface layout.
- `index.html` and `play.html`: load the shared stage module and refresh script versions.
- `previews/adult/index.html` and `previews/elder/index.html`: start at the selected stage using the actual game scripts. The historical duplicate adult preview sketch is retained but no longer loaded.
- Appearance records, gallery and `AGENTS.md`: record the approved integration and preserve the appearance/growth requirements for future tasks.

## Manual verification

1. Serve the repository root with `python3 -m http.server 8000`. Open `/play.html`: it must begin with the gently rocking C egg. Click it, watch the meteor/birth animation, type a name, and close the guide. The canvas remains 900 × 640.
2. Complete two effective feeds and two care actions; then use SLEEP. Confirm the next stage and popup appear after waking. Repeat through teenager, adult and elder. The elder must not turn into another teenager or adult after further care and sleep.
3. Open `/previews/adult/` or `/previews/elder/` to try the mature stages immediately. Feed and pet them, drag/release the floor ball, observe the gentle contact-timed kick, clean waste and use sleep. The revised adult happy face and elderly eye-corner creases must remain visible.
4. Check low mood, low energy and hunger below 30. Allow waste to smell, then clean it; check that crying ends. Death/restart must return to the egg. The music switch must still toggle without overriding a mute choice.
5. Inspect the browser console for JavaScript errors and the Network panel for missing images or scripts.

## Automated browser validation

Chromium/Playwright checks exercised real egg/naming/music controls, all three care-and-waking transitions, growth-popup pausing, stage expression selection, adult and elder native feed/pet controls, elder sleep/odor/cleaning, all four hungry hitboxes, mature contact-based kicks, neglect deaths and egg restart. Existing teen refusal/evade/kick and toy speed/bounce/reward-cooldown regressions were also checked. A synthetic closed-outline image verified that exterior paper clearing preserves enclosed white and the black contour. Original PNG SHA-256 checks verify source preservation.

Senior movement checks compare actual floor displacement and hop height with the three younger stages, sample stationary time at different frame intervals, and verify that rest never freezes a pet in midair. Native drag/release checks verify sighing during the slower chase and a happy contact-timed kick afterward. Care and sleep remain usable during a scheduled rest, and restarting clears the rest clocks.
