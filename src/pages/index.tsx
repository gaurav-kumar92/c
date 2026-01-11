import { useEffect, useRef, useState } from "react";
import { Game } from "@/game/Game";
import { render } from "@/game/Renderer";
import { Sound } from "@/game/Sound";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const soundInitialized = useRef(false);
  
  // Touch state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const MIN_SWIPE_DISTANCE = 30; // Minimum distance for a swipe to be registered

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current = new Game();
      setIsGameOver(false);
    }
  };

  const initSound = () => {
    if (!soundInitialized.current) {
      Sound.init();
      soundInitialized.current = true;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const game = new Game();
    gameRef.current = game;

    const handleKeyDown = (e: KeyboardEvent) => {
      initSound();
      if (!gameRef.current) return;
      if (gameRef.current.gameOver) {
        if (e.key === "r") handleRestart();
        return;
      }
      if (e.key === "ArrowLeft") gameRef.current.moveLeft();
      if (e.key === "ArrowRight") gameRef.current.moveRight();
      if (e.key === "ArrowDown") gameRef.current.update(); // Speed up fall
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Prevent the browser from doing its default thing (like scrolling)
      e.preventDefault();
      initSound();
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (!touchStartX.current || !touchStartY.current || !gameRef.current) {
        return;
      }
      
      if (gameRef.current.gameOver) {
          handleRestart();
          return;
      }

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;

      touchStartX.current = null;
      touchStartY.current = null;
      
      // Check for horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
          if (deltaX > 0) {
            gameRef.current.moveRight();
          } else {
            gameRef.current.moveLeft();
          }
        }
      } 
      // Check for vertical swipe (downwards)
      else if (deltaY > MIN_SWIPE_DISTANCE) {
         gameRef.current.update(); // Speed up fall
      }
    };
    

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });


    let lastTime = 0;
    let dropCounter = 0;

    const gameLoop = (time: number) => {
      if (!gameRef.current) return;

      let deltaTime = time - lastTime;
      lastTime = time;

      // Cap deltaTime to prevent large jumps
      if (deltaTime > 100) {
        deltaTime = 100;
      }

      const dropInterval = gameRef.current.getDropInterval();
      dropCounter += deltaTime;

      let fallProgress = dropCounter / dropInterval;

      if (dropCounter > dropInterval) {
        if (!gameRef.current.gameOver) {
          gameRef.current.update();
        }
        dropCounter = 0;
        fallProgress = 0;
      }

      gameRef.current.updateAnimations(deltaTime);

      setIsGameOver(gameRef.current.gameOver);
      render(
        ctx,
        gameRef.current.grid,
        gameRef.current.activeBlock,
        gameRef.current.row,
        gameRef.current.col,
        canvas,
        gameRef.current.score,
        gameRef.current.nextBlock,
        gameRef.current.gameOver,
        fallProgress,
        gameRef.current.splashes,
        gameRef.current.comboCount,
        gameRef.current.level
      );

      requestAnimationFrame(gameLoop);
    };

    gameLoop(0);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-slate-900">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4">
        {isGameOver ? (
          <button
            onClick={handleRestart}
            className="px-8 py-4 text-2xl font-bold text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
          >
            Restart
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                initSound();
                gameRef.current?.moveLeft();
              }}
              className="px-8 py-4 text-2xl font-bold text-white bg-slate-700 rounded-lg shadow-lg hover:bg-slate-600 transition-colors"
            >
              &larr;
            </button>
            <button
              onClick={() => {
                initSound();
                gameRef.current?.moveRight();
              }}
              className="px-8 py-4 text-2xl font-bold text-white bg-slate-700 rounded-lg shadow-lg hover:bg-slate-600 transition-colors"
            >
              &rarr;
            </button>
          </>
        )}
      </div>
    </div>
  );
}
