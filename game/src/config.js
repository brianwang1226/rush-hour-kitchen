// Rush Hour Kitchen: tuning and data. Every value the game reads lives here.

export const W = 960;
export const H = 640;

export const GAME_SECONDS = 90;

// Ingredients: id, display name, colour used to draw it, short label.
export const INGREDIENTS = [
  { id: "bun", name: "Bun", color: "#e8b04b", dark: "#b97f2a" },
  { id: "patty", name: "Patty", color: "#7a4a21", dark: "#4d2c10" },
  { id: "lettuce", name: "Lettuce", color: "#5fb84a", dark: "#2f7d2a" },
  { id: "tomato", name: "Tomato", color: "#e0483e", dark: "#a02820" },
  { id: "cheese", name: "Cheese", color: "#f7c948", dark: "#c79a1d" },
  { id: "onion", name: "Onion", color: "#efe6f2", dark: "#9a86a8" },
];

export function ingredientById(id) {
  return INGREDIENTS.find((g) => g.id === id);
}

// Recipes: the orders the board can ask for. needs lists ingredient ids.
export const RECIPES = [
  { name: "Classic Burger", needs: ["bun", "patty", "lettuce"], points: 100 },
  { name: "Cheeseburger", needs: ["bun", "patty", "cheese"], points: 110 },
  { name: "Garden Veggie", needs: ["bun", "lettuce", "tomato", "onion"], points: 130 },
  { name: "Double Stack", needs: ["bun", "patty", "patty", "cheese"], points: 150 },
  { name: "Deluxe Burger", needs: ["bun", "patty", "cheese", "lettuce", "tomato"], points: 170 },
  { name: "Cheesy Melt", needs: ["bun", "cheese", "cheese", "patty"], points: 140 },
];

// Layout: where the interactive zones sit (canvas coordinates).
export const LAYOUT = {
  board: { x: 20, y: 14, w: 560, h: 76 },
  timer: { x: 600, y: 14, w: 150, h: 76 },
  score: { x: 770, y: 14, w: 170, h: 76 },
  plate: { cx: 480, cy: 300, rx: 220, ry: 110 },
  serve: { x: 730, y: 250, w: 180, h: 64 },
  trash: { x: 730, y: 330, w: 180, h: 48 },
  ingredients: { y: 470, h: 120, gap: 14, margin: 24 },
};
