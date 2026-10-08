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
  year?: number;
  section?: string;
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
  page?: string;
}

export interface CourseAttendance {
  course: string;
  attendance: number;
  teacher: string;
  classTime: string;
  sessions: { date: string; time: string; status: 'present' | 'absent' }[];
}

export interface AssessmentRecord {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  type: 'assignment' | 'lab' | 'assessment';
  score: number;
  maxScore: number;
  status: string;
  dueDate: string;
  dueTime: string;
}

export interface StudentScore {
  studentId: string;
  overall: number;
  subjects: {
    name: string;
    marks: number;
    maxMarks: number;
    grade: string;
    credits: number;
    labs: number;
    assignments: number;
    assessment: number;
    midSem: number;
    finals: number;
  }[];
  assignments: AssessmentRecord[];
  labs: AssessmentRecord[];
  attendance: number;
  attendanceByCourse: CourseAttendance[];
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
  updateAssessment: (studentId: string, assessmentId: string, updates: { score?: number; status?: string }) => boolean;
  updateSubjectComponent: (studentId: string, subject: string, component: 'labs' | 'assignments' | 'assessment' | 'midSem' | 'finals', value: number) => boolean;
  updateAttendance: (studentId: string, course: string, date: string, status: 'present' | 'absent') => boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const createId = () => (
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
);

const normalizeUser = (user: User): User => ({
  ...user,
  courses: user.courses ?? (user.role === 'student'
    ? ['Data Structures', 'Algorithms', 'Database Systems']
    : user.role === 'teacher' ? ['Data Structures'] : undefined),
  year: user.year ?? (user.role === 'student' ? 1 : undefined),
  section: user.section ?? (user.role === 'student' ? 'A' : undefined),
});

const courseTeachers: Record<string, string> = {
  'Data Structures': 'Prof. Kumar',
  Algorithms: 'Dr. Sharma',
  'Database Systems': 'Prof. Patel',
  'Operating Systems': 'Prof. Reddy',
  'Computer Networks': 'Prof. Nair',
};

const getCourseTeacher = (course: string) => courseTeachers[course] || `Prof. ${course.split(' ')[0]}`;

const formatLocalDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

// Local storage helpers
const getUsers = (): User[] => {
  const data = localStorage.getItem('verdant_users');
  return data ? (JSON.parse(data) as User[]).map(normalizeUser) : [];
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
    year: Math.floor(i / 7) + 1,
    section: ['A', 'B', 'C'][i % 3],
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
    const teacherFor = getCourseTeacher;
    const subjectScores = subjects.map((name, index) => {
      const components = {
        labs: Math.floor(55 + Math.random() * 45),
        assignments: Math.floor(55 + Math.random() * 45),
        assessment: Math.floor(55 + Math.random() * 45),
        midSem: Math.floor(45 + Math.random() * 55),
        finals: Math.floor(45 + Math.random() * 55),
      };
      const marks = Math.round(
        components.labs * 0.1 +
        components.assignments * 0.15 +
        components.assessment * 0.1 +
        components.midSem * 0.25 +
        components.finals * 0.4
      );
      return {
        name,
        marks,
        maxMarks: 100,
        grade: marks >= 85 ? 'A+' : marks >= 75 ? 'A' : marks >= 65 ? 'B+' : marks >= 55 ? 'B' : 'C',
        credits: index < 2 ? 4 : 3,
        ...components,
      };
    });
    const overall = Math.round(subjectScores.reduce((total, subject) => total + subject.marks, 0) / subjectScores.length);
    const attendance = Math.floor(65 + Math.random() * 35);
    const makeAssessments = (names: string[], type: AssessmentRecord['type']) => names.map((name, index) => {
      const subject = subjects[(index + (type === 'lab' ? 1 : 0)) % subjects.length];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + index - (index === 0 ? 1 : 0));
      return {
        id: `${s.id}-${type}-${index + 1}`,
        name,
        subject,
        teacher: teacherFor(subject),
        type,
        score: Math.floor(type === 'lab' ? 45 + Math.random() * 55 : 35 + Math.random() * 66),
        maxScore: 100,
        status: Math.random() > (type === 'lab' ? 0.15 : 0.2) ? (type === 'lab' ? 'completed' : 'submitted') : 'pending',
        dueDate: formatLocalDate(dueDate),
        dueTime: ['09:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'][index % 4],
      };
    });
    scores[s.id] = {
      studentId: s.id,
      overall,
      subjects: subjectScores,
      assignments: makeAssessments(assignments, 'assignment'),
      labs: makeAssessments(labs, 'lab'),
      attendance,
      attendanceByCourse: buildAttendanceRecords(attendance, subjects, teacherFor),
      trend: Array.from({ length: 6 }, () => Math.floor(50 + Math.random() * 45))
    };
  });
  return scores;
};

