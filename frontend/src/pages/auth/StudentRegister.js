import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert
} from 'react-bootstrap';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { StudentIllustration } from '../../components/AuthIllustrations';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import { signInWithGoogle } from '../../firebase';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
  });

  const { studentRegister, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    const googleRes = await signInWithGoogle();
    if (!googleRes.success) {
      setErrorMsg(googleRes.message);
      setGoogleLoading(false);
      return;
    }

    const authRes = await loginWithGoogle(googleRes.user, 'student');
    if (authRes.success) {
      navigate('/student/dashboard');
    } else {
      setErrorMsg(authRes.message || 'Failed to authenticate with Google.');
    }
    setGoogleLoading(false);
  };

  const { name, email, password, confirmPassword, bio } = formData;

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errorMsg) setErrorMsg('');

    if (name === 'password') {
      setPasswordErrors({
        minLength: value.length >= 6,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value)
      });
    }
  };

  const validatePassword = (pwd) => {
    return (
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      pwd.length >= 6
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (!validatePassword(password)) {
      setErrorMsg('Password must be at least 6 characters with uppercase, lowercase, and a number');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const result = await studentRegister({
      name,
      email,
      password,
      bio
    });

    if (result.success) {
      navigate('/student/dashboard');
    } else {
      setErrorMsg(result.message || 'Failed to create account. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ background: '#f4f7fb' }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={11} xl={10}>
            <Card className="border-0 shadow-xl overflow-hidden" style={{ borderRadius: '24px', backgroundColor: '#ffffff' }}>
              <Row className="g-0">
                {/* Left Side: Modern Flat Illustration Panel */}
                <Col
                  lg={5}
                  className="d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative"
                  style={{
                    background: 'linear-gradient(145deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-10%',
                      left: '-10%',
                      width: '320px',
                      height: '320px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Header Branding */}
                  <div className="position-relative z-1">
                    <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none text-white">
                      <img
                        src="/emblem.png"
                        alt="Aim Higher Emblem"
                        style={{ width: '42px', height: '42px', objectFit: 'contain' }}
                      />
                      <div>
                        <h4 className="fw-bold mb-0 text-white tracking-wide">Aim Higher</h4>
                        <small className="text-blue-100 opacity-75">Student Onboarding</small>
                      </div>
                    </Link>
                  </div>

                  {/* Center Flat Illustration */}
                  <div className="my-auto py-3 text-center position-relative z-1">
                    <StudentIllustration />
                    <h3 className="fw-bold mt-4 mb-2 text-white">Start Your Learning Journey</h3>
                    <p className="mb-0 text-white opacity-80" style={{ fontSize: '14px', maxWidth: '340px', margin: '0 auto' }}>
                      Join thousands of students aiming higher. Learn with industry projects, peer feedback, and certified courses.
                    </p>
                  </div>

                  {/* Feature Highlights Footer */}
                  <div className="position-relative z-1 pt-3 border-top border-white border-opacity-25 d-flex justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <FiCheckCircle size={15} className="text-warning" />
                      <small className="opacity-90">Instant Access</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <FiCheckCircle size={15} className="text-warning" />
                      <small className="opacity-90">Progress Tracking</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <FiCheckCircle size={15} className="text-warning" />
                      <small className="opacity-90">Free Enrollment</small>
                    </div>
                  </div>
                </Col>

                {/* Right Side: Clean Student Register Form */}
                <Col lg={7} className="d-flex align-items-center justify-content-center p-4 p-sm-5 bg-white">
                  <div className="w-100" style={{ maxWidth: '480px' }}>
                    {/* Mobile Brand Header */}
                    <div className="d-lg-none text-center mb-4">
                      <img src="/emblem.png" alt="Aim Higher" height="48" />
                      <h4 className="fw-bold mt-2 mb-0">Aim Higher</h4>
                      <small className="text-muted">Student Registration</small>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div>
                        <h2 className="fw-bold mb-1" style={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
                          Create Student Account
                        </h2>
                        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                          Sign up in less than a minute to enroll in courses.
                        </p>
                      </div>
                      <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 fw-semibold">
                        Student
                      </span>
                    </div>

                    {errorMsg && (
                      <Alert variant="danger" className="py-2 px-3 small border-0 shadow-sm" onClose={() => setErrorMsg('')} dismissible>
                        {errorMsg}
                      </Alert>
                    )}

                    <GoogleAuthButton
                      text={googleLoading ? "Signing up with Google..." : "Sign up with Google"}
                      onClick={handleGoogleSignUp}
                      disabled={googleLoading || loading}
                    />

                    <div className="auth-divider">
                      <span>or register with email</span>
                    </div>

                    <Form onSubmit={onSubmit} autoComplete="off">
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-secondary small mb-1">
                          Full Name
                        </Form.Label>
                        <div className="position-relative">
                          <div className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted">
                            <FiUser size={18} />
                          </div>
                          <Form.Control
                            type="text"
                            name="name"
                            value={name}
                            onChange={onChange}
                            placeholder="Enter your full name"
                            autoComplete="off"
                            required
                            minLength="2"
                            maxLength="50"
                            style={{
                              borderRadius: '12px',
                              padding: '12px 16px 12px 44px',
                              border: '1.5px solid #e2e8f0',
                              fontSize: '15px',
                              backgroundColor: '#f8fafc',
                              color: '#0f172a'
                            }}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-secondary small mb-1">
                          Email Address
                        </Form.Label>
                        <div className="position-relative">
                          <div className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted">
                            <FiMail size={18} />
                          </div>
                          <Form.Control
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder="Enter your email address"
                            autoComplete="off"
                            required
                            style={{
                              borderRadius: '12px',
                              padding: '12px 16px 12px 44px',
                              border: '1.5px solid #e2e8f0',
                              fontSize: '15px',
                              backgroundColor: '#f8fafc',
                              color: '#0f172a'
                            }}
                          />
                        </div>
                      </Form.Group>

                      <Row className="g-2 mb-2">
                        <Col sm={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="fw-semibold text-secondary small mb-1">
                              Password
                            </Form.Label>
                            <div className="position-relative">
                              <div className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted">
                                <FiLock size={16} />
                              </div>
                              <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="Enter password"
                                autoComplete="new-password"
                                required
                                minLength="6"
                                style={{
                                  borderRadius: '12px',
                                  padding: '12px 38px 12px 40px',
                                  border: '1.5px solid #e2e8f0',
                                  fontSize: '14px',
                                  backgroundColor: '#f8fafc',
                                  color: '#0f172a'
                                }}
                              />
                              <Button
                                variant="link"
                                className="position-absolute end-0 top-50 translate-middle-y me-2 text-muted p-0"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ border: 'none', boxShadow: 'none' }}
                              >
                                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                              </Button>
                            </div>
                          </Form.Group>
                        </Col>

                        <Col sm={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="fw-semibold text-secondary small mb-1">
                              Confirm Password
                            </Form.Label>
                            <div className="position-relative">
                              <div className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted">
                                <FiLock size={16} />
                              </div>
                              <Form.Control
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={onChange}
                                placeholder="Confirm password"
                                autoComplete="new-password"
                                required
                                minLength="6"
                                style={{
                                  borderRadius: '12px',
                                  padding: '12px 38px 12px 40px',
                                  border: '1.5px solid #e2e8f0',
                                  fontSize: '14px',
                                  backgroundColor: '#f8fafc',
                                  color: '#0f172a'
                                }}
                              />
                              <Button
                                variant="link"
                                className="position-absolute end-0 top-50 translate-middle-y me-2 text-muted p-0"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ border: 'none', boxShadow: 'none' }}
                              >
                                {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                              </Button>
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Password requirements chips */}
                      <div className="d-flex flex-wrap gap-2 mb-3 px-1">
                        <span className={`badge ${passwordErrors.minLength ? 'bg-success' : 'bg-light text-muted'} fw-normal border`}>
                          {passwordErrors.minLength ? '✓' : '○'} 6+ chars
                        </span>
                        <span className={`badge ${passwordErrors.hasUpperCase ? 'bg-success' : 'bg-light text-muted'} fw-normal border`}>
                          {passwordErrors.hasUpperCase ? '✓' : '○'} Uppercase
                        </span>
                        <span className={`badge ${passwordErrors.hasLowerCase ? 'bg-success' : 'bg-light text-muted'} fw-normal border`}>
                          {passwordErrors.hasLowerCase ? '✓' : '○'} Lowercase
                        </span>
                        <span className={`badge ${passwordErrors.hasNumber ? 'bg-success' : 'bg-light text-muted'} fw-normal border`}>
                          {passwordErrors.hasNumber ? '✓' : '○'} Number
                        </span>
                      </div>


                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-100 py-3 d-flex align-items-center justify-content-center gap-2 border-0 shadow-sm"
                        style={{
                          borderRadius: '12px',
                          fontWeight: '600',
                          fontSize: '15px',
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          boxShadow: '0 8px 18px rgba(37, 99, 235, 0.25)'
                        }}
                      >
                        {loading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            Register as Student <FiArrowRight size={17} />
                          </>
                        )}
                      </Button>
                    </Form>

                    {/* Switch role & Login footer */}
                    <div className="text-center mt-4 pt-3 border-top">
                      <p className="text-muted mb-2 small">
                        Already have an account?{' '}
                        <Link
                          to="/auth/student/login"
                          className="fw-bold text-decoration-none"
                          style={{ color: '#2563eb' }}
                        >
                          Sign In here
                        </Link>
                      </p>
                      <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                        <span className="text-muted small">Are you a teacher?</span>
                        <Link
                          to="/auth/teacher/register"
                          className="badge bg-light text-dark text-decoration-none border py-2 px-3 fw-semibold rounded-pill"
                        >
                          Teacher Registration →
                        </Link>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            <div className="text-center mt-4">
              <small className="text-muted">
                © {new Date().getFullYear()} Aim Higher LMS. All rights reserved.
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StudentRegister;
