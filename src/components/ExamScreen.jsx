import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuestions } from '../utils/dataParser';
import { SUBJECTS } from '../data/subjects';

export default function ExamScreen({ examType, tree }) {
  const { subjectName, year, session, paper } = useParams();
  const [expandedQ, setExpandedQ] = useState(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const subject = decodeURIComponent(subjectName);
  const decodedSession = decodeURIComponent(session);

  const isDNB = examType === 'DNB';
  const primaryColor = isDNB ? '#EC4899' : '#3B82F6';
  const accentBg = isDNB ? '#FCE7F3' : '#DBEAFE';
  const softBg = isDNB ? '#FDF2F8' : '#EFF6FF';
  const borderColor = isDNB ? 'rgba(244,114,182,0.2)' : 'rgba(96,165,250,0.2)';

  const subjectInfo = SUBJECTS.find(s => s.name === subject);
  const questions = getQuestions(tree, subject, examType, year, decodedSession, parseInt(paper, 10));
  const totalMarks = questions.reduce((a, q) => a + (q.marks || 5), 0);

  // PDF link: if first question has a pdfLink, use it; else derive from structure
  const pdfLink = questions[0]?.pdfLink || null;

  const handlePrint = () => window.print();

  return (
    <div className="page-enter pt-[68px] pb-12 px-4 max-w-3xl mx-auto">

      {/* ── PDF Modal Viewer ─────────────────────────────── */}
      {pdfOpen && pdfLink && (
        <div
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold text-sm truncate max-w-xs">
                {subject} — Paper {paper} ({decodedSession} {year})
              </span>
              <span className="badge text-white" style={{ background: primaryColor }}>
                {examType}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={pdfLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white transition-opacity hover:opacity-80"
                style={{ background: primaryColor }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Open in New Tab
              </a>
              <button
                onClick={() => setPdfOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-white transition-opacity hover:opacity-70"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          {/* iframe */}
          <iframe
            src={pdfLink}
            className="flex-1 w-full border-0"
            title={`${subject} Paper ${paper}`}
          />
        </div>
      )}

      {/* ── Paper header card ────────────────────────────── */}
      <div className="exam-paper rounded-2xl overflow-hidden mb-5 mt-4">
        {/* Color strip */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${isDNB ? '#9333EA' : '#6366F1'})` }} />

        <div className="p-5">
          {/* Institution header */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="text-2xl">{subjectInfo?.icon || '📚'}</div>
              <h2 className="font-black text-gray-800 text-lg leading-tight">
                National Board of Examinations
              </h2>
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">
              {examType === 'DNB' ? 'Diplomate of National Board' : 'Diploma of National Board'}
            </p>
          </div>

          <div className="border-t border-dashed border-gray-200 my-4" />

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
            {[
              { label: 'Subject', value: subject },
              { label: 'Session', value: `${decodedSession} ${year}` },
              { label: 'Paper', value: `Paper ${paper}` },
              { label: 'Total Marks', value: `${totalMarks}` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-2.5" style={{ background: softBg }}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="font-bold text-gray-800 text-sm mt-0.5 leading-snug">{value}</p>
              </div>
            ))}
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {/* View Original PDF Button */}
              {pdfLink ? (
                <button
                  onClick={() => setPdfOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: primaryColor }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                    <line x1="9" y1="11" x2="15" y2="11" />
                  </svg>
                  View Original PDF
                </button>
              ) : (
                <span className="text-xs text-gray-400 font-medium italic">
                  PDF not linked — <a href="https://natboard.edu.in/dnb_old_qp" target="_blank" rel="noreferrer" className="underline">browse NBEMS</a>
                </span>
              )}
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:opacity-80"
              style={{ background: accentBg, color: primaryColor }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>

      {/* ── Instructions ─────────────────────────────────── */}
      <div className="rounded-2xl p-4 mb-5 text-xs" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <p className="font-bold text-amber-800 mb-1.5">📌 General Instructions</p>
        <ul className="text-amber-700 space-y-1 list-disc list-inside">
          <li>All questions carry marks as specified against each.</li>
          <li>Read each question carefully before answering.</li>
          <li>Diagrams and flowcharts should be neat and labeled.</li>
        </ul>
      </div>

      {/* ── Questions ─────────────────────────────────────── */}
      {questions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500 font-medium">No questions found for this paper</p>
          {pdfLink && (
            <button
              onClick={() => setPdfOpen(true)}
              className="mt-4 text-sm font-semibold px-4 py-2 rounded-xl text-white"
              style={{ background: primaryColor }}
            >
              View Original PDF Instead
            </button>
          )}
        </div>
      ) : (
        <div className="exam-paper rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="inline-block w-4 h-0.5 rounded-full" style={{ background: primaryColor }} />
              Questions
              <span className="inline-block w-4 h-0.5 rounded-full" style={{ background: primaryColor }} />
            </h3>

            <div className="space-y-0 divide-y divide-gray-100">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className={`question-item ${isDNB ? '' : 'dipnb'} py-4 px-2 cursor-pointer`}
                  onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                      style={{ background: primaryColor }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm font-medium leading-relaxed">{q.questionText}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="badge text-white"
                          style={{ background: q.marks >= 10 ? primaryColor : accentBg, color: q.marks >= 10 ? 'white' : primaryColor }}
                        >
                          {q.marks} mark{q.marks !== 1 ? 's' : ''}
                        </span>
                        {q.marks >= 10 && (
                          <span className="text-[10px] font-semibold text-gray-400">Long Answer</span>
                        )}
                      </div>
                    </div>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"
                      className="shrink-0 mt-1.5 transition-transform duration-200"
                      style={{ transform: expandedQ === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>

                  {expandedQ === idx && (
                    <div className="mt-3 ml-10 rounded-xl p-3 text-xs text-gray-500 font-medium"
                      style={{ background: softBg, border: `1px solid ${borderColor}` }}>
                      <p className="font-semibold text-gray-600 mb-1">💡 Study Tip</p>
                      <p>Refer to your standard textbook and note the key points for this topic. Focus on pathophysiology, clinical presentation, and management principles.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium">{questions.length} questions · {totalMarks} marks</p>
            <p className="text-xs text-gray-400 font-medium">NBE · {decodedSession} {year}</p>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .header-blur, .back-btn, button { display: none !important; }
          body { background: white; }
          .exam-paper { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
