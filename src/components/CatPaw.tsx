export const CatPaw = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-20 h-20 md:w-24 md:h-24 absolute -top-4 -left-4 pointer-events-none drop-shadow-2xl"
    style={{ transform: 'rotate(-15deg)' }}
  >
    <g fill="#171717">
      {/* 腕部分 */}
      <path d="M 30 100 Q 50 60 40 40 L 60 40 Q 70 60 70 100 Z" />
      {/* 肉球メイン */}
      <path d="M 35 45 Q 50 25 65 45 Q 75 60 50 70 Q 25 60 35 45 Z" />
      {/* 指（4つ） */}
      <ellipse cx="30" cy="30" rx="8" ry="12" transform="rotate(-30 30 30)" />
      <ellipse cx="43" cy="18" rx="8" ry="12" transform="rotate(-10 43 18)" />
      <ellipse cx="57" cy="18" rx="8" ry="12" transform="rotate(10 57 18)" />
      <ellipse cx="70" cy="30" rx="8" ry="12" transform="rotate(30 70 30)" />

      {/* ピンクの肉球部分 */}
      <g fill="#fbcfe8" opacity="0.9">
        <ellipse cx="50" cy="50" rx="12" ry="8" />
        <ellipse cx="30" cy="28" rx="3" ry="5" transform="rotate(-30 30 28)" />
        <ellipse cx="43" cy="16" rx="3" ry="5" transform="rotate(-10 43 16)" />
        <ellipse cx="57" cy="16" rx="3" ry="5" transform="rotate(10 57 16)" />
        <ellipse cx="70" cy="28" rx="3" ry="5" transform="rotate(30 70 28)" />
      </g>
    </g>
  </svg>
)
