import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Form,
  InputGroup,
  Alert
} from 'react-bootstrap';
import {
  FiSearch,
  FiBook,
  FiClock,
  FiUsers,
  FiStar,
  FiFilter,
  FiGrid,
  FiList
} from 'react-icons/fi';
import axios from 'axios';

const StudentCourses = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  const categories = ['Programming', 'Design', 'Business', 'Marketing', 'Science', 'Mathematics', 'Other'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, [searchTerm, categoryFilter, difficultyFilter, currentPage]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        search: searchTerm,
        ...(categoryFilter && { category: categoryFilter }),
        ...(difficultyFilter && { difficulty: difficultyFilter })
      });

      const response = await axios.get(`/api/courses?${params}`);
      setCourses(response.data.courses || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Courses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get('/api/courses/student/enrolled');
      setEnrolledCourses(response.data.courses || []);
    } catch (err) {
      console.error('Enrolled courses error:', err);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`/api/courses/${courseId}/enroll`);
      fetchCourses();
      fetchEnrolledCourses();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to enroll in course';
      alert(message);
    }
  };

  const [courseTab, setCourseTab] = useState('all'); // 'all' or 'enrolled'

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(enrollment => 
      (enrollment.courseId?._id || enrollment.courseId) === courseId
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'category') {
      setCategoryFilter(value);
    } else if (filterType === 'difficulty') {
      setDifficultyFilter(value);
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setDifficultyFilter('');
    setCurrentPage(1);
  };

  const displayedCourses = courses.filter(c => {
    if (courseTab === 'enrolled') {
      return isEnrolled(c._id);
    }
    return true;
  });

  if (loading && courses.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="h3 mb-1 fw-bold text-dark">Course Hub</h1>
          <p className="text-muted mb-0">Explore new topics and track your enrolled curriculum</p>
        </div>
        <div className="d-flex gap-2">
          <div className="btn-group me-2">
            <Button
              variant={courseTab === 'all' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setCourseTab('all')}
              className="px-3"
            >
              All Courses ({courses.length})
            </Button>
            <Button
              variant={courseTab === 'enrolled' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setCourseTab('enrolled')}
              className="px-3"
            >
              My Enrolled ({enrolledCourses.length})
            </Button>
          </div>
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <FiGrid />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <FiList />
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Search and Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                value={categoryFilter}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={difficultyFilter}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="">All Levels</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={clearFilters}>
                <FiFilter className="me-2" />
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Courses Grid/List */}
      {displayedCourses.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <Row className="g-4">
              {displayedCourses.map((course) => (
                <Col md={6} lg={4} key={course._id}>
                  <Card className="h-100 border-0 shadow-sm card-hover">
                    <div className="position-relative">
                      <img
                        src={course.thumbnail || `/api/placeholder/course`}
                        alt={course.title}
                        className="card-img-top"
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      {isEnrolled(course._id) && (
                        <Badge 
                          bg="success" 
                          className="position-absolute top-0 end-0 m-2"
                        >
                          Enrolled
                        </Badge>
                      )}
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <div className="mb-2">
                        <Badge bg="light" text="dark" className="me-2">
                          {course.category}
                        </Badge>
                        <Badge bg="info" text="white">
                          {course.difficulty}
                        </Badge>
                      </div>
                      <h5 className="card-title">{course.title}</h5>
                      <p className="card-text text-muted flex-grow-1">
                        {course.description?.substring(0, 100)}...
                      </p>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <small className="text-muted">
                          <FiClock className="me-1" />
                          {course.duration}
                        </small>
                        <small className="text-muted">
                          <FiUsers className="me-1" />
                          {course.enrollmentCount || 0} students
                        </small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted">Instructor:</small>
                          <div className="fw-semibold">{course.teacherId?.name}</div>
                        </div>
                        {isEnrolled(course._id) ? (
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            as={Link}
                            to={`/student/courses/${course._id}`}
                          >
                            View Course
                          </Button>
                        ) : (
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleEnroll(course._id)}
                            disabled={loading}
                          >
                            Enroll Now
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="list-group">
              {displayedCourses.map((course) => (
                <div key={course._id} className="list-group-item">
                  <div className="d-flex align-items-center">
                    <img
                      src={course.thumbnail || `/api/placeholder/course`}
                      alt={course.title}
                      className="rounded me-3"
                      width="80"
                      height="80"
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h5 className="mb-1">{course.title}</h5>
                          <p className="text-muted mb-2">
                            {course.description?.substring(0, 150)}...
                          </p>
                        </div>
                        {isEnrolled(course._id) && (
                          <Badge bg="success">Enrolled</Badge>
                        )}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-3">
                          <Badge bg="light" text="dark">
                            {course.category}
                          </Badge>
                          <Badge bg="info" text="white">
                            {course.difficulty}
                          </Badge>
                          <small className="text-muted">
                            <FiClock className="me-1" />
                            {course.duration}
                          </small>
                          <small className="text-muted">
                            <FiUsers className="me-1" />
                            {course.enrollmentCount || 0} students
                          </small>
                        </div>
                        {isEnrolled(course._id) ? (
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            as={Link}
                            to={`/student/courses/${course._id}`}
                          >
                            View Course
                          </Button>
                        ) : (
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleEnroll(course._id)}
                            disabled={loading}
                          >
                            Enroll Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <div className="btn-group">
                <Button
                  variant="outline-primary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index + 1}
                    variant={currentPage === index + 1 ? 'primary' : 'outline-primary'}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline-primary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-5">
          <FiBook size={48} className="text-muted mb-3" />
          <h4>No courses found</h4>
          <p className="text-muted">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </Container>
  );
};

export default StudentCourses;
