interface LevelUpModalProps {
  onContinue: () => void;
  level: number;
}

export function LevelUpModal({ onContinue, level }: LevelUpModalProps) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-slate-800 text-white rounded-2xl p-8 text-center shadow-2xl max-w-md mx-auto">
        <h2 className="text-5xl font-bold text-yellow-400 mb-4">Level Up!</h2>
        <p className="text-2xl mb-6">Congratulations, you've reached level {level}!</p>
        <button
          onClick={onContinue}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
        >
          Watch Ad & Continue
        </button>
      </div>
    </div>
  );
}
