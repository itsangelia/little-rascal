// Fit the existing canvas through CSS; never resize its 900 x 640 game coordinates.
(() => {
  const stage = document.querySelector('main');
  if (!stage || !document.fullscreenEnabled || !document.documentElement.requestFullscreen) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'game-fullscreen-button';
  const expandPath = 'M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5';
  const contractPath = 'M3 8h5V3M21 8h-5V3M8 21v-5H3M16 21v-5h5';
  button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const updateButton = () => {
    const expanded = Boolean(document.fullscreenElement);
    button.setAttribute('aria-label', expanded ? 'Exit full screen' : 'Full screen');
    button.setAttribute('aria-pressed', String(expanded));
    button.title = expanded ? 'Exit full screen (Esc)' : 'Full screen';
    button.querySelector('path').setAttribute('d', expanded ? contractPath : expandPath);
  };
  updateButton();
  // A click here must not hatch the egg or activate a tool behind the button.
  for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'keydown', 'keyup']) {
    button.addEventListener(type, event => event.stopPropagation());
  }
  button.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (_) {
      // If an embedded browser denies fullscreen, the window-fitted game stays usable.
      button.title = 'Full screen is unavailable in this browser';
    }
  });
  document.addEventListener('fullscreenchange', updateButton);
  stage.appendChild(button);
})();
