import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSheetData } from './hooks/useSheetData';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import SessionScreen from './components/SessionScreen';
import PaperScreen from './components/PaperScreen';
import ExamScreen from './components/ExamScreen';

function AppContent() {
  const [examType, setExamType] = useState('DNB');
  const { tree, loading, usingDemo, cacheInfo, refresh } = useSheetData();

  const isDNB = examType === 'DNB';

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#F4F6FB',
        transition: 'background 0.4s ease',
      }}
    >
      <Header
        examType={examType}
        onToggle={() => setExamType(t => t === 'DNB' ? 'DipNB' : 'DNB')}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomeScreen
              examType={examType}
              tree={tree}
              loading={loading}
              usingDemo={usingDemo}
              cacheInfo={cacheInfo}
              refresh={refresh}
            />
          }
        />
        <Route
          path="/subject/:subjectName"
          element={<SessionScreen examType={examType} tree={tree} loading={loading} />}
        />
        <Route
          path="/subject/:subjectName/session/:year/:session"
          element={<PaperScreen examType={examType} tree={tree} />}
        />
        <Route
          path="/subject/:subjectName/session/:year/:session/paper/:paper"
          element={<ExamScreen examType={examType} tree={tree} />}
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
