import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ examType, onToggle }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const isHome     = location.pathname === '/';
  const isDNB      = examType === 'DNB';

  const primary    = isDNB ? '#EC4899' : '#3B82F6';
  const bgColor    = isDNB ? 'rgba(253,242,248,0.88)' : 'rgba(239,246,255,0.88)';
  const border     = isDNB ? 'rgba(244,114,182,0.2)'  : 'rgba(96,165,250,0.2)';
  const gradStart  = isDNB ? '#EC4899' : '#3B82F6';
  const gradEnd    = isDNB ? '#9333EA' : '#6366F1';

  return (
    <header
      className="header-blur fixed top-0 left-0 right-0 z-50"
      style={{
        background: bgColor,
        borderBottom: `1px solid ${border}`,
        height: 'var(--header-h)',
        transition: 'background 0.4s ease',
      }}
    >
      <div className="h-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">

        {/* ── Left: logo or back ── */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isHome ? (
            /* Logo */
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-sm shrink-0"
                style={{ background: `linear-gradient(135deg, ${gradStart}, ${gradEnd})` }}
              >
                Rx
              </div>
              <div className="hidden xs:block">
                <p className="font-black text-[15px] leading-none" style={{ color: primary }}>PrepDNB</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {isDNB ? 'Diplomate of National Board' : 'Diploma of National Board'}
                </p>
              </div>
              {/* Mobile: just the brand text */}
              <p className="font-black text-[15px] xs:hidden" style={{ color: primary }}>PrepDNB</p>
            </div>
          ) : (
            /* Back + page title */
            <div className="flex items-center gap-3 min-w-0">
              <button
                className="back-btn flex items-center gap-1 text-sm font-semibold shrink-0 py-1.5 px-2 -ml-2 rounded-xl transition-colors hover:bg-black/5"
                style={{ color: primary }}
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="w-px h-5 bg-gray-200 shrink-0 hidden sm:block" />
              <div className="min-w-0 hidden sm:block">
                <p className="font-bold text-[14px] text-gray-800 truncate leading-tight">
                  {location.state?.title || 'PrepDNB'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: DNB / DipNB toggle ── */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-xs font-bold transition-opacity select-none"
            style={{ color: '#EC4899', opacity: isDNB ? 1 : 0.38 }}
          >
            DNB
          </span>

          <button
            onClick={onToggle}
            role="switch"
            aria-checked={!isDNB}
            aria-label="Toggle exam type"
            className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: isDNB ? '#EC4899' : '#3B82F6',
              focusRingColor: primary,
            }}
          >
            <span
              className="toggle-thumb absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
              style={{ transform: isDNB ? 'translateX(2px)' : 'translateX(26px)' }}
            />
          </button>

          <span
            className="text-xs font-bold transition-opacity select-none"
            style={{ color: '#3B82F6', opacity: !isDNB ? 1 : 0.38 }}
          >
            DipNB
          </span>
        </div>
      </div>
    </header>
  );
}