const buildAttendanceRecords = (
  attendance: number,
  courses: string[],
  getTeacher: (course: string) => string = getCourseTeacher
): CourseAttendance[] => {
  const today = new Date();
  const sessions = Array.from({ length: 20 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - index * 2);
    return formatLocalDate(date);
  });

  return courses.map((course, courseIndex) => {
    const targetAttendance = Math.max(55, Math.min(100, attendance + ((courseIndex % 3) - 1) * 5));
    const presentCount = Math.round(targetAttendance * sessions.length / 100);
    const courseAttendance = Math.round(presentCount * 100 / sessions.length);
    const presentIndexes = new Set(
      Array.from({ length: presentCount }, (_, index) => Math.floor(index * sessions.length / presentCount))
    );
    return {
      course,
      attendance: courseAttendance,
      teacher: getTeacher(course),
      classTime: ['09:00 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM'][courseIndex % 5],
      sessions: sessions.map((date, index) => ({
        date,
        time: ['09:00 AM', '11:00 AM', '01:30 PM', '03:00 PM'][courseIndex % 4],
        status: presentIndexes.has(index) ? 'present' : 'absent',
      })),
    };
  });
};

const loadScores = (): Record<string, StudentScore> | null => {
  const saved = localStorage.getItem('verdant_scores');
  if (!saved) return null;

  const scores = JSON.parse(saved) as Record<string, StudentScore>;
  const migrated = Object.fromEntries(Object.entries(scores).map(([id, score]) => {
    const subjects = score.subjects.map((subject, index) => ({
      ...subject,
      credits: subject.credits ?? (index < 2 ? 4 : 3),
      labs: subject.labs ?? subject.marks,
      assignments: subject.assignments ?? subject.marks,
      assessment: subject.assessment ?? subject.marks,
      midSem: subject.midSem ?? subject.marks,
      finals: subject.finals ?? subject.marks,
    }));
    const migrateRecords = (records: Partial<AssessmentRecord>[], type: AssessmentRecord['type']) =>
      records.map((record, index) => {
        const subject = record.subject ?? subjects[index % subjects.length]?.name ?? 'General';
        const needsMetadata = !record.teacher || record.teacher === 'Course Instructor';
        return {
        id: record.id ?? `${id}-${type}-${index + 1}`,
        name: record.name ?? `${type} ${index + 1}`,
        subject,
        teacher: getCourseTeacher(subject),
        type,
        score: record.score ?? 0,
        maxScore: record.maxScore ?? 100,
        status: record.status ?? 'pending',
        dueDate: needsMetadata || !record.dueDate ? formatLocalDate(new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000)) : record.dueDate,
        dueTime: needsMetadata || !record.dueTime ? ['09:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'][index % 4] : record.dueTime,
      };
    });

    const fallbackAttendance = buildAttendanceRecords(score.attendance, subjects.map(subject => subject.name));
    const attendanceByCourse = (score.attendanceByCourse ?? fallbackAttendance).map((course, index) => ({
      ...course,
      teacher: fallbackAttendance.find(item => item.course === course.course)?.teacher ?? getCourseTeacher(course.course),
      classTime: course.classTime ?? fallbackAttendance[index]?.classTime ?? '09:00 AM',
      sessions: course.sessions.map((session, sessionIndex) => ({
        ...session,
        time: session.time ?? ['09:00 AM', '11:00 AM', '01:30 PM', '03:00 PM'][sessionIndex % 4],
      })),
    }));

    return [id, {
      ...score,
      subjects,
      assignments: migrateRecords(score.assignments ?? [], 'assignment'),
      labs: migrateRecords(score.labs ?? [], 'lab'),
      attendanceByCourse,
    }];
  }));
  localStorage.setItem('verdant_scores', JSON.stringify(migrated));
  return migrated;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('verdant_current_user');
    return saved ? normalizeUser(JSON.parse(saved) as User) : null;
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('verdant_theme') as 'light' | 'dark') || 'light';
  });
  const [messages, setMessages] = useState<Message[]>(getMessages);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [students, setStudents] = useState<User[]>(() => {
    const saved = localStorage.getItem('verdant_students');
    if (saved) {
      const loaded = JSON.parse(saved) as User[];
      const migrated = loaded.map((student, index) => ({
        ...student,
        year: student.year ?? Math.min(4, Math.floor(index / 7) + 1),
        section: student.section ?? ['A', 'B', 'C'][index % 3],
      }));
      localStorage.setItem('verdant_students', JSON.stringify(migrated));
      return migrated;
    }
    const generated = generateSampleStudents();
    localStorage.setItem('verdant_students', JSON.stringify(generated));
    return generated;
  });
  const [studentScores, setStudentScores] = useState<Record<string, StudentScore>>(() => {
    const saved = loadScores();
    if (saved) return saved;
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
      const normalized = normalizeUser(found);
      setUser(normalized);
      setNotifications([]);
      localStorage.setItem('verdant_current_user', JSON.stringify(normalized));
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
        courses: role === 'student' ? ['Data Structures', 'Algorithms', 'Database Systems'] : role === 'teacher' ? ['Data Structures'] : undefined,
        year: role === 'student' ? 2 : undefined,
        section: role === 'student' ? 'A' : undefined,
        gpa: role === 'student' ? 8.5 : undefined,
        semester: role === 'student' ? 5 : undefined,
      };
      setUser(demoUser);
      setNotifications([]);
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
      courses: role === 'student' ? ['Data Structures'] : role === 'teacher' ? ['Data Structures'] : undefined,
      year: role === 'student' ? 1 : undefined,
      section: role === 'student' ? 'A' : undefined,
      gpa: role === 'student' ? 0 : undefined,
      semester: role === 'student' ? 1 : undefined,
      joinDate: new Date().toISOString().split('T')[0],
    };
    users.push(newUser);
    saveUsers(users);
    setUser(newUser);
    setNotifications([]);
    localStorage.setItem('verdant_current_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    setNotifications([]);
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

  const updateAssessment = (
    studentId: string,
    assessmentId: string,
    updates: { score?: number; status?: string }
  ) => {
    if (user?.role !== 'teacher' && user?.role !== 'admin') return false;
    const student = students.find(candidate => candidate.id === studentId);
    const currentScore = studentScores[studentId];
    if (!student || !currentScore) return false;

    const assessment = [...currentScore.assignments, ...currentScore.labs]
      .find(record => record.id === assessmentId);
    if (!assessment || !student.courses?.includes(assessment.subject) ||
      (user.role === 'teacher' && !user.courses?.includes(assessment.subject))) return false;
    if (updates.score !== undefined && (!Number.isFinite(updates.score) || updates.score < 0 || updates.score > assessment.maxScore)) return false;

    const updateRecords = (records: AssessmentRecord[]) => records.map(record =>
      record.id === assessmentId ? { ...record, ...updates } : record
    );
    const nextStudentScore = {
      ...currentScore,
      subjects: currentScore.subjects.map(subject => ({ ...subject })),
      assignments: updateRecords(currentScore.assignments),
      labs: updateRecords(currentScore.labs),
    };
    const subject = nextStudentScore.subjects.find(item => item.name === assessment.subject);
    if (subject && updates.score !== undefined) {
      const matchingRecords = nextStudentScore.assignments.filter(record => record.subject === subject.name);
      if (matchingRecords.length && (assessment.type === 'assignment' || assessment.type === 'assessment')) {
        subject.assignments = Math.round(matchingRecords.reduce((total, record) => total + record.score, 0) / matchingRecords.length);
      }
      const matchingLabs = nextStudentScore.labs.filter(record => record.subject === subject.name);
      if (matchingLabs.length && assessment.type === 'lab') {
        subject.labs = Math.round(matchingLabs.reduce((total, record) => total + record.score, 0) / matchingLabs.length);
      }
      subject.marks = Math.round(
        subject.labs * 0.1 +
        subject.assignments * 0.15 +
        subject.assessment * 0.1 +
        subject.midSem * 0.25 +
        subject.finals * 0.4
      );
      subject.grade = subject.marks >= 85 ? 'A+' : subject.marks >= 75 ? 'A' : subject.marks >= 65 ? 'B+' : subject.marks >= 55 ? 'B' : 'C';
      nextStudentScore.overall = Math.round(nextStudentScore.subjects.reduce((total, item) => total + item.marks, 0) / nextStudentScore.subjects.length);
    }

    const nextScores = { ...studentScores, [studentId]: nextStudentScore };
    setStudentScores(nextScores);
    localStorage.setItem('verdant_scores', JSON.stringify(nextScores));
    return true;
  };

  const updateSubjectComponent = (
    studentId: string,
    subjectName: string,
    component: 'labs' | 'assignments' | 'assessment' | 'midSem' | 'finals',
    value: number
  ) => {
    if (user?.role !== 'teacher' && user?.role !== 'admin') return false;
    if (!Number.isFinite(value) || value < 0 || value > 100) return false;
    if (user.role === 'teacher' && !user.courses?.includes(subjectName)) return false;
    const score = studentScores[studentId];
    const student = students.find(candidate => candidate.id === studentId);
    const subject = score?.subjects.find(item => item.name === subjectName);
    if (!student || !student.courses?.includes(subjectName) || !score || !subject) return false;

    const subjects = score.subjects.map(item => {
      if (item.name !== subjectName) return item;
      const updated = { ...item, [component]: value };
      updated.marks = Math.round(
        updated.labs * 0.1 +
        updated.assignments * 0.15 +
        updated.assessment * 0.1 +
        updated.midSem * 0.25 +
        updated.finals * 0.4
      );
      updated.grade = updated.marks >= 85 ? 'A+' : updated.marks >= 75 ? 'A' : updated.marks >= 65 ? 'B+' : updated.marks >= 55 ? 'B' : 'C';
      return updated;
    });
    const updatedScore = {
      ...score,
      subjects,
      overall: Math.round(subjects.reduce((total, item) => total + item.marks, 0) / subjects.length),
    };
    const updatedScores = { ...studentScores, [studentId]: updatedScore };
    setStudentScores(updatedScores);
    localStorage.setItem('verdant_scores', JSON.stringify(updatedScores));
    return true;
  };

  const updateAttendance = (studentId: string, courseName: string, date: string, status: 'present' | 'absent') => {
    if (user?.role !== 'teacher' && user?.role !== 'admin') return false;
    const student = students.find(candidate => candidate.id === studentId);
    const score = studentScores[studentId];
    const course = score?.attendanceByCourse.find(item => item.course === courseName);
    if (!student || !student.courses?.includes(courseName) || !course ||
      (user.role === 'teacher' && !user.courses?.includes(courseName)) ||
      !course.sessions.some(session => session.date === date)) return false;

    const sessions = course.sessions.map(session => session.date === date ? { ...session, status } : session);
    const updatedCourse = {
      ...course,
      sessions,
      attendance: Math.round(sessions.filter(session => session.status === 'present').length * 100 / sessions.length),
    };
    const attendanceByCourse = score.attendanceByCourse.map(item => item.course === courseName ? updatedCourse : item);
    const updatedScore = {
      ...score,
      attendanceByCourse,
      attendance: Math.round(attendanceByCourse.reduce((total, item) => total + item.attendance, 0) / attendanceByCourse.length),
    };
    const updatedScores = { ...studentScores, [studentId]: updatedScore };
    setStudentScores(updatedScores);
    localStorage.setItem('verdant_scores', JSON.stringify(updatedScores));
    return true;
  };

  const sendMessage = (to: string, text: string) => {
    if (!user) return;
    const msg: Message = {
      id: createId(),
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
    const notif: Notification = { ...n, id: createId(), timestamp: Date.now(), read: false };
    setNotifications(prev => [notif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const addToast = (message: string, type: Toast['type']) => {
    const id = createId();
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
      updateAssessment,
      updateSubjectComponent,
      updateAttendance,
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
