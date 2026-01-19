import { Grid } from "./Grid";
import { Block, Splash } from "./types";
import { Sound } from "./Sound";

export class Game {
  grid = new Grid();
  activeBlock: Block;
  nextBlock: Block;
  row = 0;
  col: number;
  score = 0;
  level = 1;
  levelUpScore = 500;
  gameOver = false;
  splashes: Splash[] = [];
  comboCount = 1;
  blockBag: Block[] = [];

  // Animation State
  shakeDuration = 0;
  shakeIntensity = 0;

  constructor() {
    this.col = Math.floor(this.grid.cols / 2);
    this.fillGridWithNumbers();
    this.refillBlockBag();
    this.activeBlock = this.randomBlock();
    this.nextBlock = this.randomBlock();
  }

  fillGridWithNumbers() {
    const middle = Math.floor(this.grid.cols / 2);
    const fillRows = Math.floor(this.grid.rows / 2);
    for (let r = this.grid.rows - fillRows; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        if (r < this.grid.rows - fillRows + 2 && c >= middle - 1 && c <= middle + 1) {
          continue;
        }
        this.grid.cells[r][c].block = this.randomNumberBlock();
      }
    }
  }
  
  refillBlockBag() {
    this.blockBag = [];
    const operators: ('+' | '-' | '*' | '/')[] = ['-'];

    if (this.level < 5) {
        this.blockBag.push({ kind: 'operator', op: '-' });
        this.blockBag.push({ kind: 'operator', op: '-' });
    }

    if (this.level >= 5) {
        operators.push('+');
    }
    if (this.level >= 8) {
        operators.push('/');
    }
    if (this.level >= 10) {
        operators.push('*');
    }

    const numNumbers = Math.max(6, 9 - this.level);
    const numOperatorSets = Math.min(4, Math.floor(this.level / 2) + 2);

    for (let i = 0; i < numOperatorSets; i++) {
        for (const op of operators) {
            this.blockBag.push({ kind: 'operator', op });
        }
    }

    for (let i = 0; i < numNumbers; i++) {
        this.blockBag.push(this.randomNumberBlock());
    }
    
    this.blockBag.push({ kind: "bomb" });

    for (let i = this.blockBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.blockBag[i], this.blockBag[j]] = [this.blockBag[j], this.blockBag[i]];
    }
  }

  getDropInterval() {
    return Math.max(200, 1000 - (this.level - 1) * 75);
  }

  randomNumberBlock(): Block {
    return {
      kind: "number",
      value: Math.ceil(Math.random() * 9),
    };
  }

  randomBlock(): Block {
    if (this.blockBag.length === 0) {
        this.refillBlockBag();
    }
    return this.blockBag.pop() as Block;
  }

  moveLeft() {
    if (this.col > 0 && this.grid.isEmpty(this.row, this.col - 1)) {
      this.col--;
    }
  }

  moveRight() {
    if (
      this.col < this.grid.cols - 1 &&
      this.grid.isEmpty(this.row, this.col + 1)
    ) {
      this.col++;
    }
  }

  drop() {
    if (this.gameOver) return;
    while (this.row + 1 < this.grid.rows && this.grid.isEmpty(this.row + 1, this.col)) {
      this.row++;
    }
    this.update();
  }

  applyGravity() {
    let changed = false;
    for (let c = 0; c < this.grid.cols; c++) {
      let emptyRow = -1;
      for (let r = this.grid.rows - 1; r >= 0; r--) {
        if (!this.grid.cells[r][c].block) {
          if (emptyRow === -1) {
            emptyRow = r;
          }
        } else if (emptyRow !== -1) {
          this.grid.cells[emptyRow][c].block = this.grid.cells[r][c].block;
          this.grid.cells[r][c].block = null;
          emptyRow--;
          changed = true;
        }
      }
    }
    return changed;
  }

  checkWinCondition() {
    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        if (this.grid.cells[r][c].block?.kind === 'number') {
          return;
        }
      }
    }
    this.startNextLevel();
  }

  startNextLevel() {
    this.level++;
    this.score += 1000; // Bonus for clearing the board
    this.levelUpScore *= 2;
    Sound.play("level-up");

    // Reset grid and repopulate
    this.grid = new Grid();
    this.fillGridWithNumbers();
    this.refillBlockBag();

    // Reset active block
    this.activeBlock = this.randomBlock();
    this.nextBlock = this.randomBlock();
    this.row = 0;
    this.col = Math.floor(this.grid.cols / 2);
  }

  resolveGrid() {
    let changed = false;

    const processEquation = () => {
        this.score += 50 * this.comboCount;
        this.comboCount++;
        changed = true;
        if (this.score >= this.levelUpScore) {
          this.level++;
          this.levelUpScore *= 2;
          Sound.play("level-up");
        }
    }

    for (let c = 0; c < this.grid.cols; c++) {
      for (let r = this.grid.rows - 1; r >= 2; r--) {
        const bottom = this.grid.cells[r][c].block;
        const middle = this.grid.cells[r - 1][c].block;
        const top = this.grid.cells[r - 2][c].block;

        if (bottom?.kind === 'number' && middle?.kind === 'operator' && top?.kind === 'number') {
          let result: number | null = null;
          switch (middle.op) {
            case '+': result = top.value + bottom.value; break;
            case '-': result = bottom.value - top.value; break;
            case '*': result = top.value * bottom.value; break;
            case '/': if (top.value !== 0 && bottom.value % top.value === 0) { result = bottom.value / top.value; } break;
          }

          if (result !== null && result >= 0) {
            this.grid.cells[r][c].block = null;
            this.grid.cells[r - 1][c].block = null;
            if (result === 0) {
              this.splashes.push({ x: c, y: r - 2, progress: 0 });
              this.grid.cells[r - 2][c].block = null;
              Sound.play("splash");
            } else {
              this.grid.cells[r - 2][c].block = { kind: 'number', value: result };
            }
            processEquation();
          }
        }
      }
    }

    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c <= this.grid.cols - 3; c++) {
        const left = this.grid.cells[r][c].block;
        const middle = this.grid.cells[r][c + 1].block;
        const right = this.grid.cells[r][c + 2].block;

        if (left?.kind === 'number' && middle?.kind === 'operator' && right?.kind === 'number') {
          let result: number | null = null;
          switch (middle.op) {
            case '+': result = left.value + right.value; break;
            case '-': result = left.value - right.value; break;
            case '*': result = left.value * right.value; break;
            case '/': if (right.value !== 0 && left.value % right.value === 0) { result = left.value / right.value; } break;
          }

          if (result !== null && result >= 0) {
            this.grid.cells[r][c].block = null;
            if (result === 0) {
              this.splashes.push({ x: c + 1, y: r, progress: 0 });
              this.grid.cells[r][c + 1].block = null;
              Sound.play("splash");
            } else {
              this.grid.cells[r][c + 1].block = { kind: 'number', value: result };
            }
            this.grid.cells[r][c + 2].block = null;
            processEquation();
          }
        }
      }
    }

    if (changed) {
        this.checkWinCondition();
    }
    return changed;
  }

  handleBomb(row: number, col: number) {
    let clearedBlocks = 0;
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < this.grid.rows && c >= 0 && c < this.grid.cols) {
          if (this.grid.cells[r][c].block) {
            clearedBlocks++;
            this.grid.cells[r][c].block = null;
            this.splashes.push({ x: c, y: r, progress: 0 });
          }
        }
      }
    }
    this.score += clearedBlocks * 25;
    Sound.play("blast");
    this.shakeDuration = 300;
    this.shakeIntensity = 10;
    this.checkWinCondition();
  }

  updateAnimations(deltaTime: number) {
    this.splashes.forEach(s => s.progress += deltaTime / 500);
    this.splashes = this.splashes.filter(s => s.progress < 1);

    if (this.shakeDuration > 0) {
      this.shakeDuration -= deltaTime;
      if (this.shakeDuration <= 0) {
        this.shakeIntensity = 0;
      }
    }
  }

  update() {
    if (this.gameOver) return;

    if (this.row + 1 >= this.grid.rows || !this.grid.isEmpty(this.row + 1, this.col)) {
      if (this.activeBlock.kind === 'bomb') {
        this.handleBomb(this.row, this.col);
      } else {
        this.grid.place(this.row, this.col, this.activeBlock);
        Sound.play("object");
      }

      this.comboCount = 1;
      let activity = true;
      while(activity) {
        const resolved = this.resolveGrid();
        const gravity = this.applyGravity();
        activity = resolved || gravity;
      }

      this.activeBlock = this.nextBlock;
      this.nextBlock = this.randomBlock();
      this.row = 0;
      this.col = Math.floor(this.grid.cols / 2);

      if (!this.grid.isEmpty(this.row, this.col)) {
        this.gameOver = true;
      }
      return;
    }

    this.row++;
  }
}
