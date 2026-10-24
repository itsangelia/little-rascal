# Youth and elderly stage integration

The second stage is now displayed as Youth (青年); the internal `adult` key, original artwork and legacy preview URL remain for compatibility. See `adult-refusals.md` for the current refusal and repetition rules.

The owner approved the current adult/elderly appearance overview and requested both later stages in the playable game on 24 October 2026 (Perth time).

## Behavior

- The current sequence is child → adult → elder. The owner removed the teenage stage and moved the former third-stage adult to the second stage. During child and adult, two effective feeds (hunger at or below 95) and two other care actions prepare the next transition. The pet grows after its next sleep and waking, with the existing announcement popup. Counters reset, and the name and needs carry over. The previous four-stage game is preserved at `backup-2026-10-24-78cbbb3`.
- Petting, cleaning and toolbar play count as other care. A completed, rewarded kick after a player uses the floor ball also counts. Autonomous demonstrations and pet-initiated invitations do not contribute to growth.
- The adult uses the owner's original normal/crying images, outlined unimpressed/angry designs and approved open-eye happy face. Feeding, affection and play show happy; mood 30–49 shows angry, mood below 30 shows crying, and energy below 30 shows unimpressed. Sleep uses unimpressed plus the existing Z animation.
- The elder uses the approved kind, tired and happy images. Sleep, low energy and chasing the ball use tired/sigh; reaching and kicking the ball uses happy. Crying retains the elderly tired body and adds the existing falling tears. Smelly-waste crying ends after the smelly piles are cleaned.
- Hunger below 30 still uses the shared flat pose. Existing hunger/mood deaths at eight seconds, flies after six seconds and fatal illness after seven more seconds are preserved. The elder is the final growth stage. Death from natural aging is not introduced.
- Both mature stages retain companion approaches, care actions and the physical ball kick. Adults retain autonomous ball invitations; seniors respond only to player-requested ball play and have no initial toy demonstration. Death/restart returns to a new egg and naming sequence.
- Senior autonomous movement uses three deliberate small airborne hops, with about 0.65 seconds of landing/settling between hops and shorter floor travel, followed by a full three-second stop before the next burst. This explicit pacing supersedes the earlier 30% time budget. Keep normal gravity; slow-motion physics and grounded walking were rejected and removed. Care, sleep and player-requested play remain responsive. Player-requested pursuit retains the settling cadence; its deadline extends during these pauses. Senior pursuit allows 20 active seconds (younger stages retain eight), and companion deadlines pause during rest. The toy's bounce, roll and gentle kick impulse remain unchanged.

## Files

- `stages.js`: load and crop approved artwork in memory, remove only exterior white paper from the elderly sheet, and define stage/preview helpers. Original source PNG files are unchanged.
- `sketch.js`: select expressions, carry growth/care/sleep progress, align mature tears, and preserve mature interactions. Teenage image loading, refusal and reaction code have been removed from the active sketch. Mature render width is independent of archived teenage assets.
- `help.js`: show child, adult and senior in the existing three cards, preserving the guide panel and main interface layout.
- `index.html` and `play.html`: load the shared stage module and refresh script versions.
- `previews/adult/index.html` and `previews/elder/index.html`: start at the selected stage using the actual game scripts. The historical duplicate adult preview sketch is retained but no longer loaded.
- Appearance records, gallery and `AGENTS.md`: record the approved integration and preserve the appearance/growth requirements for future tasks.

## Manual verification

1. Serve the repository root with `python3 -m http.server 8000`. Open `/play.html`: it must begin with the gently rocking C egg. Click it, watch the meteor/birth animation, type a name, and close the guide. The canvas remains 900 × 640.
2. Complete two effective feeds and two care actions; then use SLEEP. Confirm waking goes directly from child to adult, with the adult artwork and announcement. Repeat to reach elder. Elder must remain the final stage after more care/sleep; the teenage stage must never appear in the current lifecycle.
3. Open `/previews/adult/` or `/previews/elder/` to try the mature stages immediately. Feed and pet them, drag/release the floor ball, observe the gentle contact-timed kick, clean waste and use sleep. The revised adult happy face and elderly eye-corner creases must remain visible.
4. Check low mood, low energy and hunger below 30. Allow waste to smell, then clean it; check that crying ends. Death/restart must return to the egg. The music switch must still toggle without overriding a mute choice.
5. Inspect the browser console for JavaScript errors and the Network panel for missing images or scripts.

## Automated browser validation

Chromium/Playwright checks cover real egg/naming controls, both care-and-waking transitions, growth-popup pausing, the adult image/announcement after the first transition, terminal elder behavior, retained care/play/neglect/restart systems and absence of teenage image requests. Existing checks also cover size/energy tuning, toy contact/bounce/cooldown and exterior paper clearing that preserves enclosed white and the black contour. Source artwork and the four-stage backup remain intact. The teenage PNGs and historical prototype remain archived for reference.

Senior movement checks verify the full three-second stop after each burst, the deliberate settling intervals inside it, and a longer total movement-burst duration, using consecutive takeoff/landing timestamps in a running browser. Hop airtime retains normal gravity, and needs continue draining during pauses. Checks also cover bed access, care responses, disabled senior initiation paths, retained adult initiation, and retained player-requested play. Native drag/release verifies the slower hop pursuit, sigh face and happy contact-timed kick. Restarting clears the pacing clocks.
