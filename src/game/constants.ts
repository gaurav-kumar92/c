export const COLS = 6;
export const ROWS = 10;
export const BORDER_THICKNESS = 4;

export function getCellSize(width: number, height: number) {
    const a = width / (COLS + 2);
    const b = height / (ROWS + 0);
    return Math.min(a, b);
  }