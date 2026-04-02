import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PAPERS = [
  { bg: '#FFF0F7', border: 'rgba(244,114,182,0.35)', dot: '#EC4899', text: '#DB2777', name: 'Paper 1' },
  { bg: '#EFF6FF', border: 'rgba(96,165,250,0.35)',  dot: '#3B82F6', text: '#2563EB', name: 'Paper 2' },
  { bg: '#F0FDF4', border: 'rgba(74,222,128,0.35)',  dot: '#22C55E', text: '#16A34A', name: 'Paper 3' },
  { bg: '#FFF7ED', border: 'rgba(251,146,60,0.35)',  dot: '#F97316', text: '#EA580C', name: 'Paper 4' },
];

const ICONS = ['📋', '📝', '📄', '📃'];

export default function PaperScreen({ examType, tree }) {
  const { subjectName, year, session } = useParams();
  const navigate = useNavigate();
  const subject        = decodeURIComponent(subjectName);
  const decodedSession = decodeURIComponent(session);

  const isDNB   = examType === 'DNB';
  const primary = isDNB ? '#EC4899' : '#3B82F6';
  const cardBg  = isDNB ? 'var(--dnb-card)'  : 'var(--dipnb-card)';
  const border  = isDNB ? 'rgba(244,114,182,0.25)' : 'rgba(96,165,250,0.25)';

  const sessionData = tree?.[subject]?.[examType]?.[year]?.[decodedSession] || {};
  const papers      = Object.keys(sessionData).map(Number).sort();

  const getPaperQs = (n) => {
    const p = sessionData[n];
    if (!p) return [];
    return Array.isArray(p) ? p : (p.questions || []);
  };

  const totalQs = papers.reduce((acc, n) => acc + getPaperQs(n).length, 0);

  return (
    <div className="page-enter page-root">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Session info card ── */}
        <div
          className="rounded-2xl p-5 sm:p-6 mb-6"
          style={{ background: cardBg, border: `1px solid ${border}` }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                {examType} Exam
              </p>
              <h1 className="font-black text-xl sm:text-2xl text-gray-800 truncate">{subject}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {decodedSession} {year}
                <span className="mx-1.5 text-gray-300">·</span>
                {papers.length} paper{papers.length !== 1 ? 's' : ''} available
              </p>
            </div>
            {totalQs > 0 && (
              <div
                className="shrink-0 rounded-2xl px-4 py-3 text-center"
                style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
              >
                <p className="text-3xl font-black leading-none" style={{ color: primary }}>{totalQs}</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Questions</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Section label ── */}
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1">
          Select a Paper
        </p>

        {/* ── Paper cards ── */}
        {papers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-600 font-semibold text-lg">No papers available</p>
            <p className="text-gray-400 text-sm mt-1">Check back after the next data update</p>
          </div>
        ) : (
          /* 2-col grid on all screens; single col on xs if needed */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(num => {
              const hasData = papers.includes(num);
              const qs      = getPaperQs(num);
              const c       = PAPERS[num - 1];
              const marks   = qs.reduce((a, q) => a + (q.marks || 5), 0);

              return (
                <button
                  key={num}
                  onClick={() =>
                    hasData &&
                    navigate(
                      `/subject/${encodeURIComponent(subject)}/session/${year}/${encodeURIComponent(decodedSession)}/paper/${num}`
                    )
                  }
                  disabled={!hasData}
                  className="paper-card rounded-2xl border text-left flex flex-col"
                  style={{
                    background:   hasData ? c.bg     : '#F9FAFB',
                    borderColor:  hasData ? c.border : '#E5E7EB',
                    boxShadow:    hasData ? 'var(--shadow-soft)' : 'none',
                    opacity:      hasData ? 1 : 0.45,
                    cursor:       hasData ? 'pointer' : 'not-allowed',
                    padding:      '20px',
                    minHeight:    '160px',
                  }}
                >
                  {/* Top row: icon + dot indicator */}
                  <div className="flex items-start justify-between mb-auto">
                    <span className="text-3xl leading-none">{ICONS[num - 1]}</span>
                    {hasData && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: c.dot }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                          stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="mt-4">
                    <p className="font-black text-lg text-gray-800">{c.name}</p>
                    {hasData ? (
                      <>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {qs.length > 0 ? `${qs.length} questions` : 'PDF only'}
                        </p>
                        {marks > 0 && (
                          <p className="text-xs font-bold mt-2" style={{ color: c.text }}>
                            {marks} marks total
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">Not available</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Footer note ── */}
        <p className="text-center text-xs text-gray-400 font-medium mt-8">
          Each paper contains questions from the {decodedSession} {year} exam
        </p>
        <div className="h-12" />
      </div>
    </div>
  );
}
