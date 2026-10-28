import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert
} from 'react-bootstrap';
import {
  FiBook,
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiPlus,
  FiCalendar,
  FiBarChart2,
  FiFileText
} from 'react-icons/fi';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';

import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    totalGrades: 0,
    averageGrade: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, coursesRes, assignmentsRes] = await Promise.all([
        axios.get('/api/enrollments/dashboard/stats'),
        axios.get('/api/courses/teacher/my-courses?limit=5'),
        axios.get('/api/assignments/teacher/my-assignments?limit=5')
      ]);

      // Process stats
      const s = statsRes.data.stats || {};
      const courseList = coursesRes.data.courses || [];
      const assignmentList = assignmentsRes.data.assignments || [];

      setStats({
        totalCourses: s.totalCourses || courseList.length,
        totalStudents: s.totalStudents || 3,
        totalAssignments: assignmentList.length || 4,
        totalGrades: 3,
        averageGrade: 94
      });

      setRecentCourses(coursesRes.data.courses || []);
      setRecentAssignments(assignmentsRes.data.assignments || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEnrollmentData = () => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = [12, 19, 23, 25, 32, 38]; // Mock data - replace with real data

    return {
      labels,
      datasets: [
        {
          label: 'Student Enrollments',
          data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }
      ]
    };
  };

  const getCourseDistribution = () => {
    const labels = ['Programming', 'Design', 'Business', 'Marketing', 'Other'];
    const data = [8, 5, 3, 2, 1]; // Mock data - replace with real data

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#28a745',
            '#17a2b8',
            '#ffc107',
            '#fd7e14',
            '#6f42c1'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm mb-4 text-white" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', borderRadius: '16px' }}>
        <Card.Body className="p-4 p-md-5 d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
          <div className="d-flex align-items-center gap-3">
            <img
              src="/logo.png"
              alt="Aim Higher Logo"
              className="bg-white p-2 rounded-3 shadow"
              style={{ maxHeight: '70px', objectFit: 'contain' }}
            />
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h2 className="fw-bold mb-0 text-white">Welcome back, {user?.name}!</h2>
                <Badge bg="warning" text="dark" className="px-2 py-1">Teacher</Badge>
              </div>
              <p className="mb-0 text-white-50 fs-6">Aim Higher — Learn Today. Lead Tomorrow.</p>
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Button as={Link} to="/teacher/courses" variant="light" className="fw-semibold px-3 py-2 text-primary shadow-sm">
              <FiPlus className="me-2" />
              Create Course
            </Button>
            <Button as={Link} to="/teacher/assignments" variant="outline-light" className="fw-semibold px-3 py-2">
              <FiPlus className="me-2" />
              Create Assignment
            </Button>
          </div>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm card-hover">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <FiBook className="text-primary" size={24} />
                  </div>
                </div>
                <div className="ms-3">
                  <h4 className="mb-0">{stats.totalCourses}</h4>
                  <p className="text-muted mb-0 small">Total Courses</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm card-hover">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <FiUsers className="text-success" size={24} />
                  </div>
                </div>
                <div className="ms-3">
                  <h4 className="mb-0">{stats.totalStudents}</h4>
                  <p className="text-muted mb-0 small">Total Students</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm card-hover">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <FiFileText className="text-warning" size={24} />
                  </div>
                </div>
                <div className="ms-3">
                  <h4 className="mb-0">{stats.totalAssignments}</h4>
                  <p className="text-muted mb-0 small">Assignments</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm card-hover">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <FiAward className="text-info" size={24} />
                  </div>
                </div>
                <div className="ms-3">
                  <h4 className="mb-0">{stats.averageGrade}%</h4>
                  <p className="text-muted mb-0 small">Avg Grade</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Enrollment Chart */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Student Enrollment Trend</h5>
            </Card.Header>
            <Card.Body>
              <Line
                data={getEnrollmentData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Students'
                      }
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Course Distribution */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Course Categories</h5>
            </Card.Header>
            <Card.Body>
              <Doughnut
                data={getCourseDistribution()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mt-4">
        {/* Recent Courses */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Courses</h5>
                <Button
                  variant="outline-primary"
                  size="sm"
                  as={Link}
                  to="/teacher/courses"
                >
                  View All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {recentCourses.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentCourses.map((course) => (
                    <div key={course._id} className="list-group-item px-0">
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1">{course.title}</h6>
                          <p className="text-muted small mb-2">
                            {course.description?.substring(0, 100)}...
                          </p>
                          <div className="d-flex align-items-center gap-3">
                            <Badge bg={course.isPublished ? 'success' : 'warning'}>
                              {course.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                            <small className="text-muted">
                              <FiUsers className="me-1" />
                              {course.enrolledStudents?.length || 0} students
                            </small>
                            <small className="text-muted">
                              <FiCalendar className="me-1" />
                              {new Date(course.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            as={Link}
                            to={`/teacher/courses/${course._id}`}
                          >
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiBook size={48} className="text-muted mb-3" />
                  <p className="text-muted">No courses created yet</p>
                  <Button as={Link} to="/teacher/courses" variant="primary">
                    Create Your First Course
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Assignments */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Assignments</h5>
                <Button
                  variant="outline-primary"
                  size="sm"
                  as={Link}
                  to="/teacher/assignments"
                >
                  View All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {recentAssignments.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentAssignments.map((assignment) => (
                    <div key={assignment._id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{assignment.title}</h6>
                          <p className="text-muted small mb-2">
                            {assignment.courseId?.title}
                          </p>
                          <div className="d-flex flex-column gap-1">
                            <Badge bg={assignment.isPublished ? 'success' : 'warning'}>
                              {assignment.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                            <small className="text-muted">
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiFileText size={48} className="text-muted mb-3" />
                  <p className="text-muted">No assignments created yet</p>
                  <Button as={Link} to="/teacher/assignments" variant="primary">
                    Create Assignment
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TeacherDashboard;
