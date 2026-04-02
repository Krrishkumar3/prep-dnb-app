import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ examType, onToggle, onBack, title, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isDNB = examType === 'DNB';

  const primaryColor = isDNB ? '#EC4899' : '#3B82F6';
  const bgColor = isDNB ? 'rgba(253,242,248,0.85)' : 'rgba(239,246,255,0.85)';
  const borderColor = isDNB ? 'rgba(244,114,182,0.2)' : 'rgba(96,165,250,0.2)';

  return (
    <header
      className="header-blur fixed top-0 left-0 right-0 z-50"
      style={{
        background: bgColor,
        borderBottom: `1px solid ${borderColor}`,
        transition: 'background 0.4s ease',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: back or logo */}
        <div className="flex items-center gap-3 min-w-0">
          {!isHome && (
            <button
              className="back-btn flex items-center gap-1.5 text-sm font-medium"
              style={{ color: primaryColor }}
              onClick={() => navigate(-1)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          {isHome && (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${isDNB ? '#9333EA' : '#6366F1'})` }}
              >
                Rx
              </div>
              <span className="font-bold text-[15px]" style={{ color: primaryColor }}>PrepDNB</span>
            </div>
          )}
          {!isHome && (
            <div className="min-w-0">
              <h1 className="font-bold text-[15px] text-gray-800 truncate leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Right: toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-semibold transition-opacity ${isDNB ? 'opacity-100' : 'opacity-40'}`}
            style={{ color: '#EC4899' }}>DNB</span>

          <button
            onClick={onToggle}
            className="relative w-12 h-6 rounded-full transition-all duration-300"
            style={{ background: isDNB ? '#EC4899' : '#3B82F6' }}
            aria-label="Toggle exam type"
          >
            <span
              className="toggle-thumb absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
              style={{ transform: isDNB ? 'translateX(1px)' : 'translateX(25px)' }}
            />
          </button>

          <span className={`text-xs font-semibold transition-opacity ${!isDNB ? 'opacity-100' : 'opacity-40'}`}
            style={{ color: '#3B82F6' }}>DipNB</span>
        </div>
      </div>

      {/* Home title bar */}
      {isHome && (
        <div className="max-w-5xl mx-auto px-4 pb-2">
          <p className="text-xs text-gray-500 font-medium">
            {isDNB ? '🩺 Diplomate of National Board' : '📘 Diploma of National Board'}
          </p>
        </div>
      )}
    </header>
  );
}
