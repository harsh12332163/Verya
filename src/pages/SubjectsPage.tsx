import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, ChevronRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Badge, Card, Modal, ProgressBar } from '../components/UI';
import { assessAcademicRisk, getAccessibleScore } from '../utils/academicMetrics';

const components = [
  { key: 'labs', label: 'Lab work' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'midSem', label: 'Mid-sem' },
  { key: 'finals', label: 'Finals' },
] as const;

export default function SubjectsPage() {
  const { user, students, studentScores, updateAssessment, updateSubjectComponent, addToast } = useApp();
  const [selectedSubject, setSelectedSubject] = useState(() => localStorage.getItem('verya_open_subject') || '');
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [selectedAssessmentStudent, setSelectedAssessmentStudent] = useState<string | null>(null);
  const [editingMarks, setEditingMarks] = useState(false);
  const [sortStudents, setSortStudents] = useState('name');
  const [searchQuery] = useState(() => localStorage.getItem('verya_subject_search') || '');

  const subjectNames = useMemo(() => {
    if (!user) return [];
    const allSubjects = Array.from(new Set(Object.values(studentScores).flatMap(score => score.subjects.map(subject => subject.name))));
    if (user.role === 'teacher') return (user.courses || []).filter(subject => allSubjects.includes(subject));
    if (user.role === 'student') {
      const score = studentScores[user.id];
      return (user.courses || score?.subjects.map(subject => subject.name) || []).filter(subject => score?.subjects.some(item => item.name === subject));
    }
    return allSubjects;
  }, [user, studentScores]);

  useEffect(() => {
    localStorage.removeItem('verya_open_subject');
    localStorage.removeItem('verya_subject_search');
    const pendingAssessment = localStorage.getItem('verya_open_assessment');
    const assessmentStudent = localStorage.getItem('verya_open_assessment_student');
    if (!pendingAssessment) return;
    const assessmentScore = user?.role === 'student'
      ? studentScores[user.id]
      : assessmentStudent ? studentScores[assessmentStudent] : undefined;
    const match = (assessmentScore ? [...assessmentScore.assignments, ...assessmentScore.labs] : Object.values(studentScores).flatMap(score => [...score.assignments, ...score.labs]))
      .find(assessment => assessment.id === pendingAssessment);
    const targetStudent = students.find(student => student.id === assessmentStudent);
    const canView = user?.role === 'admin' ||
      (user?.role === 'teacher' && !!targetStudent?.courses?.includes(match?.subject || '') && !!user.courses?.includes(match?.subject || '')) ||
      (user?.role === 'student' && !!match && !!user.courses?.includes(match.subject));
    if (match && canView) {
      setSelectedSubject(match.subject);
      setSelectedAssessment(match.id);
      setSelectedAssessmentStudent(user?.role === 'student' ? user.id : assessmentStudent || null);
    }
    localStorage.removeItem('verya_open_assessment');
    localStorage.removeItem('verya_open_assessment_student');
  }, [studentScores, students, user]);

  useEffect(() => {
    if (!subjectNames.includes(selectedSubject)) {
      const matchingSearch = subjectNames.find(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()));
      setSelectedSubject(matchingSearch || subjectNames[0] || '');
    }
  }, [subjectNames, selectedSubject, searchQuery]);

  const roster = useMemo(() => {
    if (!user || !selectedSubject) return [];
    const candidates = user.role === 'student' ? students.filter(student => student.id === user.id) : students;
    return candidates
      .filter(student => student.courses?.includes(selectedSubject) && studentScores[student.id]?.subjects.some(subject => subject.name === selectedSubject))
      .sort((a, b) => {
        if (sortStudents === 'score') return (studentScores[b.id]?.subjects.find(item => item.name === selectedSubject)?.marks || 0) - (studentScores[a.id]?.subjects.find(item => item.name === selectedSubject)?.marks || 0);
        if (sortStudents === 'attendance') return (studentScores[b.id]?.attendanceByCourse.find(item => item.course === selectedSubject)?.attendance || 0) - (studentScores[a.id]?.attendanceByCourse.find(item => item.course === selectedSubject)?.attendance || 0);
        return a.name.localeCompare(b.name);
      });
  }, [user, students, studentScores, selectedSubject, sortStudents]);

  const storedOwnScore = user ? studentScores[user.id] : undefined;
  const ownScore = user && storedOwnScore ? getAccessibleScore(user, storedOwnScore) : undefined;
  const ownSubject = ownScore?.subjects.find(subject => subject.name === selectedSubject);
  const ownAttendance = ownScore?.attendanceByCourse.find(course => course.course === selectedSubject);
  const rosterClass = roster[0]
    ? studentScores[roster[0].id]?.attendanceByCourse.find(course => course.course === selectedSubject)
    : undefined;
  const detailScore = selectedAssessmentStudent ? studentScores[selectedAssessmentStudent] : ownScore;
  const selectedDetails = selectedAssessment && detailScore
    ? [...detailScore.assignments, ...detailScore.labs].find(item => item.id === selectedAssessment)
    : undefined;

  const saveComponent = (studentId: string, component: typeof components[number]['key'], rawValue: string) => {
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      addToast('Enter a mark between 0 and 100.', 'warning');
      return;
    }
    if (!updateSubjectComponent(studentId, selectedSubject, component, value)) {
      addToast('You do not have permission to update this subject.', 'error');
      return;
    }
    addToast('Subject mark updated.', 'success');
  };

  const saveAssessment = (studentId: string, id: string, field: 'score' | 'status', value: string) => {
    const updates = field === 'score' ? { score: Number(value) } : { status: value };
    if (!updateAssessment(studentId, id, updates)) {
      addToast('Unable to update this assessment for your assigned subjects.', 'error');
      return;
    }
    addToast('Assessment updated.', 'success');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-moss">{user.role === 'student' ? 'My learning' : user.role === 'teacher' ? 'Teaching workspace' : 'Academic administration'}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Subjects</h1>
          <p className="text-[var(--text-muted)] mt-1">
            {user.role === 'student' ? 'Your enrolled courses, marks, assessments, and attendance.' :
              user.role === 'teacher' ? 'Only your assigned subject and its enrolled students are shown.' :
                'Subject performance across the student directory.'}
          </p>
        </div>
        {user.role !== 'student' && (
          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            Sort students
            <select value={sortStudents} onChange={event => setSortStudents(event.target.value)} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)]">
              <option value="name">Name</option><option value="score">Marks</option><option value="attendance">Attendance</option>
            </select>
          </label>
        )}
      </header>

      {subjectNames.length === 0 ? (
        <Card hover={false}><p className="text-[var(--text-muted)]">No subjects are assigned to this account yet.</p></Card>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjectNames.filter(subject => !searchQuery || subject.toLowerCase().includes(searchQuery.toLowerCase())).map(subjectName => {
              const subjectScore = ownScore?.subjects.find(subject => subject.name === subjectName);
              const classAttendance = ownScore?.attendanceByCourse.find(course => course.course === subjectName);
              return (
                <button key={subjectName} onClick={() => setSelectedSubject(subjectName)} className={`text-left rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${selectedSubject === subjectName ? 'border-moss bg-moss/10 shadow-sm' : 'border-[var(--border-color)] bg-[var(--bg-card)]'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-[var(--text-primary)]">{subjectName}</span><ChevronRight size={16} className="text-moss" />
                  </div>
                  {subjectScore && <p className="text-sm text-[var(--text-muted)] mt-2">{subjectScore.marks}/100 · {subjectScore.credits} credits</p>}
                  {classAttendance && <p className="text-xs text-[var(--text-muted)] mt-1">{classAttendance.attendance}% attendance</p>}
                </button>
              );
            })}
          </div>

          <Card hover={false}>
            {user.role === 'student' && ownSubject && ownScore ? (
              <div className="space-y-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div><h2 className="text-xl font-bold text-[var(--text-primary)]">{selectedSubject}</h2><p className="text-sm text-[var(--text-muted)] mt-1">{ownSubject.credits} credits · {ownSubject.grade}</p></div>
                  <div className="text-right"><p className="text-2xl font-bold text-[var(--text-primary)]">{ownSubject.marks}/100</p><p className="text-xs text-[var(--text-muted)]">Course mark</p></div>
                </div>
                <ProgressBar value={ownSubject.marks} />
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {components.map(component => <div key={component.key} className="rounded-xl bg-[var(--bg-primary)] p-3"><p className="text-xs text-[var(--text-muted)]">{component.label}</p><p className="font-semibold text-[var(--text-primary)]">{ownSubject[component.key]}/100</p></div>)}
                </div>
                {ownAttendance && <div className="rounded-xl bg-[var(--bg-primary)] p-4"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold text-[var(--text-primary)]">Class attendance</p><p className="text-sm text-[var(--text-muted)]">{ownAttendance.teacher} · Class at {ownAttendance.classTime}</p></div><Badge variant={ownAttendance.attendance >= 75 ? 'success' : 'warning'}>{ownAttendance.attendance}%</Badge></div><p className="text-xs text-[var(--text-muted)] mt-2">{ownAttendance.sessions.length} lectures recorded · {ownAttendance.sessions.filter(session => session.status === 'present').length} attended</p></div>}
                <AssessmentLists assignments={ownScore.assignments.filter(item => item.subject === selectedSubject)} labs={ownScore.labs.filter(item => item.subject === selectedSubject)} onSelect={setSelectedAssessment} />
                <div className="space-y-2"><h3 className="font-semibold text-[var(--text-primary)]">Recent lecture attendance</h3>{ownAttendance?.sessions.slice(0, 5).map(session => <div key={session.date} className="flex justify-between rounded-lg bg-[var(--bg-primary)] px-3 py-2 text-sm"><span className="text-[var(--text-secondary)]">{session.date} · {session.time} · {ownAttendance.teacher}</span><Badge variant={session.status === 'present' ? 'success' : 'error'}>{session.status}</Badge></div>)}</div>
                <RiskReasons score={ownScore} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2"><BookOpen className="text-moss" size={18} /><h2 className="text-xl font-bold text-[var(--text-primary)]">{selectedSubject}</h2></div>
                {user.role === 'teacher' && <p className="text-sm text-[var(--text-muted)]">Your teaching access is restricted to your assigned subject and enrolled roster.</p>}
                {rosterClass && <div className="rounded-xl bg-[var(--bg-primary)] p-4 text-sm">
                  <p className="font-semibold text-[var(--text-primary)]">{rosterClass.teacher} · regular class at {rosterClass.classTime}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{rosterClass.sessions.length} lectures on record · attendance details and status updates are available in Attendance.</p>
                </div>}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-[var(--text-muted)]"><tr><th className="p-3">Student</th><th className="p-3">Year / Section</th><th className="p-3">Course mark</th><th className="p-3">Attendance</th><th className="p-3">Assessment marks & status</th></tr></thead>
                    <tbody>
                      {roster.map(student => {
                        const score = studentScores[student.id];
                        const subject = score.subjects.find(item => item.name === selectedSubject);
                        const attendance = score.attendanceByCourse.find(item => item.course === selectedSubject);
                        const records = [...score.assignments, ...score.labs].filter(item => item.subject === selectedSubject);
                        return <tr key={student.id} className="border-t border-[var(--border-color)] align-top">
                          <td className="p-3"><p className="font-medium text-[var(--text-primary)]">{student.name}</p><p className="text-xs text-[var(--text-muted)]">{student.studentId}</p></td>
                          <td className="p-3 text-[var(--text-secondary)]">Year {student.year} · {student.section}</td>
                          <td className="p-3 font-semibold text-[var(--text-primary)]">{subject?.marks}/100</td>
                          <td className="p-3">{attendance?.attendance}%</td>
                          <td className="p-3 min-w-64"><div className="space-y-2">{editingMarks && components.map(component => <label key={component.key} className="grid grid-cols-[1fr_5rem] items-center gap-2 text-xs text-[var(--text-muted)]">{component.label}<input type="number" min="0" max="100" defaultValue={subject?.[component.key]} onBlur={event => saveComponent(student.id, component.key, event.target.value)} className="w-full rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1 text-[var(--text-primary)]" /></label>)}{records.map(record => <div key={record.id} className="flex items-center gap-2"><button className="min-w-0 flex-1 truncate text-left text-xs text-moss hover:underline" onClick={() => { setSelectedAssessment(record.id); setSelectedAssessmentStudent(student.id); }}>{record.name} · {record.type} · due {record.dueDate} {record.dueTime}</button>{user.role !== 'student' && <input aria-label={`${student.name} ${record.name} score`} type="number" min="0" max={record.maxScore} defaultValue={record.score} onBlur={event => saveAssessment(student.id, record.id, 'score', event.target.value)} className="w-14 rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-1 py-1 text-xs text-[var(--text-primary)]" />}{user.role !== 'student' && <select aria-label={`${student.name} ${record.name} status`} value={record.status} onChange={event => saveAssessment(student.id, record.id, 'status', event.target.value)} className="max-w-24 rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-1 py-1 text-xs text-[var(--text-primary)]"><option value="pending">pending</option><option value="submitted">submitted</option><option value="completed">completed</option><option value="in-progress">in-progress</option></select>}</div>)}</div></td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                  {roster.length === 0 && <p className="py-8 text-center text-sm text-[var(--text-muted)]">No students are enrolled in this subject.</p>}
                </div>
                {user.role === 'teacher' && <button onClick={() => setEditingMarks(value => !value)} className="btn-secondary text-sm">{editingMarks ? 'Hide component marks' : 'Edit course component marks'}</button>}
              </div>
            )}
          </Card>
        </>
      )}

      <Modal isOpen={!!selectedAssessment} onClose={() => setSelectedAssessment(null)} title={selectedDetails?.name || 'Assessment details'} size="md">
        {selectedDetails && <div className="space-y-4">
          <div><p className="text-sm text-[var(--text-muted)]">Subject</p><p className="font-semibold text-[var(--text-primary)]">{selectedDetails.subject}</p></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Detail label="Type" value={selectedDetails.type} /><Detail label="Teacher" value={selectedDetails.teacher} />
            <Detail label="Due date" value={selectedDetails.dueDate} /><Detail label="Time" value={selectedDetails.dueTime} />
            <Detail label="Mark" value={`${selectedDetails.score}/${selectedDetails.maxScore}`} /><Detail label="Status" value={selectedDetails.status} />
          </div>
        </div>}
      </Modal>
    </div>
  );
}

function AssessmentLists({ assignments, labs, onSelect }: { assignments: { id: string; name: string; dueDate: string; dueTime: string; score: number; maxScore: number; status: string; teacher: string }[]; labs: { id: string; name: string; dueDate: string; dueTime: string; score: number; maxScore: number; status: string; teacher: string }[]; onSelect: (id: string) => void }) {
  return <div className="grid lg:grid-cols-2 gap-4">
    {[{ title: 'Assignments', records: assignments }, { title: 'Labs', records: labs }].map(group => <section key={group.title} className="space-y-2">
      <h3 className="font-semibold text-[var(--text-primary)]">{group.title}</h3>
      {group.records.map(record => <button key={record.id} onClick={() => onSelect(record.id)} className="w-full rounded-xl bg-[var(--bg-primary)] p-3 text-left transition-colors hover:bg-moss/10">
        <div className="flex items-center justify-between gap-2"><span className="font-medium text-[var(--text-primary)]">{record.name}</span><Badge variant={record.status === 'pending' ? 'warning' : record.score < 50 ? 'error' : 'success'}>{record.status}</Badge></div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]"><span>{record.score}/{record.maxScore}</span><span>{record.dueDate} · {record.dueTime}</span><span>{record.teacher}</span></div>
      </button>)}
      {group.records.length === 0 && <p className="text-xs text-[var(--text-muted)]">No {group.title.toLowerCase()} recorded for this subject.</p>}
    </section>)}
  </div>;
}

function RiskReasons({ score }: { score: NonNullable<ReturnType<typeof useApp>['studentScores'][string]> }) {
  const risk = assessAcademicRisk(score.overall, score.attendance, score);
  return <section className="rounded-xl border border-[var(--border-color)] p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-[var(--text-primary)]">Academic support signals</h3><Badge variant={risk.level === 'High' ? 'error' : risk.level === 'Moderate' ? 'warning' : 'success'}>{risk.level} · {risk.riskScore}/100</Badge></div><ul className="mt-3 space-y-1 text-sm text-[var(--text-secondary)]">{risk.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></section>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-[var(--bg-primary)] p-3"><p className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]"><CalendarDays size={12} />{label}</p><p className="mt-1 font-medium text-[var(--text-primary)]">{value}</p></div>;
}
