// Height is separate from floor position, so bouncing never bypasses room bounds.
const TOY_BOUNCE = {
  gravity: 620,
  restitution: 0.60,
  settleSpeed: 50,
  airDrag: 0.82,
  floorDrag: 0.25,
  wallRestitution: 0.72,
  obstacleRestitution: 0.60
};

function launchToyBounce(ball, strength = Math.hypot(ball.vx, ball.vy)) {
  const speed = Math.max(0, Math.min(Number(strength) || 0, 500));
  // A click gives a small hop; a faster throw gives a higher, longer bounce.
  ball.height = Math.max(0, ball.height || 0);
  ball.verticalSpeed = Math.max(70, Math.min(250, 60 + speed * 3 / 7));
  ball.impact = 0;
}

function advanceToyBallPhysics(ball, elapsedSeconds) {
  if (ball.dragging) return;
  const dt = Math.max(0, Math.min(Number(elapsedSeconds) || 0, 0.05));
  if (dt === 0) return;
  ball.height = Math.max(0, ball.height || 0);
  ball.verticalSpeed = ball.verticalSpeed || 0;
  ball.impact = Math.max(0, ball.impact || 0);
  // Small vertical steps preserve the same bounce at 30 and 60 frames per second.
  const steps = Math.max(1, Math.ceil(dt * 120), Math.ceil(Math.max(Math.abs(ball.vx), Math.abs(ball.vy)) * dt / 8));
  const step = dt / steps;
  for (let i = 0; i < steps; i++) {
    ball.impact *= Math.exp(-13 * step);
    const x = ball.x + ball.vx * step;
    const y = ball.y + ball.vy * step;
    const next = ballPosition(x, y);
    if (next.blocked) {
      // Rebound at the edge of furniture instead of crossing its floor footprint.
      ball.vx *= -TOY_BOUNCE.obstacleRestitution;
      ball.vy *= -TOY_BOUNCE.obstacleRestitution;
      ball.impact = Math.max(ball.impact, 0.25);
    } else {
      if (Math.abs(next.x - x) > 0.001) {
        ball.vx *= -TOY_BOUNCE.wallRestitution;
        ball.impact = Math.max(ball.impact, 0.25);
      }
      if (Math.abs(next.y - y) > 0.001) {
        ball.vy *= -TOY_BOUNCE.wallRestitution;
        ball.impact = Math.max(ball.impact, 0.25);
      }
      ball.angle += (next.x - ball.x) / ball.radius;
      ball.x = next.x;
      ball.y = next.y;
    }

    if (ball.height > 0 || ball.verticalSpeed > 0) {
      ball.height += ball.verticalSpeed * step - TOY_BOUNCE.gravity * step * step / 2;
      ball.verticalSpeed -= TOY_BOUNCE.gravity * step;
      if (ball.height <= 0) {
        const landingSpeed = Math.max(0, -ball.verticalSpeed);
        ball.height = 0;
        ball.impact = Math.max(ball.impact, Math.min(1, landingSpeed / 230));
        ball.verticalSpeed = landingSpeed >= TOY_BOUNCE.settleSpeed
          ? landingSpeed * TOY_BOUNCE.restitution : 0;
      }
    }
    const drag = Math.pow(ball.height > 0 || ball.verticalSpeed > 0
      ? TOY_BOUNCE.airDrag : TOY_BOUNCE.floorDrag, step);
    ball.vx *= drag;
    ball.vy *= drag;
  }
  if (Math.abs(ball.vx) < 2) ball.vx = 0;
  if (Math.abs(ball.vy) < 2) ball.vy = 0;
  if (ball.impact < 0.001) ball.impact = 0;
}

function getToyBallVisual(ball) {
  // Lift is in world pixels: multiply it by the existing depth scale when drawing.
  const lift = ball.dragging ? (ball.dragHeight || 16) : Math.max(0, ball.height || 0);
  const impact = ball.dragging ? 0 : Math.max(0, Math.min(1, ball.impact || 0));
  const stretch = ball.dragging ? 0 : Math.min(0.055, Math.abs(ball.verticalSpeed || 0) / 4000);
  return {
    lift,
    scaleX: 1 + impact * 0.18 - stretch,
    scaleY: 1 - impact * 0.20 + stretch,
    shadowScale: Math.max(0.58, 1 - lift / 180),
    shadowAlpha: ball.dragging ? 20 : Math.max(15, 35 - lift * 0.24)
  };
}

// Remove unused transparent margins while keeping the supplied drawing intact.
function trimToyBallArtwork(source) {
  source.loadPixels();
  let left = source.width, top = source.height, right = 0, bottom = 0;
  for (let y = 0; y < source.height; y++) for (let x = 0; x < source.width; x++) {
    if (source.pixels[(y * source.width + x) * 4 + 3] > 20) {
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
  return source.get(left, top, right - left + 1, bottom - top + 1);
}
