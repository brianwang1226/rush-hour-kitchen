// Render: everything the player sees, drawn on one canvas. Each function
// paints one part of the kitchen from the current game state.
import { W, H, INGREDIENTS, LAYOUT, ingredientById } from "./config.js";
import { counts } from "./orders.js";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Draw one line of text, centred vertically on (x, y).
function label(ctx, s, x, y, font, color, align) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align || "left";
  ctx.textBaseline = "middle";
  ctx.fillText(s, x, y);
}

export function drawBackground(ctx) {
  // Warm kitchen wall above a wooden counter.
  ctx.fillStyle = "#f6ead6";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#e8d5b5";
  ctx.fillRect(0, 0, W, 104);
  ctx.fillStyle = "#8a5a2b";
  ctx.fillRect(0, 430, W, 14);
  ctx.fillStyle = "#a9743f";
  ctx.fillRect(0, 444, W, H - 444);
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  for (let x = 0; x < W; x += 48) ctx.fillRect(x, 444, 2, H - 444);
}

// One required-ingredient pill on the order board.
function pill(ctx, name, x, y, color, dark) {
  const w = 104;
  roundRect(ctx, x, y, w, 34, 17);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = dark;
  ctx.stroke();
  label(ctx, name, x + w / 2, y + 18, "bold 15px system-ui, sans-serif", "#20242a", "center");
}

export function drawBoard(ctx, order, served) {
  const b = LAYOUT.board;
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fillStyle = "#20242a";
  ctx.fill();
  label(ctx, "ORDER", b.x + 16, b.y + 20, "bold 13px system-ui, sans-serif", "#f7c948");
  label(ctx, order.name, b.x + 16, b.y + 46, "bold 22px system-ui, sans-serif", "#ffffff");
  label(ctx, "served " + served, b.x + b.w - 16, b.y + 20, "13px system-ui, sans-serif", "#b8c0cc", "right");
  // Required ingredients as pills; a count suffix when the order needs two.
  const need = counts(order.needs);
  let x = b.x + 210;
  for (const id of Object.keys(need)) {
    const g = ingredientById(id);
    const suffix = need[id] > 1 ? " x" + need[id] : "";
    pill(ctx, g.name + suffix, x, b.y + 32, g.color, g.dark);
    x += 112;
  }
}

export function drawTimer(ctx, secondsLeft) {
  const t = LAYOUT.timer;
  roundRect(ctx, t.x, t.y, t.w, t.h, 12);
  ctx.fillStyle = secondsLeft <= 10 ? "#a02820" : "#20242a";
  ctx.fill();
  const m = Math.floor(secondsLeft / 60);
  const s = Math.floor(secondsLeft % 60);
  const text = m + ":" + String(s).padStart(2, "0");
  label(ctx, text, t.x + t.w / 2, t.y + 40, "bold 34px system-ui, sans-serif", "#ffffff", "center");
}

export function drawScore(ctx, score, combo) {
  const s = LAYOUT.score;
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fillStyle = "#20242a";
  ctx.fill();
  label(ctx, "SCORE", s.x + 16, s.y + 20, "bold 13px system-ui, sans-serif", "#f7c948");
  label(ctx, String(score), s.x + 16, s.y + 48, "bold 26px system-ui, sans-serif", "#ffffff");
  if (combo > 1) label(ctx, "x" + combo + " combo", s.x + s.w - 14, s.y + 48, "bold 14px system-ui, sans-serif", "#5fb84a", "right");
}

// One ingredient layer stacked on the plate.
function drawLayer(ctx, g, x, y, w, h) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = g.color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = g.dark;
  ctx.stroke();
  label(ctx, g.name, x + w / 2, y + h / 2 + 1, "bold 13px system-ui, sans-serif", "#20242a", "center");
}

