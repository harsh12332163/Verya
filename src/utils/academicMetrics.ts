import { StudentScore, User } from '../contexts/AppContext';
import { createStudentSuccessInsight } from './studentSuccess';

export function getSubjectScopedScore(score: StudentScore, courses: string[]): StudentScore {
  const subjects = score.subjects.filter(subject => courses.includes(subject.name));
  const attendanceByCourse = score.attendanceByCourse.filter(course => courses.includes(course.course));
  const assignments = score.assignments.filter(item => courses.includes(item.subject));
  const labs = score.labs.filter(item => courses.includes(item.subject));

  return {
    ...score,
    subjects,
    attendanceByCourse,
    assignments,
    labs,
    overall: subjects.length
      ? Math.round(subjects.reduce((total, subject) => total + subject.marks, 0) / subjects.length)
      : 0,
    attendance: attendanceByCourse.length
      ? Math.round(attendanceByCourse.reduce((total, course) => total + course.attendance, 0) / attendanceByCourse.length)
      : 0,
  };
}

export function getAccessibleScore(user: User, score: StudentScore): StudentScore {
  if (user.role !== 'student') return score;
  return getSubjectScopedScore(score, user.courses || score.subjects.map(subject => subject.name));
}

export function calculateSgpa(score: StudentScore): number {
  const creditTotal = score.subjects.reduce((total, subject) => total + subject.credits, 0);
  if (!creditTotal) return 0;

  const points = score.subjects.reduce((total, subject) => {
    const percentage = (subject.marks / subject.maxMarks) * 100;
    const gradePoint = percentage >= 90 ? 10
      : percentage >= 80 ? 9
      : percentage >= 70 ? 8
      : percentage >= 60 ? 7
      : percentage >= 50 ? 6
      : 0;
    return total + gradePoint * subject.credits;
  }, 0);

  return Number((points / creditTotal).toFixed(2));
}

export function calculateCgpa(user: User, score: StudentScore): number {
  const storedGpa = user.gpa || 0;
  if (storedGpa > 0) {
    const tenPointGpa = storedGpa <= 4 ? storedGpa * 2.5 : storedGpa;
    return Number(Math.min(10, tenPointGpa).toFixed(2));
  }
  return calculateSgpa(score);
}

export function assessAcademicRisk(overall: number, attendance: number, score?: StudentScore, user?: User) {
  const details: string[] = [];
  const normalizedScore = score ? { ...score, overall, attendance } : undefined;
  const student = user || {
    id: normalizedScore?.studentId || 'student',
    name: 'Student',
    email: '',
    role: 'student' as const,
  };
  const success = normalizedScore
    ? createStudentSuccessInsight(student, normalizedScore)
    : undefined;
  const lowAttendanceCourses = score?.attendanceByCourse.filter(course => course.attendance < 75) ?? [];
  if (lowAttendanceCourses.length) {
    lowAttendanceCourses.forEach(course => details.push(`Attendance is low in ${course.course} (${course.attendance}%).`));
  } else if (attendance < 75) {
    details.push(`Overall attendance is low at ${attendance}%.`);
  }
  score?.subjects.filter(subject => subject.marks < 65).forEach(subject => {
    details.push(`${subject.name} marks are low at ${subject.marks}%.`);
  });
  score?.assignments.filter(item => item.status === 'pending' || item.score < 50).forEach(item => {
    details.push(item.status === 'pending'
      ? `${item.name} for ${item.subject} is still pending.`
      : `${item.name} for ${item.subject} has a low mark (${item.score}/${item.maxScore}).`);
  });
  score?.labs.filter(item => item.status !== 'completed' || item.score < 50).forEach(item => {
    details.push(item.status !== 'completed'
      ? `${item.name} for ${item.subject} is not completed.`
      : `${item.name} for ${item.subject} has a low mark (${item.score}/${item.maxScore}).`);
  });

  if (overall < 65 && !score?.subjects.some(subject => subject.marks < 65)) details.push(`Overall marks are low at ${overall}%.`);
  const reasons = [
    ...(success?.riskReasons ?? []),
    ...details.filter(reason => !success?.riskReasons.includes(reason)),
  ];
  if (!success && details.length === 0) {
    reasons.push(`Your academic average is ${overall}% and attendance is ${attendance}%; integrated engagement data is not available.`);
  } else if (success && success.safeScore >= 75) {
    reasons.push(`Your safe score is ${success.safeScore}/100 — good standing across academic, attendance, LMS, engagement, placement, skills, and feedback indicators.`);
  }

  const riskScore = success?.riskScore ?? Math.min(100, (overall < 65 ? 30 : 0) + (attendance < 75 ? 30 : 0));
  return {
    riskScore,
    safeScore: success?.safeScore ?? 100 - riskScore,
    level: riskScore >= 60 ? 'High' : riskScore >= 30 ? 'Moderate' : 'Low',
    reasons: reasons.length ? reasons : ['Your safe score is in good standing across the available indicators.'],
  };
}
