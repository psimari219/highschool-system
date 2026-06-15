# PostgreSQL Setup Guide

## Overview
The High School Management System now uses PostgreSQL for persistent data storage instead of in-memory storage. This means all data persists across server restarts.

## Prerequisites
- PostgreSQL 12+ installed on your system
- Node.js 16+

## Installation Steps

### 1. Install PostgreSQL
**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Run the installer and follow prompts
- Remember the password you set for the `postgres` user

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database User & Database
Open PostgreSQL terminal/psql:

```sql
-- Create a new user (if not using default postgres user)
CREATE USER highschool_user WITH PASSWORD 'your_secure_password';

-- Create the database
CREATE DATABASE highschool_system OWNER highschool_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE highschool_system TO highschool_user;
```

### 3. Update Environment Variables
Edit `server/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=highschool_system
DB_USER=your_db_user
DB_PASSWORD=your_db_password
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secure_jwt_secret
```

### 4. Install Dependencies
```bash
cd server
npm install
```

### 5. Initialize Database Schema
```bash
npm run db:init
```

### 6. Seed Initial Data
```bash
npm run db:seed
```

Or do both in one command:
```bash
npm run db:setup
```

### 7. Start the Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

## Default Users
After seeding, you can login with:

| Role | Username | Password |
|------|----------|----------|
| Owner | OWN001 | owner2026 |
| Admin | ADM001 | admin2024 |
| Teacher | T001-T006 | teach1234 |
| Accountant | ACC001 | acc2024 |
| Student | S001-S008 | student2024 |

## Database Management

### View Database Content
```bash
# Connect to database
psql -U your_db_user -d highschool_system

# Common commands:
\dt                    # List all tables
\d users               # Describe users table
SELECT * FROM users;   # View all users
\q                     # Exit
```

### Backup Database
```bash
pg_dump -U your_db_user -d highschool_system > backup.sql
```

### Restore Database
```bash
psql -U your_db_user -d highschool_system < backup.sql
```

### Reset Database (Warning: Deletes all data)
```bash
dropdb -U your_db_user highschool_system
createdb -U your_db_user highschool_system
npm run db:setup
```

## Tables Created
- `users` - All login accounts
- `students` - Student records
- `teachers` - Teacher records
- `staff` - Non-teaching staff
- `subjects` - Subject catalog
- `classes` - Class information
- `enrollment` - Student enrollments
- `grades` - Student grades
- `attendance` - Attendance records
- `fee_structure` - Fee definitions
- `fee_payments` - Payment records
- `sports` - Sports programs
- `sport_members` - Sport team members
- `schemes` - Payment schemes
- `messages` - User messages
- `school` - School configuration

## Troubleshooting

**Connection refused error:**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify connection details in `.env`
- Check database and user exist: `psql -U postgres -l`

**Port conflict (5432 already in use):**
- Change DB_PORT in `.env` to an available port
- Or kill the existing PostgreSQL process

**Permission denied:**
- Verify user permissions: `psql -U postgres`
- Then: `GRANT ALL PRIVILEGES ON DATABASE highschool_system TO your_user;`

**Seed script fails:**
- Ensure db:init ran successfully first
- Delete any existing schema and run `npm run db:init` again

## Next Steps
1. Update API routes to use PostgreSQL queries
2. Migrate from in-memory data operations to SQL queries
3. Add data validation and error handling
4. Implement backup/restore functionality in the UI
