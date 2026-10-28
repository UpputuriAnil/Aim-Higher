import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  ProgressBar
} from 'react-bootstrap';
import {
  FiCheck,
  FiX,
  FiEdit,
  FiCalendar,
  FiUser,
  FiFileText,
  FiStar,
  FiFilter,
  FiDownload
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const TeacherGrading = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courseFilter, setCourseFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    marks: '',
    feedback: '',
    remarks: ''
  });
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const aId = params.get('assignmentId');
    if (aId) {
      setAssignmentFilter(aId);
    }
  }, [location.search]);

  useEffect(() => {
    fetchSubmissions();
    fetchCourses();
  }, [courseFilter, assignmentFilter, statusFilter, currentPage]);

  useEffect(() => {
    fetchAssignments();
  }, [courseFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(courseFilter && { courseId: courseFilter }),
        ...(assignmentFilter && { assignmentId: assignmentFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await axios.get(`/api/submissions/assignment/${assignmentFilter || 'all'}?${params}`);
      setSubmissions(response.data.submissions || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      setError('Failed to load submissions');
      console.error('Submissions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses/teacher/my-courses');
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error('Courses error:', err);
    }
  };

  const fetchAssignments = async () => {
    if (!courseFilter) return;

    try {
      const response = await axios.get(`/api/assignments/teacher/my-assignments?courseId=${courseFilter}`);
      setAssignments(response.data.assignments || []);
    } catch (err) {
      console.error('Assignments error:', err);
    }
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;

    try {
      setGrading(true);
      const response = await axios.post(`/api/submissions/${selectedSubmission._id}/grade`, {
        marks: parseFloat(gradeForm.marks),
        feedback: gradeForm.feedback,
        remarks: gradeForm.remarks
      });

      toast.success('Grade & feedback submitted successfully!');
      setShowGradeModal(false);
      setSelectedSubmission(null);
      setGradeForm({ marks: '', feedback: '', remarks: '' });
      fetchSubmissions();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to grade submission';
      toast.error(message);
    } finally {
      setGrading(false);
    }
  };

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      marks: submission.grade?.marks || '',
      feedback: submission.grade?.feedback || '',
      remarks: submission.grade?.remarks || ''
    });
    setShowGradeModal(true);
  };

  const getStatusBadge = (submission) => {
    if (submission.status === 'graded') {
      return <Badge bg="success">Graded</Badge>;
    }
    return <Badge bg="warning">Pending</Badge>;
  };

  const getLateBadge = (submission) => {
    if (submission.isLate) {
      return <Badge bg="danger">Late</Badge>;
    }
    return <Badge bg="info">On Time</Badge>;
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'danger';
  };

  if (loading && submissions.length === 0) {
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
          <h1 className="h3 mb-1">Grading Center</h1>
          <p className="text-muted mb-0">Review and grade student submissions</p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Select
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  setAssignmentFilter('');
                  setCurrentPage(1);
                }}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={assignmentFilter}
                onChange={(e) => {
                  setAssignmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={!courseFilter}
              >
                <option value="">All Assignments</option>
                {assignments.map(assignment => (
                  <option key={assignment._id} value={assignment._id}>{assignment.title}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="graded">Graded</option>
                <option value="ungraded">Ungraded</option>
                <option value="late">Late</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button variant="outline-secondary">
                <FiFilter className="me-2" />
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Submissions List */}
      {submissions.length > 0 ? (
        <div className="list-group">
          {submissions.map((submission) => (
            <div key={submission._id} className="list-group-item">
              <div className="d-flex align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-1">{submission.assignmentId?.title}</h6>
                      <p className="text-muted mb-2">
                        {submission.assignmentId?.courseId?.title}
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      {getStatusBadge(submission)}
                      {getLateBadge(submission)}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center">
                        <FiUser className="me-2 text-muted" />
                        <span>{submission.studentId?.name}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <FiCalendar className="me-2 text-muted" />
                        <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                      </div>
                      {submission.grade?.gradedAt && (
                        <div className="d-flex align-items-center">
                          <FiCheck className="me-2 text-success" />
                          <span>Graded: {new Date(submission.grade.gradedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      {submission.attachments && submission.attachments.length > 0 && (
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => window.open(submission.attachments[0].url, '_blank')}
                        >
                          <FiDownload className="me-1" />
                          Files
                        </Button>
                      )}

                      {submission.status === 'graded' ? (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => openGradeModal(submission)}
                        >
                          <FiEdit className="me-1" />
                          Edit Grade
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openGradeModal(submission)}
                        >
                          <FiStar className="me-1" />
                          Grade
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Grade Display */}
                  {submission.grade && (
                    <div className="mt-3 p-3 bg-light rounded">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong>Grade: {submission.grade.marks}/{submission.grade.maxMarks}</strong>
                          <span className="ms-2">
                            ({Math.round(submission.grade.percentage)}%)
                          </span>
                        </div>
                        <Badge bg={getGradeColor(submission.grade.percentage)}>
                          {submission.grade.grade}
                        </Badge>
                      </div>

                      {submission.grade.feedback && (
                        <div className="mb-2">
                          <strong>Feedback:</strong>
                          <p className="mb-0">{submission.grade.feedback}</p>
                        </div>
                      )}

                      {submission.grade.remarks && (
                        <div>
                          <strong>Remarks:</strong>
                          <p className="mb-0">{submission.grade.remarks}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <FiFileText size={48} className="text-muted mb-3" />
          <h4>No submissions found</h4>
          <p className="text-muted">
            {courseFilter || assignmentFilter || statusFilter !== 'all'
              ? 'Try adjusting your filters to see more submissions.'
              : 'No student submissions available for grading.'}
          </p>
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

      {/* Grade Modal */}
      <Modal show={showGradeModal} onHide={() => setShowGradeModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Grade Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSubmission && (
            <div>
              <div className="mb-3">
                <h6>Student: {selectedSubmission.studentId?.name}</h6>
                <p className="text-muted mb-0">
                  Assignment: {selectedSubmission.assignmentId?.title}
                </p>
                <p className="text-muted mb-0">
                  Submitted: {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                </p>
                <p className="text-muted mb-0">
                  Max Marks: {selectedSubmission.assignmentId?.maxMarks}
                </p>
              </div>

              <Form onSubmit={handleGrade}>
                <Form.Group className="mb-3">
                  <Form.Label>Marks</Form.Label>
                  <Form.Control
                    type="number"
                    name="marks"
                    value={gradeForm.marks}
                    onChange={(e) => setGradeForm({ ...gradeForm, marks: e.target.value })}
                    placeholder="Enter marks"
                    min="0"
                    max={selectedSubmission.assignmentId?.maxMarks}
                    required
                  />
                  <Form.Text className="text-muted">
                    Maximum marks: {selectedSubmission.assignmentId?.maxMarks}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Feedback</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="feedback"
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    placeholder="Provide feedback to the student..."
                    rows="4"
                    maxLength="1000"
                  />
                  <Form.Text className="text-muted">
                    {gradeForm.feedback.length}/1000 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Remarks (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="remarks"
                    value={gradeForm.remarks}
                    onChange={(e) => setGradeForm({ ...gradeForm, remarks: e.target.value })}
                    placeholder="Additional remarks..."
                    rows="2"
                    maxLength="500"
                  />
                  <Form.Text className="text-muted">
                    {gradeForm.remarks.length}/500 characters
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button variant="secondary" onClick={() => setShowGradeModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={grading}
                  >
                    {grading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Grading...
                      </>
                    ) : (
                      <>
                        <FiStar className="me-2" />
                        Submit Grade
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default TeacherGrading;
