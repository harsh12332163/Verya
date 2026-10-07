import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Navbar, ToastContainer } from './components/UI';
import HomePage from './pages/HomePage';
import { LoginPage, SignupPage, RequestAccessPage } from './pages/AuthPages';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import QuotesPage from './pages/QuotesPage';

function AppContent() {
  const { isAuthenticated, user, addNotification } = useApp();
  const [currentPage, setCurrentPage] = useState('home');

  // Add initial notifications when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      const timer = setTimeout(() => {
        addNotification({ title: 'Welcome!', message: `Welcome back, ${user.name}! You have new updates.`, type: 'info' });
        addNotification({ title: 'Assignment Due', message: 'Database Systems assignment is due tomorrow.', type: 'warning' });
        addNotification({ title: 'New Message', message: 'Prof. Kumar sent you a message.', type: 'info' });
        addNotification({ title: 'Score Updated', message: 'Your Algorithms quiz score has been published.', type: 'success' });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        return <HomePage onNavigate={navigate} isAuthenticated={true} />;
      case 'dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case 'students':
        return <StudentsPage onNavigate={navigate} />;
      case 'messages':
        return <MessagesPage />;
      case 'profile':
        return <ProfilePage />;
      case 'quotes':
        return <QuotesPage />;
      default:
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar currentPage={currentPage} onNavigate={navigate} />
      <main className="pb-8">{renderPage()}</main>
      <ToastContainer />
      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-6 px-4 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          🌿 Verdant Student Success — Empowering academic excellence
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
