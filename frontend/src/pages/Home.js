import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  InputGroup,
  Spinner
} from 'react-bootstrap';
import {
  FiBook,
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiBookOpen,
  FiArrowRight,
  FiCheckCircle,
  FiStar,
  FiSearch,
  FiClock,
  FiCheck
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [enrollingId, setEnrollingId] = useState(null);

  const categories = ['All', 'Programming', 'Design', 'Science', 'Marketing', 'Business'];

  useEffect(() => {
    fetchCourses();
    if (isAuthenticated && user?.role === 'student') {
      fetchEnrolledCourses();
    }
  }, [isAuthenticated, user]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await axios.get('/api/courses?limit=8');
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Failed to load courses on home:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const res = await axios.get('/api/courses/student/enrolled');
      const ids = (res.data.courses || []).map(c => c.courseId?._id || c.courseId);
      setEnrolledCourseIds(ids);
    } catch (err) {
      console.error('Failed to load enrolled courses:', err);
    }
  };

  const handleEnroll = async (courseId, courseTitle) => {
    if (!isAuthenticated) {
      toast.info('Please log in as a student to enroll in this course.');
      navigate('/auth/student/login');
      return;
    }

    if (user?.role !== 'student') {
      toast.warning('Instructors cannot enroll in courses.');
      return;
    }

    try {
      setEnrollingId(courseId);
      const res = await axios.post(`/api/courses/${courseId}/enroll`);
      if (res.data.success) {
        toast.success(`Enrolled in "${courseTitle}" successfully!`);
        setEnrolledCourseIds(prev => [...prev, courseId]);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to enroll';
      toast.error(msg);
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const features = [
    {
      icon: <FiBook size={32} />,
      title: 'Course Management',
      description: 'Create, manage, and deliver engaging courses with comprehensive learning materials.',
      color: 'primary'
    },
    {
      icon: <FiUsers size={32} />,
      title: 'Student Enrollment',
      description: 'Easy enrollment system with progress tracking and performance analytics.',
      color: 'success'
    },
    {
      icon: <FiAward size={32} />,
      title: 'Assignment System',
      description: 'Create assignments, collect submissions, and provide detailed feedback.',
      color: 'warning'
    },
    {
      icon: <FiTrendingUp size={32} />,
      title: 'Grade Management',
      description: 'Comprehensive grading system with analytics and student performance tracking.',
      color: 'info'
    }
  ];

  const stats = [
    {
      icon: <FiBookOpen className="text-primary" />,
      count: '1000+',
      label: 'Courses Available'
    },
    {
      icon: <FiUsers className="text-success" />,
      count: '5000+',
      label: 'Active Students'
    },
    {
      icon: <FiAward className="text-warning" />,
      count: '10000+',
      label: 'Assignments Graded'
    },
    {
      icon: <FiStar className="text-info" />,
      count: '4.8/5',
      label: 'Average Rating'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-bg text-white py-5">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={10} xl={8}>
              <div className="mb-3 d-flex justify-content-center">
                <img
                  src="/emblem.png"
                  alt="Aim Higher"
                  style={{ height: '95px', objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.35))' }}
                />
              </div>
              <h1 className="display-3 fw-bold mb-2 text-white">
                Aim Higher
              </h1>
              <p className="fs-3 fw-semibold text-warning mb-4">
                Learn Today. Lead Tomorrow.
              </p>
              <p className="lead mb-4 opacity-90 mx-auto" style={{ maxWidth: '680px' }}>
                A modern learning management system designed to empower educators
                and inspire students to achieve new heights.
              </p>

              {!isAuthenticated ? (
                <div className="d-flex gap-3 justify-content-center flex-wrap mb-4">
                  <Button
                    as={Link}
                    to="/auth/student/login"
                    size="lg"
                    variant="light"
                    className="px-4 py-2 fw-semibold shadow-sm"
                  >
                    <FiBook className="me-2" />
                    Student Portal
                  </Button>
                  <Button
                    as={Link}
                    to="/auth/teacher/login"
                    size="lg"
                    variant="outline-light"
                    className="px-4 py-2 fw-semibold"
                  >
                    <FiBookOpen className="me-2" />
                    Teacher Portal
                  </Button>
                </div>
              ) : (
                <div className="mb-4">
                  <Button
                    as={Link}
                    to={`/${user?.role}/dashboard`}
                    size="lg"
                    variant="light"
                    className="px-4 py-2 fw-semibold shadow-sm"
                  >
                    Go to Dashboard
                    <FiArrowRight className="ms-2" />
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Available Courses Section (User Story 2: Student view list of available courses on homepage to choose one to enroll in) */}
      <section className="py-5" id="courses">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <Badge bg="primary" className="mb-2 px-3 py-2 text-uppercase fw-bold letter-spacing-1">
                Explore Curriculum
              </Badge>
              <h2 className="display-6 fw-bold mb-1">Available Courses</h2>
              <p className="text-muted mb-0">Browse our industry-leading courses and enroll today</p>
            </div>
            {isAuthenticated && user?.role === 'student' && (
              <Button as={Link} to="/student/courses" variant="outline-primary" className="mt-3 mt-md-0">
                View My Courses <FiArrowRight className="ms-1" />
              </Button>
            )}
          </div>

          {/* Filters & Search */}
          <div className="bg-light p-3 rounded-4 mb-4 shadow-sm">
            <Row className="g-3 align-items-center">
              <Col lg={6}>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    <FiSearch className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by title, topic, or keyword..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                  />
                </InputGroup>
              </Col>
              <Col lg={6}>
                <div className="d-flex gap-2 flex-wrap justify-content-lg-end">
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'primary' : 'outline-secondary'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className="rounded-pill px-3"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </Col>
            </Row>
          </div>

          {/* Courses Grid */}
          {loadingCourses ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading available courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-4">
              <FiBookOpen size={48} className="text-muted mb-3" />
              <h5>No courses match your search</h5>
              <p className="text-muted">Try clearing the search or category filters.</p>
              <Button variant="outline-primary" size="sm" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <Row className="g-4">
              {filteredCourses.map(course => {
                const isEnrolled = enrolledCourseIds.includes(course._id);
                return (
                  <Col md={6} lg={4} key={course._id}>
                    <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden card-hover d-flex flex-column">
                      <div className="position-relative">
                        <img
                          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
                          alt={course.title}
                          className="w-100"
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <div className="position-absolute top-0 end-0 m-3 d-flex gap-2">
                          <Badge bg="dark" className="bg-opacity-75 backdrop-blur px-2 py-1">
                            {course.difficulty}
                          </Badge>
                          {isEnrolled && (
                            <Badge bg="success" className="px-2 py-1 d-flex align-items-center gap-1">
                              <FiCheck size={12} /> Enrolled
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Card.Body className="p-4 d-flex flex-column flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Badge bg="light" text="primary" className="fw-semibold px-2 py-1 border">
                            {course.category}
                          </Badge>
                          <small className="text-muted d-flex align-items-center gap-1">
                            <FiClock size={14} /> {course.duration}
                          </small>
                        </div>

                        <h5 className="fw-bold mb-2 text-dark" style={{ lineHeight: '1.4' }}>
                          {course.title}
                        </h5>
                        <p className="text-muted small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {course.description}
                        </p>

                        <div className="pt-3 border-top mt-auto d-flex justify-content-between align-items-center">
                          <div>
                            <small className="text-muted d-block" style={{ fontSize: '11px' }}>INSTRUCTOR</small>
                            <span className="fw-semibold text-dark small">
                              {course.teacherId?.name || 'Prof. Sarah Jenkins'}
                            </span>
                          </div>

                          {isEnrolled ? (
                            <Button
                              as={Link}
                              to={`/student/courses/${course._id}`}
                              variant="outline-success"
                              size="sm"
                              className="fw-semibold px-3 rounded-pill"
                            >
                              Go to Course
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={enrollingId === course._id}
                              onClick={() => handleEnroll(course._id, course.title)}
                              className="fw-semibold px-3 rounded-pill shadow-sm"
                            >
                              {enrollingId === course._id ? (
                                <>
                                  <Spinner animation="border" size="sm" className="me-1" />
                                  Enrolling...
                                </>
                              ) : (
                                'Enroll Now'
                              )}
                            </Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="g-4">
            {stats.map((stat, index) => (
              <Col md={6} lg={3} key={index}>
                <Card className="border-0 shadow-sm text-center rounded-4">
                  <Card.Body className="p-4">
                    <div className="mb-3 fs-3">
                      {stat.icon}
                    </div>
                    <h3 className="fw-bold mb-1">{stat.count}</h3>
                    <p className="text-muted mb-0">{stat.label}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Powerful Features for Modern Education</h2>
            <p className="lead text-muted">
              Everything you need to create an engaging learning experience
            </p>
          </div>

          <Row className="g-4">
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index}>
                <Card className="border-0 shadow-sm h-100 card-hover rounded-4">
                  <Card.Body className="text-center p-4">
                    <div className={`text-${feature.color} mb-3`}>
                      {feature.icon}
                    </div>
                    <h5 className="mb-3">{feature.title}</h5>
                    <p className="text-muted small">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">How It Works</h2>
            <p className="lead text-muted">
              Get started in minutes with our simple onboarding process
            </p>
          </div>

          <Row className="g-4">
            <Col md={4} className="text-center mb-4">
              <div className="bg-primary bg-opacity-10 rounded-circle p-4 d-inline-block mb-3">
                <FiBookOpen size={32} className="text-primary" />
              </div>
              <h5 className="mb-2">1. Register & Discover</h5>
              <p className="text-muted small">
                Sign up as a student or teacher and explore rich course catalogs.
              </p>
            </Col>

            <Col md={4} className="text-center mb-4">
              <div className="bg-success bg-opacity-10 rounded-circle p-4 d-inline-block mb-3">
                <FiCheckCircle size={32} className="text-success" />
              </div>
              <h5 className="mb-2">2. Enroll & Participate</h5>
              <p className="text-muted small">
                One-click course enrollment, download lecture materials, and submit assignments.
              </p>
            </Col>

            <Col md={4} className="text-center mb-4">
              <div className="bg-warning bg-opacity-10 rounded-circle p-4 d-inline-block mb-3">
                <FiAward size={32} className="text-warning" />
              </div>
              <h5 className="mb-2">3. Learn & Track Progress</h5>
              <p className="text-muted small">
                Receive instructor feedback, calculate cumulative GPA, and earn certificates.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 gradient-bg text-white">
        <Container className="text-center">
          <h2 className="fw-bold mb-3">Ready to Elevate Your Learning?</h2>
          <p className="lead mb-4 opacity-90">
            Join thousands of students and teachers advancing their careers on Aim Higher.
          </p>

          {!isAuthenticated ? (
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Button
                as={Link}
                to="/auth/student/register"
                size="lg"
                variant="light"
                className="px-4 py-2 fw-semibold"
              >
                <FiBook className="me-2" />
                Join as Student
              </Button>
              <Button
                as={Link}
                to="/auth/teacher/register"
                size="lg"
                variant="outline-light"
                className="px-4 py-2 fw-semibold"
              >
                <FiBookOpen className="me-2" />
                Join as Teacher
              </Button>
            </div>
          ) : (
            <Button
              as={Link}
              to={`/${user?.role}/dashboard`}
              size="lg"
              variant="light"
              className="px-4 py-2 fw-semibold"
            >
              Go to Dashboard
              <FiArrowRight className="ms-2" />
            </Button>
          )}
        </Container>
      </section>
    </div>
  );
};

export default Home;
