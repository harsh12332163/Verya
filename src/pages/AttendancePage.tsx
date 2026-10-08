import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Badge, Card, ProgressBar } from '../components/UI';
import { getAccessibleScore } from '../utils/academicMetrics';

export default function AttendancePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, students, studentScores, updateAttendance, addToast } = useApp();
  const [selectedCourse, setSelectedCourse] = useState(() => localStorage.getItem('verya_open_course') || (user?.role === 'teacher' ? user.courses?.[0] || '' : ''));
  const [selectedStudent, setSelectedStudent] = useState(() => user?.role === 'student' ? user.id : '');

  useEffect(() => {
    localStorage.removeItem('verya_open_course');
  }, []);

  const courses = useMemo(() => {
    if (user?.role === 'teacher') return user.courses || [];
    if (user?.role === 'student') return user.courses || [];
    return Array.from(new Set(Object.values(studentScores).flatMap(score => score.attendanceByCourse.map(course => course.course))));
  }, [user, studentScores]);
  const course = selectedCourse || courses[0] || '';
  const roster = useMemo(() => students.filter(student =>
    student.courses?.includes(course) && studentScores[student.id]?.attendanceByCourse.some(item => item.course === course)
  ), [students, studentScores, course]);
  const activeStudent = user?.role === 'student'
    ? students.find(student => student.id === user.id)
    : roster.find(student => student.id === selectedStudent) || roster[0];
  const storedScore = activeStudent ? studentScores[activeStudent.id] : undefined;
  const score = storedScore && user?.role === 'student' ? getAccessibleScore(user, storedScore) : storedScore;
  const attendance = score?.attendanceByCourse.find(item => item.course === course);

  const handleStatus = (date: string, status: 'present' | 'absent') => {
    if (!activeStudent || !updateAttendance(activeStudent.id, course, date, status)) {
      addToast('You do not have permission to change attendance for this class.', 'error');
      return;
    }
    addToast('Class attendance updated.', 'success');
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-moss">{user.role === 'student' ? 'My classes' : user.role === 'teacher' ? 'My teaching roster' : 'Institution records'}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Attendance</h1>
          <p className="text-[var(--text-muted)] mt-1">Class-wise attendance totals, instructors, lecture times, and dated status.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            Subject
            <select value={course} onChange={event => setSelectedCourse(event.target.value)} className="max-w-56 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)]">
              {courses.map(subject => <option key={subject} value={subject}>{subject}</option>)}
            </select>
          </label>
          {user.role !== 'student' && <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            Student
            <select value={activeStudent?.id || ''} onChange={event => setSelectedStudent(event.target.value)} className="max-w-56 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)]">
              {roster.map(student => <option key={student.id} value={student.id}>{student.name} · {student.studentId}</option>)}
            </select>
          </label>}
        </div>
      </header>

      {!attendance ? (
        <Card hover={false}>
          <p className="text-[var(--text-muted)]">No attendance records are available for this subject and student.</p>
          {user.role !== 'student' && <button onClick={() => onNavigate('students')} className="btn-primary mt-4 text-sm">Open student directory</button>}
        </Card>
      ) : (
        <>
          <Card hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--text-muted)]">{course} · {attendance.teacher}</p>
                <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{attendance.attendance}%</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Regular class time: {attendance.classTime}</p>
              </div>
              <Badge variant={attendance.attendance >= 75 ? 'success' : 'warning'}>
                {attendance.attendance >= 75 ? 'Meets 75% threshold' : 'Below 75% threshold'}
              </Badge>
            </div>
            <div className="mt-4"><ProgressBar value={attendance.attendance} /></div>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              {attendance.sessions.filter(session => session.status === 'present').length} attended out of {attendance.sessions.length} recorded lectures
            </p>
          </Card>

          <Card hover={false} className="p-0 overflow-hidden">
            <div className="p-5 border-b border-[var(--border-color)] flex items-center gap-2">
              <CalendarDays size={18} className="text-moss" />
              <div><h2 className="font-bold text-[var(--text-primary)]">Lecture attendance</h2><p className="text-xs text-[var(--text-muted)] mt-1">Instructor: {attendance.teacher}</p></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--bg-primary)] text-left text-[var(--text-muted)]">
                  <tr><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium">Lecture time</th><th className="px-5 py-3 font-medium">Teacher</th><th className="px-5 py-3 font-medium">Status</th></tr>
                </thead>
                <tbody>
                  {attendance.sessions.map(session => (
                    <tr key={session.date} className="border-t border-[var(--border-color)]">
                      <td className="px-5 py-3 text-[var(--text-secondary)]">
                        {new Date(`${session.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-[var(--text-secondary)]">{session.time}</td>
                      <td className="px-5 py-3 text-[var(--text-secondary)]">{attendance.teacher}</td>
                      <td className="px-5 py-3">
                        {user.role === 'teacher' || user.role === 'admin' ? (
                          <select aria-label={`Attendance status ${session.date}`} value={session.status} onChange={event => handleStatus(session.date, event.target.value as 'present' | 'absent')} className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1 text-[var(--text-primary)]">
                            <option value="present">Present</option><option value="absent">Absent</option>
                          </select>
                        ) : (
                          <Badge variant={session.status === 'present' ? 'success' : 'error'}>
                            <span className="inline-flex items-center gap-1">
                              {session.status === 'present' ? <CheckCircle size={12} /> : <XCircle size={12} />}{session.status}
                            </span>
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
