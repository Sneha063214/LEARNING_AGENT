import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { api, getCurrentUser, setCurrentUser } from '../services/api';

const PAGE_TITLES = {
  '/dashboard': 'Student Dashboard',
  '/diagnostic': 'Initial Knowledge Diagnostic',
  '/gaps': 'Knowledge Gap Analysis',
  '/roadmap': 'Personalized Adaptive Roadmap',
  '/tutor': 'AI Learning Assistant',
  '/quiz': 'Interactive Topic Quizzes',
  '/analytics': 'Performance Analytics',
  '/resources': 'Curated Learning Resources',
  '/profile': 'Student Profile & Settings',
};

export default function Layout({ activeSubjectId, setActiveSubjectId }) {
  const [user, setUser] = useState(getCurrentUser());
  const location = useLocation();

  useEffect(() => {
    api.getProfile()
      .then((data) => {
        setUser(data);
        setCurrentUser(data);
      })
      .catch(console.error);
  }, []);

  const pageTitle = PAGE_TITLES[location.pathname] || 'LearnPath AI';

  useEffect(() => {
    document.title = `${pageTitle} | LearnPath AI`;
  }, [pageTitle]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeSubjectId={activeSubjectId}
          onSubjectChange={setActiveSubjectId}
          pageTitle={pageTitle}
        />
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Navigated to {pageTitle}
        </div>
        <main
          id="main-content"
          role="main"
          aria-label={pageTitle}
          tabIndex={-1}
          className="flex-1 p-8 overflow-y-auto focus:outline-none"
        >
          <Outlet context={{ activeSubjectId, setActiveSubjectId, user, setUser }} />
        </main>
      </div>
    </div>
  );
}