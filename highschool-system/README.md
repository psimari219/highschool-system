# THE DIGITAL 5 — High School Management System

A full-featured high school management platform built with React. Manages every aspect of school operations.

## 🚀 Quick Start

```bash
cd highschool-system
npm install
npm start
```

Opens at **http://localhost:3000**

---

## 📋 Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Overview stats, charts, attendance trends, GPA, upcoming events |
| **Students** | Full student profiles, search/filter, grade breakdown, sports, attendance history |
| **Teachers** | Staff management, subjects, class assignments |
| **Enrollment** | Application intake, approve/reject workflow, auto-creates student record |
| **Classes** | Grade/stream management, class teachers, subjects, capacity tracking |
| **Timetables** | Visual weekly timetable editor per class — click cells to assign periods |
| **Attendance** | Take class registers, mark present/absent/late/excused, view records |
| **Grades & GPA** | Record grades, GPA rankings, grade scale reference, 4.0 GPA system |
| **Schemes of Work** | Weekly curriculum plans with topics, objectives, resources, assessment |
| **Reports** | Printable student report cards with grades, GPA, attendance, activities |
| **Sports & Clubs** | Team/individual sports management, members, schedule, venue |
| **Events** | School calendar with event types, organizers, venues |
| **Settings** | School profile, data summary, system reset |

---

## 🛠️ Tech Stack

- **React 18** with React Router v6
- **Recharts** for dashboard charts
- **Lucide React** for icons
- **localStorage** for data persistence (no backend required)
- **Custom CSS** — dark theme, Syne + DM Sans fonts

---

## 📁 Project Structure

```
src/
├── App.jsx                    # Root with routing
├── index.js / index.css       # Entry point + global styles
├── data/
│   └── store.js               # Data layer, seed data, GPA helpers
└── components/
    ├── layout/
    │   ├── Sidebar.jsx
    │   └── Topbar.jsx
    ├── dashboard/Dashboard.jsx
    ├── students/
    │   ├── Students.jsx
    │   ├── StudentModal.jsx
    │   └── StudentDetail.jsx
    ├── teachers/Teachers.jsx
    ├── classes/
    │   ├── Classes.jsx
    │   └── Timetables.jsx
    ├── enrollment/Enrollment.jsx
    ├── attendance/Attendance.jsx
    ├── grades/Grades.jsx
    ├── schemes/Schemes.jsx
    ├── sports/Sports.jsx
    ├── events/Events.jsx
    ├── reports/Reports.jsx
    └── settings/Settings.jsx
```

---

## 🎓 GPA Scale

| Grade | Range | Points |
|-------|-------|--------|
| A+    | 90–100 | 4.0   |
| A     | 85–89  | 4.0   |
| A-    | 80–84  | 3.7   |
| B+    | 75–79  | 3.3   |
| B     | 70–74  | 3.0   |
| ...   | ...    | ...   |
| F     | 0–39   | 0.0   |

---

## 💾 Data Persistence

All data is stored in **localStorage** under the key `educore_data`. Data persists across browser sessions. Use **Settings → Reset** to restore demo data.

---

## 🖨️ Printing Reports

Navigate to **Reports**, select a student and term, then click **Print Report**. The report card is formatted for A4 printing.
