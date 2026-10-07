import React, { useState } from 'react';
import { Search, Filter, ChevronRight, Award, BookOpen, Users, BarChart3, Eye } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card, Badge, SearchBar, ProgressBar, Tabs, Modal } from '../components/UI';

export default function StudentsPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { students, studentScores, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('subjects');

  const departments = ['all', ...new Set(students.map(s => s.department || 'Unknown'))];

  const filteredStudents = students
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = filterDept === 'all' || s.department === filterDept;
      const score = studentScores[s.id];
      const matchesGrade = filterGrade === 'all' ||
        (filterGrade === 'a' && score && score.overall >= 80) ||
        (filterGrade === 'b' && score && score.overall >= 60 && score.overall < 80) ||
        (filterGrade === 'c' && score && score.overall < 60);
      return matchesSearch && matchesDept && matchesGrade;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'score') return (studentScores[b.id]?.overall || 0) - (studentScores[a.id]?.overall || 0);
      if (sortBy === 'attendance') return (studentScores[b.id]?.attendance || 0) - (studentScores[a.id]?.attendance || 0);
      return 0;
    });

  const selectedStudentData = selectedStudent ? students.find(s => s.id === selectedStudent) : null;
  const selectedScore = selectedStudent ? studentScores[selectedStudent] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Student Directory</h1>
        <p className="text-[var(--text-muted)] mt-1">{students.length} students enrolled</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, email, or ID..." />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm">
          {departments.map(d => <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>)}
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
                  <Badge variant={score && score.overall >= 80 ? 'success' : score && score.overall >= 60 ? 'info' : 'warning'}>
                    {score ? `${score.overall}%` : 'N/A'}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">{student.department} • {student.studentId}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-[var(--text-muted)]">Attendance</p>
                  <p className="font-medium text-[var(--text-primary)]">{score?.attendance || 0}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[var(--text-muted)]">GPA</p>
                  <p className="font-medium text-[var(--text-primary)]">{student.gpa?.toFixed(1) || 'N/A'}</p>
                </div>
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
                <p className="text-sm text-[var(--text-muted)]">{selectedStudentData.department} • {selectedStudentData.studentId}</p>
                <p className="text-sm text-[var(--text-muted)]">{selectedStudentData.email}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-bold text-forest">{selectedScore.overall}%</p>
                <p className="text-xs text-[var(--text-muted)]">Overall Score</p>
              </div>
            </div>

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
                {selectedScore.subjects.map((sub, i) => (
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
                    <span className="font-bold text-[var(--text-primary)]">{selectedScore.attendance}%</span>
                  </div>
                  <ProgressBar value={selectedScore.attendance} color={selectedScore.attendance >= 75 ? 'bg-forest' : selectedScore.attendance >= 60 ? 'bg-moss' : 'bg-coral'} />
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-3">
                {selectedScore.assignments.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-primary)]">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{a.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">Score: {a.score}/{a.maxScore}</p>
                    </div>
                    <Badge variant={a.status === 'submitted' ? 'success' : 'warning'}>{a.status}</Badge>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'labs' && (
              <div className="space-y-3">
                {selectedScore.labs.map((l, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-primary)]">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{l.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">Score: {l.score}/{l.maxScore}</p>
                    </div>
                    <Badge variant={l.status === 'completed' ? 'success' : 'info'}>{l.status}</Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
              <button onClick={() => { setSelectedStudent(null); onNavigate('messages'); }} className="btn-primary text-sm flex-1 text-center">
                Send Message
              </button>
              <button onClick={() => { setSelectedStudent(null); onNavigate('profile'); }} className="btn-secondary text-sm flex-1 text-center">
                View Full Profile
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
