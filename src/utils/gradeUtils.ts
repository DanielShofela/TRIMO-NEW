import { Grade, Subject, Period } from '../types';

export function calculateAverage(grades: Grade[], subjects: Subject[]) {
  if (grades.length === 0) return 0;

  let totalWeightedGrade = 0;
  let totalCoefficients = 0;

  subjects.forEach(subject => {
    const subjectGrades = grades.filter(g => g.subjectId === subject.id && !g.isPlanned);
    if (subjectGrades.length > 0) {
      const subjectAverage = calculateSubjectAverage(subjectGrades);
      totalWeightedGrade += subjectAverage * subject.coefficient;
      totalCoefficients += subject.coefficient;
    }
  });

  return totalCoefficients > 0 ? totalWeightedGrade / totalCoefficients : 0;
}

export function calculateSubjectAverage(grades: Grade[]) {
  if (grades.length === 0) return 0;
  
  const actualGrades = grades.filter(g => !g.isPlanned);
  if (actualGrades.length === 0) return 0;

  let totalPoints = 0;
  let totalMaxPoints = 0;

  actualGrades.forEach(g => {
    const normalizedGrade = (g.grade / g.maxGrade) * 20;
    totalPoints += normalizedGrade + (g.bonus || 0);
    totalMaxPoints += 20;
  });

  return (totalPoints / totalMaxPoints) * 20;
}

export function getActivePeriod(periods: Period[]) {
  const now = new Date();
  return periods.find(p => {
    const start = p.startDate.toDate();
    const end = p.endDate.toDate();
    return now >= start && now <= end;
  }) || periods[0];
}

export function formatGrade(grade: number) {
  return Math.round(grade * 100) / 100;
}
