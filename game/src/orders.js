// Orders: what the board asks for, and whether the plate matches it.
import { RECIPES } from "./config.js";
import { pick } from "./random.js";

// Deal a fresh order. The same recipe never follows itself twice in a row.
export function newOrder(rng, lastName) {
  let recipe = pick(rng, RECIPES);
  let tries = 0;
  while (recipe.name === lastName && tries < 8) {
    recipe = pick(rng, RECIPES);
    tries++;
  }
  return { name: recipe.name, needs: recipe.needs.slice(), points: recipe.points };
}

// Tally how many of each ingredient id a list contains.
export function counts(list) {
  const tally = {};
  for (const id of list) tally[id] = (tally[id] || 0) + 1;
  return tally;
}

// True when the plate holds exactly the order's ingredients, in any order.
export function plateMatches(order, plate) {
  if (plate.length !== order.needs.length) return false;
  const want = counts(order.needs);
  const have = counts(plate);
  for (const k of Object.keys(want)) if (want[k] !== have[k]) return false;
  for (const k of Object.keys(have)) if (want[k] !== have[k]) return false;
  return true;
}

// True when nothing on the plate is unwanted, so the order is still reachable.
export function plateStillPossible(order, plate) {
  const want = counts(order.needs);
  const have = counts(plate);
  for (const k of Object.keys(have)) {
    if (!want[k] || have[k] > want[k]) return false;
  }
  return true;
}
