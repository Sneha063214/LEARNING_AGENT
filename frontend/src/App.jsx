import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import DiagnosticPage from './pages/DiagnosticPage';
import GapAnalysisPage from './pages/GapAnalysisPage';
import RoadmapPage from './pages/RoadmapPage';
import AITutorPage from './pages/AITutorPage';
import QuizPage from './pages/QuizPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ResourcesPage from './pages/ResourcesPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const [activeSubjectId, setActiveSubjectId] = useState(1);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected Dashboard Experience */}
        <Route
          element={
            <Layout
              activeSubjectId={activeSubjectId}
              setActiveSubjectId={setActiveSubjectId}
            />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="/gaps" element={<GapAnalysisPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/tutor" element={<AITutorPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
