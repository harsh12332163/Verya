import React from 'react';
import { Award, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Badge, Card, ProgressBar } from '../components/UI';
import { assessAcademicRisk, calculateCgpa, calculateSgpa, getAccessibleScore } from '../utils/academicMetrics';

const assessmentWeights = [
  { key: 'labs', label: 'Labs', weight: '10%' },
  { key: 'assignments', label: 'Assignments', weight: '15%' },
  { key: 'assessment', label: 'Assessment', weight: '10%' },
  { key: 'midSem', label: 'Mid-sem', weight: '25%' },
  { key: 'finals', label: 'Finals', weight: '40%' },
] as const;

export default function AcademicsPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, studentScores } = useApp();
  const storedScore = user ? studentScores[user.id] : undefined;
  const score = user && storedScore ? getAccessibleScore(user, storedScore) : undefined;

  if (user?.role !== 'student' || !score) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Card hover={false}>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Academic performance</h1>
          <p className="text-[var(--text-muted)] mt-2">Choose a student to review their subject scores and academic risk factors.</p>
          <button onClick={() => onNavigate('students')} className="btn-primary mt-5 text-sm">Open student directory</button>
        </Card>
      </div>
    );
  }

  const sgpa = calculateSgpa(score);
  const cgpa = calculateCgpa(user, score);
  const risk = assessAcademicRisk(score.overall, score.attendance, score, user);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Academic performance</h1>
        <p className="text-[var(--text-muted)] mt-1">Your cumulative and semester GPA, course credits, and full assessment breakdown.</p>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover={false} className="flex items-center gap-3">
          <Award className="text-moss" />
          <div><p className="text-xs text-[var(--text-muted)]">CGPA</p><p className="text-2xl font-bold text-[var(--text-primary)]">{cgpa.toFixed(2)}<span className="text-sm font-normal"> / 10</span></p></div>
        </Card>
        <Card hover={false} className="flex items-center gap-3">
          <Award className="text-moss" />
          <div><p className="text-xs text-[var(--text-muted)]">SGPA</p><p className="text-2xl font-bold text-[var(--text-primary)]">{sgpa.toFixed(2)}<span className="text-sm font-normal"> / 10</span></p></div>
        </Card>
        <Card hover={false}>
          <p className="text-xs text-[var(--text-muted)]">Academic risk score</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{risk.riskScore}<span className="text-sm font-normal"> / 100</span></p>
          <Badge variant={risk.level === 'High' ? 'error' : risk.level === 'Moderate' ? 'warning' : 'success'}>{risk.level} risk</Badge>
        </Card>
        <Card hover={false}>
          <p className="text-xs text-[var(--text-muted)]">Safe score</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{risk.safeScore}<span className="text-sm font-normal"> / 100</span></p>
          <Badge variant={risk.safeScore >= 75 ? 'success' : risk.safeScore >= 60 ? 'warning' : 'error'}>
            {risk.safeScore >= 75 ? 'Good standing' : risk.safeScore >= 60 ? 'Monitor' : 'Needs support'}
          </Badge>
          <div className="mt-2"><ProgressBar value={risk.safeScore} /></div>
        </Card>
      </section>

      <Card hover={false}>
        <div className="flex items-center gap-2 mb-3">
          {risk.level === 'Low' ? <ShieldCheck size={18} className="text-moss" /> : <AlertTriangle size={18} className="text-coral" />}
          <h2 className="font-bold text-[var(--text-primary)]">Why this risk score?</h2>
        </div>
        <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
          {risk.reasons.map(reason => <li key={reason}>{reason}</li>)}
        </ul>
        <p className="mt-3 text-xs text-[var(--text-muted)]">Risk and safe scores combine academic marks, attendance, LMS activity, engagement, placement readiness, skills, and feedback. Non-academic signals are simulated in this prototype; address listed factors to improve the score.</p>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Course-by-course scores</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Final course marks use the assessment weights shown below.</p>
        </div>
        {score.subjects.map(subject => (
          <Card key={subject.name} hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">{subject.name}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">{subject.credits} credits</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[var(--text-primary)]">{subject.marks}/{subject.maxMarks}</p>
                <Badge variant={subject.marks >= 80 ? 'success' : subject.marks >= 60 ? 'info' : 'warning'}>{subject.grade}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {assessmentWeights.map(component => (
                <div key={component.key} className="rounded-xl bg-[var(--bg-primary)] p-3">
                  <p className="text-xs text-[var(--text-muted)]">{component.label} <span className="opacity-70">({component.weight})</span></p>
                  <p className="font-semibold text-[var(--text-primary)]">{subject[component.key]}/100</p>
                </div>
              ))}
            </div>
            <div className="mt-4"><ProgressBar value={subject.marks} /></div>
          </Card>
        ))}
      </section>
    </div>
  );
}
