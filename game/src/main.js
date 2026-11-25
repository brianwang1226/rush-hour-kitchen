// Rush Hour Kitchen: state, loop and rules.
import { W, H, GAME_SECONDS, LAYOUT } from "./config.js";
import { mulberry32 } from "./random.js";
import { newOrder, plateMatches, plateStillPossible } from "./orders.js";
import { clickAction } from "./input.js";
import {
  drawBackground, drawBoard, drawTimer, drawScore, drawPlate,
  drawButtons, drawIngredientBar, drawTitle, drawGameOver, drawFlash,
} from "./render.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = W;
canvas.height = H;

// The game can be driven into a fixed state for screenshots:
//   ?shot=title | ?shot=mid | ?shot=serve | ?shot=over
const params = new URLSearchParams(location.search);
const shot = params.get("shot");

const state = {
  screen: "title", // title | play | over
  order: null,
  plate: [],
  score: 0,
  served: 0,
  combo: 0,
  timeLeft: GAME_SECONDS,
  flash: "",
  flashUntil: 0,
  lastOrderName: "",
};

let rng = Math.random;
let lastTick = 0;

function startGame() {
  state.screen = "play";
  state.score = 0;
  state.served = 0;
  state.combo = 0;
  state.timeLeft = GAME_SECONDS;
  state.plate = [];
  state.flash = "";
  state.lastOrderName = "";
  state.order = newOrder(rng, "");
  lastTick = performance.now();
}

function serve() {
  if (!plateMatches(state.order, state.plate)) {
    state.flash = "That plate does not match the order yet.";
    state.flashUntil = performance.now() + 1200;
    state.combo = 0;
    return;
  }
  const bonus = Math.ceil(state.timeLeft / 10);
  state.score += state.order.points + bonus;
  state.served++;
  state.combo++;
  state.flash = "+" + (state.order.points + bonus) + "  " + state.order.name + " served!";
  state.flashUntil = performance.now() + 1200;
  state.plate = [];
  state.lastOrderName = state.order.name;
  state.order = newOrder(rng, state.lastOrderName);
}

function onClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * W;
  const y = ((e.clientY - rect.top) / rect.height) * H;
  if (state.screen === "title" || state.screen === "over") {
    startGame();
    return;
  }
  const action = clickAction(x, y);
  if (action.type === "ingredient") {
    state.plate.push(action.id);
    state.flash = "";
  } else if (action.type === "serve") {
    serve();
  } else if (action.type === "trash") {
    state.plate = [];
    state.combo = 0;
    state.flash = "Plate cleared.";
    state.flashUntil = performance.now() + 900;
  }
}

canvas.addEventListener("pointerdown", onClick);

function draw(now) {
  drawBackground(ctx);
  if (state.screen === "title") {
    drawBoard(ctx, { name: "Classic Burger", needs: ["bun", "patty", "lettuce"] }, 0);
    drawTimer(ctx, GAME_SECONDS);
    drawScore(ctx, 0, 0);
    drawPlate(ctx, ["bun", "patty"]);
    drawButtons(ctx, false);
    drawIngredientBar(ctx);
    drawTitle(ctx);
    return;
  }
  drawBoard(ctx, state.order, state.served);
  drawTimer(ctx, Math.max(0, state.timeLeft));
  drawScore(ctx, state.score, state.combo);
  drawPlate(ctx, state.plate);
  drawButtons(ctx, plateMatches(state.order, state.plate));
  drawIngredientBar(ctx);
  if (now < state.flashUntil) drawFlash(ctx, state.flash);
  if (state.screen === "over") drawGameOver(ctx, state.score, state.served);
}

function tick(now) {
  if (state.screen === "play") {
    const dt = (now - lastTick) / 1000;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = "over";
    }
  }
  lastTick = now;
  draw(now);
  requestAnimationFrame(tick);
}

// Fixed states for screenshots (no timer running).
function applyShot() {
  if (!shot) return;
  rng = mulberry32(20261125);
  state.screen = "play";
  state.timeLeft = 74;
  state.score = 210;
  state.served = 2;
  state.combo = 2;
  if (shot === "title") {
    state.screen = "title";
    return;
  }
  if (shot === "mid") {
    state.order = newOrder(rng, "");
    state.plate = ["bun", "patty"];
    return;
  }
  if (shot === "serve") {
    state.order = { name: "Classic Burger", needs: ["bun", "patty", "lettuce"], points: 100 };
    state.plate = ["bun", "patty", "lettuce"];
    return;
  }
  if (shot === "over") {
    state.screen = "over";
    state.order = { name: "Classic Burger", needs: ["bun", "patty", "lettuce"], points: 100 };
    state.plate = ["bun", "patty"];
    state.score = 480;
    state.served = 4;
    return;
  }
}

applyShot();
requestAnimationFrame(tick);
