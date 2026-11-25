// Input: translate a pointer click on the canvas into a game action.
import { LAYOUT } from "./config.js";
import { ingredientHit } from "./render.js";

function inside(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

// Returns one of: {type:"ingredient", id}, {type:"serve"}, {type:"trash"},
// {type:"anywhere"}, or null when the click lands on nothing.
export function clickAction(x, y) {
  const id = ingredientHit(x, y);
  if (id) return { type: "ingredient", id };
  if (inside(x, y, LAYOUT.serve)) return { type: "serve" };
  if (inside(x, y, LAYOUT.trash)) return { type: "trash" };
  return { type: "anywhere" };
}
