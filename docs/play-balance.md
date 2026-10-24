# Child scale and play-energy tuning

The owner requested higher energy consumption after playing and a 15% smaller first-stage model.

| Interaction | Previous energy cost | Current energy cost |
| --- | ---: | ---: |
| Successful, rewarded contact with the floor ball | 2 | 5 |
| Accepted toolbar PLAY action | 26 | 32 |

The existing 1.5-second toy reward cooldown is unchanged. Rapid repeated contacts cannot charge duplicate energy during that cooldown. Refused interactions do not charge energy; accepted costs clamp at zero. Normal stat drain and sleep recovery are unchanged.

`CHILD_MODEL_SCALE` in `stages.js` is 0.85. `sketch.js` applies it to the first-stage normal, happy, crying and shared hungry artwork. `getPetBody()` already shares the render factor, keeping click/ball-contact geometry consistent with the smaller model. The child's shadow and death pose follow the same size reduction. `hatching.js` uses the scale for the newly born world character. Naming/guide portraits, the egg, room, canvas and other stages retain their existing sizes. Source image files are not resized or rewritten.

Verification covers actual draw dimensions and proportions, matching shadows/hitboxes, native feeding and toy contact with the smaller pet, increased play costs, refused-action/cooldown behavior, zero-energy clamping and sleep recovery. The existing native throw/contact/kick regression also checks that the resized model still reaches and gently kicks the ball.
