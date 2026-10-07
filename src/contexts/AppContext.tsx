import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  avatar?: string;
  department?: string;
  studentId?: string;
  phone?: string;
  bio?: string;
  joinDate?: string;
  gpa?: number;
  semester?: number;
  courses?: string[];
}

export interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
}

export interface StudentScore {
  studentId: string;
  overall: number;
  subjects: { name: string; marks: number; maxMarks: number; grade: string }[];
  assignments: { name: string; score: number; maxScore: number; status: string }[];
  labs: { name: string; score: number; maxScore: number; status: string }[];
  attendance: number;
  trend: number[];
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// Context
interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  messages: Message[];
  sendMessage: (to: string, text: string) => void;
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  students: User[];
  studentScores: Record<string, StudentScore>;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// Local storage helpers
const getUsers = (): User[] => {
  const data = localStorage.getItem('verdant_users');
  return data ? JSON.parse(data) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem('verdant_users', JSON.stringify(users));
};

const getMessages = (): Message[] => {
  const data = localStorage.getItem('verdant_messages');
  return data ? JSON.parse(data) : [];
};

const saveMessages = (messages: Message[]) => {
  localStorage.setItem('verdant_messages', JSON.stringify(messages));
};

// Generate sample students
const generateSampleStudents = (): User[] => {
  const names = [
    'Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Ananya Singh', 'Vikram Reddy',
    'Meera Joshi', 'Arjun Nair', 'Kavya Iyer', 'Rahul Verma', 'Diya Kapoor',
    'Aditya Mishra', 'Sneha Rao', 'Karan Desai', 'Pooja Menon', 'Siddharth Kumar',
    'Nisha Agarwal', 'Dev Malhotra', 'Riya Chopra', 'Amit Saxena', 'Tanvi Bhatt',
    'Nikhil Pandey', 'Shreya Thakur', 'Varun Pillai', 'Ishita Banerjee', 'Harsh Jain'
  ];
  const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics'];
  
  return names.map((name, i) => ({
    id: `STU${String(1001 + i).padStart(4, '0')}`,
    name,
    email: `${name.split(' ')[0].toLowerCase()}@university.edu`,
    role: 'student' as const,
    department: departments[i % departments.length],
    studentId: `STU${String(1001 + i).padStart(4, '0')}`,
    phone: `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
    gpa: +(3 + Math.random() * 1).toFixed(2),
    semester: Math.floor(1 + Math.random() * 8),
    courses: ['Data Structures', 'Algorithms', 'Database Systems'].slice(0, 2 + Math.floor(Math.random() * 2)),
    joinDate: `202${2 + Math.floor(Math.random() * 3)}-0${1 + Math.floor(Math.random() * 8)}-15`
  }));
};

const generateScores = (students: User[]): Record<string, StudentScore> => {
  const scores: Record<string, StudentScore> = {};
  const subjects = ['Data Structures', 'Algorithms', 'Database Systems', 'Operating Systems', 'Computer Networks'];
  const assignments = ['Assignment 1', 'Assignment 2', 'Mid-term Project', 'Lab Report', 'Final Project'];
  const labs = ['Lab 1: Basics', 'Lab 2: Implementation', 'Lab 3: Testing', 'Lab 4: Optimization', 'Lab 5: Advanced'];

  students.forEach(s => {
    const overall = Math.floor(55 + Math.random() * 40);
    scores[s.id] = {
      studentId: s.id,
      overall,
      subjects: subjects.map(sub => ({
        name: sub,
        marks: Math.floor(40 + Math.random() * 55),
        maxMarks: 100,
        grade: overall >= 85 ? 'A+' : overall >= 75 ? 'A' : overall >= 65 ? 'B+' : overall >= 55 ? 'B' : 'C'
      })),
      assignments: assignments.map(a => ({
        name: a,
        score: Math.floor(50 + Math.random() * 50),
        maxScore: 100,
        status: Math.random() > 0.2 ? 'submitted' : 'pending'
      })),
      labs: labs.map(l => ({
        name: l,
        score: Math.floor(60 + Math.random() * 40),
        maxScore: 100,
        status: Math.random() > 0.15 ? 'completed' : 'in-progress'
      })),
      attendance: Math.floor(65 + Math.random() * 35),
      trend: Array.from({ length: 6 }, () => Math.floor(50 + Math.random() * 45))
    };
  });
  return scores;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('verdant_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('verdant_theme') as 'light' | 'dark') || 'light';
  });
  const [messages, setMessages] = useState<Message[]>(getMessages);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [students, setStudents] = useState<User[]>(() => {
    const saved = localStorage.getItem('verdant_students');
    if (saved) return JSON.parse(saved);
    const generated = generateSampleStudents();
    localStorage.setItem('verdant_students', JSON.stringify(generated));
    return generated;
  });
  const [studentScores, setStudentScores] = useState<Record<string, StudentScore>>(() => {
    const saved = localStorage.getItem('verdant_scores');
    if (saved) return JSON.parse(saved);
    const generated = generateScores(students);
    localStorage.setItem('verdant_scores', JSON.stringify(generated));
    return generated;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('verdant_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.role === role);
    if (found) {
      setUser(found);
      localStorage.setItem('verdant_current_user', JSON.stringify(found));
      return true;
    }
    // Demo login
    if (password === 'demo123' || password.length >= 6) {
      const demoUser: User = {
        id: role === 'admin' ? 'ADM001' : role === 'teacher' ? 'TCH001' : 'STU1001',
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email,
        role: role as User['role'],
        department: role === 'student' ? 'Computer Science' : 'Faculty',
        studentId: role === 'student' ? 'STU1001' : undefined,
        gpa: role === 'student' ? 8.5 : undefined,
        semester: role === 'student' ? 5 : undefined,
      };
      setUser(demoUser);
      localStorage.setItem('verdant_current_user', JSON.stringify(demoUser));
      if (!users.find(u => u.email === email)) {
        users.push(demoUser);
        saveUsers(users);
      }
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
    const users = getUsers();
    if (users.find(u => u.email === email)) return false;
    const newUser: User = {
      id: `${role === 'admin' ? 'ADM' : role === 'teacher' ? 'TCH' : 'STU'}${String(users.length + 1).padStart(3, '0')}`,
      name,
      email,
      role: role as User['role'],
      department: role === 'student' ? 'Computer Science' : 'Faculty',
      studentId: role === 'student' ? `STU${String(2000 + users.length).padStart(4, '0')}` : undefined,
      gpa: role === 'student' ? 0 : undefined,
      semester: role === 'student' ? 1 : undefined,
      joinDate: new Date().toISOString().split('T')[0],
    };
    users.push(newUser);
    saveUsers(users);
    setUser(newUser);
    localStorage.setItem('verdant_current_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('verdant_current_user');
  };

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('verdant_current_user', JSON.stringify(updated));
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) { users[idx] = updated; saveUsers(users); }
  }, [user]);

  const sendMessage = (to: string, text: string) => {
    if (!user) return;
    const msg: Message = {
      id: Date.now().toString(),
      from: user.id,
      to,
      text,
      timestamp: Date.now(),
      read: false
    };
    const updated = [...messages, msg];
    setMessages(updated);
    saveMessages(updated);
  };

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notif: Notification = { ...n, id: Date.now().toString(), timestamp: Date.now(), read: false };
    setNotifications(prev => [notif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <AppContext.Provider value={{
      user, isAuthenticated: !!user, theme, toggleTheme,
      login, signup, logout, updateUser,
      messages, sendMessage,
      notifications, addNotification, markNotificationRead,
      toasts, addToast, removeToast,
      students, studentScores,
      sidebarOpen, setSidebarOpen
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
