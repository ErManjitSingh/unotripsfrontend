/** EaseMyTrip-style sprite — `public/images/menu.png` (10×12 grid, 71×67px cells). */

export const EASE_MENU_SPRITE = "/images/menu.png";

/** Source sprite cell size (px). */
export const EASE_MENU_CELL_W = 71;
export const EASE_MENU_CELL_H = 67;

/** Sprite sheet dimensions (px). */
export const EASE_MENU_SHEET_W = 710;
export const EASE_MENU_SHEET_H = 804;

/** Row index per color variant (0 = gray inactive, 1 = blue active, 2 = orange). */
export const EASE_MENU_ROW = {
  gray: 0,
  blue: 1,
  orange: 2,
} as const;

/** Column index on row 0 — matches menu labels left → right. */
export const EASE_MENU_COL = {
  flights: 0,
  hotels: 1,
  trains: 2,
  bus: 3,
  holidays: 4,
  cabs: 5,
  activities: 6,
  cruise: 7,
} as const;

export type EaseMenuSpriteId = keyof typeof EASE_MENU_COL;

/** Nav ids — `more` uses Lucide three-dots, not the sprite. */
export type EaseMenuIconId = EaseMenuSpriteId | "more";

export function easeMenuSpritePosition(
  iconId: EaseMenuSpriteId,
  active: boolean,
  /** Target icon width in px (height follows 67:71 cell aspect). */
  displayWidth: number,
) {
  const col = EASE_MENU_COL[iconId];
  const row = active ? EASE_MENU_ROW.orange : EASE_MENU_ROW.gray;
  const scale = displayWidth / EASE_MENU_CELL_W;
  const displayHeight = Math.round(EASE_MENU_CELL_H * scale);
  const sheetW = EASE_MENU_SHEET_W * scale;
  const sheetH = EASE_MENU_SHEET_H * scale;
  const posX = col * EASE_MENU_CELL_W * scale;
  const posY = row * EASE_MENU_CELL_H * scale;

  return {
    backgroundImage: `url(${EASE_MENU_SPRITE})`,
    backgroundSize: `${sheetW}px ${sheetH}px`,
    backgroundPosition: `-${posX}px -${posY}px`,
    backgroundRepeat: "no-repeat" as const,
    width: displayWidth,
    height: displayHeight,
  };
}
