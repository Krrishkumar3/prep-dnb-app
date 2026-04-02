import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuestions } from '../utils/dataParser';
import { SUBJECTS } from '../data/subjects';

export default function ExamScreen({ examType, tree }) {
  const { subjectName, year, session, paper } = useParams();
  const [expandedQ, setExpandedQ] = useState(null);
  const [pdfOpen,   setPdfOpen]   = useState(false);
  const subject        = decodeURIComponent(subjectName);
  const decodedSession = decodeURIComponent(session);

  const isDNB   = examType === 'DNB';
  const primary = isDNB ? '#EC4899' : '#3B82F6';
  const accent  = isDNB ? '#FDF2F8' : '#EFF6FF';
  const soft    = isDNB ? '#FCE7F3' : '#DBEAFE';
  const border  = isDNB ? 'rgba(244,114,182,0.18)' : 'rgba(96,165,250,0.18)';
  const grad    = isDNB ? '#9333EA' : '#6366F1';

  const subjectInfo = SUBJECTS.find(s => s.name === subject);
  const questions   = getQuestions(tree, subject, examType, year, decodedSession, parseInt(paper, 10));
  const totalMarks  = questions.reduce((a, q) => a + (q.marks || 5), 0);
  const pdfLink     = questions[0]?.pdfLink || null;

  /* ── PDF Modal ─────────────────────────────────────── */
  const PdfModal = () => (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
    >
      {/* Modal toolbar */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0 gap-3"
        style={{ background: 'rgba(0,0,0,0.55)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="badge text-white shrink-0" style={{ background: primary }}>{examType}</span>
          <p className="text-white text-sm font-semibold truncate">
            {subject} · Paper {paper} · {decodedSession} {year}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={pdfLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-opacity hover:opacity-80"
            style={{ background: primary }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            New Tab
          </a>
          <button
            onClick={() => setPdfOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-white transition-opacity hover:opacity-70"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <iframe src={pdfLink} className="flex-1 w-full border-0" title={`${subject} Paper ${paper}`} />
    </div>
  );

  return (
    <div className="page-enter page-root">
      {pdfOpen && pdfLink && <PdfModal />}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Exam paper header card ─────────────────────── */}
        <div className="exam-paper rounded-2xl overflow-hidden mb-5">
          {/* Gradient top bar */}
          <div
            className="h-1.5 w-full"
            style={{ background: `linear-gradient(90deg, ${primary}, ${grad})` }}
          />

          <div className="p-5 sm:p-6">
            {/* Institution */}
            <div className="text-center mb-5">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <span className="text-2xl">{subjectInfo?.icon || '📚'}</span>
                <h2 className="font-black text-gray-800 text-base sm:text-lg">
                  National Board of Examinations
                </h2>
              </div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">
                {isDNB ? 'Diplomate of National Board' : 'Diploma of National Board'}
              </p>
            </div>

            <div className="border-t border-dashed border-gray-200 my-4" />

            {/* Metadata grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { label: 'Subject',      value: subject            },
                { label: 'Session',      value: `${decodedSession} ${year}` },
                { label: 'Paper',        value: `Paper ${paper}`   },
                { label: 'Total Marks',  value: totalMarks > 0 ? `${totalMarks}` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-3" style={{ background: accent }}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="font-bold text-gray-800 text-sm sm:text-base mt-0.5 leading-snug">{value}</p>
                </div>
              ))}
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-2 mt-5 flex-wrap">
              {pdfLink ? (
                <button
                  onClick={() => setPdfOpen(true)}
                  className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
                  style={{ background: primary }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  View Original PDF
                </button>
              ) : (
                <a
                  href="https://natboard.edu.in/dnb_old_qp"
                  target="_blank" rel="noreferrer"
                  className="text-xs font-semibold"
                  style={{ color: primary }}
                >
                  Browse NBEMS ↗
                </a>
              )}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-opacity hover:opacity-80 ml-auto"
                style={{ background: soft, color: primary }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print
              </button>
            </div>
          </div>
        </div>

        {/* ── General Instructions ───────────────────────── */}
        <div
          className="rounded-2xl px-4 py-3.5 mb-5 text-xs"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
        >
          <p className="font-bold text-amber-800 mb-1.5 flex items-center gap-1.5">
            <span>📌</span> General Instructions
          </p>
          <ul className="text-amber-700 space-y-1 list-disc list-inside">
            <li>All questions carry marks as specified against each.</li>
            <li>Read each question carefully before answering.</li>
            <li>Diagrams and flowcharts should be neat and labeled.</li>
          </ul>
        </div>

        {/* ── Questions ─────────────────────────────────── */}
        {questions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500 font-semibold">No questions for this paper</p>
            {pdfLink && (
              <button
                onClick={() => setPdfOpen(true)}
                className="mt-4 text-sm font-bold px-5 py-2.5 rounded-xl text-white"
                style={{ background: primary }}
              >
                View Original PDF
              </button>
            )}
          </div>
        ) : (
          <div className="exam-paper rounded-2xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ background: primary }} />
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">
                Questions
              </h3>
              <span className="ml-auto badge" style={{ background: accent, color: primary }}>
                {questions.length} Qs · {totalMarks} marks
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className={`question-item ${isDNB ? '' : 'dipnb'} px-4 sm:px-6 py-4 cursor-pointer`}
                  onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                >
                  <div className="flex items-start gap-3">
                    {/* Number bubble */}
                    <div
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                      style={{ background: primary }}
                    >
                      {idx + 1}
                    </div>

                    {/* Question text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm leading-relaxed">{q.questionText}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className="badge"
                          style={
                            q.marks >= 10
                              ? { background: primary, color: 'white' }
                              : { background: accent, color: primary }
                          }
                        >
                          {q.marks} mark{q.marks !== 1 ? 's' : ''}
                        </span>
                        {q.marks >= 10 && (
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                            Long Answer
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chevron */}
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"
                      className="shrink-0 mt-1.5 transition-transform duration-200"
                      style={{ transform: expandedQ === idx ? 'rotate(180deg)' : 'none' }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>

                  {/* Expanded study tip */}
                  {expandedQ === idx && (
                    <div
                      className="mt-3 ml-10 rounded-xl p-3 text-xs text-gray-500"
                      style={{ background: accent, border: `1px solid ${border}` }}
                    >
                      <p className="font-bold text-gray-600 mb-1">💡 Study Tip</p>
                      <p>
                        Review pathophysiology, clinical features, investigations, and
                        management for this topic. Use standard textbooks and make concise notes.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className="px-4 sm:px-6 py-3 border-t border-gray-100 flex items-center justify-between"
              style={{ background: accent }}
            >
              <p className="text-xs text-gray-400 font-medium">
                {questions.length} question{questions.length !== 1 ? 's' : ''}
                {totalMarks > 0 && ` · ${totalMarks} marks`}
              </p>
              <p className="text-xs text-gray-400 font-medium">
                NBE · {decodedSession} {year}
              </p>
            </div>
          </div>
        )}

        <div className="h-12" />
      </div>
    </div>
  );
}
