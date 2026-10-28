import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

// Auth Pages
import StudentLogin from './pages/auth/StudentLogin';
import StudentRegister from './pages/auth/StudentRegister';
import TeacherLogin from './pages/auth/TeacherLogin';
import TeacherRegister from './pages/auth/TeacherRegister';

// Student Dashboard
import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentAssignments from './pages/student/Assignments';
import StudentGrades from './pages/student/Grades';
import StudentProfile from './pages/student/Profile';

// Teacher Dashboard
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherCourses from './pages/teacher/Courses';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherGrading from './pages/teacher/Grading';
import TeacherProfile from './pages/teacher/Profile';

// Course Hub (Materials, Discussions, Assignments, Enrolled Students)
import CourseDetails from './pages/CourseDetails';

// Context
import { AuthProvider } from './context/AuthContext';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Auth Routes */}
              <Route path="/auth/student/login" element={<StudentLogin />} />
              <Route path="/auth/student/register" element={<StudentRegister />} />
              <Route path="/auth/teacher/login" element={<TeacherLogin />} />
              <Route path="/auth/teacher/register" element={<TeacherRegister />} />
              
              {/* Student Protected Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute role="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/courses"
                element={
                  <ProtectedRoute role="student">
                    <StudentCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/assignments"
                element={
                  <ProtectedRoute role="student">
                    <StudentAssignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/grades"
                element={
                  <ProtectedRoute role="student">
                    <StudentGrades />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute role="student">
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />
              
              {/* Teacher Protected Routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute role="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/courses"
                element={
                  <ProtectedRoute role="teacher">
                    <TeacherCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/assignments"
                element={
                  <ProtectedRoute role="teacher">
                    <TeacherAssignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/grading"
                element={
                  <ProtectedRoute role="teacher">
                    <TeacherGrading />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/profile"
                element={
                  <ProtectedRoute role="teacher">
                    <TeacherProfile />
                  </ProtectedRoute>
                }
              />
              
              {/* Course Hub / Details Routes (Materials, Discussions, Assignments, Roster) */}
              <Route
                path="/student/courses/:id"
                element={
                  <ProtectedRoute role="student">
                    <CourseDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/courses/:id"
                element={
                  <ProtectedRoute role="teacher">
                    <CourseDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/courses/create"
                element={<Navigate to="/teacher/courses" replace />}
              />
              <Route
                path="/teacher/courses/:id/edit"
                element={<Navigate to={`/teacher/courses`} replace />}
              />
              <Route
                path="/teacher/assignments/create"
                element={<Navigate to="/teacher/assignments" replace />}
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
