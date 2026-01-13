import { getCellSize, COLS, ROWS } from "./constants";

export function getPlayfield(canvas: HTMLCanvasElement) {
  const CELL_SIZE = getCellSize(canvas.width, canvas.height);
  const width = COLS * CELL_SIZE;
  const height = ROWS * CELL_SIZE;

  return {
    x: Math.floor((canvas.width - width) / 2),
    y: Math.floor((canvas.height - height) / 3),
    width,
    height,
  };
}
