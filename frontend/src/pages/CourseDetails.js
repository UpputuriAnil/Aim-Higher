import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Tabs,
  Tab,
  Spinner,
  Modal,
  Form,
  ProgressBar,
  Alert
} from 'react-bootstrap';
import {
  FiClock,
  FiBook,
  FiUser,
  FiFileText,
  FiMessageSquare,
  FiDownload,
  FiPlus,
  FiSend,
  FiCheckCircle,
  FiArrowLeft,
  FiAlertCircle,
  FiTrash2
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Materials state (User Story 6)
  const [materials, setMaterials] = useState([]);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    title: '',
    format: 'PDF',
    url: '',
    description: '',
    duration: '15 min read'
  });

  // Discussions state (User Story 6)
  const [discussions, setDiscussions] = useState([]);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [postForm, setPostForm] = useState({ title: '', content: '' });
  const [replyContent, setReplyContent] = useState({});

  // Assignments & Enrollments
  const [assignments, setAssignments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    fetchMaterials();
    fetchDiscussions();
    fetchAssignments();
    if (user?.role === 'teacher') {
      fetchEnrollments();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/courses/${id}`);
      setCourse(res.data.course);

      // Check enrollment
      if (user?.role === 'student') {
        const enrRes = await axios.get('/api/courses/student/enrolled');
        const enrolled = (enrRes.data.courses || []).some(
          c => (c.courseId?._id || c.courseId) === id
        );
        setIsEnrolled(enrolled);
      }
    } catch (err) {
      console.error('Course details error:', err);
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`/api/materials/course/${id}`);
      setMaterials(res.data.materials || []);
    } catch (err) {
      console.error('Materials error:', err);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const res = await axios.get(`/api/discussions/course/${id}`);
      setDiscussions(res.data.discussions || []);
    } catch (err) {
      console.error('Discussions error:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`/api/assignments/course/${id}`);
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error('Assignments error:', err);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await axios.get(`/api/enrollments/course/${id}`);
      setEnrollments(res.data.enrollments || []);
    } catch (err) {
      console.error('Enrollments error:', err);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const res = await axios.post(`/api/courses/${id}/enroll`);
      if (res.data.success) {
        toast.success('Successfully enrolled in course!');
        setIsEnrolled(true);
        fetchCourseDetails();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to enroll';
      toast.error(msg);
    } finally {
      setEnrolling(false);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/materials', {
        courseId: id,
        ...materialForm
      });
      if (res.data.success) {
        toast.success('Course material added!');
        setShowAddMaterialModal(false);
        setMaterialForm({
          title: '',
          format: 'PDF',
          url: '',
          description: '',
          duration: '15 min read'
        });
        fetchMaterials();
      }
    } catch (err) {
      toast.error('Failed to add material');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      await axios.delete(`/api/materials/${materialId}`);
      toast.success('Material deleted');
      fetchMaterials();
    } catch (err) {
      toast.error('Failed to delete material');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/discussions', {
        courseId: id,
        ...postForm
      });
      if (res.data.success) {
        toast.success('Discussion thread created!');
        setShowNewPostModal(false);
        setPostForm({ title: '', content: '' });
        fetchDiscussions();
      }
    } catch (err) {
      toast.error('Failed to post discussion');
    }
  };

  const handleAddReply = async (discussionId) => {
    const text = replyContent[discussionId];
    if (!text || !text.trim()) return;

    try {
      const res = await axios.post(`/api/discussions/${discussionId}/replies`, {
        content: text.trim()
      });
      if (res.data.success) {
        toast.success('Reply submitted!');
        setReplyContent(prev => ({ ...prev, [discussionId]: '' }));
        fetchDiscussions();
      }
    } catch (err) {
      toast.error('Failed to submit reply');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading course hub...</p>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">Course not found or has been deactivated.</Alert>
        <Button as={Link} to={`/${user?.role}/courses`} variant="primary">
          Back to Courses
        </Button>
      </Container>
    );
  }

  const isTeacher = user?.role === 'teacher' && String(course.teacherId?._id || course.teacherId) === String(user?._id);

  return (
    <Container className="py-4">
      {/* Back button */}
      <Button
        variant="link"
        onClick={() => navigate(-1)}
        className="text-decoration-none p-0 mb-3 text-secondary d-inline-flex align-items-center gap-1"
      >
        <FiArrowLeft /> Back to Courses
      </Button>

      {/* Course Hero Banner */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <Row className="g-0">
          <Col md={5} lg={4}>
            <img
              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
              alt={course.title}
              className="w-100 h-100"
              style={{ objectFit: 'cover', minHeight: '260px' }}
            />
          </Col>
          <Col md={7} lg={8}>
            <Card.Body className="p-4 p-lg-5 d-flex flex-column justify-content-between h-100">
              <div>
                <div className="d-flex gap-2 mb-2 flex-wrap">
                  <Badge bg="primary" className="px-2 py-1">{course.category}</Badge>
                  <Badge bg="secondary" className="px-2 py-1">{course.difficulty}</Badge>
                  {isEnrolled && (
                    <Badge bg="success" className="px-2 py-1 d-flex align-items-center gap-1">
                      <FiCheckCircle size={12} /> Enrolled Student
                    </Badge>
                  )}
                  {isTeacher && (
                    <Badge bg="info" className="px-2 py-1">Instructor Roster</Badge>
                  )}
                </div>

                <h1 className="h2 fw-bold text-dark mb-2">{course.title}</h1>
                <p className="text-muted mb-3">{course.description}</p>
              </div>

              <div className="d-flex justify-content-between align-items-center pt-3 border-top flex-wrap gap-3">
                <div className="d-flex gap-4">
                  <div>
                    <small className="text-muted d-block">DURATION</small>
                    <span className="fw-semibold text-dark d-flex align-items-center gap-1">
                      <FiClock className="text-primary" /> {course.duration}
                    </span>
                  </div>
                  <div>
                    <small className="text-muted d-block">INSTRUCTOR</small>
                    <span className="fw-semibold text-dark d-flex align-items-center gap-1">
                      <FiUser className="text-primary" /> {course.teacherId?.name || 'Instructor'}
                    </span>
                  </div>
                  <div>
                    <small className="text-muted d-block">ENROLLED</small>
                    <span className="fw-semibold text-dark">
                      {course.enrolledStudents?.length || enrollments.length || 0} students
                    </span>
                  </div>
                </div>

                {user?.role === 'student' && !isEnrolled && (
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={enrolling}
                    onClick={handleEnroll}
                    className="px-4 rounded-pill shadow-sm"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                  </Button>
                )}
              </div>
            </Card.Body>
          </Col>
        </Row>
      </Card>

      {/* Course Content Tabs */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4 custom-nav-tabs"
          >
            {/* TAB 1: Overview */}
            <Tab eventKey="overview" title="Overview & Syllabus">
              <div className="py-2">
                <h5 className="fw-bold mb-3">About This Course</h5>
                <p className="text-muted leading-relaxed" style={{ fontSize: '15px' }}>
                  {course.description}
                </p>

                <h6 className="fw-bold mt-4 mb-2">Key Skills & Tags</h6>
                <div className="d-flex gap-2 flex-wrap mb-4">
                  {(course.tags || ['FullStack', 'SoftwareEngineering']).map((tag, idx) => (
                    <Badge key={idx} bg="light" text="dark" className="border px-3 py-2 rounded-pill">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <h6 className="fw-bold mt-4 mb-2">Course Instructor</h6>
                <Card className="bg-light border-0 rounded-3 p-3">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={course.teacherId?.profileImage || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'}
                      alt={course.teacherId?.name}
                      className="rounded-circle"
                      width="60"
                      height="60"
                      style={{ objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="fw-bold mb-1">{course.teacherId?.name}</h6>
                      <p className="text-muted small mb-0">
                        {course.teacherId?.bio || 'Senior instructor dedicated to empowering future developers.'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </Tab>

            {/* TAB 2: Materials (User Story 6) */}
            <Tab
              eventKey="materials"
              title={`Course Materials (${materials.length})`}
            >
              <div className="py-2">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="fw-bold mb-1">Learning Resources & Files</h5>
                    <p className="text-muted small mb-0">Download lecture notes, cheat sheets, and slide decks</p>
                  </div>
                  {isTeacher && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAddMaterialModal(true)}
                      className="rounded-pill d-flex align-items-center gap-1"
                    >
                      <FiPlus /> Add Material
                    </Button>
                  )}
                </div>

                {materials.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4">
                    <FiFileText size={40} className="text-muted mb-2" />
                    <h6>No materials uploaded yet</h6>
                    <p className="text-muted small">The instructor will upload files and slides soon.</p>
                  </div>
                ) : (
                  <Row className="g-3">
                    {materials.map(mat => (
                      <Col md={6} key={mat._id}>
                        <Card className="h-100 border rounded-3 p-3 card-hover">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="d-flex gap-3">
                              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center">
                                <FiFileText size={24} />
                              </div>
                              <div>
                                <h6 className="fw-bold mb-1">{mat.title}</h6>
                                <p className="text-muted small mb-2">{mat.description}</p>
                                <div className="d-flex gap-2 align-items-center">
                                  <Badge bg="secondary" className="px-2">{mat.format || 'PDF'}</Badge>
                                  <small className="text-muted">{mat.duration || '15 min read'}</small>
                                </div>
                              </div>
                            </div>

                            <div className="d-flex gap-1">
                              <Button
                                as="a"
                                href={mat.url}
                                target="_blank"
                                rel="noreferrer"
                                variant="outline-primary"
                                size="sm"
                                className="rounded-pill px-3 d-flex align-items-center gap-1"
                              >
                                <FiDownload size={14} /> Open
                              </Button>
                              {isTeacher && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteMaterial(mat._id)}
                                  className="rounded-circle p-2"
                                >
                                  <FiTrash2 size={14} />
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Tab>

            {/* TAB 3: Assignments (User Story 4) */}
            <Tab
              eventKey="assignments"
              title={`Assignments (${assignments.length})`}
            >
              <div className="py-2">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="fw-bold mb-1">Course Assignments</h5>
                    <p className="text-muted small mb-0">Practical assessments and coding milestones</p>
                  </div>
                  {isTeacher && (
                    <Button
                      as={Link}
                      to="/teacher/assignments"
                      variant="primary"
                      size="sm"
                      className="rounded-pill d-flex align-items-center gap-1"
                    >
                      <FiPlus /> Manage Assignments
                    </Button>
                  )}
                </div>

                {assignments.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4">
                    <FiBook size={40} className="text-muted mb-2" />
                    <h6>No assignments posted for this course yet</h6>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {assignments.map(assign => (
                      <Card key={assign._id} className="border rounded-3 p-3">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                          <div>
                            <h6 className="fw-bold mb-1">{assign.title}</h6>
                            <p className="text-muted small mb-2">{assign.description}</p>
                            <div className="d-flex gap-3 text-muted small">
                              <span>Due: {new Date(assign.dueDate).toLocaleDateString()}</span>
                              <span>Max Marks: {assign.maxMarks}</span>
                            </div>
                          </div>

                          <div>
                            {user?.role === 'student' ? (
                              <Button
                                as={Link}
                                to="/student/assignments"
                                variant="outline-primary"
                                size="sm"
                                className="rounded-pill px-3"
                              >
                                Go to Submission
                              </Button>
                            ) : (
                              <Button
                                as={Link}
                                to="/teacher/grading"
                                variant="outline-primary"
                                size="sm"
                                className="rounded-pill px-3"
                              >
                                View Submissions
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Tab>

            {/* TAB 4: Discussion Forum (User Story 6) */}
            <Tab
              eventKey="discussions"
              title={`Discussions (${discussions.length})`}
            >
              <div className="py-2">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="fw-bold mb-1">Course Discussion Forum</h5>
                    <p className="text-muted small mb-0">Ask questions, share code snippets, and collaborate with peers and teachers</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowNewPostModal(true)}
                    className="rounded-pill d-flex align-items-center gap-1"
                  >
                    <FiPlus /> New Question / Thread
                  </Button>
                </div>

                {discussions.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4">
                    <FiMessageSquare size={40} className="text-muted mb-2" />
                    <h6>No discussion threads yet</h6>
                    <p className="text-muted small">Be the first to start a conversation in this course!</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-4">
                    {discussions.map(disc => (
                      <Card key={disc._id} className="border rounded-4 p-4 shadow-sm">
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <img
                            src={disc.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                            alt={disc.authorName}
                            className="rounded-circle"
                            width="44"
                            height="44"
                            style={{ objectFit: 'cover' }}
                          />
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold text-dark">{disc.authorName}</span>
                              <Badge bg={disc.authorRole === 'teacher' ? 'primary' : 'secondary'} className="text-uppercase" style={{ fontSize: '10px' }}>
                                {disc.authorRole}
                              </Badge>
                            </div>
                            <small className="text-muted">{new Date(disc.createdAt).toLocaleString()}</small>
                          </div>
                        </div>

                        <h6 className="fw-bold text-dark mb-2">{disc.title}</h6>
                        <p className="text-muted mb-3" style={{ whiteSpace: 'pre-line' }}>{disc.content}</p>

                        {/* Thread Replies */}
                        {disc.replies && disc.replies.length > 0 && (
                          <div className="p-3 bg-light rounded-3 mb-3 d-flex flex-column gap-3">
                            <small className="fw-bold text-uppercase text-muted" style={{ fontSize: '11px' }}>
                              Replies ({disc.replies.length})
                            </small>
                            {disc.replies.map(rep => (
                              <div key={rep._id} className="d-flex gap-2">
                                <img
                                  src={rep.authorAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'}
                                  alt={rep.authorName}
                                  className="rounded-circle mt-1"
                                  width="32"
                                  height="32"
                                  style={{ objectFit: 'cover' }}
                                />
                                <div className="bg-white p-3 rounded-3 flex-grow-1 border">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="fw-bold text-dark small">{rep.authorName}</span>
                                    <Badge bg={rep.authorRole === 'teacher' ? 'primary' : 'light'} text={rep.authorRole === 'teacher' ? 'white' : 'dark'} style={{ fontSize: '10px' }}>
                                      {rep.authorRole}
                                    </Badge>
                                  </div>
                                  <p className="text-muted small mb-0">{rep.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply composer */}
                        <div className="d-flex gap-2 mt-2">
                          <Form.Control
                            type="text"
                            placeholder="Write a helpful response..."
                            size="sm"
                            value={replyContent[disc._id] || ''}
                            onChange={(e) => setReplyContent({ ...replyContent, [disc._id]: e.target.value })}
                            className="rounded-pill px-3"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAddReply(disc._id)}
                            className="rounded-pill px-3 d-flex align-items-center gap-1"
                          >
                            <FiSend size={14} /> Reply
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Tab>

            {/* TAB 5: Enrolled Students (User Story 3 - for Teacher) */}
            {isTeacher && (
              <Tab
                eventKey="students"
                title={`Enrolled Students (${enrollments.length})`}
              >
                <div className="py-2">
                  <h5 className="fw-bold mb-3">Enrolled Student Roster</h5>
                  <p className="text-muted small mb-4">Track student participation, enrollment dates, and completion progress.</p>

                  {enrollments.length === 0 ? (
                    <div className="text-center py-5 bg-light rounded-4">
                      <FiUser size={40} className="text-muted mb-2" />
                      <h6>No students enrolled yet</h6>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Student</th>
                            <th>Email</th>
                            <th>Enrolled Date</th>
                            <th>Progress</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrollments.map(enr => (
                            <tr key={enr._id}>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <img
                                    src={enr.studentId?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                                    alt={enr.studentId?.name}
                                    className="rounded-circle"
                                    width="36"
                                    height="36"
                                    style={{ objectFit: 'cover' }}
                                  />
                                  <span className="fw-semibold text-dark">{enr.studentId?.name || 'Student'}</span>
                                </div>
                              </td>
                              <td className="text-muted">{enr.studentId?.email}</td>
                              <td className="text-muted">{new Date(enr.enrolledAt).toLocaleDateString()}</td>
                              <td style={{ width: '200px' }}>
                                <div className="d-flex align-items-center gap-2">
                                  <ProgressBar now={enr.progress || 0} variant="primary" className="flex-grow-1" style={{ height: '8px' }} />
                                  <small className="fw-semibold">{enr.progress || 0}%</small>
                                </div>
                              </td>
                              <td>
                                <Badge bg={enr.status === 'completed' ? 'success' : 'primary'}>
                                  {enr.status || 'active'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Tab>
            )}
          </Tabs>
        </Card.Body>
      </Card>

      {/* Modal: Add Material (User Story 6) */}
      <Modal show={showAddMaterialModal} onHide={() => setShowAddMaterialModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Course Material</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddMaterial}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Material Title</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Lecture 1: Architecture Cheat Sheet"
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Format</Form.Label>
                  <Form.Select
                    value={materialForm.format}
                    onChange={(e) => setMaterialForm({ ...materialForm, format: e.target.value })}
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="PPT">PPT Slide Deck</option>
                    <option value="DOC">Word / Doc</option>
                    <option value="LINK">Reference Link</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Estimated Read Time</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. 15 min read"
                    value={materialForm.duration}
                    onChange={(e) => setMaterialForm({ ...materialForm, duration: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Document / Download URL</Form.Label>
              <Form.Control
                type="url"
                required
                placeholder="https://example.com/document.pdf"
                value={materialForm.url}
                onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
              />
              <Form.Text className="text-muted">Direct link to PDF or cloud-hosted resource</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description / Summary</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Brief summary of what this document covers..."
                value={materialForm.description}
                onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddMaterialModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Upload Material
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal: New Discussion Post (User Story 6) */}
      <Modal show={showNewPostModal} onHide={() => setShowNewPostModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Start a Course Discussion</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreatePost}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Topic / Question Title</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Clarification on async middleware handling"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Details / Question Body</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                required
                placeholder="Provide full details or code snippets for your question..."
                value={postForm.content}
                onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewPostModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Post to Forum
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CourseDetails;

export default CourseDetails;
