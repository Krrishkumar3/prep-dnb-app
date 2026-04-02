import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSessions } from '../utils/dataParser';
import { SUBJECTS } from '../data/subjects';
import { SkeletonRow } from './LoadingSpinner';

const SESSION_ICONS = {
  June: '☀️', October: '🍂', December: '❄️',
  January: '🌱', March: '🌸', May: '🌼',
  April: '🌺', August: '🌿', September: '🍁',
};

export default function SessionScreen({ examType, tree, loading }) {
  const { subjectName } = useParams();
  const navigate = useNavigate();
  const subject  = decodeURIComponent(subjectName);

  const isDNB   = examType === 'DNB';
  const primary = isDNB ? '#EC4899' : '#3B82F6';
  const cardBg  = isDNB ? 'var(--dnb-card)'   : 'var(--dipnb-card)';
  const softBg  = isDNB ? '#FCE7F3'            : '#DBEAFE';
  const border  = isDNB ? 'rgba(244,114,182,0.25)' : 'rgba(96,165,250,0.25)';

  const subjectInfo = SUBJECTS.find(s => s.name === subject);
  const sessions    = useMemo(() => getSessions(tree, subject, examType), [tree, subject, examType]);

  const grouped = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      if (!map[s.year]) map[s.year] = [];
      map[s.year].push(s);
    });
    return Object.entries(map).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [sessions]);

  return (
    <div className="page-enter page-root">
      {/* ── Max-width wrapper ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Subject hero card ── */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: cardBg, border: `1px solid ${border}` }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0"
              style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >
              {subjectInfo?.icon || '📚'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                {subjectInfo?.category || examType}
              </p>
              <h1 className="font-black text-xl sm:text-2xl text-gray-800 leading-tight truncate">
                {subject}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{examType} Question Bank</p>
            </div>
          </div>

          {!loading && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/60">
              <span className="badge text-white" style={{ background: primary }}>
                {sessions.length} session{sessions.length !== 1 ? 's' : ''}
              </span>
              <span className="badge" style={{ background: 'white', color: '#6B7280', border: '1px solid #E5E7EB' }}>
                {sessions.reduce((a, s) => a + s.papers.length, 0)} papers total
              </span>
              {sessions.length > 0 && (
                <span className="badge" style={{ background: 'white', color: '#6B7280', border: '1px solid #E5E7EB' }}>
                  {grouped[grouped.length - 1]?.[0]} – {grouped[0]?.[0]}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Session list ── */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-600 font-semibold text-lg">No sessions found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try switching to {isDNB ? 'DipNB' : 'DNB'} or check back later
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {grouped.map(([year, yearSessions]) => (
              <div key={year}>
                {/* Year header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-1.5 h-5 rounded-full shrink-0"
                    style={{ background: primary }}
                  />
                  <h2 className="font-black text-gray-700 text-lg">{year}</h2>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    {yearSessions.length} session{yearSessions.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Session rows — 1 col mobile, 2 col sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {yearSessions.map(s => (
                    <button
                      key={`${s.year}-${s.session}`}
                      onClick={() =>
                        navigate(
                          `/subject/${encodeURIComponent(subject)}/session/${s.year}/${encodeURIComponent(s.session)}`
                        )
                      }
                      className="session-row flex items-center justify-between p-4 rounded-2xl bg-white border text-left"
                      style={{ borderColor: border, boxShadow: 'var(--shadow-soft)' }}
                    >
                      {/* Icon + label */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                          style={{ background: softBg }}
                        >
                          {SESSION_ICONS[s.session] || '📅'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm leading-tight">
                            {s.session} {s.year}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Paper 1 – Paper {Math.max(...s.papers)}
                          </p>
                        </div>
                      </div>

                      {/* Papers badge + chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="badge text-white" style={{ background: primary }}>
                          {s.papers.length} paper{s.papers.length !== 1 ? 's' : ''}
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="h-12" />
      </div>
    </div>
  );
}
