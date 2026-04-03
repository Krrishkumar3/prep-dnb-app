import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSessions } from '../utils/dataParser';
import { SUBJECTS } from '../data/subjects';
import { SkeletonCard } from './LoadingSpinner';

/* ── Document icon SVG ───────────────────────── */
function DocIcon({ size = 22, color = '#9CA3AF' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

/* ── Pill badge ──────────────────────────────── */
function Pill({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
      padding: '3px 10px', borderRadius: 999,
      background: 'rgba(0,0,0,0.07)', color: '#555',
      border: '1px solid rgba(0,0,0,0.09)',
    }}>
      {children}
    </span>
  );
}

/* ── Session card ────────────────────────────── */
function SessionCard({ label, badge, onClick, bg, iconBg }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: bg,
        borderRadius: 28,
        padding: '20px 18px 18px',
        textAlign: 'left',
        boxShadow: pressed
          ? '0 2px 6px rgba(0,0,0,0.10)'
          : '0 4px 18px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
        border: 'none',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: 140,
      }}
    >
      {/* Document icon in circular white backdrop */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: iconBg || 'rgba(255,255,255,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
      }}>
        <DocIcon size={20} color="#6B7280" />
      </div>

      {/* Title */}
      <p style={{
        fontWeight: 800, fontSize: 15, color: '#1F2937',
        lineHeight: 1.25, flex: 1,
      }}>
        {label}
      </p>

      {/* Badge */}
      <div><Pill>{badge}</Pill></div>
    </button>
  );
}

/* ── Featured card (top row) ─────────────────── */
function FeaturedCard({ title, badge, bg, iconBg, disabled, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => !disabled && setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: bg,
        borderRadius: 28,
        padding: '20px 18px 18px',
        textAlign: 'left',
        boxShadow: pressed
          ? '0 2px 6px rgba(0,0,0,0.09)'
          : '0 4px 18px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: 140,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
      }}>
        <DocIcon size={20} color="#6B7280" />
      </div>
      <p style={{ fontWeight: 800, fontSize: 15, color: '#1F2937', lineHeight: 1.25, flex: 1 }}>
        {title}
      </p>
      <div><Pill>{badge}</Pill></div>
    </button>
  );
}

/* ── Main SessionScreen ──────────────────────── */
export default function SessionScreen({ examType, tree, loading }) {
  const { subjectName } = useParams();
  const navigate        = useNavigate();
  const subject         = decodeURIComponent(subjectName);
  const [dropOpen, setDropOpen] = useState(false);

  const isDNB   = examType === 'DNB';

  /* All available subjects for the selector dropdown */
  const allSubjects = useMemo(() => {
    if (!tree) return [subject];
    const keys = new Set(Object.keys(tree));
    return [...keys].sort();
  }, [tree, subject]);

  const sessions = useMemo(() => getSessions(tree, subject, examType), [tree, subject, examType]);

  /* Pink gradient shades for session cards (cycle through) */
  const PINK_SHADES = [
    'linear-gradient(135deg, #FBBCCE 0%, #F9A8C0 100%)',
    'linear-gradient(135deg, #F9A8C0 0%, #F794B2 100%)',
    'linear-gradient(135deg, #FBBCCE 0%, #FAB0C7 100%)',
    'linear-gradient(135deg, #F9C0CD 0%, #F9A8BF 100%)',
  ];

  const BLUE_SHADES = [
    'linear-gradient(135deg, #BFCEFF 0%, #A5B4FC 100%)',
    'linear-gradient(135deg, #A5B4FC 0%, #93A5FA 100%)',
    'linear-gradient(135deg, #C3D0FF 0%, #A8B8FF 100%)',
    'linear-gradient(135deg, #B8C8FF 0%, #A0B0FF 100%)',
  ];

  const SHADES = isDNB ? PINK_SHADES : BLUE_SHADES;

  return (
    <div className="page-enter page-root" style={{ background: '#F4F6FB', minHeight: '100dvh' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 14px 40px' }}>

        {/* ── Subject selector ──────────────── */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <button
            onClick={() => setDropOpen(o => !o)}
            style={{
              width: '100%',
              background: 'white',
              borderRadius: 18,
              padding: '15px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 4px 20px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)',
              border: 'none', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16, color: '#1F2937' }}>{subject}</span>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #F97316, #FBBF24)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(249,115,22,0.35)',
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="3" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
              background: 'white', borderRadius: 18, zIndex: 40,
              boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
              maxHeight: 300, overflowY: 'auto',
              border: '1px solid rgba(0,0,0,0.06)',
            }}>
              {allSubjects.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setDropOpen(false);
                    navigate(`/subject/${encodeURIComponent(s)}`);
                  }}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '13px 18px',
                    fontWeight: s === subject ? 800 : 500,
                    fontSize: 14, color: s === subject ? '#9B6FD4' : '#374151',
                    background: s === subject ? 'rgba(155,111,212,0.07)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = s === subject ? 'rgba(155,111,212,0.07)' : 'transparent'}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Featured cards row ─────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FeaturedCard
            title="Important Topics"
            badge="List"
            bg="linear-gradient(135deg, #FFE0A3 0%, #FFD080 100%)"
            iconBg="rgba(255,255,255,0.80)"
            disabled
          />
          <FeaturedCard
            title="MCQ Mode"
            badge="Quiz"
            bg="linear-gradient(135deg, #E0D0FF 0%, #CDB8FF 100%)"
            iconBg="rgba(255,255,255,0.80)"
            disabled
          />
        </div>

        {/* ── Session cards grid ─────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ borderRadius: 28, minHeight: 140 }} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontWeight: 700, color: '#374151', fontSize: 16 }}>No sessions found</p>
            <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>
              Try switching to {isDNB ? 'DipNB' : 'DNB'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {sessions.map((s, i) => (
              <SessionCard
                key={`${s.year}-${s.session}`}
                label={`${s.session} ${s.year}`}
                badge={examType}
                bg={SHADES[i % SHADES.length]}
                iconBg="rgba(255,255,255,0.82)"
                onClick={() =>
                  navigate(
                    `/subject/${encodeURIComponent(subject)}/session/${s.year}/${encodeURIComponent(s.session)}`
                  )
                }
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
