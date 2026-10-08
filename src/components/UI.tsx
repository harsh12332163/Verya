import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Search, ChevronDown, Menu, Bell, Moon, Sun, LogOut, User, MessageSquare, BookOpen, BarChart3, Home, Settings, Shield, Users, HelpCircle, ArrowLeft, Award, CalendarDays } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

// Toast Component
export function ToastContainer() {
  const { toasts, removeToast } = useApp();
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast-enter pointer-events-auto p-4 rounded-xl shadow-lg border flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200' :
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200' :
          toast.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-200' :
          'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> :
           toast.type === 'error' ? <AlertCircle size={18} /> :
           toast.type === 'warning' ? <AlertTriangle size={18} /> :
           <Info size={18} />}
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

// Modal Component
export function Modal({ isOpen, onClose, title, children, size = 'md' }: { isOpen: boolean; onClose: () => void; title?: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;
  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative animate-scale-in ${sizeClasses[size]} w-full bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-color)] max-h-[90vh] overflow-hidden flex flex-col`}>
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors" aria-label="Close">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-5 flex-1">{children}</div>
      </div>
    </div>
  );
}

// Confirm Dialog
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-[var(--text-secondary)] mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }} className="btn-primary text-sm">Confirm</button>
      </div>
    </Modal>
  );
}

// Search Bar
export function SearchBar({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:border-moss focus:ring-2 focus:ring-moss/20 transition-all"
        aria-label={placeholder}
      />
    </div>
  );
}

// Tabs Component
export function Tabs({ tabs, activeTab, onChange }: { tabs: { id: string; label: string; icon?: ReactNode }[]; activeTab: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 p-1 bg-[var(--bg-primary)] rounded-xl overflow-x-auto" role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === tab.id
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          {tab.icon}{tab.label}
        </button>
      ))}
    </div>
  );
}

// Accordion
export function Accordion({ items }: { items: { title: string; content: ReactNode }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border border-[var(--border-color)] rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--bg-primary)] transition-colors"
            aria-expanded={openIndex === i}
          >
            <span className="font-medium text-[var(--text-primary)]">{item.title}</span>
            <ChevronDown size={16} className={`transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
          </button>
          {openIndex === i && <div className="px-4 pb-4 text-[var(--text-secondary)] text-sm animate-slide-up">{item.content}</div>}
        </div>
      ))}
    </div>
  );
}

