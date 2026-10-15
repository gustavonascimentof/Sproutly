/** Companion provisório: vaso com folhas e carinha, desenhado em SVG. */
export function Mascote({ sede = false }: { sede?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="Companion Basil Buddy" className="mascote">
      <path d="M60 62C58 44 44 36 34 38c0 14 10 24 26 24Z" fill="#5BBF3A" />
      <path d="M60 62c2-20 16-30 28-26 0 16-12 26-28 26Z" fill="#7BD35A" />
      <path d="M34 66h52l-6 40a8 8 0 0 1-8 7H48a8 8 0 0 1-8-7Z" fill="#F4C7A8" />
      <rect x="30" y="60" width="60" height="12" rx="6" fill="#E9AE86" />
      <circle cx="50" cy="86" r="4" fill="#3B2A20" /><circle cx="70" cy="86" r="4" fill="#3B2A20" />
      {sede ? <path d="M54 98q6-5 12 0" stroke="#3B2A20" strokeWidth="3" fill="none" strokeLinecap="round" />
            : <path d="M53 95q7 7 14 0" stroke="#3B2A20" strokeWidth="3" fill="none" strokeLinecap="round" />}
      <circle cx="42" cy="94" r="4" fill="#FF9E9E" opacity=".6" /><circle cx="78" cy="94" r="4" fill="#FF9E9E" opacity=".6" />
    </svg>
  );
}
