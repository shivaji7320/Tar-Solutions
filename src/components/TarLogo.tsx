import React from 'react';

interface TarLogoProps {
  variant?: 'full' | 'compact' | 'white' | 'iconOnly';
  className?: string;
  subtextClass?: string;
}

export const TarLogo: React.FC<TarLogoProps> = ({
  variant = 'full',
  className = '',
  subtextClass = ''
}) => {
  if (variant === 'iconOnly') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shield Base */}
          <path
            d="M50 8L88 22V50C88 72 71 89 50 96C29 89 12 72 12 50V22L50 8Z"
            fill="url(#shieldGrad)"
            stroke="#3B82F6"
            strokeWidth="3"
          />
          {/* Wave & Drop Hydro Motif */}
          <path
            d="M50 26C50 26 36 44 36 54C36 62 42.2 68 50 68C57.8 68 64 62 64 54C64 44 50 26 50 26Z"
            fill="url(#dropGrad)"
          />
          <path
            d="M24 64C32 60 40 68 50 64C60 60 68 66 76 63"
            stroke="#60A5FA"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Bold TAR Lettering inside icon */}
          <text
            x="50"
            y="57"
            textAnchor="middle"
            fontFamily="Outfit, sans-serif"
            fontWeight="900"
            fontSize="18"
            fill="#FFFFFF"
            letterSpacing="1"
          >
            TAR
          </text>
          <defs>
            <linearGradient id="shieldGrad" x1="12" y1="8" x2="88" y2="96" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0B1B3D" />
              <stop offset="1" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="dropGrad" x1="36" y1="26" x2="64" y2="68" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#0284C7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  const isWhite = variant === 'white';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Visual Shield Crest */}
      <div className="relative flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-11 h-11 sm:w-13 sm:h-13 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Shield */}
          <path
            d="M50 6L90 21V50C90 73 72 90 50 97C28 90 10 73 10 50V21L50 6Z"
            fill="url(#tarShield)"
            stroke={isWhite ? '#60A5FA' : '#2563EB'}
            strokeWidth="3.5"
          />
          {/* Inner Accent Ring */}
          <path
            d="M50 16L80 27V48C80 66 66 80 50 86C34 80 20 66 20 48V27L50 16Z"
            stroke={isWhite ? '#93C5FD' : '#38BDF8'}
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.6"
          />
          {/* Waterproof Droplet Crest */}
          <path
            d="M50 25C50 25 34 44 34 55C34 64 41 71 50 71C59 71 66 64 66 55C66 44 50 25 50 25Z"
            fill="url(#tarDrop)"
          />
          {/* Structural Brick/Joint Grid Line */}
          <path
            d="M26 62C34 58 42 66 50 62C58 58 66 65 74 61"
            stroke="#E0F2FE"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* T-A-R Core Monogram */}
          <text
            x="50"
            y="57"
            textAnchor="middle"
            fontFamily="Outfit, sans-serif"
            fontWeight="900"
            fontSize="17"
            fill="#FFFFFF"
            letterSpacing="1.2"
          >
            TAR
          </text>
          <defs>
            <linearGradient id="tarShield" x1="10" y1="6" x2="90" y2="97" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0B1B3D" />
              <stop offset="0.5" stopColor="#0F2854" />
              <stop offset="1" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="tarDrop" x1="34" y1="25" x2="66" y2="71" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#0369A1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography Identity */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-serif italic font-bold tracking-tight text-2xl sm:text-3xl leading-none ${isWhite ? 'text-white' : 'text-[#121212]'}`}>
            TAR
          </span>
          <span className="bg-[#121212] text-[#F9F7F2] text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-[0.2em] uppercase border border-[#DCD9D1]/40">
            SOLUTIONS
          </span>
        </div>

        {variant !== 'compact' && (
          <div className="flex flex-col mt-1">
            <span className={`text-[10px] uppercase tracking-[0.2em] font-semibold leading-tight ${isWhite ? 'text-[#DCD9D1]' : 'text-[#3D3B35]'} ${subtextClass}`}>
              Civil &amp; Waterproofing Experts
            </span>
            <span className={`text-[9px] font-medium tracking-wider flex items-center gap-1.5 mt-0.5 ${isWhite ? 'text-[#8C8A82]' : 'text-[#8C8A82]'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#121212] dark:bg-white inline-block"></span>
              HYDERABAD // TELANGANA
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