// Card Component
export function Card({ children, className = '', hover = true, onClick }: { children: ReactNode; className?: string; hover?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      onKeyDown={onClick ? event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 ${hover ? 'card-hover' : ''} ${onClick ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// Badge
export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' | 'info' }) {
  const variants = {
    default: 'bg-[var(--bg-primary)] text-[var(--text-secondary)]',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>;
}

// Progress Bar
export function ProgressBar({ value, max = 100, color = 'bg-moss' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full bg-[var(--bg-primary)] rounded-full h-2.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// Stat Card
export function StatCard({ icon, label, value, change, color = 'text-moss', onClick }: { icon: ReactNode; label: string; value: string | number; change?: string; color?: string; onClick?: () => void }) {
  return (
    <Card
      className={`flex items-center gap-4 ${onClick ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss' : ''}`}
      onClick={onClick}
    >
      <div className={`p-3 rounded-xl bg-[var(--bg-primary)] ${color}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--text-muted)] font-medium">{label}</p>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        {change && <p className="text-xs text-moss font-medium mt-0.5">{change}</p>}
      </div>
    </Card>
  );
}

// Click outside hook
function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Notification Panel
export function NotificationPanel({ isOpen, onClose, onNavigate }: { isOpen: boolean; onClose: () => void; onNavigate: (page: string) => void }) {
  const { notifications, markNotificationRead } = useApp();
  const panelRef = useRef<HTMLDivElement>(null);
  useClickOutside(panelRef, onClose);
  if (!isOpen) return null;
  return (
    <div ref={panelRef} className="absolute right-0 top-12 w-80 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in">
      <div className="p-4 border-b border-[var(--border-color)]">
        <h3 className="font-bold text-[var(--text-primary)]">Notifications</h3>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-4 text-center text-sm text-[var(--text-muted)]">No notifications yet</p>
        ) : (
          notifications.slice(0, 10).map(n => (
            <button
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id);
                onClose();
                onNavigate(n.page || 'dashboard');
              }}
              className={`w-full p-3 text-left border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors ${!n.read ? 'bg-moss/5' : ''}`}
            >
              <p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{n.message}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// User Profile Dropdown
export function UserDropdown({ isOpen, onClose, onNavigate }: { isOpen: boolean; onClose: () => void; onNavigate: (page: string) => void }) {
  const { user, logout, theme, toggleTheme } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, () => {
    if (!showLogoutConfirm) onClose();
  });

  if (!isOpen || !user) return null;
  return (
    <>
      <div ref={dropdownRef} className="absolute right-0 top-12 w-64 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in">
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-forest to-moss flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{user.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{user.role}</p>
            </div>
          </div>
        </div>
        <div className="p-2">
          <button onClick={() => { toggleTheme(); }} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-primary)] transition-colors text-sm text-[var(--text-secondary)]">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button onClick={() => { setShowLogoutConfirm(true); }} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm text-red-600 dark:text-red-400">
            <LogOut size={16} />Sign Out
          </button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => { logout(); onClose(); onNavigate('home'); }}
        title="Sign Out"
        message="Are you sure you want to sign out? You'll need to log in again to access your account."
      />
    </>
  );
}

// Navbar
export function Navbar({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const { user, theme, toggleTheme, notifications, sidebarOpen, setSidebarOpen } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (user?.role === 'student') {
        localStorage.setItem('verya_subject_search', searchQuery.trim());
        onNavigate('subjects');
      } else {
        localStorage.setItem('verya_student_search', searchQuery.trim());
        onNavigate('students');
      }
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const navItems = [
    { id: 'dashboard', icon: <BarChart3 size={18} />, label: 'Dashboard' },
    { id: 'subjects', icon: <BookOpen size={18} />, label: 'Subjects' },
    { id: 'attendance', icon: <CalendarDays size={18} />, label: 'Attendance' },
    ...(user?.role !== 'student' ? [{ id: 'students', icon: <Users size={18} />, label: 'Students' }] : []),
    { id: 'messages', icon: <MessageSquare size={18} />, label: 'Messages' },
    { id: 'profile', icon: <User size={18} />, label: 'Profile' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-lg hover:bg-[var(--bg-primary)]" aria-label="Toggle menu">
              <Menu size={20} />
            </button>
            <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <span className="font-bold text-lg gradient-text hidden sm:block">Verya</span>
            </button>
          </div>

          {/* Center Nav - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-moss/10 text-forest dark:text-sage'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                }`}
              >
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors" aria-label="Search">
              <Search size={18} />
            </button>
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors" aria-label="Notifications">
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-coral text-white text-[10px] rounded-full flex items-center justify-center font-bold">{unreadCount}</span>}
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors" aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-8 h-8 rounded-full bg-gradient-to-br from-forest to-moss flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0) || 'U'}
            </button>

            {/* Dropdowns */}
            <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} onNavigate={onNavigate} />
            <UserDropdown isOpen={showUserMenu} onClose={() => setShowUserMenu(false)} onNavigate={onNavigate} />
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="pb-3 animate-slide-up">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                placeholder={user?.role === 'student' ? 'Search your subjects... (Press Enter)' : 'Search students by name, email, or ID... (Press Enter)'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:border-moss focus:ring-2 focus:ring-moss/20 transition-all"
                autoFocus
                aria-label="Search"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {sidebarOpen && (
        <div className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-card)] animate-slide-up">
          <div className="p-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  currentPage === item.id ? 'bg-moss/10 text-forest dark:text-sage' : 'text-[var(--text-muted)] hover:bg-[var(--bg-primary)]'
                }`}
              >
                {item.icon}{item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

// Loading Spinner
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-[var(--border-color)] border-t-moss rounded-full animate-spin`} />
  );
}

// Empty State
export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 rounded-2xl bg-[var(--bg-primary)] mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-4">{description}</p>
      {action && <button onClick={action.onClick} className="btn-primary text-sm">{action.label}</button>}
    </div>
  );
}
