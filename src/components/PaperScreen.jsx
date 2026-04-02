import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PAPER_COLORS = [
  { bg: '#FFF0F7', border: 'rgba(244,114,182,0.3)', dot: '#EC4899', label: '#DB2777' },
  { bg: '#EFF6FF', border: 'rgba(96,165,250,0.3)', dot: '#3B82F6', label: '#2563EB' },
  { bg: '#F0FDF4', border: 'rgba(74,222,128,0.3)', dot: '#22C55E', label: '#16A34A' },
  { bg: '#FFF7ED', border: 'rgba(251,146,60,0.3)', dot: '#F97316', label: '#EA580C' },
];

const PAPER_ICONS = ['📋', '📝', '📄', '📃'];

export default function PaperScreen({ examType, tree }) {
  const { subjectName, year, session } = useParams();
  const navigate = useNavigate();
  const subject = decodeURIComponent(subjectName);
  const decodedSession = decodeURIComponent(session);

  const isDNB = examType === 'DNB';
  const primaryColor = isDNB ? '#EC4899' : '#3B82F6';
  const cardBg = isDNB ? 'var(--dnb-card)' : 'var(--dipnb-card)';
  const borderColor = isDNB ? 'rgba(244,114,182,0.25)' : 'rgba(96,165,250,0.25)';

  const sessionData = tree?.[subject]?.[examType]?.[year]?.[decodedSession] || {};
  const papers = Object.keys(sessionData).map(Number).sort();

  // Helper to get questions array from paper data (supports both old [] and new {questions} format)
  const getPaperQuestions = (paperNum) => {
    const p = sessionData[paperNum];
    if (!p) return [];
    return Array.isArray(p) ? p : (p.questions || []);
  };

  const getPaperPdfLink = (paperNum) => {
    const p = sessionData[paperNum];
    if (!p) return null;
    return Array.isArray(p) ? null : (p.pdfLink || null);
  };

  const handlePaper = (paper) => {
    navigate(`/subject/${encodeURIComponent(subject)}/session/${year}/${encodeURIComponent(decodedSession)}/paper/${paper}`);
  };

  const totalQuestions = papers.reduce((acc, p) => acc + getPaperQuestions(p).length, 0);

  return (
    <div className="page-enter pt-[72px] pb-8 px-4 max-w-3xl mx-auto">
      {/* Session info card */}
      <div className="rounded-2xl p-5 mb-6 mt-4" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{examType} Exam</p>
            <h2 className="font-bold text-xl text-gray-800">{subject}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{decodedSession} {year} · {papers.length} Papers</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black" style={{ color: primaryColor }}>{totalQuestions}</p>
            <p className="text-xs text-gray-400 font-medium">Questions</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">Select a Paper</p>

      {/* Paper cards grid - 2 cols on mobile, keeps aspect ratio */}
      {papers.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500 font-medium">No papers available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(paperNum => {
            const hasData = papers.includes(paperNum);
            const questions = getPaperQuestions(paperNum);
            const questionCount = questions.length;
            const colors = PAPER_COLORS[paperNum - 1];
            const totalMarks = questions.reduce((a, q) => a + (q.marks || 5), 0);

            return (
              <button
                key={paperNum}
                onClick={() => hasData && handlePaper(paperNum)}
                disabled={!hasData}
                className="paper-card rounded-2xl p-5 text-left border flex flex-col gap-3"
                style={{
                  background: hasData ? colors.bg : '#F9FAFB',
                  borderColor: hasData ? colors.border : '#E5E7EB',
                  boxShadow: hasData ? 'var(--shadow-soft)' : 'none',
                  opacity: hasData ? 1 : 0.45,
                  cursor: hasData ? 'pointer' : 'not-allowed',
                  minHeight: '160px',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{PAPER_ICONS[paperNum - 1]}</span>
                  {hasData && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: colors.dot }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-800">Paper {paperNum}</p>
                  {hasData ? (
                    <>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">{questionCount} questions</p>
                      <p className="text-xs font-semibold mt-2" style={{ color: colors.label }}>
                        {totalMarks} marks total
                      </p>
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

      {/* Info note */}
      <p className="text-center text-xs text-gray-400 mt-6 font-medium">
        Each paper contains questions from the {decodedSession} {year} exam
      </p>
    </div>
  );
}
