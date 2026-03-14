import { CatPaw } from './components/CatPaw'
import { KEYBOARD } from './lib/generateCatString'
import { useGame } from './hooks/useGame'

export default function App() {
  const {
    gameState,
    targetWord,
    typedChars,
    score,
    combo,
    timeLeft,
    paws,
    startGame,
  } = useGame()

  return (
    <div className="min-h-screen bg-sky-50 text-neutral-800 font-sans flex flex-col items-center justify-center p-4 selection:bg-amber-200">
      {/* カスタムアニメーション */}
      <style>{`
        @keyframes strike {
          0% { transform: scale(1.3) translateY(-20px); opacity: 0; }
          40% { transform: scale(1) translateY(0); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 0; }
        }
        .animate-strike { animation: strike 0.15s ease-out forwards; }
      `}</style>

      {/* ヘッダー */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-6 px-8 py-4 bg-white rounded-2xl shadow-sm border border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🐾</div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-700">
            黒猫バシバシタイピング
          </h1>
        </div>
        <div className="flex gap-8 font-bold">
          <div className="flex flex-col items-end">
            <span className="text-xs text-neutral-400">TIME</span>
            <span
              className={`text-2xl ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-sky-600'}`}
            >
              0:{timeLeft.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-neutral-400">SCORE</span>
            <span className="text-2xl text-amber-500">{score}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-neutral-400">COMBO</span>
            <span className="text-2xl text-emerald-500">{combo}</span>
          </div>
        </div>
      </div>

      {/* メインエリア */}
      <div className="w-full max-w-3xl bg-white rounded-3xl p-8 shadow-xl border border-neutral-100 relative overflow-hidden">
        {/* タイトル画面 */}
        {gameState === 'title' && (
          <div className="text-center py-16">
            <div className="text-7xl mb-6 flex justify-center gap-2">
              <span className="transform -rotate-12 drop-shadow-lg">🐈‍⬛</span>
              <span className="transform rotate-12 mt-4 text-5xl opacity-80">⌨️</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-neutral-800">
              謎の文字列をバシバシ叩け！
            </h2>
            <p className="text-neutral-500 mb-10 max-w-md mx-auto leading-relaxed font-medium">
              猫が歩いたような予測不能な「謎の文字列」が次々と出現。
              <br />
              キーを打つたびに、画面の中から黒猫の手が伸びてきて
              <br />
              一緒に白いキーボードをバシバシ叩いてくれます。
            </p>
            <button
              onClick={startGame}
              className="bg-neutral-800 hover:bg-neutral-900 text-white text-xl px-12 py-4 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-neutral-400/50"
            >
              バシバシ始める
            </button>
          </div>
        )}

        {/* リザルト画面 */}
        {gameState === 'result' && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-3xl font-bold mb-2">おつかれにゃん！</h2>
            <p className="text-neutral-500 mb-8">
              クロさんは満足して膝の上で寝ました。
            </p>
            <div className="text-5xl font-bold text-amber-500 mb-10 drop-shadow-sm">
              Score: {score}
            </div>
            <button
              onClick={startGame}
              className="bg-neutral-800 hover:bg-neutral-900 text-white text-xl px-12 py-4 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-neutral-400/50"
            >
              もう一度叩く
            </button>
          </div>
        )}

        {/* プレイ画面 */}
        {gameState === 'playing' && (
          <div className="flex flex-col items-center">
            {/* お題表示エリア */}
            <div className="w-full bg-neutral-50 rounded-2xl p-6 md:p-8 mb-10 border border-neutral-200 relative shadow-inner min-h-[140px] flex items-center justify-center">
              <div
                className={`font-mono font-bold tracking-widest text-center break-all relative z-10 ${
                  targetWord.length > 20
                    ? 'text-3xl md:text-4xl leading-loose'
                    : 'text-5xl md:text-6xl'
                }`}
              >
                <span className="text-neutral-300">{typedChars}</span>
                <span className="text-amber-500 relative">
                  {targetWord[typedChars.length]}
                  <span className="absolute left-0 right-0 -bottom-2 h-1 bg-amber-500 animate-pulse rounded-full" />
                </span>
                <span className="text-neutral-700">
                  {targetWord.slice(typedChars.length + 1)}
                </span>
              </div>
            </div>

            {/* 仮想キーボード */}
            <div className="w-full max-w-2xl flex flex-col gap-3 p-8 bg-neutral-100/80 rounded-3xl shadow-inner border border-neutral-200 select-none">
              {KEYBOARD.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-2 md:gap-3">
                  {row.map((key) => {
                    const activeStrikes = paws.filter((p) => p.key === key)
                    const isNextKey = targetWord[typedChars.length] === key

                    return (
                      <div
                        key={key}
                        className={`relative flex items-center justify-center w-12 h-14 md:w-16 md:h-16 rounded-xl font-mono text-xl md:text-2xl font-bold uppercase transition-colors ${
                          isNextKey
                            ? 'bg-amber-100 text-amber-700 shadow-[0_4px_15px_rgba(251,191,36,0.3)] border-b-4 border-amber-300 z-10 scale-105'
                            : 'bg-white text-neutral-500 border-b-4 border-neutral-200 shadow-sm'
                        }`}
                      >
                        {key}
                        {activeStrikes.map((strike) => (
                          <div
                            key={strike.id}
                            className="absolute inset-0 z-20 flex items-center justify-center animate-strike"
                          >
                            <CatPaw />
                            <div className="absolute w-full h-full border-4 border-neutral-800 rounded-xl animate-ping opacity-20" />
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
