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
  Alert,
  Modal,
  ProgressBar
} from 'react-bootstrap';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiUsers,
  FiBook,
  FiEye,
  FiGrid,
  FiList,
  FiClock,
  FiUser
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const TeacherCourses = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudentsList, setEnrolledStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Form State
  const initialForm = {
    title: '',
    description: '',
    duration: '',
    category: 'Programming',
    difficulty: 'Beginner',
    price: 0,
    tags: '',
    thumbnail: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, statusFilter, currentPage]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });

      const response = await axios.get(`/api/courses/teacher/my-courses?${params}`);
      setCourses(response.data.courses || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Courses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.duration) {
      toast.error('Title, description, and duration are required.');
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post('/api/courses', formData);
      if (response.data.success) {
        toast.success('Course created successfully!');
        setShowCreateModal(false);
        setFormData(initialForm);
        fetchCourses();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create course';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      setSaving(true);
      const response = await axios.put(`/api/courses/${selectedCourse._id}`, formData);
      if (response.data.success) {
        toast.success('Course updated successfully!');
        setShowEditModal(false);
        setSelectedCourse(null);
        fetchCourses();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update course';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      await axios.delete(`/api/courses/${selectedCourse._id}`);
      toast.success('Course deleted');
      setShowDeleteModal(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete course';
      toast.error(message);
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      duration: course.duration,
      category: course.category || 'Programming',
      difficulty: course.difficulty || 'Beginner',
      price: course.price || 0,
      tags: Array.isArray(course.tags) ? course.tags.join(', ') : (course.tags || ''),
      thumbnail: course.thumbnail || ''
    });
    setShowEditModal(true);
  };

  const openStudentsModal = async (course) => {
    setSelectedCourse(course);
    setShowStudentsModal(true);
    setLoadingStudents(true);
    try {
      const res = await axios.get(`/api/enrollments/course/${course._id}`);
      setEnrolledStudentsList(res.data.enrollments || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

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
          <h1 className="h3 mb-1 fw-bold text-dark">Course Management</h1>
          <p className="text-muted mb-0">Create, edit, and monitor your curriculum and enrolled students</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setFormData(initialForm);
            setShowCreateModal(true);
          }}
          className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
        >
          <FiPlus size={18} /> Create Course
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Search and Filters */}
      <Card className="mb-4 border-0 shadow-sm rounded-4">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <FiSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search courses by title or topic..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="border-start-0"
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-3"
              >
                <option value="all">All Courses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <div className="d-flex gap-2 justify-content-md-end">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-3"
                >
                  <FiGrid />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-3"
                >
                  <FiList />
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Courses Grid/List */}
      {courses.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <Row className="g-4">
              {courses.map((course) => (
                <Col md={6} lg={4} key={course._id}>
                  <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden card-hover d-flex flex-column">
                    <div className="position-relative">
                      <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
                        alt={course.title}
                        className="w-100"
                        style={{ height: '190px', objectFit: 'cover' }}
                      />
                      <Badge 
                        bg={course.isPublished ? 'success' : 'warning'} 
                        className="position-absolute top-0 end-0 m-3 px-2 py-1"
                      >
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge 
                        bg="dark" 
                        className="bg-opacity-75 position-absolute top-0 start-0 m-3 px-2 py-1"
                      >
                        {course.difficulty}
                      </Badge>
                    </div>

                    <Card.Body className="p-4 d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Badge bg="light" text="primary" className="border px-2 py-1">
                          {course.category}
                        </Badge>
                        <small className="text-muted d-flex align-items-center gap-1">
                          <FiClock size={13} /> {course.duration}
                        </small>
                      </div>

                      <h5 className="fw-bold mb-2 text-dark">{course.title}</h5>
                      <p className="text-muted small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.description}
                      </p>

                      <div className="pt-3 border-top mt-auto d-flex justify-content-between align-items-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => openStudentsModal(course)}
                          className="rounded-pill px-3 py-1 d-flex align-items-center gap-1 fw-semibold text-decoration-none"
                          title="View Enrolled Students & Track Participation"
                        >
                          <FiUsers size={14} /> {course.enrolledStudents?.length || 0} Students
                        </Button>

                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            as={Link}
                            to={`/teacher/courses/${course._id}`}
                            title="View Course Hub"
                            className="rounded-circle p-2"
                          >
                            <FiEye size={15} />
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => openEditModal(course)}
                            title="Edit Course"
                            className="rounded-circle p-2"
                          >
                            <FiEdit size={15} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => { setSelectedCourse(course); setShowDeleteModal(true); }}
                            title="Delete Course"
                            className="rounded-circle p-2"
                          >
                            <FiTrash2 size={15} />
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="d-flex flex-column gap-3">
              {courses.map((course) => (
                <Card key={course._id} className="border-0 shadow-sm rounded-4 p-3 card-hover">
                  <div className="d-flex align-items-center flex-wrap gap-3">
                    <img
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
                      alt={course.title}
                      className="rounded-3"
                      width="100"
                      height="75"
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h5 className="fw-bold mb-1 text-dark">{course.title}</h5>
                        <Badge bg={course.isPublished ? 'success' : 'warning'}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-muted small mb-2">{course.description?.substring(0, 140)}...</p>
                      <div className="d-flex gap-3 text-muted small">
                        <span><FiClock className="me-1" /> {course.duration}</span>
                        <span><FiUsers className="me-1" /> {course.enrolledStudents?.length || 0} students</span>
                        <Badge bg="light" text="dark" className="border">{course.category}</Badge>
                      </div>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => openStudentsModal(course)}
                        className="rounded-pill px-3 d-flex align-items-center gap-1 fw-semibold"
                        title="View Enrolled Students Roster & Track Participation"
                      >
                        <FiUsers size={14} /> Students ({course.enrolledStudents?.length || 0})
                      </Button>
                      <Button 
                        variant="outline-info" 
                        size="sm"
                        as={Link}
                        to={`/teacher/courses/${course._id}`}
                        className="rounded-pill px-3"
                      >
                        Course Hub
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => openEditModal(course)}
                        className="rounded-pill px-3"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => { setSelectedCourse(course); setShowDeleteModal(true); }}
                        className="rounded-pill px-3"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-5 bg-light rounded-4">
          <FiBook size={48} className="text-muted mb-3" />
          <h4>No courses found</h4>
          <p className="text-muted">Create your first course to get started.</p>
          <Button
            variant="primary"
            onClick={() => { setFormData(initialForm); setShowCreateModal(true); }}
            className="rounded-pill px-4"
          >
            <FiPlus className="me-2" /> Create Course
          </Button>
        </div>
      )}

      {/* MODAL: Create Course (User Story 2: Teacher creates a course with title, description, duration) */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Create New Course</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateCourse}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Course Title *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Master React & Node.js Architecture"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Course Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                placeholder="Describe what students will learn in this course..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Course Duration *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. 8 Weeks (64 Hours)"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Category</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Programming">Programming</option>
                    <option value="Design">Design</option>
                    <option value="Science">Science</option>
                    <option value="Business">Business</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Difficulty Level</Form.Label>
                  <Form.Select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Tags (comma-separated)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. React, NodeJS, WebDev"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold">Course Thumbnail Image URL</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              />
              <Form.Text className="text-muted">Leave empty to use high-resolution default cover.</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Creating Course...' : 'Publish Course'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL: Edit Course */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Edit Course</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditCourse}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Course Title</Form.Label>
              <Form.Control
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Duration</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Category</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Programming">Programming</option>
                    <option value="Design">Design</option>
                    <option value="Science">Science</option>
                    <option value="Business">Business</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Thumbnail URL</Form.Label>
              <Form.Control
                type="url"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL: Enrolled Students (User Story 3: Teacher see list of students enrolled in course) */}
      <Modal show={showStudentsModal} onHide={() => setShowStudentsModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-bottom pb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Badge bg="primary" className="text-uppercase" style={{ fontSize: '11px' }}>
                {selectedCourse?.category || 'Curriculum'}
              </Badge>
              <small className="text-muted"><FiClock className="me-1" />{selectedCourse?.duration}</small>
            </div>
            <Modal.Title className="fw-bold fs-5">
              Enrolled Students Roster — {selectedCourse?.title}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="p-4">
          {loadingStudents ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Fetching enrolled student roster...</p>
            </div>
          ) : enrolledStudentsList.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-4">
              <FiUser size={42} className="text-muted mb-3 opacity-50" />
              <h6 className="fw-bold text-dark">No Students Enrolled Yet</h6>
              <p className="text-muted small mb-0">Students who enroll in this course will appear here with real-time participation tracking.</p>
            </div>
          ) : (
            <>
              {/* Participation Metric Summary */}
              <Row className="g-3 mb-4">
                <Col sm={4}>
                  <div className="p-3 bg-light rounded-3 text-center border">
                    <div className="fs-4 fw-bold text-dark">{enrolledStudentsList.length}</div>
                    <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '11px' }}>Enrolled Students</small>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="p-3 bg-light rounded-3 text-center border">
                    <div className="fs-4 fw-bold text-success">
                      {enrolledStudentsList.filter(e => e.status !== 'dropped').length}
                    </div>
                    <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '11px' }}>Active Learners</small>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="p-3 bg-light rounded-3 text-center border">
                    <div className="fs-4 fw-bold text-primary">
                      {Math.round(enrolledStudentsList.reduce((acc, curr) => acc + (curr.progress || 0), 0) / (enrolledStudentsList.length || 1))}%
                    </div>
                    <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '11px' }}>Average Progress</small>
                  </div>
                </Col>
              </Row>

              <div className="table-responsive rounded-3 border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Student Name</th>
                      <th>Email</th>
                      <th>Enrolled On</th>
                      <th>Participation Progress</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudentsList.map((enr) => {
                      const progressVal = enr.progress || 0;
                      const progressColor = progressVal >= 75 ? 'success' : progressVal >= 35 ? 'primary' : 'warning';
                      return (
                        <tr key={enr._id}>
                          <td className="ps-3">
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={enr.studentId?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                                alt={enr.studentId?.name}
                                className="rounded-circle border"
                                width="38"
                                height="38"
                                style={{ objectFit: 'cover' }}
                              />
                              <div>
                                <span className="fw-semibold text-dark d-block">{enr.studentId?.name || 'Student'}</span>
                                <small className="text-muted" style={{ fontSize: '11px' }}>ID: {enr.studentId?._id || enr.studentId}</small>
                              </div>
                            </div>
                          </td>
                          <td className="text-muted small">{enr.studentId?.email || 'N/A'}</td>
                          <td className="text-muted small">
                            {enr.enrolledAt ? new Date(enr.enrolledAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently'}
                          </td>
                          <td style={{ width: '220px' }}>
                            <div className="d-flex align-items-center gap-2">
                              <ProgressBar now={progressVal} variant={progressColor} className="flex-grow-1" style={{ height: '8px', borderRadius: '4px' }} />
                              <span className="fw-bold small text-dark" style={{ minWidth: '36px' }}>{progressVal}%</span>
                            </div>
                          </td>
                          <td>
                            <Badge 
                              bg={enr.status === 'completed' ? 'success' : 'primary'}
                              className="text-capitalize px-2 py-1"
                            >
                              {enr.status || 'active'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top d-flex justify-content-between">
          <div>
            {selectedCourse && (
              <Button
                as={Link}
                to={`/teacher/courses/${selectedCourse._id}`}
                variant="outline-primary"
                size="sm"
                className="rounded-pill px-3"
              >
                Go to Course Hub &rarr;
              </Button>
            )}
          </div>
          <Button variant="secondary" size="sm" className="rounded-pill px-4" onClick={() => setShowStudentsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete course "<strong>{selectedCourse?.title}</strong>"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteCourse}>Delete Course</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherCourses;
