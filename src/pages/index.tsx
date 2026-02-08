import { useEffect, useRef, useState } from "react";
import { Game } from "@/game/Game";
import { render } from "@/game/Renderer";
import { Sound } from "@/game/Sound";
import { HowToPlay } from "@/components/HowToPlay";
import { LevelUpModal } from "@/components/LevelUpModal";
import { AdService } from "@/services/AdService";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const howToPlayButton = useRef<{ x: number, y: number, width: number, height: number } | null>(null);

  const [isGameOver, setIsGameOver] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isShowingAd, setIsShowingAd] = useState(false);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const soundInitialized = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastLevel = useRef(1);
  
  const MIN_SWIPE_DISTANCE = 30;
  const TAP_DISTANCE_THRESHOLD = 10;

  useEffect(() => {
    setIsPaused(showHowToPlay || showLevelUp || isShowingAd);
  }, [showHowToPlay, showLevelUp, isShowingAd]);

  const handleRestart = () => {
    setIsShowingAd(true);
    const restartGameLogic = () => {
      setIsShowingAd(false);
      lastLevel.current = 1;
      gameRef.current = new Game();
      setIsGameOver(false);
      setShowHowToPlay(false);
      setShowLevelUp(false);
    };
    AdService.showAd(restartGameLogic);
  };

  const handleContinue = () => {
    setShowLevelUp(false);
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

    if (!gameRef.current) {
      gameRef.current = new Game();
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const handleClick = (e: MouseEvent) => {
      if (isPausedRef.current) return;
      
      const btn = howToPlayButton.current;
      if (!canvas || !btn) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        setShowHowToPlay(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      initSound();
      if (isPausedRef.current) return;
      if (!gameRef.current) return;
      if (gameRef.current.gameOver) {
        if (e.key === "r") handleRestart();
        return;
      }
      if (e.key === "ArrowLeft") gameRef.current.moveLeft();
      if (e.key === "ArrowRight") gameRef.current.moveRight();
      if (e.key === "ArrowDown") gameRef.current.update();
      if (e.key === " ") gameRef.current.drop();
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      initSound();
      if (isPausedRef.current) return;
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (isPausedRef.current || !touchStartX.current || !touchStartY.current || !gameRef.current) {
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

      const isTap = Math.abs(deltaX) < TAP_DISTANCE_THRESHOLD && Math.abs(deltaY) < TAP_DISTANCE_THRESHOLD;

      if (isTap) {
        const btn = howToPlayButton.current;
        if (canvas && btn) {
            const rect = canvas.getBoundingClientRect();
            const x = touchEndX - rect.left;
            const y = touchEndY - rect.top;
            if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
                setShowHowToPlay(true);
            }
        }
      } else {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
            if (deltaX > 0) gameRef.current.moveRight();
            else gameRef.current.moveLeft();
          }
        } else if (deltaY > MIN_SWIPE_DISTANCE) {
          gameRef.current.drop();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    };

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    let lastTime = 0;
    let dropCounter = 0;

    const gameLoop = (time: number) => {
      animationFrameId.current = requestAnimationFrame(gameLoop);

      const game = gameRef.current;
      if (!game || !ctx) return;

      let deltaTime = time - lastTime;
      lastTime = time;
      if (deltaTime > 100) deltaTime = 100;

      if (!isPausedRef.current && !game.gameOver) {
        const dropInterval = game.getDropInterval();
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
          game.update();
          dropCounter = 0;
        }
        game.updateAnimations(deltaTime);
      }
      
      if (game.level > lastLevel.current) {
        setShowLevelUp(true);
        lastLevel.current = game.level;
      }

      setIsGameOver(game.gameOver);

      const fallProgress = isPausedRef.current ? 0 : dropCounter / game.getDropInterval();

      howToPlayButton.current = render(
        ctx, game.grid, game.activeBlock, game.row, game.col, canvas,
        game.score, game.nextBlock, game.gameOver, false, fallProgress,
        game.splashes, game.comboCount, game.level, game.shakeDuration, game.shakeIntensity,
      );
    };

    gameLoop(0);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-slate-900 font-sans">
      {showHowToPlay && <HowToPlay onStart={() => setShowHowToPlay(false)} />}
      {showLevelUp && <LevelUpModal onContinue={handleContinue} level={gameRef.current?.level ?? 0} />}
      <canvas ref={canvasRef} className="block w-full h-full" />

      <div className="absolute bottom-25 inset-x-0 px-10 flex justify-between items-center">
        {isGameOver ? (
          <div className="w-full flex justify-center">
            <button
              onClick={handleRestart}
              className="px-8 py-4 text-xl font-bold text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
            >
              Restart
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                initSound();
                if (!isPausedRef.current) gameRef.current?.moveLeft();
              }}
              className="px-6 py-3 text-xl font-bold text-white bg-slate-700 rounded-lg shadow-lg hover:bg-slate-600 transition-colors active:bg-slate-500"
            >
              &larr;
            </button>
            <button
              onClick={() => {
                initSound();
                if (!isPausedRef.current) gameRef.current?.drop();
              }}
              className="px-6 py-3 text-xl font-bold text-white bg-slate-700 rounded-lg shadow-lg hover:bg-slate-600 transition-colors active:bg-slate-500"
            >
              Drop
            </button>
            <button
              onClick={() => {
                initSound();
                if (!isPausedRef.current) gameRef.current?.moveRight();
              }}
              className="px-6 py-3 text-xl font-bold text-white bg-slate-700 rounded-lg shadow-lg hover:bg-slate-600 transition-colors active:bg-slate-500"
            >
              &rarr;
            </button>
          </>
        )}
      </div>
    </div>
  );
}
