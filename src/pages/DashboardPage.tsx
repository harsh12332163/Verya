import React, { useState } from 'react';
import { Users, TrendingUp, Award, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card, StatCard, Badge, ProgressBar, Modal } from '../components/UI';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import DailyThought from '../components/DailyThought';
import { assessAcademicRisk, calculateCgpa, calculateSgpa, getAccessibleScore, getSubjectScopedScore } from '../utils/academicMetrics';
import { createStudentSuccessInsight, StudentSuccessInsight } from '../utils/studentSuccess';

export default function DashboardPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, students, studentScores } = useApp();
  const [segmentFilter, setSegmentFilter] = useState('All segments');
  const [riskFilter, setRiskFilter] = useState('All risk levels');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedInsight, setSelectedInsight] = useState<StudentSuccessInsight | null>(null);

  // Generate dashboard data
  const visibleStudents = user?.role === 'teacher'
    ? students.filter(student => student.courses?.some(course => user.courses?.includes(course)))
    : students;
  const totalStudents = visibleStudents.length;
  const scores = visibleStudents.map(student => studentScores[student.id]).filter(Boolean);
  const teacherCourses = user?.role === 'teacher' ? user.courses || [] : [];
  const subjectRecords = scores.flatMap(score => score.subjects
    .filter(subject => user?.role !== 'teacher' || teacherCourses.includes(subject.name)));
  const avgScore = user?.role === 'teacher'
    ? subjectRecords.length ? Math.round(subjectRecords.reduce((total, subject) => total + subject.marks, 0) / subjectRecords.length) : 0
    : scores.length ? Math.round(scores.reduce((total, score) => total + score.overall, 0) / scores.length) : 0;
  const highPerformers = user?.role === 'teacher'
    ? visibleStudents.filter(student => studentScores[student.id]?.subjects.some(subject => teacherCourses.includes(subject.name) && subject.marks >= 80)).length
    : scores.filter(score => score.overall >= 80).length;
  const atRisk = user?.role === 'teacher'
    ? new Set(visibleStudents.filter(student => {
      const score = studentScores[student.id];
      return score?.subjects.some(subject => teacherCourses.includes(subject.name) && subject.marks < 60) ||
        score?.attendanceByCourse.some(course => teacherCourses.includes(course.course) && course.attendance < 75);
    }).map(student => student.id)).size
    : scores.filter(score => assessAcademicRisk(score.overall, score.attendance, score).riskScore >= 60).length;

  const subjectTotals = new Map<string, { total: number; count: number }>();
  scores.forEach(score => score.subjects
    .filter(subject => user?.role !== 'teacher' || teacherCourses.includes(subject.name))
    .forEach(subject => {
    const current = subjectTotals.get(subject.name) || { total: 0, count: 0 };
    subjectTotals.set(subject.name, { total: current.total + subject.marks, count: current.count + 1 });
  }));
  const subjectData = Array.from(subjectTotals, ([name, result]) => ({
    name,
    avg: Math.round(result.total / result.count),
  }));

  const gradeDistribution = [
    { name: 'A+', value: subjectRecords.filter(subject => subject.marks >= 85).length, color: '#173F35' },
    { name: 'A/B+', value: subjectRecords.filter(subject => subject.marks >= 75 && subject.marks < 85).length, color: '#245B49' },
    { name: 'B', value: subjectRecords.filter(subject => subject.marks >= 60 && subject.marks < 75).length, color: '#6F8F62' },
    { name: 'Needs support', value: subjectRecords.filter(subject => subject.marks < 60).length, color: '#E07A5F' },
  ];
  const criticalWork = visibleStudents.flatMap(student => {
    const score = studentScores[student.id];
    return (score?.assignments ?? [])
      .filter(item => (user?.role !== 'teacher' || teacherCourses.includes(item.subject)) && (item.status === 'pending' || item.score < 50))
      .map(item => ({ ...item, studentId: student.id, studentName: student.name }));
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 8);
  const successInsights = visibleStudents.flatMap(student => {
    const score = studentScores[student.id];
    if (!score) return [];
    const scopedScore = user?.role === 'teacher' ? getSubjectScopedScore(score, teacherCourses) : score;
    return [createStudentSuccessInsight(student, scopedScore)];
  }).sort((a, b) => a.score - b.score);
  const segments = Array.from(new Set(successInsights.map(insight => insight.segment)));
  const filteredInsights = successInsights.filter(insight =>
    (segmentFilter === 'All segments' || insight.segment === segmentFilter) &&
    (riskFilter === 'All risk levels' || insight.riskLevel === riskFilter) &&
    `${insight.student.name} ${insight.student.studentId || insight.student.id} ${insight.student.department || ''} ${insight.student.year || ''} ${insight.student.section || ''}`
      .toLowerCase().includes(studentSearch.trim().toLowerCase())
  );

  // If student, show personal dashboard
  if (user?.role === 'student') {
    const storedScore = studentScores[user.id];
    const myScore = storedScore ? getAccessibleScore(user, storedScore) : undefined;
    const myRisk = myScore ? assessAcademicRisk(myScore.overall, myScore.attendance, myScore, user) : undefined;
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">My Dashboard</h1>
          <p className="text-[var(--text-muted)] mt-1">Welcome back, {user.name}! Here's your academic overview.</p>
        </div>

        <DailyThought />

        {myScore && (() => {
          const personalInsight = createStudentSuccessInsight(user, myScore);
          return (
            <Card hover={false} className="animate-slide-up border-moss/30">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-moss">Integrated demo signals</p>
                  <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">Student Success Score</h2>
                  <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
                    A decision-support estimate across academics, attendance, LMS, engagement, placement readiness, skills, and feedback.
                  </p>
                </div>
                <div className="rounded-2xl bg-moss/10 px-5 py-3 text-center">
                  <span className="block text-3xl font-bold text-moss">{personalInsight.score}</span>
                  <span className="text-xs text-[var(--text-muted)]">out of 100</span>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {personalInsight.indicators.map(indicator => (
                  <div key={indicator.key} className="rounded-xl bg-[var(--bg-primary)] p-3">
                    <div className="flex justify-between gap-2 text-xs">
                      <span className="text-[var(--text-secondary)]">{indicator.label}</span>
                      <span className="font-semibold text-[var(--text-primary)]">{indicator.value}</span>
                    </div>
                    <ProgressBar value={indicator.value} color={indicator.value < 60 ? 'bg-coral' : 'bg-moss'} />
                    <p className="mt-1 text-[11px] text-[var(--text-muted)]">{Math.round(indicator.weight * 100)}% weight · {indicator.contribution} points</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-[var(--text-muted)]">
                Prototype data note: attendance and academic signals use your demo records; LMS, engagement, placement, skills, and feedback are simulated for this demonstration.
              </p>
            </Card>
          );
        })()}

        {/* My Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <StatCard onClick={() => onNavigate('subjects')} icon={<Award size={20} />} label="Overall Score" value={`${myScore?.overall || 0}%`} change="View subject scores" />
          <StatCard onClick={() => onNavigate('attendance')} icon={<BookOpen size={20} />} label="Attendance" value={`${myScore?.attendance || 0}%`} change="View class records" />
          <StatCard onClick={() => onNavigate('subjects')} icon={<CheckCircle size={20} />} label="Assignments Done" value={`${myScore?.assignments.filter(a => a.status === 'submitted').length || 0}/${myScore?.assignments.length || 0}`} change="View subject work" />
          <StatCard onClick={() => onNavigate('subjects')} icon={<TrendingUp size={20} />} label="CGPA" value={myScore ? calculateCgpa(user, myScore).toFixed(2) : 'N/A'} change="Out of 10" />
          <StatCard onClick={() => onNavigate('subjects')} icon={<Award size={20} />} label="SGPA" value={myScore ? calculateSgpa(myScore).toFixed(2) : 'N/A'} change="Current semester" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Card>
            <h3 className="font-bold text-[var(--text-primary)] mb-4">My class attendance</h3>
            <div className="space-y-4">
              {myScore?.attendanceByCourse.map(course => (
                <button key={course.course} onClick={() => {
                  localStorage.setItem('verya_open_course', course.course);
                  onNavigate('attendance');
                }} className="w-full text-left">
                  <div className="flex justify-between gap-3 text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">{course.course}</span>
                    <span className="font-medium text-[var(--text-primary)]">{course.attendance}%</span>
                  </div>
                  <ProgressBar value={course.attendance} color={course.attendance >= 75 ? 'bg-forest' : 'bg-coral'} />
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{course.teacher} · {course.sessions.length} lectures recorded</p>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-[var(--text-primary)] mb-4">Subject Performance</h3>
            <div className="space-y-3">
              {myScore?.subjects.map((sub, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <button onClick={() => {
                      localStorage.setItem('verya_open_subject', sub.name);
                      onNavigate('subjects');
                    }} className="text-left text-[var(--text-secondary)] hover:text-moss">{sub.name}</button>
                    <span className="font-medium text-[var(--text-primary)]">{sub.marks}/{sub.maxMarks}</span>
                  </div>
                  <ProgressBar value={sub.marks} max={sub.maxMarks} color={sub.marks >= 80 ? 'bg-forest' : sub.marks >= 60 ? 'bg-moss' : 'bg-coral'} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Card hover={false}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div><h3 className="font-bold text-[var(--text-primary)]">Assignments needing attention</h3><p className="text-xs text-[var(--text-muted)] mt-1">Only items affecting your academic standing are listed.</p></div>
              <button onClick={() => onNavigate('subjects')} className="text-xs font-medium text-moss hover:underline">All subjects</button>
            </div>
            <div className="space-y-2">
              {(myScore?.assignments.filter(item => item.status === 'pending' || item.score < 50) || [])
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .slice(0, 6)
                .map(item => (
                  <button key={item.id} onClick={() => {
                    localStorage.setItem('verya_open_assessment', item.id);
                    onNavigate('subjects');
                  }} className="w-full rounded-xl bg-[var(--bg-primary)] p-3 text-left transition-colors hover:bg-moss/10">
                    <div className="flex items-center justify-between gap-3"><span className="font-medium text-sm text-[var(--text-primary)]">{item.name} · {item.subject}</span><Badge variant={item.status === 'pending' ? 'warning' : 'error'}>{item.status === 'pending' ? 'Pending' : `${item.score}/${item.maxScore}`}</Badge></div>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{item.teacher} · Due {item.dueDate} at {item.dueTime}</p>
                  </button>
                ))}
              {myScore?.assignments.every(item => item.status !== 'pending' && item.score >= 50) && <p className="rounded-xl bg-moss/5 p-3 text-sm text-[var(--text-secondary)]">No assignments currently need attention.</p>}
            </div>
          </Card>
          {myScore && <Card hover={false}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-bold text-[var(--text-primary)]">
                {myRisk?.safeScore !== undefined && myRisk.safeScore >= 75 ? 'Your Safe Score is good' : 'Your Safe Score needs attention'}
              </h3>
              <div className="flex flex-wrap justify-end gap-2">
                <Badge variant={myRisk?.level === 'High' ? 'error' : myRisk?.level === 'Moderate' ? 'warning' : 'success'}>
                  Risk {myRisk?.riskScore ?? 0}/100
                </Badge>
                <Badge variant={myRisk?.safeScore !== undefined && myRisk.safeScore >= 75 ? 'success' : 'warning'}>
                  Safe {myRisk?.safeScore ?? 0}/100
                </Badge>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              {myRisk?.reasons.slice(0, 7).map(reason => <li key={reason}>{reason}</li>)}
            </ul>
          </Card>}
        </div>
      </div>
    );
  }

  // Admin/Teacher Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Dashboard Overview</h1>
        <p className="text-[var(--text-muted)] mt-1">Welcome back, {user?.name}. Here's what's happening.</p>
      </div>

      <DailyThought />

      <Card hover={false} className="border-moss/30">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-moss">Decision intelligence · demo data</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">Student Success Score</h2>
            <p className="mt-1 max-w-3xl text-sm text-[var(--text-muted)]">
              A transparent support signal that combines academic, attendance, LMS, engagement, placement, skills, and feedback indicators. Use it to prioritize a human check-in, not as an automated decision.
            </p>
          </div>
          <div className="rounded-2xl bg-moss/10 px-4 py-3 text-center">
            <span className="block text-2xl font-bold text-moss">
              {successInsights.length ? Math.round(successInsights.reduce((total, insight) => total + insight.score, 0) / successInsights.length) : 0}
            </span>
            <span className="text-xs text-[var(--text-muted)]">cohort average</span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button onClick={() => { setRiskFilter('All risk levels'); setSegmentFilter('All segments'); }} className="rounded-xl bg-[var(--bg-primary)] p-3 text-left hover:bg-moss/10">
            <span className="block text-2xl font-bold text-[var(--text-primary)]">{successInsights.length}</span><span className="text-xs text-[var(--text-muted)]">Integrated student views</span>
          </button>
          <button onClick={() => { setRiskFilter('High'); setSegmentFilter('All segments'); }} className="rounded-xl bg-red-50 p-3 text-left hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30">
            <span className="block text-2xl font-bold text-coral">{successInsights.filter(insight => insight.riskLevel === 'High').length}</span><span className="text-xs text-[var(--text-muted)]">High priority</span>
          </button>
          <button onClick={() => { setRiskFilter('Moderate'); setSegmentFilter('All segments'); }} className="rounded-xl bg-amber-50 p-3 text-left hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30">
            <span className="block text-2xl font-bold text-amber-700 dark:text-amber-300">{successInsights.filter(insight => insight.riskLevel === 'Moderate').length}</span><span className="text-xs text-[var(--text-muted)]">Monitor and support</span>
          </button>
          <button onClick={() => { setRiskFilter('All risk levels'); setSegmentFilter('Strong academics · placement gap'); }} className="rounded-xl bg-blue-50 p-3 text-left hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30">
            <span className="block text-2xl font-bold text-blue-700 dark:text-blue-300">{successInsights.filter(insight => insight.segment === 'Strong academics · placement gap').length}</span><span className="text-xs text-[var(--text-muted)]">Placement-readiness gap</span>
          </button>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-[var(--text-primary)]">Students to review</h3>
              <div className="flex flex-wrap gap-2">
                <input value={studentSearch} onChange={event => setStudentSearch(event.target.value)} placeholder="Search name or ID" className="w-36 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] sm:w-44" aria-label="Search students by name or ID" />
                <select value={riskFilter} onChange={event => setRiskFilter(event.target.value)} className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)]">
                  {['All risk levels', 'High', 'Moderate', 'Low'].map(level => <option key={level}>{level}</option>)}
                </select>
                <select value={segmentFilter} onChange={event => setSegmentFilter(event.target.value)} className="max-w-56 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)]">
                  {['All segments', ...segments].map(segment => <option key={segment}>{segment}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              {filteredInsights.slice(0, 6).map(insight => (
                <button key={insight.student.id} onClick={() => setSelectedInsight(insight)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-[var(--bg-primary)] p-3 text-left transition-colors hover:bg-moss/10">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">{insight.student.name} · {insight.student.studentId || insight.student.id}</span>
                    <span className="mt-1 block truncate text-xs text-[var(--text-muted)]">{insight.segment} · {insight.insight}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge variant={insight.riskLevel === 'High' ? 'error' : insight.riskLevel === 'Moderate' ? 'warning' : 'success'}>{insight.riskLevel}</Badge>
                    <span className="w-9 text-right text-lg font-bold text-[var(--text-primary)]">{insight.score}</span>
                  </span>
                </button>
              ))}
              {!filteredInsights.length && <p className="rounded-xl bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-muted)]">No students match these filters.</p>}
              {filteredInsights.length > 6 && <p className="text-xs text-[var(--text-muted)]">Showing 6 of {filteredInsights.length}. Adjust filters to focus the list.</p>}
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-bold text-[var(--text-primary)]">Cohort segments</h3>
            <div className="space-y-2">
              {segments.map(segment => {
                const count = successInsights.filter(insight => insight.segment === segment).length;
                return (
                  <button key={segment} onClick={() => { setSegmentFilter(segment); setRiskFilter('All risk levels'); }} className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] p-3 text-left hover:border-moss">
                    <span className="text-sm text-[var(--text-secondary)]">{segment}</span><Badge>{count}</Badge>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">Signals beyond academic and attendance records are simulated sample data, clearly separated for the prototype.</p>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <StatCard onClick={() => onNavigate('students')} icon={<Users size={20} />} label="Total Students" value={totalStudents} change="Open directory" />
        <StatCard onClick={() => onNavigate('academics')} icon={<Award size={20} />} label="Average Score" value={`${avgScore}%`} change="View academic details" />
        <StatCard onClick={() => onNavigate('students')} icon={<TrendingUp size={20} />} label="High Performers" value={highPerformers} change={`${totalStudents ? Math.round(highPerformers/totalStudents*100) : 0}% of total`} />
        <StatCard onClick={() => onNavigate('students')} icon={<AlertTriangle size={20} />} label="At Risk" value={atRisk} change="Review student details" color="text-coral" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-[var(--text-primary)] mb-4">Course performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} interval={0} angle={-15} textAnchor="end" height={55} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }} />
              <Bar dataKey="avg" name="Average marks" fill="#6F8F62" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-bold text-[var(--text-primary)] mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={gradeDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {gradeDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {gradeDistribution.map((g, i) => (
              <div key={i} className="flex items-center gap-1 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
                <span className="text-[var(--text-muted)]">{g.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Subject averages and assignments at risk */}
      <div className="grid lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <Card>
          <h3 className="font-bold text-[var(--text-primary)] mb-4">Subject Averages</h3>
          <div className="space-y-3">
            {subjectData.map((sub, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-secondary)]">{sub.name}</span>
                  <span className="font-medium text-[var(--text-primary)]">{sub.avg}%</span>
                </div>
                <ProgressBar value={sub.avg} color={sub.avg >= 75 ? 'bg-forest' : sub.avg >= 60 ? 'bg-moss' : 'bg-coral'} />
              </div>
            ))}
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div><h3 className="font-bold text-[var(--text-primary)]">Assignments needing attention</h3><p className="text-xs text-[var(--text-muted)] mt-1">Only pending or low-mark work in your accessible courses.</p></div>
            <button onClick={() => onNavigate('subjects')} className="text-xs font-medium text-moss hover:underline">Open subjects</button>
          </div>
          <div className="space-y-2">
            {criticalWork.map(item => (
              <button key={item.id} onClick={() => {
                localStorage.setItem('verya_open_assessment', item.id);
                localStorage.setItem('verya_open_assessment_student', item.studentId);
                onNavigate('subjects');
              }} className="w-full rounded-xl bg-[var(--bg-primary)] p-3 text-left hover:bg-moss/10 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-[var(--text-primary)]">{item.name} · {item.subject}</span>
                  <Badge variant={item.status === 'pending' ? 'warning' : 'error'}>{item.status === 'pending' ? 'Pending' : `${item.score}/${item.maxScore}`}</Badge>
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{item.studentName} · {item.teacher} · Due {item.dueDate} at {item.dueTime}</p>
              </button>
            ))}
            {criticalWork.length === 0 && <p className="text-sm text-[var(--text-muted)]">No assignments currently need attention.</p>}
          </div>
        </Card>
      </div>
      <Modal isOpen={!!selectedInsight} onClose={() => setSelectedInsight(null)} title={selectedInsight ? `${selectedInsight.student.name} · Success insight` : undefined} size="lg">
        {selectedInsight && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-sm text-[var(--text-muted)]">{selectedInsight.student.studentId || selectedInsight.student.id} · {selectedInsight.student.department || 'Department not set'}</p><p className="mt-1 font-semibold text-[var(--text-primary)]">{selectedInsight.segment}</p></div>
              <div className="flex items-center gap-3"><Badge variant={selectedInsight.riskLevel === 'High' ? 'error' : selectedInsight.riskLevel === 'Moderate' ? 'warning' : 'success'}>{selectedInsight.riskLevel} priority</Badge><span className="text-3xl font-bold text-moss">{selectedInsight.score}</span></div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-[var(--text-primary)]">Score drivers · indicator × weight</h4>
              <div className="space-y-3">
                {selectedInsight.indicators.map(indicator => (
                  <div key={indicator.key}>
                    <div className="mb-1 flex justify-between gap-3 text-xs"><span className="text-[var(--text-secondary)]">{indicator.label} ({Math.round(indicator.weight * 100)}%)</span><span className="font-medium text-[var(--text-primary)]">{indicator.value}/100 · {indicator.contribution} points</span></div>
                    <ProgressBar value={indicator.value} color={indicator.value < 60 ? 'bg-coral' : 'bg-moss'} />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
              <h4 className="font-semibold text-[var(--text-primary)]">Why flagged</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">{selectedInsight.riskReasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
            </div>
            <div className="rounded-xl bg-moss/10 p-4">
              <h4 className="font-semibold text-[var(--text-primary)]">Suggested next step</h4>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{selectedInsight.recommendedAction}</p>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Prototype note: non-academic source signals are simulated and should be replaced with governed institutional integrations before operational use. Scores support staff judgment; they do not make decisions about students.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