export function drawPlate(ctx, plate) {
  const p = LAYOUT.plate;
  // The plate itself: a white ellipse with a gold rim.
  ctx.beginPath();
  ctx.ellipse(p.cx, p.cy, p.rx, p.ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#c8b48f";
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(p.cx, p.cy, p.rx - 26, p.ry - 20, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "#e3d3ae";
  ctx.lineWidth = 2;
  ctx.stroke();
  // The dish, stacked bottom to top with a small overlap.
  const layerH = 34;
  const layerW = 300;
  let y = p.cy + 58 - layerH;
  for (let i = 0; i < plate.length; i++) {
    const g = ingredientById(plate[i]);
    drawLayer(ctx, g, p.cx - layerW / 2, y, layerW, layerH);
    y -= layerH - 8;
  }
  if (plate.length === 0) {
    label(ctx, "tap ingredients below to build the dish", p.cx, p.cy, "16px system-ui, sans-serif", "#9a8a6a", "center");
  }
}

export function drawButtons(ctx, canServe) {
  const s = LAYOUT.serve;
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fillStyle = canServe ? "#2f8f3a" : "#9aa3ad";
  ctx.fill();
  label(ctx, "SERVE", s.x + s.w / 2, s.y + 34, "bold 24px system-ui, sans-serif", "#ffffff", "center");
  const t = LAYOUT.trash;
  roundRect(ctx, t.x, t.y, t.w, t.h, 10);
  ctx.fillStyle = "#6b7280";
  ctx.fill();
  label(ctx, "TRASH PLATE", t.x + t.w / 2, t.y + 25, "bold 15px system-ui, sans-serif", "#ffffff", "center");
}

export function drawIngredientBar(ctx) {
  const bar = LAYOUT.ingredients;
  const n = INGREDIENTS.length;
  const w = (W - bar.margin * 2 - bar.gap * (n - 1)) / n;
  INGREDIENTS.forEach((g, i) => {
    const x = bar.margin + i * (w + bar.gap);
    roundRect(ctx, x, bar.y, w, bar.h, 14);
    ctx.fillStyle = g.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = g.dark;
    ctx.stroke();
    // A simple drawn icon: a pale circle with the first letter.
    ctx.beginPath();
    ctx.arc(x + w / 2, bar.y + 42, 24, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();
    label(ctx, g.name[0], x + w / 2, bar.y + 43, "bold 26px system-ui, sans-serif", g.dark, "center");
    label(ctx, g.name, x + w / 2, bar.y + 92, "bold 17px system-ui, sans-serif", "#20242a", "center");
  });
}

export function ingredientHit(x, y) {
  const bar = LAYOUT.ingredients;
  if (y < bar.y || y > bar.y + bar.h) return null;
  const n = INGREDIENTS.length;
  const w = (W - bar.margin * 2 - bar.gap * (n - 1)) / n;
  for (let i = 0; i < n; i++) {
    const bx = bar.margin + i * (w + bar.gap);
    if (x >= bx && x <= bx + w) return INGREDIENTS[i].id;
  }
  return null;
}

export function drawTitle(ctx) {
  ctx.fillStyle = "rgba(20, 20, 24, 0.72)";
  ctx.fillRect(0, 0, W, H);
  label(ctx, "RUSH HOUR", W / 2, 220, "bold 72px system-ui, sans-serif", "#f7c948", "center");
  label(ctx, "KITCHEN", W / 2, 300, "bold 72px system-ui, sans-serif", "#ffffff", "center");
  label(ctx, "Build each order before the timer runs out.", W / 2, 380, "20px system-ui, sans-serif", "#e8e2d4", "center");
  label(ctx, "Click ingredients to add them, SERVE when the plate matches.", W / 2, 414, "20px system-ui, sans-serif", "#e8e2d4", "center");
  label(ctx, "Click anywhere to start", W / 2, 480, "bold 22px system-ui, sans-serif", "#5fb84a", "center");
}

export function drawGameOver(ctx, score, served) {
  ctx.fillStyle = "rgba(20, 20, 24, 0.72)";
  ctx.fillRect(0, 0, W, H);
  label(ctx, "TIME'S UP", W / 2, 240, "bold 64px system-ui, sans-serif", "#f7c948", "center");
  label(ctx, "You served " + served + " dishes  ·  Score " + score, W / 2, 330, "24px system-ui, sans-serif", "#ffffff", "center");
  label(ctx, "Click anywhere to play again", W / 2, 420, "bold 22px system-ui, sans-serif", "#5fb84a", "center");
}

export function drawFlash(ctx, message) {
  if (!message) return;
  label(ctx, message, W / 2, 150, "bold 30px system-ui, sans-serif", "#2f8f3a", "center");
}
