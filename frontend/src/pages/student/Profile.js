import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Modal,
  Badge
} from 'react-bootstrap';
import {
  FiUser,
  FiMail,
  FiEdit,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCamera,
  FiSave,
  FiX
} from 'react-icons/fi';
import axios from 'axios';

const StudentProfile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await updateProfile(profileForm);
    
    if (result.success) {
      setSuccess('Profile updated successfully!');
    } else {
      setError(result.message || 'Failed to update profile');
    }
    
    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    setError('');
    setSuccess('');

    const result = await changePassword(passwordForm);
    
    if (result.success) {
      setSuccess('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      setError(result.message || 'Failed to change password');
    }
    
    setPasswordLoading(false);
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      try {
        setLoading(true);
        const response = await axios.post('/api/auth/upload-profile-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        await updateProfile({ profileImage: response.data.imageUrl });
        setSuccess('Profile image updated successfully!');
      } catch (err) {
        setError('Failed to upload profile image');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">My Profile</h1>
          <p className="text-muted mb-0">Manage your account settings</p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="g-4">
        {/* Profile Card */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="position-relative d-inline-block mb-3">
                <img
                  src={user?.profileImage || '/api/placeholder/avatar'}
                  alt="Profile"
                  className="rounded-circle"
                  width="120"
                  height="120"
                  style={{ objectFit: 'cover' }}
                />
                <label 
                  htmlFor="profileImage" 
                  className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2"
                  style={{ cursor: 'pointer' }}
                >
                  <FiCamera size={16} />
                </label>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
              
              <h5 className="mb-1">{user?.name}</h5>
              <p className="text-muted mb-2">{user?.email}</p>
              <Badge bg="info" className="mb-3">
                {user?.role === 'student' ? 'Student' : 'Teacher'}
              </Badge>
              
              <div className="text-start">
                <small className="text-muted d-block mb-1">
                  <FiUser className="me-2" />
                  Member since: {new Date(user?.createdAt).toLocaleDateString()}
                </small>
                <small className="text-muted d-block mb-1">
                  <FiMail className="me-2" />
                  {user?.email}
                </small>
                {user?.lastLogin && (
                  <small className="text-muted d-block">
                    Last login: {new Date(user.lastLogin).toLocaleDateString()}
                  </small>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Edit Profile Form */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Edit Profile</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleProfileSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                    required
                    minLength="2"
                    maxLength="50"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    placeholder="Tell us about yourself..."
                    rows="4"
                    maxLength="500"
                  />
                  <Form.Text className="text-muted">
                    {profileForm.bio.length}/500 characters
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="btn-gradient"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="me-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <FiLock className="me-2" />
                    Change Password
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Change Password Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <div className="input-group">
                <Form.Control
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                </Button>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <div className="input-group">
                <Form.Control
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  required
                  minLength="6"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FiEyeOff /> : <FiEye />}
                </Button>
              </div>
              <Form.Text className="text-muted">
                Password must be at least 6 characters with uppercase, lowercase, and number.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <div className="input-group">
                <Form.Control
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                  minLength="6"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </Button>
              </div>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                <FiX className="me-2" />
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default StudentProfile;
