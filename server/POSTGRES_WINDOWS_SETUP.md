# PostgreSQL Setup Guide for Windows

## Current Status
✓ PostgreSQL 17.8 is installed and running
✗ Database connection failing: The `postgres` user password is not recognized

## Solution: Reset PostgreSQL Password on Windows

If you don't remember the password you set during PostgreSQL installation, follow these steps:

### Option 1: Using pgAdmin (Easiest)
1. Open pgAdmin (comes with PostgreSQL)
   - Search "pgAdmin" in Windows Start menu
   - Default browser window opens to pgAdmin interface
   
2. In left panel, right-click **Servers** > **Register** > **Server**
   - **Name**: localhost
   - **Host**: localhost
   - **Port**: 5432
   - **Username**: postgres
   - Leave password blank and click **Save**

3. If it asks for password, click **Trust** (for local development)

4. In left panel, find **Servers** > **localhost** > **Login/Group Roles**
   - Right-click **postgres** > **Properties**
   - Go to **Definition** tab
   - Set password to: `postgres`
   - Click **Save**

### Option 2: Using Command Line (Requires Administrator Access)

1. **Open PowerShell as Administrator**
   - Right-click PowerShell > Run as Administrator

2. **Locate PostgreSQL data directory:**
   ```powershell
   $datadir = "C:\Program Files\PostgreSQL\17\data"
   ```

3. **Backup pg_hba.conf (safety first):**
   ```powershell
   Copy-Item "$datadir\pg_hba.conf" "$datadir\pg_hba.conf.bak"
   ```

4. **Modify pg_hba.conf to use trust authentication temporarily:**
   ```powershell
   $content = Get-Content "$datadir\pg_hba.conf"
   $content = $content -replace 'host    all             all             127.0.0.1/32            scram-sha-256', 'host    all             all             127.0.0.1/32            trust'
   Set-Content "$datadir\pg_hba.conf" $content
   ```

5. **Restart PostgreSQL service:**
   ```powershell
   Restart-Service -Name postgresql-x64-17
   ```

6. **Connect and reset password (no password needed now):**
   ```powershell
   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
   ```

7. **Restore pg_hba.conf security:**
   ```powershell
   Copy-Item "$datadir\pg_hba.conf.bak" "$datadir\pg_hba.conf" -Force
   ```

8. **Restart PostgreSQL again:**
   ```powershell
   Restart-Service -Name postgresql-x64-17
   ```

### Option 3: Update .env with Correct Password
If you remember the password you set during installation:
1. Open `server/.env`
2. Change `DB_PASSWORD=postgres` to your actual password
3. Save the file

## Verify Setup

After completing one of the options above, test the connection:

```bash
cd server
npm run db:init
```

Expected output:
```
✓ Database initialized successfully!
```

Then run:
```bash
npm run db:seed
```

Expected output:
```
✓ Demo data seeded successfully!
```

Finally:
```bash
npm start
```

Expected output:
```
✓ Connected to PostgreSQL
School Server running on port 5000 with PostgreSQL
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "password authentication failed" | Use one of the Options above to reset password |
| "database 'highschool_system' does not exist" | Run `npm run db:init` from server directory |
| "Cannot open postgresql-x64-17 service" | Run PowerShell as Administrator |
| Port 5432 already in use | Close other PostgreSQL instances or change `DB_PORT` in `.env` |

## Next Steps

Once PostgreSQL is set up:

1. **Initialize database schema:**
   ```bash
   cd server
   npm run db:init
   ```

2. **Seed demo data:**
   ```bash
   npm run db:seed
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **In another terminal, start the frontend:**
   ```bash
   cd ..
   npm start
   ```

Default login credentials (after seeding):
- **Admin**: Username `ADM001`, Password `admin2024`
- **Teacher**: Username `T001`, Password `teach1234`
- **Student**: Username `S001`, Password `student2024`

For more details, see [POSTGRES_SETUP.md](POSTGRES_SETUP.md)
