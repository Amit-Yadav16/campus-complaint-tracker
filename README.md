# Campus Complaint Tracker

A responsive campus complaint accountability web app.

## Tech Stack
- **Frontend**: React.js + Tailwind CSS (Vite)
- **Backend**: Node.js + Express.js
- **Storage**: JSON files (migration-ready for MongoDB/PostgreSQL)

## Getting Started

### Backend
```bash
cd server
npm install
npm run dev      # starts on http://localhost:5000
```

### Frontend
```bash
cd client
npm install
npm run dev      # starts on http://localhost:5173
```

## Seed Accounts (all passwords: `password123`)
| Email | Role | Department |
|---|---|---|
| alice@college.edu | Student | — |
| bob.admin@college.edu | Admin | Hostel / Maintenance |
| dave.admin@college.edu | Admin | Academic / Exam |
| carol.hod@college.edu | HOD | All departments |

## Development Phases
1. ✅ Scaffolding
2. 🔲 Authentication
3. 🔲 Complaint submission
4. 🔲 Student views
5. 🔲 Admin views
6. 🔲 Rule Engine + SLA
7. 🔲 Escalation + HOD
8. 🔲 Resolution flow
9. 🔲 External reporting
10. 🔲 Notifications + polish
