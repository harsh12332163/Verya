import { StudentScore, User } from '../contexts/AppContext';

export type SuccessIndicatorKey =
  | 'academic'
  | 'attendance'
  | 'lms'
  | 'engagement'
  | 'placement'
  | 'skills'
  | 'feedback';

export interface SuccessIndicator {
  key: SuccessIndicatorKey;
  label: string;
  value: number;
  weight: number;
  contribution: number;
}

export interface StudentSuccessInsight {
  student: User;
  score: number;
  riskScore: number;
  safeScore: number;
  indicators: SuccessIndicator[];
  academicRisk: boolean;
  placementRisk: boolean;
  riskLevel: 'High' | 'Moderate' | 'Low';
  riskReasons: string[];
  segment: string;
  insight: string;
  recommendedAction: string;
}

const weights: Array<{ key: SuccessIndicatorKey; label: string; weight: number }> = [
  { key: 'academic', label: 'Academic performance', weight: 0.30 },
  { key: 'attendance', label: 'Attendance', weight: 0.20 },
  { key: 'lms', label: 'LMS activity', weight: 0.15 },
  { key: 'engagement', label: 'Campus engagement', weight: 0.10 },
  { key: 'placement', label: 'Placement readiness', weight: 0.15 },
  { key: 'skills', label: 'Skills assessment', weight: 0.07 },
  { key: 'feedback', label: 'Student feedback', weight: 0.03 },
];

const bounded = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function seededValue(id: string, signal: string, min: number, max: number): number {
  const seed = `${id}:${signal}`;
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return min + (hash >>> 0) % (max - min + 1);
}

export function createStudentSuccessInsight(student: User, score: StudentScore): StudentSuccessInsight {
  const academic = bounded(score.overall);
  const attendance = bounded(score.attendance);
  const assessmentWork = [...score.assignments, ...score.labs];
  const completedWork = assessmentWork.filter(item => item.status !== 'pending');
  const completionRate = assessmentWork.length
    ? completedWork.length / assessmentWork.length * 100
    : 65;
  const averageWorkMark = completedWork.length
    ? completedWork.reduce((total, item) => total + item.score / Math.max(1, item.maxScore) * 100, 0) / completedWork.length
    : 65;
  const lms = bounded(completionRate * 0.6 + averageWorkMark * 0.4);
  const engagement = seededValue(student.id, 'engagement', 42, 96);
  const aptitude = bounded(academic * 0.55 + seededValue(student.id, 'aptitude', 25, 95) * 0.45);
  const coding = bounded(academic * 0.65 + seededValue(student.id, 'coding', 25, 95) * 0.35);
  const mockInterview = seededValue(student.id, 'interview', 35, 92);
  const placement = bounded(aptitude * 0.4 + coding * 0.35 + mockInterview * 0.25);
  const technicalSkills = bounded(academic * 0.55 + seededValue(student.id, 'technical', 30, 95) * 0.45);
  const softSkills = seededValue(student.id, 'soft-skills', 35, 96);
  const skills = bounded(technicalSkills * 0.6 + softSkills * 0.4);
  const feedback = seededValue(student.id, 'feedback', 55, 96);

  const values: Record<SuccessIndicatorKey, number> = {
    academic,
    attendance,
    lms,
    engagement,
    placement,
    skills,
    feedback,
  };
  const indicators = weights.map(indicator => ({
    ...indicator,
    value: values[indicator.key],
    contribution: Number((values[indicator.key] * indicator.weight).toFixed(1)),
  }));
  const successScore = Math.round(indicators.reduce((total, indicator) => total + indicator.contribution, 0));
  const academicRisk = academic < 65 || attendance < 75;
  const placementRisk = placement < 55;
  const riskReasons: string[] = [];

  if (academic < 65) riskReasons.push(`Academic average is ${academic}%, below the 65% support threshold.`);
  if (attendance < 75) riskReasons.push(`Attendance is ${attendance}%, below the 75% campus threshold.`);
  if (lms < 60) riskReasons.push(`LMS completion and assessment activity are at ${lms}%.`);
  if (engagement < 55) riskReasons.push(`Campus engagement is at ${engagement}%, indicating an opportunity to reconnect the student with activities or support.`);
  if (placement < 55) riskReasons.push(`Placement readiness is ${placement}%, indicating a need for aptitude, coding, or interview practice.`);
  if (skills < 55) riskReasons.push(`Skills assessment is at ${skills}%, suggesting targeted technical or soft-skill practice.`);
  if (feedback < 55) riskReasons.push(`Student feedback is at ${feedback}%, so a check-in may help identify concerns.`);
  if (!riskReasons.length) {
    if (successScore >= 75) {
      riskReasons.push('No support threshold is currently breached; your safe score is in good standing.');
    } else {
      const lowestIndicators = [...indicators]
        .sort((left, right) => left.value - right.value)
        .slice(0, 2);
      lowestIndicators.forEach(indicator => {
        riskReasons.push(`${indicator.label} is ${indicator.value}%, contributing to a safe score below the 75-point good-standing target.`);
      });
    }
  }

  let segment = 'Developing steadily';
  let insight = 'Review progress at the next routine check-in.';
  let recommendedAction = 'Continue regular academic and engagement check-ins.';
  if (academic >= 70 && placement < 60) {
    segment = 'Strong academics · placement gap';
    insight = 'Academic performance is stronger than placement readiness.';
    recommendedAction = 'Offer a placement-readiness plan focused on aptitude, coding practice, and mock interviews.';
  } else if (academicRisk) {
    segment = 'Academic support needed';
    insight = 'Attendance or academic performance is below a support threshold.';
    recommendedAction = 'Schedule a faculty check-in and agree on a subject-level attendance or tutoring plan.';
  } else if (lms < 60 || engagement < 55) {
    segment = 'Re-engagement opportunity';
    insight = 'Learning activity or campus engagement is comparatively low.';
    recommendedAction = 'Check for barriers to participation and connect the student with relevant learning or campus support.';
  } else if (successScore >= 75 && placement >= 65) {
    segment = 'High momentum';
    insight = 'Academic and readiness indicators are consistently strong.';
    recommendedAction = 'Recognize progress and consider peer mentoring or advanced opportunities.';
  }

  const riskScore = 100 - successScore;
  return {
    student,
    score: successScore,
    riskScore,
    safeScore: successScore,
    indicators,
    academicRisk,
    placementRisk,
    riskLevel: riskScore >= 60 ? 'High' : riskScore >= 30 ? 'Moderate' : 'Low',
    riskReasons,
    segment,
    insight,
    recommendedAction,
  };
}
