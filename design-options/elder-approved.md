# Approved elderly pet appearance

Approved by the project owner on 24 October 2026 (Perth time).

The approved design is [elder-a-tired-happy.png](elder-a-tired-happy.png).

| Expression | Approved design |
| --- | --- |
| Kind / default | The chosen A appearance and kindly expression. |
| Tired | F's sigh expression adapted to A's body and drawing style, with a small breath puff. |
| Happy | The original baby happy mouth, retaining A's eyes and eye-corner creases. |

Preserve A's body silhouette and proportions, small side bumps, cream fill, thin black outline, pink cheeks, attached head star and small lower-right body star. Keep expression edits consistent with this approved drawing.

Earlier elderly sheets are exploratory references. Use this approved sheet as the visual source for subsequent elderly-stage assets.

The owner subsequently requested integration of both later stages. The elderly stage now follows adult in the existing growth sequence. Like the earlier transitions, it requires two effective feeds plus two other care actions during adulthood, followed by the next sleep and waking. A growth popup announces the senior stage, and the pet's name and needs carry over.

Kind is the default expression; low energy, sleep and ball pursuit use tired/sigh. After reaching the ball, the actual kick uses happy, as do feeding and petting. Sadness and odor distress use the elderly tired artwork with the existing animated tears, so the elderly body and eye-corner creases remain visible. The shared hungry pose still appears below 30 hunger. The existing care, toy, neglect-death and egg-restart systems remain active. No automatic death from old age has been added; the elderly stage is the final growth stage.

`stages.js` crops the three approved illustrations and clears only edge-connected white paper at runtime. The source sheet remains unchanged, and its A/F/HAPPY labels never appear in the game.

The owner requested slower senior movement, rejected both scaled jump physics (slow-motion playback) and grounded walking, and then clarified that each rest must be a full stationary stop of about three seconds. The earlier 30% time budget has been removed. Each autonomous hop now lands, stays at exactly that ground position for three active game seconds, and only then starts another hop. Hop power is 65% of the younger stages', with short distances and normal gravity. Care, play, sleep and player-started toy pursuit can interrupt the rest; these interactions remain responsive. Younger stages retain their original movement.

Seniors no longer initiate ball play: both the early autonomous toy demonstration and mature-stage ball invitations are disabled for this stage. Adult invitations and demonstrations are unchanged. Players can still throw the ball or use PLAY; senior pursuit uses short hops, the sigh face, and the existing happy contact-timed kick. Longer pursuit/approach deadlines remain available so the senior can reach the target.
