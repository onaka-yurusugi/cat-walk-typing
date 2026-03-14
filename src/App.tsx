import { useEffect } from 'react'
import { CatPaw } from './components/CatPaw'
import { KEYBOARD, type Difficulty } from './lib/generateCatString'
import { getRank } from './lib/ranks'
import { useGame, type GameMode } from './hooks/useGame'
import { useSound } from './hooks/useSound'

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; desc: string; emoji: string }> = {
  kitten: { label: '子猫', desc: '30秒 / やさしめ', emoji: '🐱' },
  adult: { label: '成猫', desc: '60秒 / ふつう', emoji: '🐈‍⬛' },
  boss: { label: 'ボス猫', desc: '90秒 / 鬼むず', emoji: '😼' },
}

const MODE_LABELS: Record<GameMode, { label: string; desc: string; emoji: string }> = {
  normal: { label: 'ノーマル', desc: '制限時間内にスコアを稼げ！', emoji: '🎮' },
  timeattack: { label: 'タイムアタック', desc: '10問を最速で打ち切れ！', emoji: '⏱️' },
  daily: { label: 'デイリー', desc: '今日の問題に挑戦！', emoji: '📅' },
}

// コンボに応じた背景の猫シルエットの数
function getCatSilhouetteCount(combo: number): number {
  if (combo >= 50) return 8
  if (combo >= 30) return 5
  if (combo >= 20) return 3
  if (combo >= 10) return 1
  return 0
}

// コンボに応じたキーボードテーマ
function getKeyboardTheme(combo: number): {
  bg: string
  activeBg: string
  activeText: string
  activeShadow: string
  activeBorder: string
} {
  if (combo >= 50) {
    return {
      bg: 'bg-orange-50/80',
      activeBg: 'bg-red-200',
      activeText: 'text-red-700',
      activeShadow: 'shadow-[0_4px_15px_rgba(239,68,68,0.3)]',
      activeBorder: 'border-red-400',
    }
  }
  if (combo >= 30) {
    return {
      bg: 'bg-purple-50/80',
      activeBg: 'bg-violet-200',
      activeText: 'text-violet-700',
      activeShadow: 'shadow-[0_4px_15px_rgba(139,92,246,0.3)]',
      activeBorder: 'border-violet-400',
    }
  }
  if (combo >= 10) {
    return {
      bg: 'bg-emerald-50/80',
      activeBg: 'bg-emerald-200',
      activeText: 'text-emerald-700',
      activeShadow: 'shadow-[0_4px_15px_rgba(16,185,129,0.3)]',
      activeBorder: 'border-emerald-400',
    }
  }
  return {
    bg: 'bg-neutral-100/80',
    activeBg: 'bg-amber-100',
    activeText: 'text-amber-700',
    activeShadow: 'shadow-[0_4px_15px_rgba(251,191,36,0.3)]',
    activeBorder: 'border-amber-300',
  }
}

// 猫シルエットのポジションリスト
const SILHOUETTE_POSITIONS = [
  'top-4 left-4',
  'top-8 right-8',
  'bottom-12 left-12',
  'bottom-4 right-4',
  'top-1/3 left-8',
  'top-1/4 right-12',
  'bottom-1/3 right-8',
  'bottom-1/4 left-4',
]

