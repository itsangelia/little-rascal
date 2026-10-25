// Shared matte paper finishes; rendering helpers never change game state or hitboxes.
const UI_THEME = {
  ink: '#67533d', outline: '#bea77e', paper: '#fff9eb', sage: '#96ad89',
  track: '#e7e5d7', gold: '#d7b363', pink: '#d7979e', muted: '#8c826a',
  tones: { cream: '#fff9eb', leaf: '#e9efdf', rose: '#f5e2df', honey: '#f5e7bd',
    lavender: '#ece6ef', sand: '#eee5d3' }
};

function uiPaperPanel(x, y, w, h, radius = 15, fillColor = UI_THEME.paper) {
  const ctx = drawingContext;
  ctx.save();
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = UI_THEME.outline;
  ctx.lineWidth = 1.1;
  ctx.shadowColor = 'rgba(103,83,61,0.10)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.roundRect(x + 3, y + 3, w - 6, h - 6, Math.max(2, radius - 3));
  ctx.stroke();
  ctx.restore();
}

function uiPaperOval(cx, cy, w, h, { hover = false, active = false, tone = 'cream', pressed = false } = {}) {
  const ctx = drawingContext;
  ctx.save();
  ctx.translate(cx, cy + (pressed ? 0.7 : 0));
  ctx.fillStyle = UI_THEME.tones[tone] || UI_THEME.paper;
  ctx.strokeStyle = active ? '#9b7c43' : hover ? '#9e8b65' : UI_THEME.outline;
  ctx.lineWidth = active ? 1.7 : 1.2;
  ctx.shadowColor = 'rgba(103,83,61,0.12)';
  ctx.shadowBlur = pressed ? 1 : 3;
  ctx.shadowOffsetY = pressed ? 0.5 : 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.stroke();
  ctx.strokeStyle = active ? 'rgba(215,179,99,0.65)' : 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2 - 3, h / 2 - 3, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (hover) {
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fill();
  }
  ctx.restore();
}

function uiPaperCircle(cx, cy, diameter, options = {}) {
  uiPaperOval(cx, cy, diameter, diameter, options);
}
