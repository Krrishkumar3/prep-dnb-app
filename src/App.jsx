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
        background: isDNB
          ? 'linear-gradient(160deg, #FDF2F8 0%, #F9FAFB 60%, #F0F7FF 100%)'
          : 'linear-gradient(160deg, #EFF6FF 0%, #F9FAFB 60%, #FDF2F8 100%)',
        transition: 'background 0.5s ease',
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
