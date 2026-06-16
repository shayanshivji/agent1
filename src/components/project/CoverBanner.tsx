/** Decorative header strip for the cover page with McKinsey branding. */
export function CoverBanner() {
  return (
    <div className="cover-banner">
      <svg
        className="cover-banner-svg"
        viewBox="0 0 1200 80"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#051c2c" />
            <stop offset="45%" stopColor="#2251ff" />
            <stop offset="100%" stopColor="#4f7cff" />
          </linearGradient>
        </defs>
        <rect width="1200" height="80" fill="url(#coverGrad)" />
        <circle cx="980" cy="20" r="48" fill="rgba(255,255,255,0.08)" />
        <circle cx="1050" cy="60" r="32" fill="rgba(255,255,255,0.06)" />
        <path
          d="M0 48 Q300 20 600 52 T1200 36 L1200 80 L0 80 Z"
          fill="rgba(255,255,255,0.07)"
        />
        <path
          d="M0 62 Q400 78 800 58 T1200 70 L1200 80 L0 80 Z"
          fill="rgba(5,28,44,0.15)"
        />
      </svg>
      <div className="cover-banner-logo" aria-label="McKinsey">
        <svg
          viewBox="0 0 180 32"
          className="cover-banner-logo-svg"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="McKinsey & Company"
        >
          <text
            x="0"
            y="24"
            fill="#ffffff"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="22"
            fontWeight="600"
            letterSpacing="0.5"
          >
            McKinsey
          </text>
        </svg>
      </div>
    </div>
  );
}
