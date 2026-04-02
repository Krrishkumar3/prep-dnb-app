import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSessions } from '../utils/dataParser';
import { SUBJECTS } from '../data/subjects';
import { SkeletonRow } from './LoadingSpinner';

export default function SessionScreen({ examType, tree, loading }) {
  const { subjectName } = useParams();
  const navigate = useNavigate();
  const subject = decodeURIComponent(subjectName);

  const isDNB = examType === 'DNB';
  const primaryColor = isDNB ? '#EC4899' : '#3B82F6';
  const cardBg = isDNB ? 'var(--dnb-card)' : 'var(--dipnb-card)';
  const borderColor = isDNB ? 'rgba(244,114,182,0.25)' : 'rgba(96,165,250,0.25)';
  const softBg = isDNB ? '#FCE7F3' : '#DBEAFE';

  const subjectInfo = SUBJECTS.find(s => s.name === subject);
  const sessions = useMemo(() => getSessions(tree, subject, examType), [tree, subject, examType]);

  // Group sessions by year
  const grouped = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      if (!map[s.year]) map[s.year] = [];
      map[s.year].push(s);
    });
    return Object.entries(map).sort((a, b) => b[0] - a[0]);
  }, [sessions]);

  const handleSession = (s) => {
    navigate(`/subject/${encodeURIComponent(subject)}/session/${s.year}/${encodeURIComponent(s.session)}`);
  };

  const sessionIcon = { June: '☀️', October: '🍂', December: '❄️', January: '🌱', March: '🌸' };

  return (
    <div className="page-enter pt-[72px] pb-8 px-4 max-w-3xl mx-auto">
      {/* Subject hero */}
      <div className="rounded-2xl p-5 mb-5 mt-4" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-3">
          <div className="text-4xl">{subjectInfo?.icon || '📚'}</div>
          <div>
            <h2 className="font-bold text-xl text-gray-800">{subject}</h2>
            <p className="text-sm text-gray-500">{subjectInfo?.category} · {examType} Question Bank</p>
          </div>
        </div>
        {!loading && (
          <div className="mt-3 flex items-center gap-2">
            <span className="badge text-white" style={{ background: primaryColor }}>{sessions.length} sessions</span>
            <span className="badge bg-white text-gray-500 border border-gray-200">{sessions.reduce((a, s) => a + s.papers.length, 0)} papers</span>
          </div>
        )}
      </div>

      {/* Sessions by year */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500 font-medium">No sessions found for {examType}</p>
          <p className="text-sm text-gray-400 mt-1">Try switching to the other exam type</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {grouped.map(([year, yearSessions]) => (
            <div key={year}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-1 h-4 rounded-full" style={{ background: primaryColor }} />
                <h3 className="font-bold text-gray-700 text-[15px]">{year}</h3>
                <span className="text-xs text-gray-400">{yearSessions.length} session{yearSessions.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex flex-col gap-2">
                {yearSessions.map(s => (
                  <button
                    key={`${s.year}-${s.session}`}
                    onClick={() => handleSession(s)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border text-left transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                    style={{ borderColor, boxShadow: 'var(--shadow-soft)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: softBg }}>
                        {sessionIcon[s.session] || '📅'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{s.session} {s.year}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Paper 1 – Paper {Math.max(...s.papers)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge text-white hidden sm:inline-block" style={{ background: primaryColor }}>
                        {s.papers.length} paper{s.papers.length !== 1 ? 's' : ''}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
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
    </div>
  );
}
