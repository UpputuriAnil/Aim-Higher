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
  Alert,
  Modal
} from 'react-bootstrap';
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiUpload,
  FiFileText,
  FiEye,
  FiEdit
} from 'react-icons/fi';
import axios from 'axios';

const StudentAssignments = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViewAssignment, setSelectedViewAssignment] = useState(null);
  const [submitForm, setSubmitForm] = useState({
    textContent: '',
    files: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchAssignments();
  }, [statusFilter, courseFilter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: 50,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(courseFilter && { courseId: courseFilter })
      });

      const response = await axios.get(`/api/assignments/student/my-assignments?${params}`);
      setAssignments(response.data.assignments || []);

      // Extract unique courses for filter
      const uniqueCourses = [...new Set(
        response.data.assignments.map(a => a.assignmentId?.courseId?._id).filter(Boolean)
      )];
      setCourses(uniqueCourses);
    } catch (err) {
      setError('Failed to load assignments');
      console.error('Assignments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('assignmentId', selectedAssignment._id);
      formData.append('textContent', submitForm.textContent);

      submitForm.files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      await axios.post('/api/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowSubmitModal(false);
      setSelectedAssignment(null);
      setSubmitForm({ textContent: '', files: [] });
      fetchAssignments();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit assignment';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSubmitForm({ ...submitForm, files });
  };

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  const getStatusBadge = (assignment) => {
    const status = assignment.submissionStatus;

    if (status?.submitted) {
      if (status.status === 'graded') {
        return <Badge bg="success">Graded</Badge>;
      }
      return <Badge bg="info">Submitted</Badge>;
    }

    if (status?.isOverdue) {
      return <Badge bg="danger">Overdue</Badge>;
    }

    return <Badge bg="warning">Pending</Badge>;
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">My Assignments</h1>
          <p className="text-muted mb-0">View and submit your assignments</p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="ungraded">Pending</option>
                <option value="graded">Graded</option>
                <option value="late">Late</option>
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="">All Courses</option>
                {courses.map(courseId => (
                  <option key={courseId} value={courseId}>
                    {assignments.find(a => a.assignmentId?.courseId?._id === courseId)?.assignmentId?.courseId?.title}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Assignments List */}
      {assignments.length > 0 ? (
        <div className="list-group">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="list-group-item">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="mb-1">{assignment.assignmentId?.title}</h5>
                      <p className="text-muted mb-2">
                        {assignment.assignmentId?.description?.substring(0, 150)}...
                      </p>
                    </div>
                    {getStatusBadge(assignment)}
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-3">
                      <small className="text-muted">
                        <FiCalendar className="me-1" />
                        {assignment.assignmentId?.courseId?.title}
                      </small>
                      <small className="text-muted">
                        <FiClock className="me-1" />
                        Due: {new Date(assignment.assignmentId?.dueDate).toLocaleDateString()}
                      </small>
                      <small className={`fw-semibold ${new Date(assignment.assignmentId?.dueDate) < new Date()
                          ? 'text-danger'
                          : 'text-warning'
                        }`}>
                        {getDaysRemaining(assignment.assignmentId?.dueDate)}
                      </small>
                    </div>

                    <div className="d-flex gap-2">
                      {assignment.submissionStatus?.submitted ? (
                        <>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => {
                              setSelectedViewAssignment(assignment);
                              setShowViewModal(true);
                            }}
                          >
                            <FiEye className="me-1" />
                            {assignment.submissionStatus?.status === 'graded' ? 'View Grade & Feedback' : 'View Submission'}
                          </Button>
                          {assignment.submissionStatus?.status !== 'graded' && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openSubmitModal(assignment)}
                            >
                              <FiEdit className="me-1" />
                              Resubmit
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openSubmitModal(assignment)}
                        >
                          <FiUpload className="me-1" />
                          Submit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <FiFileText size={48} className="text-muted mb-3" />
          <h4>No assignments found</h4>
          <p className="text-muted">
            {statusFilter !== 'all' || courseFilter
              ? 'Try adjusting your filters to see more assignments.'
              : 'You don\'t have any assignments yet.'}
          </p>
        </div>
      )}

      {/* Submit Assignment Modal */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Submit Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAssignment && (
            <div>
              <h5>{selectedAssignment.assignmentId?.title}</h5>
              <p className="text-muted mb-3">
                {selectedAssignment.assignmentId?.description}
              </p>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Text Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Enter your assignment content here..."
                    value={submitForm.textContent}
                    onChange={(e) => setSubmitForm({
                      ...submitForm,
                      textContent: e.target.value
                    })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Attachments (Optional)</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={handleFileChange}
                  />
                  <Form.Text className="text-muted">
                    You can upload multiple files (PDF, DOC, images, etc.)
                  </Form.Text>
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitAssignment}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Submitting...
              </>
            ) : (
              <>
                <FiUpload className="me-2" />
                Submit Assignment
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Submission & Feedback Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {selectedViewAssignment?.title || selectedViewAssignment?.assignmentId?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedViewAssignment && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <div>
                  <small className="text-muted d-block">COURSE</small>
                  <span className="fw-semibold">{selectedViewAssignment.courseId?.title || 'Course'}</span>
                </div>
                <div>
                  <small className="text-muted d-block">SUBMISSION STATUS</small>
                  <Badge bg={selectedViewAssignment.submissionStatus?.status === 'graded' ? 'success' : 'primary'}>
                    {selectedViewAssignment.submissionStatus?.status === 'graded' ? 'Graded' : 'Submitted'}
                  </Badge>
                </div>
              </div>

              {/* Grade & Feedback card if graded */}
              {selectedViewAssignment.submissionStatus?.status === 'graded' && selectedViewAssignment.submissionStatus?.grade && (
                <div className="p-4 bg-light rounded-4 mb-4 border border-success border-opacity-25">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-success mb-0">Grade Evaluation</h6>
                    <span className="fs-4 fw-bold text-success">
                      {selectedViewAssignment.submissionStatus.grade.marks} / {selectedViewAssignment.submissionStatus.grade.maxMarks || selectedViewAssignment.maxMarks}
                    </span>
                  </div>
                  {selectedViewAssignment.submissionStatus.feedback && (
                    <div className="mt-2">
                      <small className="fw-bold text-dark d-block">Teacher Feedback:</small>
                      <p className="text-muted small mb-0 fst-italic">
                        "{selectedViewAssignment.submissionStatus.feedback}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              <h6 className="fw-bold mb-2">Assignment Problem Statement</h6>
              <p className="text-muted small mb-3">
                {selectedViewAssignment.description || selectedViewAssignment.assignmentId?.description}
              </p>

              {selectedViewAssignment.instructions && (
                <>
                  <h6 className="fw-bold mb-1">Instructions</h6>
                  <p className="text-muted small mb-3">{selectedViewAssignment.instructions}</p>
                </>
              )}

              <div className="d-flex gap-3 text-muted small pt-2 border-top">
                <span>Submitted on: {new Date(selectedViewAssignment.submissionStatus?.submittedAt || Date.now()).toLocaleString()}</span>
                {selectedViewAssignment.submissionStatus?.isLate && (
                  <Badge bg="danger">Late Submission</Badge>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StudentAssignments;
