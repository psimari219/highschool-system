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
- **Express** backend with PostgreSQL
- **Docker-ready** for production
- **Custom CSS** — dark theme, Syne + DM Sans fonts

---

## 🚀 Production Deployment

This repo now includes a backend and PostgreSQL deployment configuration.

### Required environment variables

- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — auth token secret
- `REACT_APP_API_URL` — production API base URL used by the frontend

### Deployment options

1) **Docker**

```bash
docker build -t highschool-system:latest .
docker run -e DATABASE_URL="$DATABASE_URL" -e JWT_SECRET="$JWT_SECRET" -p 5000:5000 highschool-system:latest
```

2) **Heroku / Render / Any Node host**

- Use the repo root `Procfile`:

```text
web: node server/index.js
```

- Set `DATABASE_URL` and `JWT_SECRET` in the host environment.

3) **Vercel**

- Connect the repo to Vercel.
- Add `DATABASE_URL`, `JWT_SECRET`, and `REACT_APP_API_URL` to Vercel environment variables.
- `vercel.json` is configured for the Node backend.

### GitHub Actions

The workflow `.github/workflows/deploy.yml` now:

- installs server and client dependencies
- runs `server/db-init.js` and `server/seed.js` using `DATABASE_URL`
- builds the React client
- optionally deploys to Vercel when Vercel secrets are provided

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

All data is stored in **localStorage** under the key `educore_data` (demo storage). Data persists across browser sessions. Use **Settings → Reset** to restore demo data.

---

## Hosting, PWA install and Play Store (recommended fast path)

1) Quick hosting (GitHub Pages): commit and push the repository to GitHub (branch `main` or `master`). The included GitHub Actions workflow `/.github/workflows/deploy-pages.yml` will build and publish the production site to GitHub Pages (HTTPS).

2) After deployment you will have an HTTPS URL like `https://<your-org>.github.io/<repo>/`. Open that URL in Chrome (Android or desktop) and use the browser menu → "Install" / "Add to Home screen" to install the PWA.

3) Publish to Google Play using Trusted Web Activity (TWA):
    - Host the site on HTTPS (GitHub Pages is acceptable).
    - Use Bubblewrap to generate an Android TWA package that wraps your PWA. Bubblewrap will create an Android project that you can build into an APK/AAB for Play Store.
    - See the `TWA.md` document in this repo for step-by-step commands.


---

## 🖨️ Printing Reports

Navigate to **Reports**, select a student and term, then click **Print Report**. The report card is formatted for A4 printing.
