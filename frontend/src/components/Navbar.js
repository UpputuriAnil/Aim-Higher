import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Navbar as BootstrapNavbar,
  Container,
  Nav,
  NavDropdown,
  Button,
  Badge,
  Modal
} from 'react-bootstrap';
import {
  FiUser,
  FiBook,
  FiLogOut,
  FiSettings,
  FiMenu,
  FiBell,
  FiCheck,
  FiAward,
  FiFileText,
  FiMessageSquare,
  FiGrid
} from 'react-icons/fi';
import axios from 'axios';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  // Notification state (User Story 6)
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifModal, setShowNotifModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // silently fail if unauthenticated
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await axios.put(`/api/notifications/${notif._id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setShowNotifModal(false);
      setExpanded(false);
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setExpanded(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'grade': return <FiAward className="text-warning" size={18} />;
      case 'assignment': return <FiFileText className="text-primary" size={18} />;
      case 'discussion': return <FiMessageSquare className="text-info" size={18} />;
      default: return <FiBell className="text-success" size={18} />;
    }
  };

  return (
    <>
      <BootstrapNavbar
        bg="white"
        variant="light"
        expand="lg"
        className="shadow-sm sticky-top border-bottom py-2"
        expanded={expanded}
      >
        <Container>
          <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center text-decoration-none">
            <img
              src="/emblem.png"
              alt="Aim Higher"
              height="40"
              className="me-2"
              style={{ objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(13, 71, 161, 0.2))' }}
            />
            <span className="fs-3 brand-title">Aim Higher</span>
          </BootstrapNavbar.Brand>

          <BootstrapNavbar.Toggle
            aria-controls="basic-navbar-nav"
            onClick={() => setExpanded(!expanded)}
          >
            <FiMenu />
          </BootstrapNavbar.Toggle>

          <BootstrapNavbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center gap-1">
              {/* Public Links */}
              {!isAuthenticated && (
                <>
                  <Nav.Link
                    as={Link}
                    to="/"
                    className={`nav-link px-3 ${isActive('/') ? 'active fw-bold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    Home
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/about"
                    className={`nav-link px-3 ${isActive('/about') ? 'active fw-bold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    About
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/contact"
                    className={`nav-link px-3 ${isActive('/contact') ? 'active fw-bold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    Contact
                  </Nav.Link>
                </>
              )}

              {/* Student Navigation Links */}
              {isAuthenticated && user?.role === 'student' && (
                <>
                  <Nav.Link
                    as={Link}
                    to="/student/dashboard"
                    className={`nav-link px-3 ${isActive('/student/dashboard') ? 'active fw-bold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    Dashboard
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/student/courses"
                    className={`nav-link px-3 ${isActive('/student/courses') ? 'active fw-bold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    Courses
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/student/assignments"
                    className={`nav-link px-3 ${isActive('/student/assignments') ? 'active fw-bold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    Assignments
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/student/grades"
                    className={`nav-link px-3 ${isActive('/student/grades') ? 'active fw-bold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    Grades
                  </Nav.Link>
                </>
              )}

              {/* Teacher Navigation Links */}
              {isAuthenticated && user?.role === 'teacher' && (
                <>
                  <Nav.Link
                    as={Link}
                    to="/teacher/dashboard"
                    className={`nav-link px-3 ${isActive('/teacher/dashboard') ? 'active fw-bold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    Dashboard
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/teacher/courses"
                    className={`nav-link px-3 ${isActive('/teacher/courses') ? 'active fw-bold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    Courses
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/teacher/assignments"
                    className={`nav-link px-3 ${isActive('/teacher/assignments') ? 'active fw-bold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    Assignments
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/teacher/grading"
                    className={`nav-link px-3 ${isActive('/teacher/grading') ? 'active fw-bold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    Grading
                  </Nav.Link>
                </>
              )}

              {/* Notification Bell (User Story 6) */}
              {isAuthenticated && (
                <div className="position-relative mx-2">
                  <Button
                    variant="light"
                    onClick={() => setShowNotifModal(true)}
                    className="rounded-circle p-2 border position-relative d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px' }}
                    title="Notifications"
                  >
                    <FiBell size={18} className="text-secondary" />
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </div>
              )}

              {/* Public Auth Buttons */}
              {!isAuthenticated && (
                <div className="d-flex gap-2 ms-lg-3 mt-2 mt-lg-0">
                  <Button
                    variant="outline-primary"
                    as={Link}
                    to="/auth/student/login"
                    size="sm"
                    className="rounded-pill px-3"
                    onClick={() => setExpanded(false)}
                  >
                    Student Login
                  </Button>
                  <Button
                    variant="primary"
                    as={Link}
                    to="/auth/teacher/login"
                    size="sm"
                    className="rounded-pill px-3"
                    onClick={() => setExpanded(false)}
                  >
                    Teacher Login
                  </Button>
                </div>
              )}

              {/* User Dropdown */}
              {isAuthenticated && user && (
                <NavDropdown
                  title={
                    <div className="d-inline-flex align-items-center">
                      <img
                        src={user.profileImage || user.avatar || (user.role === 'teacher' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80')}
                        alt={user.name}
                        className="rounded-circle me-2"
                        width="30"
                        height="30"
                        style={{ objectFit: 'cover' }}
                      />
                      <span className="fw-semibold text-dark small">{user.name?.split(' ')[0]}</span>
                      <Badge bg={user.role === 'student' ? 'primary' : 'success'} className="ms-2 text-uppercase" style={{ fontSize: '10px' }}>
                        {user.role}
                      </Badge>
                    </div>
                  }
                  id="user-nav-dropdown"
                  align="end"
                  className="ms-2"
                >
                  <NavDropdown.Item
                    as={Link}
                    to={`/${user.role}/dashboard`}
                    onClick={() => setExpanded(false)}
                  >
                    <FiGrid className="me-2" /> Dashboard
                  </NavDropdown.Item>

                  <NavDropdown.Item
                    as={Link}
                    to={`/${user.role}/profile`}
                    onClick={() => setExpanded(false)}
                  >
                    <FiSettings className="me-2" /> Profile
                  </NavDropdown.Item>

                  <NavDropdown.Divider />

                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    <FiLogOut className="me-2" /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>

      {/* Notifications Modal (User Story 6) */}
      <Modal show={showNotifModal} onHide={() => setShowNotifModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
            <FiBell className="text-primary" /> Notifications
            {unreadCount > 0 && <Badge bg="danger" pill style={{ fontSize: '11px' }}>{unreadCount} New</Badge>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <span className="text-muted small">Recent updates and activity</span>
            {unreadCount > 0 && (
              <Button variant="link" size="sm" onClick={handleMarkAllRead} className="p-0 text-decoration-none small">
                Mark all as read
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <FiBell size={32} className="mb-2 opacity-50" />
              <p className="small mb-0">No notifications at the moment.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2" style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 rounded-3 border d-flex gap-3 align-items-start cursor-pointer transition-all ${n.isRead ? 'bg-white opacity-85' : 'bg-light border-primary border-opacity-25'}`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="p-2 bg-white rounded-circle shadow-sm flex-shrink-0">
                    {getNotifIcon(n.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="fw-bold mb-1 small text-dark">{n.title}</h6>
                      {!n.isRead && <span className="p-1 bg-primary rounded-circle" />}
                    </div>
                    <p className="text-muted small mb-1" style={{ fontSize: '12px' }}>{n.message}</p>
                    <small className="text-muted" style={{ fontSize: '10px' }}>
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Navbar;
