import { getRank } from './lib/ranks'
import { TASK_COUNT, GAME_DURATION } from './lib/workTasks'
import { useGame } from './hooks/useGame'
import { useSound } from './hooks/useSound'
import { Cat } from './components/Cat'
import { CatPaw } from './components/CatPaw'

function satisfactionColor(sat: number): string {
  if (sat >= 65) return 'bg-emerald-400'
  if (sat >= 35) return 'bg-amber-400'
  if (sat >= 10) return 'bg-orange-500'
  return 'bg-red-500'
}

function satisfactionBgColor(sat: number): string {
  if (sat >= 65) return 'bg-emerald-100'
  if (sat >= 35) return 'bg-amber-100'
  if (sat >= 10) return 'bg-orange-100'
  return 'bg-red-100'
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function App() {
  const sound = useSound()
  const game = useGame(sound)

  const currentTask = game.tasks[game.currentTaskIndex]
  const rank = game.stats ? getRank(game.stats.score) : null

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col items-center justify-center p-4 selection:bg-amber-200 selection:text-neutral-900">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-4px) rotate(-0.5deg); }
          30% { transform: translateX(4px) rotate(0.5deg); }
          50% { transform: translateX(-3px); }
          70% { transform: translateX(3px); }
          90% { transform: translateX(-1px); }
        }
        .animate-shake { animation: shake 0.4s ease-out; }

        @keyframes miss-flash {
          0% { background-color: rgba(239, 68, 68, 0.15); }
          100% { background-color: transparent; }
        }
        .animate-miss-flash { animation: miss-flash 0.2s ease-out; }

        @keyframes heart-float {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-60px) scale(1.3); opacity: 0; }
        }
        .animate-heart-float { animation: heart-float 1s ease-out forwards; }

        @keyframes sway {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(5px) rotate(2deg); }
          75% { transform: translateX(-5px) rotate(-2deg); }
        }
        .animate-sway { animation: sway 2s ease-in-out infinite; }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow { animation: bounce-slow 1s ease-in-out infinite; }

        @keyframes pop {
          0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
          70% { transform: translateX(-50%) scale(1.1); opacity: 1; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        .animate-pop { animation: pop 0.3s ease-out; }

        @keyframes wag {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(15deg); }
        }
        .animate-wag { animation: wag 0.6s ease-in-out infinite; }

        @keyframes shutdown-flicker {
          0% { opacity: 1; }
          10% { opacity: 0.3; }
          20% { opacity: 0.8; }
          30% { opacity: 0.1; }
          50% { opacity: 0.6; }
          70% { opacity: 0.1; }
          100% { opacity: 0; }
        }
        .animate-shutdown { animation: shutdown-flicker 1.5s ease-out forwards; }

        @keyframes new-record {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-new-record { animation: new-record 0.8s ease-in-out infinite; }

        @keyframes paw-interference {
          0% { transform: translateY(-30px) rotate(-20deg); opacity: 0; }
          30% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          70% { transform: translateY(0) rotate(5deg); opacity: 0.6; }
          100% { transform: translateY(-10px) rotate(-10deg); opacity: 0; }
        }
        .animate-paw-interference { animation: paw-interference 2s ease-in-out infinite; }

        @keyframes slide-in {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.5s ease-out; }
      `}</style>

      {/* ===== TITLE SCREEN ===== */}
      {game.screen === 'title' && (
        <div className="text-center max-w-lg animate-slide-in">
          <div className="text-8xl mb-6 flex justify-center gap-4">
            <span className="transform -rotate-6 drop-shadow-lg">🐈‍⬛</span>
            <span className="transform rotate-6 mt-6 text-6xl opacity-80">💻</span>
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tight">
            ネコハラタイピング
          </h1>
          <p className="text-neutral-400 mb-8 leading-relaxed">
            黒猫のネコハラをかわしつつ仕事を片付けろ！
            <br />
            <span className="text-sm">
              ⌨️ キーボードでタイピング &nbsp;|&nbsp; 🐱 マウスで猫をなでる
            </span>
          </p>

          <div className="bg-neutral-900 rounded-2xl p-6 mb-8 border border-neutral-800 text-left space-y-3 text-sm">
            <h3 className="text-center text-neutral-500 font-bold text-xs uppercase tracking-widest mb-4">
              遊び方
            </h3>
            <div className="flex items-start gap-3">
              <span className="text-lg">⌨️</span>
              <p className="text-neutral-300">表示される仕事のテキストをタイピングして仕事を片付ける</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🐱</span>
              <p className="text-neutral-300">猫がかまってほしそうにしたら、マウスでクリック＆なでなでする</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">💢</span>
              <p className="text-neutral-300">猫を放置しすぎると怒ってノートPCの電源を切られる！</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">⏱️</span>
              <p className="text-neutral-300">{GAME_DURATION}秒以内に{TASK_COUNT}個の仕事を片付けよう</p>
            </div>
          </div>

          {game.highScore > 0 && (
            <div className="mb-6 text-neutral-500 font-bold">
              🏆 ベストスコア: <span className="text-amber-400">{game.highScore}</span>
            </div>
          )}

          <button
            onClick={game.startGame}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-900 text-xl px-16 py-5 rounded-full font-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30"
          >
            仕事を始める
          </button>
        </div>
      )}

      {/* ===== PLAYING SCREEN ===== */}
      {game.screen === 'playing' && (
        <div className="w-full max-w-3xl relative animate-slide-in">
          {/* Status bar */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-6">
              {/* Timer */}
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Time</span>
                <span className={`text-2xl font-black tabular-nums ${game.timeLeft <= 15 ? 'text-red-400 animate-pulse' : 'text-neutral-200'}`}>
                  {formatTime(game.timeLeft)}
                </span>
              </div>

              {/* Task progress */}
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Tasks</span>
                <span className="text-2xl font-black text-sky-400">
                  {game.currentTaskIndex}<span className="text-base text-neutral-600">/{TASK_COUNT}</span>
                </span>
              </div>
            </div>

            {/* Cat satisfaction gauge */}
            <div className="flex items-center gap-3 min-w-[200px]">
              <span className="text-lg">
                {game.catMood === 'happy' ? '😸' : game.catMood === 'wanting' ? '🐱' : game.catMood === 'annoyed' ? '😾' : '🙀'}
              </span>
              <div className="flex-1">
                <div className={`h-4 rounded-full overflow-hidden ${satisfactionBgColor(game.catSatisfaction)} transition-colors`}>
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${satisfactionColor(game.catSatisfaction)}`}
                    style={{ width: `${game.catSatisfaction}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Cat Mood</span>
              </div>
            </div>
          </div>

          {/* Laptop frame */}
          <div className={`relative bg-neutral-900 rounded-2xl border-2 border-neutral-700 overflow-hidden shadow-2xl ${game.missFlash ? 'animate-miss-flash' : ''}`}>
            {/* Screen */}
            <div className="relative min-h-[350px] p-8 flex flex-col">
              {/* Task label */}
              {currentTask && (
                <div className="mb-2">
                  <span className="inline-block bg-sky-500/20 text-sky-300 text-xs font-bold px-3 py-1 rounded-full border border-sky-500/30">
                    📋 {currentTask.label}
                  </span>
                  <span className="text-neutral-600 text-xs ml-3">
                    Task {game.currentTaskIndex + 1} / {TASK_COUNT}
                  </span>
                </div>
              )}

              {/* Typing area */}
              {currentTask && (
                <div className="flex-1 flex items-center justify-center py-8">
                  <div className={`font-mono text-2xl md:text-3xl leading-relaxed tracking-wide break-all max-w-full ${game.catOnKeyboard ? 'blur-[2px]' : ''} transition-all duration-300`}>
                    <span className="text-neutral-500">{game.typedChars}</span>
                    <span className="text-amber-400 relative">
                      {currentTask.text[game.typedChars.length]}
                      <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-amber-400 animate-pulse rounded-full" />
                    </span>
                    <span className="text-neutral-300">
                      {currentTask.text.slice(game.typedChars.length + 1)}
                    </span>
                  </div>
                </div>
              )}

              {/* Cat paw interference overlay */}
              {game.catOnKeyboard && !game.shutdownPhase && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="animate-paw-interference opacity-60">
                    <CatPaw />
                  </div>
                  <div className="absolute inset-0 bg-neutral-900/10" />
                </div>
              )}

              {/* Hint text */}
              {game.catMood === 'wanting' && !game.isPetting && (
                <div className="text-center text-amber-500/60 text-xs animate-pulse">
                  🐱 猫がかまってほしそうにしている...マウスでなでてあげよう！
                </div>
              )}
              {game.catMood === 'annoyed' && !game.isPetting && (
                <div className="text-center text-orange-500/80 text-xs animate-pulse font-bold">
                  😾 猫が怒りかけている！早くなでないと...！
                </div>
              )}
              {game.catMood === 'furious' && !game.isPetting && (
                <div className="text-center text-red-500 text-sm animate-pulse font-black">
                  🙀 猫がキレそう！！今すぐなでて！！！
                </div>
              )}

              {/* Cat component */}
              <Cat
                mood={game.catMood}
                satisfaction={game.catSatisfaction}
                isPetting={game.isPetting}
                speechBubble={game.speechBubble}
                shutdownPhase={game.shutdownPhase}
                onPetStart={game.handlePetStart}
                onPetMove={game.handlePetMove}
                onPetEnd={game.handlePetEnd}
              />

              {/* Shutdown overlay */}
              {game.shutdownPhase && (
                <div className="absolute inset-0 z-30 flex items-center justify-center">
                  <div className="animate-shutdown absolute inset-0 bg-neutral-900" />
                  <div className="relative z-10 text-center" style={{ animationDelay: '0.5s' }}>
                    <div className="text-6xl mb-4">😤</div>
                    <div className="text-3xl font-black text-red-500 animate-pulse">
                      ブチッ！！
                    </div>
                    <p className="text-neutral-400 text-sm mt-2">猫がPCの電源を切りました...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Laptop bottom bar (keyboard area indicator) */}
            <div className="h-8 bg-neutral-800 border-t border-neutral-700 flex items-center justify-center">
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="w-6 h-3 bg-neutral-700 rounded-sm" />
                ))}
              </div>
            </div>
          </div>

          {/* Petting instruction */}
          {game.isPetting && (
            <div className="text-center mt-4 text-amber-400 font-bold animate-pulse">
              🐾 なでなで中...マウスを動かしてもっとなでよう！ 🐾
            </div>
          )}
        </div>
      )}

      {/* ===== RESULT SCREEN ===== */}
      {game.screen === 'result' && game.stats && (
        <div className="text-center max-w-lg animate-slide-in">
          {/* Game over reason header */}
          {game.gameOverReason === 'clear' && (
            <div className="mb-4">
              <div className="text-7xl mb-3">🎉</div>
              <h2 className="text-3xl font-black text-emerald-400">仕事完了！</h2>
              <p className="text-neutral-500 text-sm mt-1">全タスクをクリアしました</p>
            </div>
          )}
          {game.gameOverReason === 'timeout' && (
            <div className="mb-4">
              <div className="text-7xl mb-3">⏰</div>
              <h2 className="text-3xl font-black text-amber-400">タイムアップ！</h2>
              <p className="text-neutral-500 text-sm mt-1">締め切りに間に合わなかった...</p>
            </div>
          )}
          {game.gameOverReason === 'cat-shutdown' && (
            <div className="mb-4">
              <div className="text-7xl mb-3">😤</div>
              <h2 className="text-3xl font-black text-red-400">ネコハラ失敗！</h2>
              <p className="text-neutral-500 text-sm mt-1">猫がPCの電源を切りました...</p>
            </div>
          )}

          {game.isNewRecord && (
            <div className="animate-new-record text-lg font-black text-yellow-400 mb-4">
              🏆 NEW RECORD! 🏆
            </div>
          )}

          {/* Rank */}
          {rank && (
            <div className="mb-4">
              <div className="text-5xl mb-1">{rank.emoji}</div>
              <p className="text-lg font-bold text-neutral-400">{rank.title}</p>
            </div>
          )}

          {/* Score */}
          <div className="text-6xl font-black text-amber-400 mb-6 drop-shadow-lg tabular-nums">
            {game.stats.score}
          </div>

          {game.highScore > 0 && (
            <div className="text-sm text-neutral-500 mb-6">
              🏆 ベストスコア: <span className="text-amber-400">{game.highScore}</span>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard
              icon="📋"
              label="タスク完了"
              value={`${game.stats.tasksCompleted}/${game.stats.totalTasks}`}
            />
            <StatCard
              icon="🎯"
              label="正確率"
              value={
                game.stats.correctChars + game.stats.missCount > 0
                  ? `${((game.stats.correctChars / (game.stats.correctChars + game.stats.missCount)) * 100).toFixed(1)}%`
                  : '-'
              }
            />
            <StatCard
              icon="😸"
              label="猫満足度(平均)"
              value={`${Math.round(game.stats.avgSatisfaction)}%`}
            />
            <StatCard
              icon="❌"
              label="ミス"
              value={String(game.stats.missCount)}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={game.startGame}
              className="bg-amber-500 hover:bg-amber-400 text-neutral-900 text-lg px-10 py-4 rounded-full font-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30"
            >
              もう一度挑戦
            </button>
            <button
              onClick={game.goToTitle}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-lg px-8 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95 border border-neutral-700"
            >
              タイトルに戻る
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-xl font-black text-neutral-100">{value}</div>
      <div className="text-xs text-neutral-500 font-medium">{label}</div>
    </div>
  )
}
