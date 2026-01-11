import { CELL_SIZE, COLS, ROWS } from "./constants";

export function getPlayfield(canvas: HTMLCanvasElement) {
  const width = COLS * CELL_SIZE;
  const height = ROWS * CELL_SIZE;

  return {
    x: Math.floor((canvas.width - width) / 2),
    y: Math.floor((canvas.height - height) / 6),
    width,
    height,
  };
}
