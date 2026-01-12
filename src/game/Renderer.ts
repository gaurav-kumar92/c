import { CELL_SIZE, COLS, ROWS, BORDER_THICKNESS } from "./constants";
import { Grid } from "./Grid";
import { Block, Splash } from "./types";
import { getPlayfield } from "./Playfield";

/* -------- Background -------- */

function drawBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#1e293b");
  gradient.addColorStop(1, "#0f172a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.font = "bold 12vw 'Arial', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CALC RUSH", canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

/* -------- Container -------- */

function drawContainer(
  ctx: CanvasRenderingContext2D,
  field: { x: number; y: number; width: number; height: number }
) {
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = BORDER_THICKNESS;
  ctx.strokeRect(field.x, field.y, field.width, field.height);
}

/* -------- Block -------- */

function getBlockColor(block: Block) {
  if (!block) return "#000";
  switch (block.kind) {
    case "number":
      return "#38bdf8";
    case "operator":
      return "#f59e0b";
    case "bomb":
      return "#ef4444";
    default:
      return "#475569";
  }
}

function getBlockText(block: Block) {
  if (!block) return "";
  switch (block.kind) {
    case "number":
      return block.value.toString();
    case "operator":
      return block.op;
    case "bomb":
      return "💣";
    default:
      return "?";
  }
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  x: number,
  y: number
) {
  const cornerRadius = 4;
  ctx.fillStyle = getBlockColor(block);
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.beginPath();
  ctx.moveTo(x + cornerRadius, y);
  ctx.lineTo(x + CELL_SIZE - cornerRadius, y);
  ctx.arcTo(x + CELL_SIZE, y, x + CELL_SIZE, y + cornerRadius, cornerRadius);
  ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE - cornerRadius);
  ctx.arcTo(
    x + CELL_SIZE,
    y + CELL_SIZE,
    x + CELL_SIZE - cornerRadius,
    y + CELL_SIZE,
    cornerRadius
  );
  ctx.lineTo(x + cornerRadius, y + CELL_SIZE);
  ctx.arcTo(x, y + CELL_SIZE, x, y + CELL_SIZE - cornerRadius, cornerRadius);
  ctx.lineTo(x, y + cornerRadius);
  ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = "transparent";

  ctx.fillStyle = "#fff";
  ctx.font = block.kind === 'bomb' ? "bold 24px sans-serif" : "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(getBlockText(block), x + CELL_SIZE / 2, y + CELL_SIZE / 2);
}

/* -------- Splash -------- */

function drawSplash(
  ctx: CanvasRenderingContext2D,
  splash: Splash,
  fieldX: number,
  fieldY: number
) {
  const x = fieldX + splash.x * CELL_SIZE + CELL_SIZE / 2;
  const y = fieldY + splash.y * CELL_SIZE + CELL_SIZE / 2;
  const radius = (CELL_SIZE / 1.5) * splash.progress;
  const opacity = 1 - splash.progress;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.fill();
}


/* -------- UI Text -------- */

function drawUIText(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  score: number,
  nextBlock: Block,
  gameOver: boolean,
  comboCount: number,
  level: number
) {
  ctx.fillStyle = "#fff";
  ctx.font = "24px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 50, 50);
  ctx.fillText(`Level: ${level}`, 50, 80);

  if (comboCount > 1) {
    ctx.font = "bold 36px sans-serif";
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`Combo x${comboCount}!`, 50, 130);
  }

  ctx.textAlign = "right";
  ctx.font = "24px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText("Next", canvas.width - 100, 50);
  if (nextBlock) {
    drawBlock(ctx, nextBlock, canvas.width - 150, 70);
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 72px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  }
}

/* -------- Render (EXPORTED) -------- */

export function render(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  active: Block,
  row: number,
  col: number,
  canvas: HTMLCanvasElement,
  score: number,
  nextBlock: Block,
  gameOver: boolean,
  fallProgress: number,
  splashes: Splash[],
  comboCount: number,
  level: number,
  shakeDuration: number,
  shakeIntensity: number
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  if (shakeDuration > 0) {
    const shakeX = (Math.random() - 0.5) * shakeIntensity;
    const shakeY = (Math.random() - 0.5) * shakeIntensity;
    ctx.translate(shakeX, shakeY);
  }

  drawBackground(ctx, canvas);

  const field = getPlayfield(canvas);

  drawContainer(ctx, field);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = grid.cells[r][c];
      if (cell.block) {
        drawBlock(
          ctx,
          cell.block,
          field.x + c * CELL_SIZE,
          field.y + r * CELL_SIZE
        );
      }
    }
  }

  if (!gameOver && active) {
    const isAtBottom = row + 1 >= ROWS || !grid.isEmpty(row + 1, col);
    const y = isAtBottom
      ? field.y + row * CELL_SIZE
      : field.y + (row + fallProgress) * CELL_SIZE;
    drawBlock(ctx, active, field.x + col * CELL_SIZE, y);
  }
  
  for (const splash of splashes) {
    drawSplash(ctx, splash, field.x, field.y);
  }

  drawUIText(ctx, canvas, score, nextBlock, gameOver, comboCount, level);

  ctx.restore();
}
