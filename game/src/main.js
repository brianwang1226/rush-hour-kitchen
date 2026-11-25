// Rush Hour Kitchen: state, loop and rules. The plate must match the order
// exactly to serve; a wrong plate can be trashed and rebuilt from scratch.
// The loop runs on requestAnimationFrame; the timer only ticks while the
// screen is "play", and the fixed ?shot= states freeze it for screenshots.
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

const game = {
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

let randomFn = Math.random;
let prevNow = 0;

function startGame() {
  game.screen = "play";
  game.score = 0;
  game.served = 0;
  game.combo = 0;
  game.timeLeft = GAME_SECONDS;
  game.plate = [];
  game.flash = "";
  game.lastOrderName = "";
  game.order = newOrder(randomFn, "");
  prevNow = performance.now();
}

function serve() {
  if (!plateMatches(game.order, game.plate)) {
    game.flash = "That plate does not match the order yet.";
    game.flashUntil = performance.now() + 1200;
    game.combo = 0;
    return;
  }
  const bonus = Math.ceil(game.timeLeft / 10);
  game.score += game.order.points + bonus;
  game.served++;
  game.combo++;
  game.flash = "+" + (game.order.points + bonus) + "  " + game.order.name + " served!";
  game.flashUntil = performance.now() + 1200;
  game.plate = [];
  game.lastOrderName = game.order.name;
  game.order = newOrder(randomFn, game.lastOrderName);
}

function onClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * W;
  const y = ((e.clientY - rect.top) / rect.height) * H;
  if (game.screen === "title" || game.screen === "over") {
    startGame();
    return;
  }
  const action = clickAction(x, y);
  if (action.type === "ingredient") {
    game.plate.push(action.id);
    game.flash = "";
  } else if (action.type === "serve") {
    serve();
  } else if (action.type === "trash") {
    game.plate = [];
    game.combo = 0;
    game.flash = "Plate cleared.";
    game.flashUntil = performance.now() + 900;
  }
}

canvas.addEventListener("pointerdown", onClick);

function draw(now) {
  drawBackground(ctx);
  if (game.screen === "title") {
    drawBoard(ctx, { name: "Classic Burger", needs: ["bun", "patty", "lettuce"] }, 0);
    drawTimer(ctx, GAME_SECONDS);
    drawScore(ctx, 0, 0);
    drawPlate(ctx, ["bun", "patty"]);
    drawButtons(ctx, false);
    drawIngredientBar(ctx);
    drawTitle(ctx);
    return;
  }
  drawBoard(ctx, game.order, game.served);
  drawTimer(ctx, Math.max(0, game.timeLeft));
  drawScore(ctx, game.score, game.combo);
  drawPlate(ctx, game.plate);
  drawButtons(ctx, plateMatches(game.order, game.plate));
  drawIngredientBar(ctx);
  if (now < game.flashUntil) drawFlash(ctx, game.flash);
  if (game.screen === "over") drawGameOver(ctx, game.score, game.served);
}

function tick(now) {
  if (game.screen === "play") {
    const dt = (now - prevNow) / 1000;
    game.timeLeft -= dt;
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      game.screen = "over";
    }
  }
  prevNow = now;
  draw(now);
  requestAnimationFrame(tick);
}

// Fixed states for screenshots (no timer running).
function applyShot() {
  if (!shot) return;
  randomFn = mulberry32(20261125);
  game.screen = "play";
  game.timeLeft = 74;
  game.score = 210;
  game.served = 2;
  game.combo = 2;
  if (shot === "title") {
    game.screen = "title";
    return;
  }
  if (shot === "mid") {
    game.order = newOrder(randomFn, "");
    game.plate = ["bun", "patty"];
    return;
  }
  if (shot === "serve") {
    game.order = { name: "Classic Burger", needs: ["bun", "patty", "lettuce"], points: 100 };
    game.plate = ["bun", "patty", "lettuce"];
    return;
  }
  if (shot === "over") {
    game.screen = "over";
    game.order = { name: "Classic Burger", needs: ["bun", "patty", "lettuce"], points: 100 };
    game.plate = ["bun", "patty"];
    game.score = 480;
    game.served = 4;
    return;
  }
}

applyShot();
requestAnimationFrame(tick);
