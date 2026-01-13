import { COLS, ROWS } from "./constants";
import { Cell, Block } from "./types";

export class Grid {
  cells: Cell[][];
  rows: number;
  cols: number;

  constructor() {
    this.rows = ROWS;
    this.cols = COLS;
    this.cells = Array.from({ length: this.rows }, (): Cell[] =>
      Array.from({ length: this.cols }, (): Cell => ({ block: null }))
    );
  }

  isEmpty(row: number, col: number): boolean {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return false; 
    }
    return this.cells[row][col].block === null;
  }

  place(row: number, col: number, block: Block) {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      this.cells[row][col].block = block;
    }
  }

  clearLines(): number {
    let clearedRows = 0;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.cells[r].every((cell: Cell) => cell.block !== null)) {
        clearedRows++;
        this.cells.splice(r, 1);
        this.cells.unshift(Array.from({ length: this.cols }, (): Cell => ({ block: null })));
      }
    }
    return clearedRows;
  }
}
