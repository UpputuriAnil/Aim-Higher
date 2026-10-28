import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Form,
  Alert,
  Modal,
  InputGroup
} from 'react-bootstrap';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiGrid,
  FiList,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const TeacherAssignments = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const initialForm = {
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    maxMarks: 100,
    instructions: '',
    submissionType: 'both',
    allowLateSubmission: true,
    latePenalty: 0
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, [searchTerm, courseFilter, statusFilter, currentPage]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        search: searchTerm,
        ...(courseFilter && { courseId: courseFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await axios.get(`/api/assignments/teacher/my-assignments?${params}`);
      setAssignments(response.data.assignments || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      setError('Failed to load assignments');
      console.error('Assignments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses/teacher/my-courses');
      const list = response.data.courses || [];
      setCourses(list);
      if (list.length > 0 && !formData.courseId) {
        setFormData(prev => ({ ...prev, courseId: list[0]._id }));
      }
    } catch (err) {
      console.error('Courses error:', err);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.courseId || !formData.dueDate) {
      toast.error('Title, description, course, and due date are required.');
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post('/api/assignments', formData);
      if (response.data.success) {
        toast.success('Assignment created successfully!');
        setShowCreateModal(false);
        setFormData(initialForm);
        fetchAssignments();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create assignment';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEditAssignment = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    try {
      setSaving(true);
      const response = await axios.put(`/api/assignments/${selectedAssignment._id}`, formData);
      if (response.data.success) {
        toast.success('Assignment updated successfully!');
        setShowEditModal(false);
        setSelectedAssignment(null);
        fetchAssignments();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update assignment';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      await axios.delete(`/api/assignments/${selectedAssignment._id}`);
      toast.success('Assignment deleted');
      setShowDeleteModal(false);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete assignment';
      toast.error(message);
    }
  };

  const openEditModal = (assignment) => {
    setSelectedAssignment(assignment);
    const dateStr = assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '';
    setFormData({
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId?._id || assignment.courseId,
      dueDate: dateStr,
      maxMarks: assignment.maxMarks || 100,
      instructions: assignment.instructions || '',
      submissionType: assignment.submissionType || 'both',
      allowLateSubmission: assignment.allowLateSubmission !== undefined ? assignment.allowLateSubmission : true,
      latePenalty: assignment.latePenalty || 0
    });
    setShowEditModal(true);
  };

  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days remaining`;
  };

  if (loading && assignments.length === 0) {
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
          <h1 className="h3 mb-1 fw-bold text-dark">Assignment Builder</h1>
          <p className="text-muted mb-0">Create, publish, and evaluate course assignments</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setFormData({
              ...initialForm,
              courseId: courses.length > 0 ? courses[0]._id : ''
            });
            setShowCreateModal(true);
          }}
          className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
        >
          <FiPlus size={18} /> Create Assignment
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Search and Filters */}
      <Card className="mb-4 border-0 shadow-sm rounded-4">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-center">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <FiSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="border-start-0"
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={courseFilter}
                onChange={(e) => { setCourseFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-3"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
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

      {/* Assignments Grid */}
      {assignments.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <Row className="g-4">
              {assignments.map((assignment) => (
                <Col md={6} lg={4} key={assignment._id}>
                  <Card className="h-100 border-0 shadow-sm rounded-4 card-hover p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge bg="light" text="primary" className="border px-2 py-1">
                        {assignment.courseId?.title || 'General Course'}
                      </Badge>
                      <Badge bg={new Date() > new Date(assignment.dueDate) ? 'danger' : 'success'}>
                        {getDaysRemaining(assignment.dueDate)}
                      </Badge>
                    </div>

                    <h5 className="fw-bold mb-2 text-dark">{assignment.title}</h5>
                    <p className="text-muted small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {assignment.description}
                    </p>

                    <div className="pt-3 border-top mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-3 text-muted small">
                        <span><FiCalendar className="me-1" /> Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        <span className="fw-bold text-dark">{assignment.maxMarks} Marks</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <Button
                          as={Link}
                          to={`/teacher/grading?assignmentId=${assignment._id}`}
                          variant="outline-primary"
                          size="sm"
                          className="rounded-pill px-3"
                        >
                          Review Submissions
                        </Button>

                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => openEditModal(assignment)}
                            className="rounded-circle p-2"
                            title="Edit"
                          >
                            <FiEdit size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => { setSelectedAssignment(assignment); setShowDeleteModal(true); }}
                            className="rounded-circle p-2"
                            title="Delete"
                          >
                            <FiTrash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="d-flex flex-column gap-3">
              {assignments.map((assignment) => (
                <Card key={assignment._id} className="border-0 shadow-sm rounded-4 p-4 card-hover">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex gap-2 align-items-center mb-1">
                        <Badge bg="light" text="primary" className="border">
                          {assignment.courseId?.title || 'Course'}
                        </Badge>
                        <span className="text-muted small">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        <span className="text-muted small">Max Marks: {assignment.maxMarks}</span>
                      </div>
                      <h5 className="fw-bold text-dark mb-1">{assignment.title}</h5>
                      <p className="text-muted small mb-0">{assignment.description?.substring(0, 140)}...</p>
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        as={Link}
                        to={`/teacher/grading?assignmentId=${assignment._id}`}
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill px-3"
                      >
                        Submissions
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => openEditModal(assignment)}
                        className="rounded-pill px-3"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => { setSelectedAssignment(assignment); setShowDeleteModal(true); }}
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
          <FiFileText size={48} className="text-muted mb-3" />
          <h4>No assignments found</h4>
          <p className="text-muted">Create an assignment for one of your courses.</p>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="rounded-pill px-4"
          >
            <FiPlus className="me-2" /> Create Assignment
          </Button>
        </div>
      )}

      {/* MODAL: Create Assignment (User Story 4: Teacher creates assignment) */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Create New Assignment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateAssignment}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Select Course *</Form.Label>
              <Form.Select
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              >
                <option value="">-- Choose Course --</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Assignment Title *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Build a REST API with Express"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                placeholder="Explain the assignment objectives and problem statement..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Due Date *</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Max Marks</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Submission Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="e.g. Submit GitHub repository link or ZIP file..."
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Accepted Submission Format</Form.Label>
                  <Form.Select
                    value={formData.submissionType}
                    onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
                  >
                    <option value="both">Both Text & File Upload</option>
                    <option value="text">Text Response Only</option>
                    <option value="file">File Upload Only</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-center mt-3 mt-md-0">
                <Form.Check
                  type="checkbox"
                  id="allowLate"
                  label="Allow late submissions"
                  checked={formData.allowLateSubmission}
                  onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Publish Assignment'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL: Edit Assignment */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Edit Assignment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditAssignment}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Title</Form.Label>
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
                  <Form.Label className="fw-semibold">Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Max Marks</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete assignment "<strong>{selectedAssignment?.title}</strong>"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteAssignment}>Delete Assignment</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherAssignments;