export default function App() {
  const game = useGame()
  const { playMeow, playHiss, playPurr } = useSound()

  // サウンドコールバックの接続
  const { setOnCorrect, setOnMiss, setOnPurr } = game
  useEffect(() => {
    setOnCorrect(playMeow)
    setOnMiss(playHiss)
    setOnPurr(playPurr)
  }, [setOnCorrect, setOnMiss, setOnPurr, playMeow, playHiss, playPurr])

  const kbTheme = getKeyboardTheme(game.combo)
  const silhouetteCount = getCatSilhouetteCount(game.combo)
  const rank = game.stats ? getRank(game.score) : null

  return (
    <div
      className={`min-h-screen bg-sky-50 text-neutral-800 font-sans flex flex-col items-center justify-center p-4 selection:bg-amber-200 transition-transform duration-75 ${
        game.shakeScreen ? 'animate-shake' : ''
      }`}
    >
      {/* カスタムアニメーション */}
      <style>{`
        @keyframes strike {
          0% { transform: scale(1.3) translateY(-20px); opacity: 0; }
          40% { transform: scale(1) translateY(0); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 0; }
        }
        .animate-strike { animation: strike 0.15s ease-out forwards; }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-4px) rotate(-0.5deg); }
          30% { transform: translateX(4px) rotate(0.5deg); }
          50% { transform: translateX(-3px); }
          70% { transform: translateX(3px); }
          90% { transform: translateX(-1px); }
        }
        .animate-shake { animation: shake 0.4s ease-out; }

        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-80px) scale(1.3); opacity: 0; }
        }
        .animate-float-up { animation: float-up 1.5s ease-out forwards; }

        @keyframes miss-flash {
          0% { background-color: rgba(239, 68, 68, 0.15); }
          100% { background-color: transparent; }
        }
        .animate-miss-flash { animation: miss-flash 0.2s ease-out; }

        @keyframes purr-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.6); }
        }
        .animate-purr-glow { animation: purr-glow 1s ease-in-out infinite; }

        @keyframes silhouette-drift {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.06; }
          50% { transform: translateY(-8px) rotate(3deg); opacity: 0.1; }
        }
        .animate-silhouette { animation: silhouette-drift 4s ease-in-out infinite; }

        @keyframes new-record {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-new-record { animation: new-record 0.8s ease-in-out infinite; }
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
          {game.gameMode === 'normal' ? (
            <div className="flex flex-col items-end">
              <span className="text-xs text-neutral-400">TIME</span>
              <span
                className={`text-2xl ${timeLeftStyle(game.timeLeft)}`}
              >
                0:{game.timeLeft.toString().padStart(2, '0')}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <span className="text-xs text-neutral-400">
                {game.gameMode === 'daily' ? 'DAILY' : 'TIME'}
              </span>
              <span className="text-2xl text-sky-600">
                {formatElapsed(game.taElapsed)}
              </span>
            </div>
          )}
          <div className="flex flex-col items-end">
            <span className="text-xs text-neutral-400">SCORE</span>
            <span className={`text-2xl text-amber-500 ${game.isPurrTime ? 'animate-purr-glow rounded-lg px-1' : ''}`}>
              {game.score}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-neutral-400">COMBO</span>
            <span className="text-2xl text-emerald-500">{game.combo}</span>
          </div>
          {(game.gameMode === 'timeattack' || game.gameMode === 'daily') && (
            <div className="flex flex-col items-end">
              <span className="text-xs text-neutral-400">PROGRESS</span>
              <span className="text-2xl text-violet-500">
                {game.taWordIndex + (game.screen === 'result' ? 0 : 1)}/{game.taWordCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* メインエリア */}
      <div
        className={`w-full max-w-3xl bg-white rounded-3xl p-8 shadow-xl border border-neutral-100 relative overflow-hidden ${
          game.missFlash ? 'animate-miss-flash' : ''
        }`}
      >
        {/* 背景の猫シルエット */}
        {game.screen === 'playing' &&
          Array.from({ length: silhouetteCount }, (_, i) => (
            <div
              key={i}
              className={`absolute ${SILHOUETTE_POSITIONS[i]} animate-silhouette pointer-events-none select-none`}
              style={{ animationDelay: `${i * 0.5}s`, fontSize: '4rem' }}
            >
              🐈‍⬛
            </div>
          ))}

        {/* フローティングイベントテキスト */}
        {game.events.map((ev) => (
          <div
            key={ev.id}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 z-50 animate-float-up pointer-events-none select-none"
          >
            <span
              className={`text-2xl font-black whitespace-nowrap ${
                ev.type === 'purr-time'
                  ? 'text-amber-500'
                  : ev.type === 'kedama'
                    ? 'text-pink-500'
                    : ev.type === 'sleep-clear'
                      ? 'text-red-500'
                      : 'text-emerald-500'
              }`}
            >
              {ev.message}
            </span>
          </div>
        ))}

        {/* ゴロゴロタイム表示 */}
        {game.isPurrTime && game.screen === 'playing' && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-sm font-bold border border-amber-300 animate-pulse">
            🐾 ゴロゴロタイム！×2 🐾
          </div>
        )}

        {/* タイトル画面 */}
        {game.screen === 'title' && (
          <div className="text-center py-8">
            <div className="text-7xl mb-6 flex justify-center gap-2">
              <span className="transform -rotate-12 drop-shadow-lg">🐈‍⬛</span>
              <span className="transform rotate-12 mt-4 text-5xl opacity-80">⌨️</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-neutral-800">
              謎の文字列をバシバシ叩け！
            </h2>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto leading-relaxed font-medium">
              猫が歩いたような予測不能な「謎の文字列」が次々と出現。
              <br />
              キーを打つたびに、黒猫の手がバシバシ叩いてくれます。
            </p>

            {/* ハイスコア表示 */}
            {game.highScore > 0 && (
              <div className="mb-6 text-neutral-400 font-bold">
                🏆 ベストスコア: <span className="text-amber-500">{game.highScore}</span>
              </div>
            )}

            {/* ゲームモード選択 */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-neutral-400 mb-3 uppercase tracking-widest">
                モード
              </h3>
              <div className="flex justify-center gap-3 flex-wrap">
                {(Object.entries(MODE_LABELS) as [GameMode, typeof MODE_LABELS[GameMode]][]).map(
                  ([mode, info]) => (
                    <button
                      key={mode}
                      onClick={() => game.startGame(mode)}
                      className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border-2 border-neutral-200 hover:border-neutral-400 transition-all hover:scale-105 active:scale-95 min-w-[140px]"
                    >
                      <span className="text-2xl">{info.emoji}</span>
                      <span className="font-bold text-neutral-700">{info.label}</span>
                      <span className="text-xs text-neutral-400">{info.desc}</span>
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* 難易度選択 */}
            <div>
              <h3 className="text-sm font-bold text-neutral-400 mb-3 uppercase tracking-widest">
                難易度
              </h3>
              <div className="flex justify-center gap-3 flex-wrap">
                {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, typeof DIFFICULTY_LABELS[Difficulty]][]).map(
                  ([diff, info]) => (
                    <button
                      key={diff}
                      onClick={() => game.startGame('normal', diff)}
                      className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border-2 border-neutral-200 hover:border-neutral-400 transition-all hover:scale-105 active:scale-95 min-w-[140px]"
                    >
                      <span className="text-2xl">{info.emoji}</span>
                      <span className="font-bold text-neutral-700">{info.label}</span>
                      <span className="text-xs text-neutral-400">{info.desc}</span>
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {/* リザルト画面 */}
        {game.screen === 'result' && (
          <div className="text-center py-8">
            {game.isNewHighScore && (
              <div className="animate-new-record text-lg font-black text-red-500 mb-2">
                🎉 NEW RECORD! 🎉
              </div>
            )}
            <div className="text-6xl mb-4">{rank?.emoji ?? '🏆'}</div>
            <h2 className="text-3xl font-bold mb-1">おつかれにゃん！</h2>
            {rank && (
              <p className="text-lg font-bold text-neutral-600 mb-2">
                称号: {rank.emoji} {rank.title}
              </p>
            )}
            <p className="text-neutral-500 mb-6">
              クロさんは満足して膝の上で寝ました。
            </p>

            <div className="text-5xl font-bold text-amber-500 mb-6 drop-shadow-sm">
              Score: {game.score}
            </div>

            {game.highScore > 0 && (
              <div className="text-sm text-neutral-400 mb-6">
                🏆 ベストスコア: {game.highScore}
              </div>
            )}

            {/* 統計情報 */}
            {game.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-xl mx-auto">
                <StatCard label="最大コンボ" value={String(game.stats.maxCombo)} icon="🔥" />
                <StatCard
                  label="正確率"
                  value={`${(game.stats.accuracy * 100).toFixed(1)}%`}
                  icon="🎯"
                />
                <StatCard
                  label="打鍵速度"
                  value={`${game.stats.keysPerSecond.toFixed(1)}/s`}
                  icon="⚡"
                />
                <StatCard
                  label="ミス数"
                  value={String(game.stats.missCount)}
                  icon="❌"
                />
              </div>
            )}

            {(game.gameMode === 'timeattack' || game.gameMode === 'daily') && (
              <div className="mb-6 text-lg font-bold text-violet-500">
                クリアタイム: {formatElapsed(game.taElapsed)}
              </div>
            )}

            <button
              onClick={() => game.startGame(game.gameMode, game.difficulty)}
              className="bg-neutral-800 hover:bg-neutral-900 text-white text-xl px-12 py-4 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-neutral-400/50 mr-4"
            >
              もう一度叩く
            </button>
            <button
              onClick={() => game.goToTitle()}
              className="bg-white hover:bg-neutral-50 text-neutral-600 text-lg px-8 py-4 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow border border-neutral-200 mt-4 md:mt-0"
            >
              タイトルに戻る
            </button>
          </div>
        )}

        {/* プレイ画面 */}
        {game.screen === 'playing' && (
          <div className="flex flex-col items-center">
            {/* お題表示エリア */}
            <div className="w-full bg-neutral-50 rounded-2xl p-6 md:p-8 mb-10 border border-neutral-200 relative shadow-inner min-h-[140px] flex items-center justify-center">
              <div
                className={`font-mono font-bold tracking-widest text-center break-all relative z-10 ${
                  game.targetWord.length > 20
                    ? 'text-3xl md:text-4xl leading-loose'
                    : 'text-5xl md:text-6xl'
                }`}
              >
                <span className="text-neutral-300">{game.typedChars}</span>
                <span className="text-amber-500 relative">
                  {game.targetWord[game.typedChars.length]}
                  <span className="absolute left-0 right-0 -bottom-2 h-1 bg-amber-500 animate-pulse rounded-full" />
                </span>
                <span className="text-neutral-700">
                  {game.targetWord.slice(game.typedChars.length + 1)}
                </span>
              </div>
            </div>

            {/* 仮想キーボード */}
            <div
              className={`w-full max-w-2xl flex flex-col gap-3 p-8 rounded-3xl shadow-inner border border-neutral-200 select-none transition-colors duration-500 ${kbTheme.bg}`}
            >
              {KEYBOARD.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-2 md:gap-3">
                  {row.map((key) => {
                    const activeStrikes = game.paws.filter((p) => p.key === key)
                    const isNextKey = game.targetWord[game.typedChars.length] === key

                    return (
                      <div
                        key={key}
                        className={`relative flex items-center justify-center w-12 h-14 md:w-16 md:h-16 rounded-xl font-mono text-xl md:text-2xl font-bold uppercase transition-colors ${
                          isNextKey
                            ? `${kbTheme.activeBg} ${kbTheme.activeText} ${kbTheme.activeShadow} border-b-4 ${kbTheme.activeBorder} z-10 scale-105`
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

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-xl font-bold text-neutral-800">{value}</div>
      <div className="text-xs text-neutral-400 font-medium">{label}</div>
    </div>
  )
}

function timeLeftStyle(timeLeft: number): string {
  if (timeLeft <= 10) return 'text-red-500 animate-pulse'
  return 'text-sky-600'
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
