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
  FiCalendar,
  FiAward,
  FiClock,
  FiTrendingUp,
  FiBookOpen
} from 'react-icons/fi';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
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
        axios.get('/api/courses/student/enrolled?limit=5'),
        axios.get('/api/assignments/student/my-assignments?limit=5')
      ]);

      // Process stats
      const s = statsRes.data.stats || {};
      const assignments = assignmentsRes.data.assignments || [];
      const pendingCount = assignments.filter(a => !a.submissionStatus?.submitted).length;
      const completedCount = assignments.filter(a => a.submissionStatus?.submitted).length;

      setStats({
        enrolledCourses: s.totalEnrolled || (coursesRes.data.courses || []).length,
        pendingAssignments: pendingCount,
        completedAssignments: completedCount,
        averageGrade: s.averageProgress || 75
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
              src="/emblem.png"
              alt="Aim Higher Logo"
              style={{ maxHeight: '70px', objectFit: 'contain' }}
            />
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h2 className="fw-bold mb-0 text-white">Welcome back, {user?.name}!</h2>
                <Badge bg="light" text="dark" className="px-2 py-1">Student</Badge>
              </div>
              <p className="mb-0 text-white-50 fs-6">Aim Higher — Learn Today. Lead Tomorrow.</p>
            </div>
          </div>
          <Button as={Link} to="/student/courses" variant="light" className="fw-semibold px-4 py-2 text-primary shadow-sm">
            <FiBookOpen className="me-2" />
            Browse Courses
          </Button>
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
                  <h4 className="mb-0">{stats.enrolledCourses}</h4>
                  <p className="text-muted mb-0 small">Enrolled Courses</p>
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
                    <FiCalendar className="text-warning" size={24} />
                  </div>
                </div>
                <div className="ms-3">
                  <h4 className="mb-0">{stats.pendingAssignments}</h4>
                  <p className="text-muted mb-0 small">Pending Assignments</p>
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
                    <FiAward className="text-success" size={24} />
                  </div>
                </div>
                <div className="ms-3">
                  <h4 className="mb-0">{stats.completedAssignments}</h4>
                  <p className="text-muted mb-0 small">Completed</p>
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
                    <FiTrendingUp className="text-info" size={24} />
                  </div>
                </div>
                <div className="ms-3">
                  <h4 className="mb-0">{Math.round(stats.averageGrade)}%</h4>
                  <p className="text-muted mb-0 small">Avg Progress</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
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
                  to="/student/courses"
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
                        <div className="flex-shrink-0">
                          <img
                            src={course.courseId?.thumbnail || `/api/placeholder/course`}
                            alt={course.courseId?.title}
                            className="rounded"
                            width="60"
                            height="60"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1">{course.courseId?.title}</h6>
                          <p className="text-muted small mb-2">
                            {course.courseId?.description?.substring(0, 100)}...
                          </p>
                          <div className="d-flex align-items-center gap-3">
                            <Badge bg="primary">{course.status}</Badge>
                            <small className="text-muted">
                              <FiClock className="me-1" />
                              {new Date(course.enrolledAt).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            as={Link}
                            to={`/student/courses/${course.courseId?._id}`}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiBook size={48} className="text-muted mb-3" />
                  <p className="text-muted">No courses enrolled yet</p>
                  <Button as={Link} to="/student/courses" variant="primary">
                    Browse Courses
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
                  to="/student/assignments"
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
                          <h6 className="mb-1">{assignment.assignmentId?.title}</h6>
                          <p className="text-muted small mb-2">
                            {assignment.assignmentId?.courseId?.title}
                          </p>
                          <div className="d-flex flex-column gap-1">
                            <Badge
                              bg={
                                assignment.submissionStatus?.submitted
                                  ? assignment.submissionStatus?.status === 'graded'
                                    ? 'success'
                                    : 'info'
                                  : assignment.submissionStatus?.isOverdue
                                    ? 'danger'
                                    : 'warning'
                              }
                            >
                              {assignment.submissionStatus?.submitted
                                ? assignment.submissionStatus?.status === 'graded'
                                  ? 'Graded'
                                  : 'Submitted'
                                : assignment.submissionStatus?.isOverdue
                                  ? 'Overdue'
                                  : 'Pending'
                              }
                            </Badge>
                            <small className="text-muted">
                              Due: {new Date(assignment.assignmentId?.dueDate).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiCalendar size={48} className="text-muted mb-3" />
                  <p className="text-muted">No assignments yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentDashboard;
