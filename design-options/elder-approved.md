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

The owner requested slower senior movement and 30% stationary time, then rejected slowing the jump physics because it looked like reduced video playback speed. Senior wandering, approaches and bed travel now use short grounded steps with normal-cadence weight transfers. Pursuit stays grounded and uses the same compact stride rhythm. Free activity alternates with floor rests accounting for approximately 30% of autonomous time. Explicit play can use a brief low hop, with normal gravity and no scaled physics timestep. Rest pauses for care, play, sleep and player-started toy pursuit. Younger stages retain their original movement. Seniors retain longer pursuit/approach deadlines so they can reach the target; the physical gentle kick is unchanged.
