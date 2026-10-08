import React, { useState, useEffect } from 'react';
import { ChevronRight, Award, BookOpen, Users, BarChart3 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card, Badge, SearchBar, ProgressBar, Tabs, Modal } from '../components/UI';
import { assessAcademicRisk, getSubjectScopedScore } from '../utils/academicMetrics';

export default function StudentsPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { students, studentScores, user, updateAssessment, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem('verya_student_search') || '');
  const [filterDept, setFilterDept] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [filterCourse, setFilterCourse] = useState(user?.role === 'teacher' ? user.courses?.[0] || 'all' : 'all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('subjects');
  const availableCourses = user?.role === 'teacher'
    ? user.courses || []
    : Array.from(new Set(Object.values(studentScores).flatMap(score => score.subjects.map(subject => subject.name))));

  useEffect(() => {
    localStorage.removeItem('verya_student_search');
  }, []);

  const departments = ['all', ...new Set(students.map(s => s.department || 'Unknown'))];
  const getStudentSubjectMark = (studentId: string) => {
    const score = studentScores[studentId];
    const relevant = score?.subjects.filter(subject => user?.role !== 'teacher' || user.courses?.includes(subject.name)) || [];
    return relevant.length ? Math.round(relevant.reduce((total, subject) => total + subject.marks, 0) / relevant.length) : 0;
  };
  const getStudentAttendance = (studentId: string) => {
    const score = studentScores[studentId];
    const relevant = score?.attendanceByCourse.filter(course => user?.role !== 'teacher' || user.courses?.includes(course.course)) || [];
    return relevant.length ? Math.round(relevant.reduce((total, course) => total + course.attendance, 0) / relevant.length) : 0;
  };

  const filteredStudents = students
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = filterDept === 'all' || s.department === filterDept;
      const matchesYear = filterYear === 'all' || String(s.year) === filterYear;
      const matchesSection = filterSection === 'all' || s.section === filterSection;
      const matchesCourse = filterCourse === 'all' || s.courses?.includes(filterCourse);
      const score = studentScores[s.id];
      const studentMark = getStudentSubjectMark(s.id);
      const matchesGrade = filterGrade === 'all' ||
        (filterGrade === 'a' && score && studentMark >= 80) ||
        (filterGrade === 'b' && score && studentMark >= 60 && studentMark < 80) ||
        (filterGrade === 'c' && score && studentMark < 60);
      return matchesSearch && matchesDept && matchesYear && matchesSection && matchesCourse && matchesGrade;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'score') return getStudentSubjectMark(b.id) - getStudentSubjectMark(a.id);
      if (sortBy === 'attendance') return getStudentAttendance(b.id) - getStudentAttendance(a.id);
      if (sortBy === 'year') return (a.year || 0) - (b.year || 0);
      if (sortBy === 'gpa') return (b.gpa || 0) - (a.gpa || 0);
      return 0;
    });

  const selectedStudentData = selectedStudent ? students.find(s => s.id === selectedStudent) : null;
  const selectedScore = selectedStudent ? studentScores[selectedStudent] : null;
  const selectedScopedScore = selectedScore && user?.role === 'teacher'
    ? getSubjectScopedScore(selectedScore, user.courses || [])
    : selectedScore;
  const selectedRisk = selectedScopedScore
    ? assessAcademicRisk(selectedScopedScore.overall, selectedScopedScore.attendance, selectedScopedScore)
    : undefined;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Student Directory</h1>
        <p className="text-[var(--text-muted)] mt-1">{filteredStudents.length} students match the current filters</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, email, or ID..." />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm">
          {departments.map(d => <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm">
          <option value="all">All years</option>{[1, 2, 3, 4].map(year => <option key={year} value={year}>Year {year}</option>)}
        </select>
        <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm">
          <option value="all">All sections</option>{['A', 'B', 'C'].map(section => <option key={section} value={section}>Section {section}</option>)}
        </select>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} disabled={user?.role === 'teacher'} className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm disabled:opacity-70">
          {user?.role !== 'teacher' && <option value="all">All subjects</option>}
          {availableCourses.map(course => <option key={course} value={course}>{course}</option>)}
        </select>
        <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm">
          <option value="all">All Grades</option>
          <option value="a">A Grade (80%+)</option>
          <option value="b">B Grade (60-79%)</option>
          <option value="c">C Grade (&lt;60%)</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm">
          <option value="name">Sort by Name</option>
          <option value="score">Sort by Score</option>
          <option value="attendance">Sort by Attendance</option>
          <option value="year">Sort by Year</option>
          <option value="gpa">Sort by GPA</option>
        </select>
      </div>

      {/* Student List */}
      <div className="grid gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {filteredStudents.map((student, i) => {
          const score = studentScores[student.id];
          return (
            <Card key={student.id} hover onClick={() => setSelectedStudent(student.id)} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-forest to-moss flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                {student.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">{student.name}</h3>
                  <Badge variant={score && getStudentSubjectMark(student.id) >= 80 ? 'success' : score && getStudentSubjectMark(student.id) >= 60 ? 'info' : 'warning'}>
                    {score ? `${user?.role === 'teacher' ? 'Subject ' : ''}${getStudentSubjectMark(student.id)}%` : 'N/A'}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">{student.department} • Year {student.year}, Section {student.section} • {student.studentId}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-[var(--text-muted)]">Attendance</p>
                  <p className="font-medium text-[var(--text-primary)]">{getStudentAttendance(student.id)}%</p>
                </div>
                {user?.role !== 'teacher' && <div className="text-center">
                  <p className="text-xs text-[var(--text-muted)]">GPA</p>
                  <p className="font-medium text-[var(--text-primary)]">{student.gpa?.toFixed(1) || 'N/A'}</p>
                </div>}
              </div>
              <ChevronRight size={16} className="text-[var(--text-muted)] flex-shrink-0" />
            </Card>
          );
        })}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <Users size={40} className="mx-auto mb-3 opacity-50" />
            <p>No students found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title={selectedStudentData?.name || 'Student Details'} size="lg">
        {selectedStudentData && selectedScore && (
          <div className="space-y-6">
            {/* Student Info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-primary)]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-forest to-moss flex items-center justify-center text-white font-bold text-xl">
                {selectedStudentData.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">{selectedStudentData.name}</h3>
                <p className="text-sm text-[var(--text-muted)]">{selectedStudentData.department} • Year {selectedStudentData.year}, Section {selectedStudentData.section} • {selectedStudentData.studentId}</p>
                <p className="text-sm text-[var(--text-muted)]">{selectedStudentData.email}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-bold text-forest">{user?.role === 'teacher' ? selectedScopedScore?.overall : selectedScore.overall}%</p>
                <p className="text-xs text-[var(--text-muted)]">{user?.role === 'teacher' ? 'Assigned subject average' : 'Overall Score'}</p>
              </div>
            </div>

            {selectedRisk && user?.role !== 'student' && <div className="rounded-xl bg-[var(--bg-primary)] p-4">
              <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-[var(--text-primary)]">Risk reasons</h3><Badge variant={selectedRisk.level === 'High' ? 'error' : selectedRisk.level === 'Moderate' ? 'warning' : 'success'}>{selectedRisk.level} · {selectedRisk.riskScore}/100</Badge></div>
              <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">{selectedRisk.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
            </div>}

            {/* Tabs */}
            <Tabs
              tabs={[
                { id: 'subjects', label: 'Subjects', icon: <BookOpen size={14} /> },
                { id: 'assignments', label: 'Assignments', icon: <Award size={14} /> },
                { id: 'labs', label: 'Labs', icon: <BarChart3 size={14} /> },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {/* Tab Content */}
            {activeTab === 'subjects' && (
              <div className="space-y-3">
                {selectedScore.subjects.filter(sub => user?.role !== 'teacher' || user.courses?.includes(sub.name)).map((sub, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[var(--bg-primary)]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-[var(--text-primary)]">{sub.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={sub.marks >= 80 ? 'success' : sub.marks >= 60 ? 'info' : 'warning'}>{sub.grade}</Badge>
                        <span className="font-bold text-[var(--text-primary)]">{sub.marks}/{sub.maxMarks}</span>
                      </div>
                    </div>
                    <ProgressBar value={sub.marks} max={sub.maxMarks} color={sub.marks >= 80 ? 'bg-forest' : sub.marks >= 60 ? 'bg-moss' : 'bg-coral'} />
                  </div>
                ))}
                <div className="p-4 rounded-xl bg-[var(--bg-primary)]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-[var(--text-primary)]">Attendance</span>
                    <span className="font-bold text-[var(--text-primary)]">                    {user?.role === 'teacher'
                      ? Math.round(selectedScore.attendanceByCourse.filter(course => user.courses?.includes(course.course)).reduce((sum, course) => sum + course.attendance, 0) / Math.max(1, selectedScore.attendanceByCourse.filter(course => user.courses?.includes(course.course)).length))
                      : selectedScore.attendance}%</span>
                  </div>
                  <ProgressBar value={user?.role === 'teacher'
                    ? selectedScore.attendanceByCourse.find(course => user.courses?.includes(course.course))?.attendance || 0
                    : selectedScore.attendance} color={selectedScore.attendance >= 75 ? 'bg-forest' : selectedScore.attendance >= 60 ? 'bg-moss' : 'bg-coral'} />
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-3">
                {selectedScore.assignments.filter(a => user?.role !== 'teacher' || user.courses?.includes(a.subject)).map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-primary)]">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{a.name} · {a.subject}</p>
                      <p className="text-sm text-[var(--text-muted)]">{a.dueDate} at {a.dueTime} · {a.teacher} · Score: {a.score}/{a.maxScore}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user?.role !== 'student' && <input aria-label={`${a.name} score`} type="number" min="0" max={a.maxScore} defaultValue={a.score} onBlur={event => {
                        if (!updateAssessment(selectedStudentData.id, a.id, { score: Number(event.target.value) })) addToast('Could not update this assessment.', 'error');
                      }} className="w-16 rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1 text-sm" />}
                      <Badge variant={a.status === 'submitted' ? 'success' : 'warning'}>{a.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'labs' && (
              <div className="space-y-3">
                {selectedScore.labs.filter(l => user?.role !== 'teacher' || user.courses?.includes(l.subject)).map((l, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-primary)]">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{l.name} · {l.subject}</p>
                      <p className="text-sm text-[var(--text-muted)]">{l.dueDate} at {l.dueTime} · {l.teacher} · Score: {l.score}/{l.maxScore}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user?.role !== 'student' && <input aria-label={`${l.name} score`} type="number" min="0" max={l.maxScore} defaultValue={l.score} onBlur={event => {
                        if (!updateAssessment(selectedStudentData.id, l.id, { score: Number(event.target.value) })) addToast('Could not update this lab mark.', 'error');
                      }} className="w-16 rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1 text-sm" />}
                      <Badge variant={l.status === 'completed' ? 'success' : 'info'}>{l.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
              <button onClick={() => {
                localStorage.setItem('verya_message_contact', selectedStudentData.id);
                setSelectedStudent(null);
                onNavigate('messages');
              }} className="btn-primary text-sm flex-1 text-center">
                Send Message
              </button>
              <button onClick={() => setSelectedStudent(null)} className="btn-secondary text-sm flex-1 text-center">
                Close details
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
