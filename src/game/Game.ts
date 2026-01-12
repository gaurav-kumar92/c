import { Grid } from "./Grid";
import { Block, Splash } from "./types";
import { ROWS, COLS } from "./constants";
import { Sound } from "./Sound";

export class Game {
  grid = new Grid();
  activeBlock: Block;
  nextBlock: Block;
  row = 0;
  col = Math.floor(COLS / 2);
  score = 0;
  level = 1;
  levelUpScore = 500;
  gameOver = false;
  consecutiveOperators = 0;
  consecutiveNumbers = 0;
  splashes: Splash[] = [];
  comboCount = 1;

  // Animation State
  shakeDuration = 0;
  shakeIntensity = 0;

  constructor() {
    this.activeBlock = this.randomNumberBlock();
    this.consecutiveNumbers = 1;
    this.nextBlock = this.randomBlock();
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

  randomOperatorBlock(): Block {
    const rand = Math.random();
    let op: '+' | '-' | '*' | '/';

    if (rand < 0.25) {
      op = '+';
    } else if (rand < 0.5) {
      op = '-';
    } else if (rand < 0.75) {
      op = '*';
    } else {
      op = '/';
    }

    return {
      kind: "operator",
      op: op,
    };
  }

  randomBlock(): Block {
    if (Math.random() < 0.05) {
      return { kind: "bomb" };
    }

    if (this.consecutiveNumbers >= 3) {
      this.consecutiveNumbers = 0;
      this.consecutiveOperators = 1;
      return this.randomOperatorBlock();
    }

    if (this.consecutiveOperators >= 2) {
      this.consecutiveOperators = 0;
      this.consecutiveNumbers = 1;
      return this.randomNumberBlock();
    }

    if (Math.random() > 0.5) {
      this.consecutiveNumbers++;
      this.consecutiveOperators = 0;
      return this.randomNumberBlock();
    } else {
      this.consecutiveOperators++;
      this.consecutiveNumbers = 0;
      return this.randomOperatorBlock();
    }
  }

  moveLeft() {
    if (this.col > 0 && this.grid.isEmpty(this.row, this.col - 1)) {
      this.col--;
    }
  }

  moveRight() {
    if (
      this.col < COLS - 1 &&
      this.grid.isEmpty(this.row, this.col + 1)
    ) {
      this.col++;
    }
  }

  applyGravity() {
    let changed = false;
    for (let c = 0; c < COLS; c++) {
      let emptyRow = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
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

  resolveGrid() {
    let changed = false;

    const processEquation = () => {
        this.score += 50 * this.comboCount;
        this.comboCount++;
        changed = true;
        this.shakeDuration = 150;
        this.shakeIntensity = 5;
        if (this.score >= this.levelUpScore) {
          this.level++;
          this.levelUpScore *= 2;
          Sound.play("level-up");
        }
    }

    // Vertical calculations
    for (let c = 0; c < COLS; c++) {
      for (let r = ROWS - 1; r >= 2; r--) {
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

    // Horizontal calculations
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 3; c++) {
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

    return changed;
  }

  handleBomb(row: number, col: number) {
    let clearedBlocks = 0;
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
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

    if (this.row + 1 >= ROWS || !this.grid.isEmpty(this.row + 1, this.col)) {
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
      this.col = Math.floor(COLS / 2);

      if (!this.grid.isEmpty(this.row, this.col)) {
        this.gameOver = true;
      }
      return;
    }

    this.row++;
  }
}
