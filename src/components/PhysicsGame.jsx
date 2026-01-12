import React, { useState, useEffect, useRef } from 'react';

const PhysicsGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [nextValue, setNextValue] = useState(2);
  
  const gameRef = useRef({
    blocks: [],
    container: { x: 50, y: 50, width: 300, height: 500 },
    gravity: 0.5,
    friction: 0.98,
    restitution: 0.3,
    animationId: null
  });

  const getBlockSize = (value) => {
    // Size increases logarithmically with value
    const baseSize = 20;
    const scale = Math.log2(value) * 3;
    return Math.min(baseSize + scale, 80);
  };

  const getBlockColor = (value) => {
    const colors = {
      2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
      32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
      512: '#edc850', 1024: '#edc53f', 2048: '#edc22e', 4096: '#3c3a32'
    };
    return colors[value] || '#3c3a32';
  };

  const createBlock = (x, y, value) => ({
    x, y,
    vx: 0, vy: 0,
    value,
    size: getBlockSize(value),
    color: getBlockColor(value),
    id: Date.now() + Math.random()
  });

  const checkCollision = (b1, b2) => {
    const dx = b2.x - b1.x;
    const dy = b2.y - b1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDist = (b1.size + b2.size) / 2;
    return distance < minDist;
  };

  const resolveCollision = (b1, b2) => {
    const dx = b2.x - b1.x;
    const dy = b2.y - b1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDist = (b1.size + b2.size) / 2;
    
    if (distance === 0) return;

    const overlap = minDist - distance;
    const nx = dx / distance;
    const ny = dy / distance;

    b1.x -= nx * overlap * 0.5;
    b1.y -= ny * overlap * 0.5;
    b2.x += nx * overlap * 0.5;
    b2.y += ny * overlap * 0.5;

    const dvx = b2.vx - b1.vx;
    const dvy = b2.vy - b1.vy;
    const dotProduct = dvx * nx + dvy * ny;

    if (dotProduct > 0) return;

    const { restitution } = gameRef.current;
    const impulse = (1 + restitution) * dotProduct / 2;

    b1.vx += impulse * nx;
    b1.vy += impulse * ny;
    b2.vx -= impulse * nx;
    b2.vy -= impulse * ny;
  };

  const mergeBlocks = (b1, b2) => {
    if (b1.value !== b2.value) return false;
    
    const newValue = b1.value * 2;
    const newSize = getBlockSize(newValue);
    
    b1.value = newValue;
    b1.size = newSize;
    b1.color = getBlockColor(newValue);
    
    setScore(prev => prev + newValue);
    return true;
  };

  const updatePhysics = () => {
    const { blocks, container, gravity, friction } = gameRef.current;
    
    blocks.forEach(block => {
      block.vy += gravity;
      block.vx *= friction;
      block.vy *= friction;
      
      block.x += block.vx;
      block.y += block.vy;
      
      const radius = block.size / 2;
      
      if (block.y + radius > container.y + container.height) {
        block.y = container.y + container.height - radius;
        block.vy *= -gameRef.current.restitution;
      }
      
      if (block.x - radius < container.x) {
        block.x = container.x + radius;
        block.vx *= -gameRef.current.restitution;
      }
      
      if (block.x + radius > container.x + container.width) {
        block.x = container.x + container.width - radius;
        block.vx *= -gameRef.current.restitution;
      }
    });

    const toRemove = new Set();
    
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        if (toRemove.has(i) || toRemove.has(j)) continue;
        
        if (checkCollision(blocks[i], blocks[j])) {
          if (blocks[i].value === blocks[j].value && 
              Math.abs(blocks[i].vy) < 2 && Math.abs(blocks[j].vy) < 2) {
            if (mergeBlocks(blocks[i], blocks[j])) {
              toRemove.add(j);
            }
          } else {
            resolveCollision(blocks[i], blocks[j]);
          }
        }
      }
    }

    gameRef.current.blocks = blocks.filter((_, i) => !toRemove.has(i));

    if (blocks.length > 0) {
      const highestBlock = Math.min(...blocks.map(b => b.y - b.size / 2));
      if (highestBlock < container.y + 50) {
        setGameOver(true);
      }
    }
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { container, blocks } = gameRef.current;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#bbada0';
    ctx.fillRect(container.x, container.y, container.width, container.height);
    
    ctx.strokeStyle = '#8f7a66';
    ctx.lineWidth = 3;
    ctx.strokeRect(container.x, container.y, container.width, container.height);
    
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(container.x, container.y + 50);
    ctx.lineTo(container.x + container.width, container.y + 50);
    ctx.stroke();
    ctx.setLineDash([]);
    
    blocks.forEach(block => {
      ctx.fillStyle = block.color;
      ctx.beginPath();
      ctx.arc(block.x, block.y, block.size / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#776e65';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = block.value >= 8 ? '#f9f6f2' : '#776e65';
      ctx.font = `bold ${Math.max(12, block.size / 3)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(block.value, block.x, block.y);
    });
  };

  const gameLoop = () => {
    if (!gameOver) {
      updatePhysics();
      render();
      gameRef.current.animationId = requestAnimationFrame(gameLoop);
    }
  };

  const dropBlock = (clientX) => {
    if (gameOver) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    
    const { container } = gameRef.current;
    const clampedX = Math.max(
      container.x + 20,
      Math.min(x, container.x + container.width - 20)
    );
    
    const newBlock = createBlock(clampedX, container.y + 30, nextValue);
    gameRef.current.blocks.push(newBlock);
    
    setNextValue(Math.random() > 0.8 ? 4 : 2);
  };

  const handleClick = (e) => {
    dropBlock(e.clientX);
  };

  const handleTouch = (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      dropBlock(e.touches[0].clientX);
    }
  };

  const resetGame = () => {
    gameRef.current.blocks = [];
    setScore(0);
    setGameOver(false);
    setNextValue(2);
  };

  useEffect(() => {
    gameRef.current.animationId = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameRef.current.animationId) {
        cancelAnimationFrame(gameRef.current.animationId);
      }
    };
  }, [gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
        <div className="flex justify-between items-center mb-4 gap-8">
          <div className="text-center">
            <div className="text-sm text-gray-600 font-semibold">SCORE</div>
            <div className="text-3xl font-bold text-amber-700">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 font-semibold">NEXT</div>
            <div className="text-3xl font-bold text-amber-700">{nextValue}</div>
          </div>
          <button
            onClick={resetGame}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            New Game
          </button>
        </div>
        
        <canvas
          ref={canvasRef}
          width={400}
          height={600}
          onClick={handleClick}
          onTouchStart={handleTouch}
          className="border-4 border-amber-200 rounded-lg cursor-pointer bg-gray-50"
        />
        
        <div className="mt-4 text-center text-gray-700">
          <p className="font-semibold">Click/tap to drop blocks</p>
          <p className="text-sm">Blocks grow as they merge • Red line = danger zone</p>
        </div>
      </div>
      
      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <h2 className="text-4xl font-bold text-red-600 mb-4">Game Over!</h2>
            <p className="text-2xl mb-6">Final Score: {score}</p>
            <button
              onClick={resetGame}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhysicsGame;