import { COLS, ROWS } from "./constants";
import { Block } from "./types";

export class Grid {
  cells: Cell[][];

  constructor() {
    this.cells = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({ block: null }))
    );
  }

  isEmpty(row: number, col: number) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
      return false; 
    }
    return this.cells[row][col].block === null;
  }

  place(row: number, col: number, block: Block) {
    this.cells[row][col].block = block;
  }

  clearLines() {
    let clearedRows = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.cells[r].every((cell) => cell.block !== null)) {
        clearedRows++;
        this.cells.splice(r, 1);
        this.cells.unshift(Array.from({ length: COLS }, () => ({ block: null })));
      }
    }
    return clearedRows;
  }
}
