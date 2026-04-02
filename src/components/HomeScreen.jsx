import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUBJECTS, CATEGORIES } from '../data/subjects';
import { SkeletonCard } from './LoadingSpinner';

export default function HomeScreen({ examType, tree, loading, usingDemo, cacheInfo, refresh }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const isDNB = examType === 'DNB';
  const primaryColor = isDNB ? '#EC4899' : '#3B82F6';
  const accentBg = isDNB ? 'var(--dnb-soft)' : 'var(--dipnb-soft)';
  const cardBg = isDNB ? 'var(--dnb-card)' : 'var(--dipnb-card)';
  const borderColor = isDNB ? 'rgba(244,114,182,0.3)' : 'rgba(96,165,250,0.3)';
  const pillActive = isDNB
    ? 'bg-pink-100 text-pink-600 border border-pink-200'
    : 'bg-blue-100 text-blue-600 border border-blue-200';

  const filtered = useMemo(() => {
    return SUBJECTS.filter(s => {
      const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  // Count how many sessions are available for a subject
  const getCount = (name) => {
    if (!tree || !tree[name] || !tree[name][examType]) return 0;
    let count = 0;
    Object.values(tree[name][examType]).forEach(yearData => {
      count += Object.keys(yearData).length; // each key = a session
    });
    return count;
  };

  const handleSubjectClick = (subject) => {
    navigate(`/subject/${encodeURIComponent(subject.name)}`);
  };

  return (
    <div className="page-enter pt-24 pb-8 px-4 max-w-5xl mx-auto">
      {/* Demo banner */}
      {usingDemo && (
        <div className="mb-4 rounded-2xl p-3 flex items-center gap-2 text-xs font-medium"
          style={{ background: isDNB ? '#FFF7ED' : '#F0FDF4', color: isDNB ? '#92400E' : '#14532D', border: `1px solid ${isDNB ? '#FED7AA' : '#BBF7D0'}` }}>
          <span>🎓</span>
          <span>{cacheInfo} — <button className="underline font-semibold" onClick={refresh}>Set up your Google Sheet</button></span>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search subjects…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`search-input ${isDNB ? '' : 'dipnb'} w-full pl-10 pr-4 py-3 rounded-2xl bg-white border text-sm font-medium placeholder-gray-400`}
          style={{ borderColor, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        />
        {search && (
          <button className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setSearch('')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 ${activeCategory === cat ? pillActive : 'bg-white text-gray-500 border border-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-500">
          {filtered.length} subject{filtered.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-gray-400 font-medium">{examType} Question Bank</p>
      </div>

      {/* Subject grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.map(subject => {
            const count = getCount(subject.name);
            const hasData = count > 0;
            return (
              <button
                key={subject.id}
                onClick={() => handleSubjectClick(subject)}
                className="subject-card text-left rounded-2xl p-4 border"
                style={{
                  background: hasData ? cardBg : '#F9FAFB',
                  borderColor: hasData ? borderColor : '#E5E7EB',
                  boxShadow: hasData ? 'var(--shadow-soft)' : 'none',
                  opacity: hasData ? 1 : 0.65,
                }}
              >
                <div className="text-2xl mb-2">{subject.icon}</div>
                <h3 className="font-semibold text-gray-800 text-[13px] leading-snug mb-1.5">
                  {subject.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-gray-400">{subject.category}</span>
                  {hasData ? (
                    <span className="badge text-white" style={{ background: primaryColor }}>
                      {count} {count === 1 ? 'session' : 'sessions'}
                    </span>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-400">No data</span>
                  )}
                </div>
              </button>
            );
          })}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 font-medium">No subjects match "{search}"</p>
          <button className="mt-3 text-sm font-semibold" style={{ color: primaryColor }} onClick={() => setSearch('')}>
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
