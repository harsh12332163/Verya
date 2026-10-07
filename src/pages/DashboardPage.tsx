import React, { useState } from 'react';
import { Users, TrendingUp, Award, BookOpen, Clock, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card, StatCard, Badge, ProgressBar, Tabs } from '../components/UI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, students, studentScores } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  // Generate dashboard data
  const totalStudents = students.length;
  const avgScore = Math.round(Object.values(studentScores).reduce((acc, s) => acc + s.overall, 0) / Object.values(studentScores).length);
  const highPerformers = Object.values(studentScores).filter(s => s.overall >= 80).length;
  const atRisk = Object.values(studentScores).filter(s => s.overall < 60).length;

  const trendData = Array.from({ length: 7 }, (_, i) => ({
    name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    score: 60 + Math.floor(Math.random() * 30),
    attendance: 70 + Math.floor(Math.random() * 25),
  }));

  const subjectData = [
    { name: 'Data Structures', avg: 72 },
    { name: 'Algorithms', avg: 68 },
    { name: 'DB Systems', avg: 75 },
    { name: 'OS', avg: 70 },
    { name: 'Networks', avg: 65 },
  ];

  const gradeDistribution = [
    { name: 'A+', value: highPerformers, color: '#173F35' },
    { name: 'B+', value: Math.floor(totalStudents * 0.3), color: '#245B49' },
    { name: 'B', value: Math.floor(totalStudents * 0.25), color: '#6F8F62' },
    { name: 'C', value: atRisk, color: '#E07A5F' },
  ];

  const recentActivities = [
    { id: 1, text: 'Assignment 3 submitted by Aarav Sharma', time: '2 min ago', type: 'success' },
    { id: 2, text: 'Lab Report due tomorrow for CS301', time: '1 hour ago', type: 'warning' },
    { id: 3, text: 'New message from Prof. Kumar', time: '3 hours ago', type: 'info' },
    { id: 4, text: 'Attendance updated for Algorithms', time: '5 hours ago', type: 'info' },
    { id: 5, text: 'Quiz results published for DB Systems', time: '1 day ago', type: 'success' },
  ];

  // If student, show personal dashboard
  if (user?.role === 'student') {
    const myScore = studentScores[user.id] || studentScores['STU1001'];
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">My Dashboard</h1>
          <p className="text-[var(--text-muted)] mt-1">Welcome back, {user.name}! Here's your academic overview.</p>
        </div>

        {/* My Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <StatCard icon={<Award size={20} />} label="Overall Score" value={`${myScore?.overall || 0}%`} change="+3% this month" />
          <StatCard icon={<BookOpen size={20} />} label="Attendance" value={`${myScore?.attendance || 0}%`} change="Good standing" />
          <StatCard icon={<CheckCircle size={20} />} label="Assignments Done" value={`${myScore?.assignments.filter(a => a.status === 'submitted').length || 0}/${myScore?.assignments.length || 0}`} />
          <StatCard icon={<TrendingUp size={20} />} label="GPA" value={user.gpa?.toFixed(1) || '8.5'} change="Above average" />
        </div>

        {/* Score Trend Chart */}
        <div className="grid lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Card>
            <h3 className="font-bold text-[var(--text-primary)] mb-4">Score Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={myScore?.trend.map((v, i) => ({ name: `Sem ${i + 1}`, score: v })) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="#6F8F62" strokeWidth={2} dot={{ fill: '#6F8F62' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="font-bold text-[var(--text-primary)] mb-4">Subject Performance</h3>
            <div className="space-y-3">
              {myScore?.subjects.map((sub, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">{sub.name}</span>
                    <span className="font-medium text-[var(--text-primary)]">{sub.marks}/{sub.maxMarks}</span>
                  </div>
                  <ProgressBar value={sub.marks} max={sub.maxMarks} color={sub.marks >= 80 ? 'bg-forest' : sub.marks >= 60 ? 'bg-moss' : 'bg-coral'} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Assignments & Labs */}
        <div className="grid lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Card>
            <h3 className="font-bold text-[var(--text-primary)] mb-4">Assignments</h3>
            <div className="space-y-3">
              {myScore?.assignments.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-primary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{a.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">Score: {a.score}/{a.maxScore}</p>
                  </div>
                  <Badge variant={a.status === 'submitted' ? 'success' : 'warning'}>{a.status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-[var(--text-primary)] mb-4">Lab Work</h3>
            <div className="space-y-3">
              {myScore?.labs.map((l, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-primary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{l.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">Score: {l.score}/{l.maxScore}</p>
                  </div>
                  <Badge variant={l.status === 'completed' ? 'success' : 'info'}>{l.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <StatCard icon={<Users size={20} />} label="Total Students" value={totalStudents} change="+12 this month" />
        <StatCard icon={<Award size={20} />} label="Average Score" value={`${avgScore}%`} change="+2.5% vs last month" />
        <StatCard icon={<TrendingUp size={20} />} label="High Performers" value={highPerformers} change={`${Math.round(highPerformers/totalStudents*100)}% of total`} />
        <StatCard icon={<AlertTriangle size={20} />} label="At Risk" value={atRisk} change="Needs attention" color="text-coral" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-[var(--text-primary)] mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }} />
              <Bar dataKey="score" fill="#6F8F62" radius={[4, 4, 0, 0]} />
              <Bar dataKey="attendance" fill="#A8BE9A" radius={[4, 4, 0, 0]} />
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

      {/* Subject Averages & Recent Activity */}
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

        <Card>
          <h3 className="font-bold text-[var(--text-primary)] mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivities.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-primary)]">
                <div className={`mt-0.5 ${a.type === 'success' ? 'text-green-500' : a.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`}>
                  {a.type === 'success' ? <CheckCircle size={16} /> : a.type === 'warning' ? <AlertTriangle size={16} /> : <Clock size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">{a.text}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
