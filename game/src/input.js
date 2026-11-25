// Input: turn a pointer click on the canvas into a game action.
import { LAYOUT } from "./config.js";
import { ingredientHit } from "./render.js";

// True when the point (x, y) falls inside the rectangle r.
function hitRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

// Returns one of: {type:"ingredient", id}, {type:"serve"}, {type:"trash"},
// or {type:"anywhere"} when the click lands on nothing interactive.
export function clickAction(x, y) {
  const id = ingredientHit(x, y);
  if (id) return { type: "ingredient", id };
  if (hitRect(x, y, LAYOUT.serve)) return { type: "serve" };
  if (hitRect(x, y, LAYOUT.trash)) return { type: "trash" };
  return { type: "anywhere" };
}
