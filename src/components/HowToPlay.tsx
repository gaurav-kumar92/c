export function HowToPlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 bg-slate-900 bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-slate-800 text-white p-8 rounded-lg shadow-2xl max-w-lg w-full">
        <h2 className="text-4xl font-bold text-center text-sky-400 mb-6">How to Play Calc Rush</h2>
        <div className="space-y-4 text-slate-300">
          <p>
            <span className="font-bold text-amber-400">Goal:</span> Form equations to score points! Don't let the blocks stack to the top.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Use the <span className="font-bold text-green-400">arrow keys</span> or <span className="font-bold text-green-400">swipe</span> to move the falling block left and right.</li>
            <li>Press the <span className="font-bold text-green-400">down arrow</span> or <span className="font-bold text-green-400">swipe down</span> to drop the block instantly.</li>
            <li>Arrange blocks to form <span className="font-bold text-sky-400">vertical or horizontal</span> equations. For example: <code className="bg-slate-700 px-1 rounded">[ 2 ] [ + ] [ 3 ]</code> or</li>
            <div className="flex flex-col items-center">
                <code className="bg-slate-700 px-1 rounded">[ 3 ]</code>
                <code className="bg-slate-700 px-1 rounded">[ + ]</code>
                <code className="bg-slate-700 px-1 rounded">[ 2 ]</code>
            </div>
            <li>Equations are resolved from top-to-bottom or left-to-right. For subtraction and division, the order matters!</li>
            <li><span className="font-bold text-red-500">Bombs (💣)</span> will clear a 3x3 area around them.</li>
          </ul>
          <p>
            Clear multiple equations in a row to get <span className="font-bold text-amber-400">combo bonuses!</span>
          </p>
        </div>
        <div className="text-center mt-8">
          <button
            onClick={onStart}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 shadow-lg"
          >
            Let's Go!
          </button>
        </div>
      </div>
    </div>
  );
}
