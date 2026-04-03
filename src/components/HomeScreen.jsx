import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUBJECTS, CATEGORIES } from '../data/subjects';
import { SkeletonCard } from './LoadingSpinner';

/* ── Document icon ───────────────────────── */
function DocIcon({ size = 20, color = '#6B7280' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

/* ── Pill badge ──────────────────────────── */
function Pill({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 999,
      background: 'rgba(0,0,0,0.07)', color: '#555',
      border: '1px solid rgba(0,0,0,0.09)',
    }}>
      {children}
    </span>
  );
}

/* ── Subject card (pink/blue gradient) ──── */
function SubjectCard({ subject, count, examType, onClick, shade, isDNB }) {
  const [pressed, setPressed] = useState(false);
  const hasData = count > 0;

  /* Cycle between 4 tints */
  const PINK = [
    'linear-gradient(135deg, #FBBCCE 0%, #F9A8C0 100%)',
    'linear-gradient(135deg, #F9C4D2 0%, #FBAFC5 100%)',
    'linear-gradient(135deg, #FFC8D8 0%, #F9A8C0 100%)',
    'linear-gradient(135deg, #F9B8CC 0%, #F794B4 100%)',
  ];
  const BLUE = [
    'linear-gradient(135deg, #BFCEFF 0%, #A5B4FC 100%)',
    'linear-gradient(135deg, #C3D4FF 0%, #ABC0FC 100%)',
    'linear-gradient(135deg, #B8C8FF 0%, #A8B8FC 100%)',
    'linear-gradient(135deg, #C8D8FF 0%, #A5B4FC 100%)',
  ];

  const bg = hasData
    ? (isDNB ? PINK[shade % 4] : BLUE[shade % 4])
    : '#F3F4F6';

  return (
    <button
      onClick={onClick}
      disabled={!hasData}
      onMouseDown={() => hasData && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => hasData && setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: bg,
        borderRadius: 28,
        padding: '20px 18px 18px',
        textAlign: 'left',
        boxShadow: hasData
          ? (pressed
            ? '0 2px 6px rgba(0,0,0,0.09)'
            : '0 4px 18px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)')
          : 'none',
        border: 'none',
        cursor: hasData ? 'pointer' : 'default',
        opacity: hasData ? 1 : 0.5,
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        display: 'flex', flexDirection: 'column', gap: 10,
        minHeight: 140,
      }}
    >
      {/* Circular icon backdrop */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(255,255,255,0.82)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
        flexShrink: 0,
      }}>
        {hasData
          ? <DocIcon size={20} color="#6B7280" />
          : <span style={{ fontSize: 18 }}>{subject.icon}</span>}
      </div>

      {/* Title */}
      <p style={{
        fontWeight: 800, fontSize: 14, color: '#1F2937',
        lineHeight: 1.25, flex: 1,
      }}>
        {subject.name}
      </p>

      {/* Badge */}
      <div>
        {hasData
          ? <Pill>{examType}</Pill>
          : <Pill>No data</Pill>}
      </div>
    </button>
  );
}

/* ── Main HomeScreen ─────────────────────── */
export default function HomeScreen({ examType, tree, loading, usingDemo, cacheInfo, refresh }) {
  const [search, setSearch]               = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();
  const isDNB    = examType === 'DNB';

  const filtered = useMemo(() =>
    SUBJECTS.filter(s => {
      const matchCat    = activeCategory === 'All' || s.category === activeCategory;
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    }), [search, activeCategory]);

  const getCount = (name) => {
    if (!tree?.[name]?.[examType]) return 0;
    let count = 0;
    Object.values(tree[name][examType]).forEach(yearData =>
      count += Object.keys(yearData).length
    );
    return count;
  };

  const pillActiveStyle = {
    background: 'linear-gradient(135deg, #6C8EF5, #9B6FD4)',
    color: 'white',
    border: '1.5px solid transparent',
    boxShadow: '0 2px 8px rgba(108,142,245,0.35)',
  };

  return (
    <div className="page-enter page-root" style={{ background: '#F4F6FB', minHeight: '100dvh' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 14px 40px' }}>

        {/* ── Demo banner ───────────────── */}
        {usingDemo && (
          <div style={{
            marginBottom: 16, borderRadius: 16, padding: '12px 16px',
            background: '#FFF7ED', color: '#92400E',
            border: '1px solid #FED7AA', fontSize: 13, fontWeight: 500,
            display: 'flex', gap: 10, alignItems: 'center',
          }}>
            <span>🎓</span>
            <span>
              {cacheInfo} —{' '}
              <button style={{ textDecoration: 'underline', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} onClick={refresh}>
                Connect your Google Sheet
              </button>
            </span>
          </div>
        )}

        {/* ── Search ────────────────────── */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <svg
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search subjects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 44, paddingRight: 44,
              paddingTop: 14, paddingBottom: 14,
              borderRadius: 18, background: 'white',
              border: '1.5px solid rgba(108,142,245,0.15)',
              fontSize: 14, fontWeight: 500, color: '#1F2937',
              boxShadow: '0 3px 14px rgba(0,0,0,0.07)',
              outline: 'none',
            }}
          />
          {search && (
            <button
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              onClick={() => setSearch('')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Category pills ─────────────── */}
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 18,
          paddingBottom: 4, scrollbarWidth: 'none',
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                flexShrink: 0,
                fontSize: 12, fontWeight: 700,
                padding: '8px 16px', borderRadius: 999,
                border: '1.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                ...(activeCategory === cat
                  ? pillActiveStyle
                  : { background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }),
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Stats ─────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>
            {filtered.length} subject{filtered.length !== 1 ? 's' : ''}
          </p>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {examType} Question Bank
          </p>
        </div>

        {/* ── Subject grid ───────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ borderRadius: 28, minHeight: 140 }} />
              ))
            : filtered.map((subject, i) => {
                const count = getCount(subject.name);
                return (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    count={count}
                    examType={examType}
                    isDNB={isDNB}
                    shade={i}
                    onClick={() => navigate(`/subject/${encodeURIComponent(subject.name)}`)}
                  />
                );
              })
          }
        </div>

        {/* ── Empty search state ─────────── */}
        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontWeight: 700, color: '#374151', fontSize: 16 }}>No subjects found</p>
            <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4, marginBottom: 16 }}>Try a different search term</p>
            <button
              onClick={() => setSearch('')}
              style={{
                fontSize: 14, fontWeight: 700, padding: '10px 24px', borderRadius: 999,
                background: 'linear-gradient(135deg, #6C8EF5, #9B6FD4)', color: 'white', border: 'none',
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(108,142,245,0.35)',
              }}
            >
              Clear search
            </button>
          </div>
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
