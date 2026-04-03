import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ examType, onToggle }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const isHome    = location.pathname === '/';
  const isDNB     = examType === 'DNB';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        height: 'var(--header-h)',
        background: 'linear-gradient(135deg, #6C8EF5 0%, #9B6FD4 55%, #B57FE8 100%)',
        boxShadow: '0 2px 20px rgba(108,142,245,0.35)',
      }}
    >
      <div className="h-full max-w-6xl mx-auto px-4 sm:px-5 flex items-center justify-between gap-3">

        {/* ── Left: logo or back ── */}
        {isHome ? (
          /* Logo */
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)' }}
            >
              <span style={{ fontSize: 18 }}>🎓</span>
            </div>
            <span className="font-black text-white text-lg tracking-tight leading-none">
              Prep DNB
            </span>
          </div>
        ) : (
          /* Back button */
          <button
            className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </div>
            <span className="font-bold text-sm text-white hidden sm:inline">Back</span>
          </button>
        )}

        {/* ── Right: toggle + kebab ── */}
        <div className="flex items-center gap-3">
          {/* DNB / DipNB pill toggle */}
          <button
            onClick={onToggle}
            role="switch"
            aria-checked={!isDNB}
            aria-label="Toggle exam type"
            className="flex items-center gap-0 rounded-full p-0.5 text-[11px] font-bold"
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(6px)',
              border: '1.5px solid rgba(255,255,255,0.3)',
            }}
          >
            <span
              className="px-3 py-1.5 rounded-full transition-all duration-250"
              style={{
                background: isDNB ? 'white' : 'transparent',
                color: isDNB ? '#9B6FD4' : 'rgba(255,255,255,0.75)',
              }}
            >
              DNB
            </span>
            <span
              className="px-3 py-1.5 rounded-full transition-all duration-250"
              style={{
                background: !isDNB ? 'white' : 'transparent',
                color: !isDNB ? '#6C8EF5' : 'rgba(255,255,255,0.75)',
              }}
            >
              DipNB
            </span>
          </button>

          {/* Kebab menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.18)' }}
              aria-label="More options"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="5"  r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-11 rounded-2xl overflow-hidden z-50 min-w-[180px]"
                style={{
                  background: 'white',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
                onBlur={() => setMenuOpen(false)}
              >
                <a
                  href="https://natboard.edu.in/dnb_old_qp"
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>🌐</span> NBEMS Website
                </a>
                <div className="h-px bg-gray-100 mx-3" />
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => { window.location.reload(); setMenuOpen(false); }}
                >
                  <span>🔄</span> Refresh Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
