# Aim Higher — Learning Management System (LMS)

A modern full-stack Learning Management System with role-based authentication (Student & Teacher), Google Single Sign-On (Firebase Authentication), course creation, student enrollment, assignment submissions, grading, and analytics.

---

## 🚀 Key Features

### 🔐 Authentication & Security
- **Role-Based Access**: Dedicated portals and workflows for **Students** and **Instructors/Teachers**.
- **Google Sign-In / Sign-Up**: Integrated Google OAuth via Firebase with auto-account creation.
- **JWT & Password Security**: JSON Web Tokens with `bcryptjs` password hashing and secure token storage.
- **Single Centralized Configuration**: All environment variables managed cleanly in one root `.env` file with full `.gitignore` protection.

### 🎓 Student Experience
- **Student Dashboard**: Real-time view of enrolled courses, upcoming assignments, and performance.
- **Course Catalog & Enrollment**: Explore courses, view instructor details, curriculum, and enroll with a single click.
- **Assignment Submissions**: Submit work, check deadlines, and view status.
- **Grade & Progress Tracking**: Visual breakdown of grades, feedback, and performance stats.

### 👨‍🏫 Instructor / Teacher Experience
- **Teacher Dashboard**: Comprehensive analytics covering student enrollments, course stats, and submission reviews.
- **Course Management**: Create, edit, and publish rich courses with modules and syllabus.
- **Assignment Builder**: Set deadlines, instructions, and scoring criteria.
- **Grading & Feedback Suite**: Review student submissions and provide direct scores and comments.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, React Router v6, Bootstrap 5, React-Bootstrap, React Icons, React-Toastify, Chart.js, Firebase Auth SDK, Axios |
| **Backend** | Node.js, Express.js, MongoDB / Mongoose (with in-memory fallback), JWT, Bcryptjs, Multer, Helmet, Rate Limiter |
| **Authentication** | Email & Password (JWT) + Google Identity (Firebase Auth) |
| **Configuration** | Centralized `.env` with `dotenv-cli` orchestration |

---

## 📁 Project Structure

```
Aim Higher/
├── .env                      # Single centralized configuration file (Root)
├── .gitignore                # Unified gitignore for both frontend and backend
├── package.json              # Root orchestration scripts
├── README.md                 # Project documentation
│
├── frontend/                 # React Client Application
│   ├── node_modules/         # Frontend dependencies exclusively
│   ├── public/               # Public assets & emblem
│   ├── src/
│   │   ├── components/       # GoogleAuthButton, Header, Footer, Illustrations
│   │   ├── context/          # AuthContext (Student/Teacher/Google Auth state)
│   │   ├── firebase.js       # Firebase SDK initialization & Google OAuth provider
│   │   ├── pages/            # Student, Teacher, and Public pages
│   │   │   ├── auth/         # StudentLogin, StudentRegister, TeacherLogin, TeacherRegister
│   │   │   ├── student/      # Student Dashboard, Courses, Assignments, Profile
│   │   │   └── teacher/      # Teacher Dashboard, Course Builder, Submissions, Grades
│   │   ├── App.js            # App routing & protected route wrappers
│   │   └── index.css         # Modern design tokens, Google Identity styling
│   └── package.json          # Frontend dependencies & start scripts
│
└── backend/                  # Node.js / Express API Server
    ├── node_modules/         # Backend dependencies exclusively
    ├── controllers/          # authController (email & googleAuth), courseController, etc.
    ├── middleware/           # auth protection & role verification
    ├── models/               # Student, Teacher, Course, Assignment schemas
    ├── routes/               # /api/auth, /api/courses, /api/assignments, etc.
    ├── utils/                # In-memory DB and helper utilities
    ├── uploads/              # File uploads
    ├── server.js             # Express API entry point
    └── package.json          # Backend dependencies
```

---

## ⚙️ Environment Configuration

All environment variables for both backend and frontend are placed in a single root `.env` file:

```env
# Backend Server Configuration
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?appName=AimHigher
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development

# Frontend Firebase / Google Auth Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

---

## 🚀 How to Run the Application

### 1. Install Dependencies
Run from the root directory to install both frontend and backend dependencies:
```bash
npm run install-all
```

### 2. Start Backend & Frontend Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```

### 3. Or Run in Separate Terminals

#### Terminal 1 — Backend API
```powershell
cd backend
npm run dev
```
*Server runs on `http://localhost:5000`*

#### Terminal 2 — Frontend Client
```powershell
cd frontend
npm start
```
*Client runs on `http://localhost:3000`*

---

## 📡 API Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/student/register` | Register a new student account |
| `POST` | `/api/auth/student/login` | Student login with email & password |
| `POST` | `/api/auth/teacher/register` | Register a new instructor account |
| `POST` | `/api/auth/teacher/login` | Teacher login with email & password |
| `POST` | `/api/auth/google` | Google SSO login & auto-registration |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `PUT` | `/api/auth/profile` | Update profile details |
| `POST` | `/api/auth/logout` | Invalidate token and session |

---

## 🔒 Security Best Practices Implemented
- **No Hardcoded Credentials**: Source code in `frontend/` and `backend/` references only environment variables.
- **Single Central `.gitignore`**: Blocks `.env`, `node_modules`, and upload folders from version control.
- **Clean Dependency Separation**: `frontend/node_modules` and `backend/node_modules` are maintained strictly within their respective folders.
