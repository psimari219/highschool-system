const router = require('express').Router();
const auth = require('../middleware/auth');
const { query } = require('../models/data');

router.get('/', auth, async (req, res) => {
  const [{ rows: schools }] = await Promise.all([
    query('SELECT * FROM school LIMIT 1'),
  ]);

  const [{ rows: studentCountRows }, { rows: teacherCountRows }, { rows: classCountRows }, { rows: activeStudentRows }, { rows: upcomingEventsRows }, { rows: avgGpaRows }] = await Promise.all([
    query('SELECT COUNT(*)::int AS total_students FROM students'),
    query('SELECT COUNT(*)::int AS total_teachers FROM teachers'),
    query('SELECT COUNT(*)::int AS total_classes FROM classes'),
    query("SELECT COUNT(*)::int AS active_students FROM students WHERE enrollment_status = 'active'"),
    query("SELECT COUNT(*)::int AS upcoming_events FROM events WHERE status = 'Upcoming'"),
    query(
      `SELECT ROUND(AVG(gpa_points)::numeric,2) AS avg_gpa FROM grades WHERE gpa_points IS NOT NULL`
    ),
  ]);

  const gradeDistributionRows = await query(
    `SELECT grade, COUNT(*)::int AS count
     FROM grades
     GROUP BY grade
     ORDER BY grade DESC`
  );

  const activeStudents = activeStudentRows[0]?.active_students || 0;
  const gradeDistribution = {};
  gradeDistributionRows.rows.forEach(row => {
    gradeDistribution[row.grade] = row.count;
  });

  res.json({
    school: schools[0] || null,
    totalStudents: studentCountRows[0]?.total_students || 0,
    totalTeachers: teacherCountRows[0]?.total_teachers || 0,
    totalClasses: classCountRows[0]?.total_classes || 0,
    activeStudents,
    gradeDistribution,
    avgGPA: avgGpaRows[0]?.avg_gpa || 0,
    sportsTeams: (await query('SELECT COUNT(*)::int AS count FROM sports WHERE status = $1', ['active'])).rows[0].count,
    upcomingEvents: upcomingEventsRows[0]?.upcoming_events || 0,
  });
});

module.exports = router;
