import { generateId } from '../data/store';

// Simple rule-based prototype for personalized learning plans
export function analyzeStudent(store, studentId) {
  const student = (store.students || []).find(s => s.id === studentId);
  if (!student) return null;
  const grades = (store.grades || []).filter(g => g.studentId === studentId);
  const subjects = {};
  grades.forEach(g => {
    subjects[g.subject] = subjects[g.subject] || { total: 0, count: 0 };
    subjects[g.subject].total += g.score || 0;
    subjects[g.subject].count += 1;
  });
  const subjectAverages = Object.keys(subjects).map(sub => ({ subject: sub, avg: Math.round(subjects[sub].total / subjects[sub].count) }));

  const attendance = (store.attendance || []).filter(a => a.studentId === studentId);
  const present = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate = attendance.length ? Math.round((present / attendance.length) * 100) : 100;

  const weaknesses = subjectAverages.filter(s => s.avg < 60).sort((a,b)=>a.avg-b.avg);

  return { student, subjectAverages, attendanceRate, weaknesses };
}

export function generatePersonalPlan(store, studentId) {
  const analysis = analyzeStudent(store, studentId);
  if (!analysis) return null;

  const goals = [];
  if (analysis.weaknesses.length) {
    analysis.weaknesses.forEach(w => {
      goals.push({ subject: w.subject, target: Math.min(100, w.avg + 20), note: `Focus on core topics in ${w.subject}` });
    });
  } else {
    goals.push({ subject: 'General', target: 85, note: 'Consolidate strengths and prepare extension tasks' });
  }

  if (analysis.attendanceRate < 80) goals.push({ subject: 'Attendance', target: 90, note: 'Improve attendance to benefit learning continuity' });

  // Build a weekly action plan (4 weeks) simple tasks
  const actions = [];
  for (let wk = 1; wk <= 4; wk++) {
    const weekTasks = [];
    goals.forEach(g => {
      weekTasks.push({ week: wk, subject: g.subject, task: `Week ${wk} practice for ${g.subject}`, minutes: 30 });
    });
    actions.push({ week: wk, tasks: weekTasks });
  }

  const resources = analysis.weaknesses.slice(0,3).map(w => ({ subject: w.subject, resource: `Suggested workbook chapter for ${w.subject}` }));

  const plan = {
    id: generateId('PLAN'),
    studentId,
    createdAt: new Date().toISOString(),
    generatedBy: 'system',
    analysisSummary: { attendanceRate: analysis.attendanceRate, weaknesses: analysis.weaknesses },
    goals,
    actions,
    resources,
    status: 'active',
  };

  return plan;
}
