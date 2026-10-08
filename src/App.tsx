import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Navbar, ToastContainer } from './components/UI';
import HomePage from './pages/HomePage';
import { LoginPage, SignupPage, RequestAccessPage } from './pages/AuthPages';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import AttendancePage from './pages/AttendancePage';
import AcademicsPage from './pages/AcademicsPage';
import SubjectsPage from './pages/SubjectsPage';

function AppContent() {
  const { isAuthenticated, user, addNotification } = useApp();
  const [currentPage, setCurrentPage] = useState('home');
  const notifiedUsers = useRef(new Set<string>());

  useEffect(() => {
    if (!isAuthenticated) setCurrentPage('home');
    else if (currentPage === 'home') setCurrentPage('dashboard');
  }, [isAuthenticated]);

  // Add initial notifications when user logs in
  useEffect(() => {
    if (isAuthenticated && user && !notifiedUsers.current.has(user.id)) {
      const timer = setTimeout(() => {
        notifiedUsers.current.add(user.id);
        addNotification({ title: 'Welcome!', message: `Welcome back, ${user.name}! You have new updates.`, type: 'info', page: 'dashboard' });
        addNotification({ title: 'Assignment Due', message: 'Database Systems assignment is due tomorrow.', type: 'warning', page: 'academics' });
        addNotification({ title: 'New Message', message: 'Prof. Kumar sent you a message.', type: 'info', page: 'messages' });
        addNotification({ title: 'Score Updated', message: 'Your Algorithms quiz score has been published.', type: 'success', page: 'academics' });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user?.id]);

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Public pages
  if (!isAuthenticated) {
    switch (currentPage) {
      case 'login':
        return <><ToastContainer /><LoginPage onNavigate={navigate} /></>;
      case 'signup':
        return <><ToastContainer /><SignupPage onNavigate={navigate} /></>;
      case 'request-access':
        return <><ToastContainer /><RequestAccessPage onNavigate={navigate} /></>;
      default:
        return <><ToastContainer /><HomePage onNavigate={navigate} isAuthenticated={false} /></>;
    }
  }

  // Protected pages
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <DashboardPage onNavigate={navigate} />;
      case 'dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case 'students':
        return user?.role === 'student' ? <DashboardPage onNavigate={navigate} /> : <StudentsPage onNavigate={navigate} />;
      case 'subjects':
        return <SubjectsPage />;
      case 'attendance':
        return <AttendancePage onNavigate={navigate} />;
      case 'academics':
        return user?.role === 'student' ? <AcademicsPage onNavigate={navigate} /> : <SubjectsPage />;
      case 'messages':
        return <MessagesPage />;
      case 'profile':
        return <ProfilePage onNavigate={navigate} />;
      default:
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar currentPage={currentPage} onNavigate={navigate} />
      <main key={currentPage} className="pb-8 page-enter">{renderPage()}</main>
      <ToastContainer />
      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-6 px-4 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          🌿 Verya Student Success — Empowering academic excellence
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
