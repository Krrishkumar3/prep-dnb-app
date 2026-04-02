import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUBJECTS, CATEGORIES } from '../data/subjects';
import { SkeletonCard } from './LoadingSpinner';

export default function HomeScreen({ examType, tree, loading, usingDemo, cacheInfo, refresh }) {
  const [search, setSearch]               = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const isDNB      = examType === 'DNB';
  const primary    = isDNB ? '#EC4899' : '#3B82F6';
  const cardBg     = isDNB ? 'var(--dnb-card)'  : 'var(--dipnb-card)';
  const softBg     = isDNB ? 'var(--dnb-soft)'  : 'var(--dipnb-soft)';
  const border     = isDNB ? 'rgba(244,114,182,0.3)' : 'rgba(96,165,250,0.3)';
  const pillActive = isDNB
    ? { background: '#FDF2F8', color: '#EC4899', border: '1px solid rgba(244,114,182,0.4)' }
    : { background: '#EFF6FF', color: '#3B82F6', border: '1px solid rgba(96,165,250,0.4)' };

  const filtered = useMemo(() => {
    return SUBJECTS.filter(s => {
      const matchCat    = activeCategory === 'All' || s.category === activeCategory;
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const getCount = (name) => {
    if (!tree?.[name]?.[examType]) return 0;
    let count = 0;
    Object.values(tree[name][examType]).forEach(yearData => {
      count += Object.keys(yearData).length;
    });
    return count;
  };

  return (
    <div className="page-enter page-root">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Demo banner ───────────────── */}
        {usingDemo && (
          <div
            className="mb-5 rounded-2xl px-4 py-3 flex items-center gap-2.5 text-xs font-medium"
            style={{
              background: isDNB ? '#FFF7ED' : '#F0FDF4',
              color: isDNB ? '#92400E' : '#14532D',
              border: `1px solid ${isDNB ? '#FED7AA' : '#BBF7D0'}`,
            }}
          >
            <span className="shrink-0 text-base">🎓</span>
            <span className="flex-1 leading-relaxed">
              {cacheInfo} —{' '}
              <button className="underline font-bold" onClick={refresh}>
                Connect your Google Sheet
              </button>
            </span>
          </div>
        )}

        {/* ── Search ────────────────────── */}
        <div className="relative mb-4">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search subjects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`search-input ${isDNB ? '' : 'dipnb'} w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white border text-sm font-medium placeholder-gray-400 text-gray-800`}
            style={{ borderColor: border, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          />
          {search && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Category pills ────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full transition-all duration-200 whitespace-nowrap"
              style={
                activeCategory === cat
                  ? pillActive
                  : { background: 'white', color: '#6B7280', border: '1px solid #E5E7EB' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Stats bar ─────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-gray-500">
            {filtered.length} subject{filtered.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">
            {examType} Question Bank
          </p>
        </div>

        {/* ── Subject grid ──────────────── */}
        {/* 2 cols on mobile, 3 on md, 4 on lg */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map(subject => {
                const count   = getCount(subject.name);
                const hasData = count > 0;
                return (
                  <button
                    key={subject.id}
                    onClick={() => navigate(`/subject/${encodeURIComponent(subject.name)}`)}
                    className="subject-card text-left rounded-2xl border flex flex-col"
                    style={{
                      background:   hasData ? cardBg   : '#F9FAFB',
                      borderColor:  hasData ? border   : '#E5E7EB',
                      boxShadow:    hasData ? 'var(--shadow-soft)' : 'none',
                      opacity:      hasData ? 1 : 0.6,
                      padding:      '16px',
                      minHeight:    '120px',
                    }}
                  >
                    {/* Icon */}
                    <div className="text-3xl mb-3 leading-none">{subject.icon}</div>

                    {/* Name */}
                    <h3 className="font-bold text-gray-800 text-[13px] sm:text-sm leading-snug flex-1">
                      {subject.name}
                    </h3>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 gap-1">
                      <span className="text-[10px] font-semibold text-gray-400 tracking-wide uppercase truncate">
                        {subject.category}
                      </span>
                      {hasData ? (
                        <span className="badge text-white shrink-0" style={{ background: primary }}>
                          {count} {count === 1 ? 'session' : 'sessions'}
                        </span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-400 shrink-0">No data</span>
                      )}
                    </div>
                  </button>
                );
              })
          }
        </div>

        {/* ── Empty search state ────────── */}
        {filtered.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-600 font-semibold text-lg">No subjects found</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">Try a different search term</p>
            <button
              onClick={() => setSearch('')}
              className="text-sm font-bold px-5 py-2.5 rounded-2xl text-white transition-opacity hover:opacity-85"
              style={{ background: primary }}
            >
              Clear search
            </button>
          </div>
        )}

        {/* ── Bottom padding ─────────────── */}
        <div className="h-10" />
      </div>
    </div>
  );
}
