// Orders: what the board asks for, and whether the plate matches it.
import { RECIPES } from "./config.js";
import { pick } from "./random.js";

// Deal a new order. Avoids repeating the same recipe twice in a row.
export function newOrder(rng, lastName) {
  let recipe = pick(rng, RECIPES);
  let guard = 0;
  while (recipe.name === lastName && guard < 8) {
    recipe = pick(rng, RECIPES);
    guard++;
  }
  return { name: recipe.name, needs: recipe.needs.slice(), points: recipe.points };
}

// Count how many of each ingredient id a list holds.
export function counts(list) {
  const c = {};
  for (const id of list) c[id] = (c[id] || 0) + 1;
  return c;
}

// True when the plate holds exactly the order's ingredients (any order).
export function plateMatches(order, plate) {
  if (plate.length !== order.needs.length) return false;
  const a = counts(order.needs);
  const b = counts(plate);
  for (const k of Object.keys(a)) if (a[k] !== b[k]) return false;
  for (const k of Object.keys(b)) if (a[k] !== b[k]) return false;
  return true;
}

// True when every ingredient on the plate is still wanted by the order.
export function plateStillPossible(order, plate) {
  const need = counts(order.needs);
  const have = counts(plate);
  for (const k of Object.keys(have)) {
    if (!need[k] || have[k] > need[k]) return false;
  }
  return true;
}
