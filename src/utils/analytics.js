export function overallAttendanceRate(store) {
  const attendance = store.attendance || [];
  if (attendance.length === 0) return 100;
  const present = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  return Math.round((present / attendance.length) * 100);
}

export function feeRiskStudents(store) {
  const students = store.students || [];
  const payments = store.feePayments || [];
  const term = store.school?.currentTerm;
  const year = store.school?.currentYear;
  const termFeeIds = (store.feeStructure || []).filter(f => f.term === term && f.year === year).map(f => f.id);
  return students.filter(s => {
    const paid = payments.find(p => p.studentId === s.id && p.term === term && p.year === year && termFeeIds.includes(p.feeId));
    return !paid;
  });
}

export function averageGradeForTerm(store) {
  const grades = (store.grades || []).filter(g => g.term === store.school?.currentTerm && g.year === store.school?.currentYear);
  if (grades.length === 0) return null;
  const avg = grades.reduce((s, g) => s + (g.score || 0), 0) / grades.length;
  return Math.round(avg * 100) / 100;
}

export function interventionAlerts(store, opts = { attendanceThreshold: 75, gradeThreshold: 50 }) {
  const students = store.students || [];
  const attendance = store.attendance || [];
  const grades = store.grades || [];
  const alerts = [];

  // Low attendance
  students.forEach(s => {
    const recs = attendance.filter(a => a.studentId === s.id);
    if (recs.length > 0) {
      const present = recs.filter(r => r.status === 'Present' || r.status === 'Late').length;
      const rate = (present / recs.length) * 100;
      if (rate < opts.attendanceThreshold) alerts.push({ studentId: s.id, type: 'Low Attendance', value: `${Math.round(rate)}%` });
    }
  });

  // Low grades
  students.forEach(s => {
    const recs = grades.filter(g => g.studentId === s.id);
    if (recs.length > 0) {
      const avg = recs.reduce((a, b) => a + (b.score || 0), 0) / recs.length;
      if (avg < opts.gradeThreshold) alerts.push({ studentId: s.id, type: 'Low Grades', value: `${Math.round(avg)}%` });
    }
  });

  // Fee arrears
  const feeRisk = feeRiskStudents(store);
  feeRisk.forEach(s => alerts.push({ studentId: s.id, type: 'Fee Arrears', value: '' }));

  // Map student details
  return alerts.map(a => ({ ...a, student: (students.find(s => s.id === a.studentId) || {}) }));
}

export function attendanceByGrade(store) {
  const grades = (store.students || []).reduce((acc, s) => {
    acc[s.grade] = acc[s.grade] || { present: 0, total: 0 };
    return acc;
  }, {});
  const attendance = store.attendance || [];
  attendance.forEach(a => {
    const s = store.students.find(x => x.id === a.studentId);
    if (!s) return;
    grades[s.grade] = grades[s.grade] || { present: 0, total: 0 };
    if (a.status === 'Present' || a.status === 'Late') grades[s.grade].present += 1;
    grades[s.grade].total += 1;
  });
  const result = Object.keys(grades).map(g => ({ grade: g, rate: grades[g].total ? Math.round((grades[g].present / grades[g].total) * 100) : 100 }));
  return result.sort((a,b)=>a.grade.localeCompare(b.grade));
}

export function gradeDistribution(store) {
  const grades = store.grades || [];
  const buckets = {};
  grades.forEach(g => {
    const key = Math.floor((g.score || 0) / 10) * 10; // 0-9,10-19,...90-100
    buckets[key] = (buckets[key] || 0) + 1;
  });
  const entries = Object.keys(buckets).map(k => ({ range: `${k}-${Number(k)+9}`, count: buckets[k] })).sort((a,b)=>parseInt(a.range)-parseInt(b.range));
  return entries;
}
