import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { StudentIllustration } from '../../components/AuthIllustrations';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import { signInWithGoogle } from '../../firebase';

const StudentLogin = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRoleMismatch, setIsRoleMismatch] = useState(false);
  const { studentLogin, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
    if (isRoleMismatch) setIsRoleMismatch(false);
  };

  const handleGoogleSignIn = async () => {
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setIsRoleMismatch(false);

    const result = await studentLogin(formData);

    if (result.success) {
      navigate('/student/dashboard');
    } else {
      setErrorMsg(result.message || 'Invalid credentials. Please try again.');
      if (result.isRoleMismatch || (result.message && (result.message.toLowerCase().includes('instructor') || result.message.toLowerCase().includes('teacher')))) {
        setIsRoleMismatch(true);
      }
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
                  lg={6}
                  className="d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative"
                  style={{
                    background: 'linear-gradient(145deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
                  }}
                >
                  {/* Decorative background circle */}
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
                        <small className="text-blue-100 opacity-75">Student Portal</small>
                      </div>
                    </Link>
                  </div>

                  {/* Center Flat Illustration */}
                  <div className="my-auto py-4 text-center position-relative z-1">
                    <StudentIllustration />
                    <h3 className="fw-bold mt-4 mb-2 text-white">Turn Aspirations into Reality</h3>
                    <p className="mb-0 text-white opacity-80" style={{ fontSize: '15px', maxWidth: '380px', margin: '0 auto' }}>
                      Access live courses, submit your assignments, and track your academic progress in one seamless hub.
                    </p>
                  </div>

                  {/* Feature Highlights Footer */}
                  <div className="position-relative z-1 pt-3 border-top border-white border-opacity-25 d-flex justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <FiCheckCircle size={16} className="text-warning" />
                      <small className="opacity-90">Certified Courses</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <FiCheckCircle size={16} className="text-warning" />
                      <small className="opacity-90">Expert Feedback</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <FiCheckCircle size={16} className="text-warning" />
                      <small className="opacity-90">Peer Community</small>
                    </div>
                  </div>
                </Col>

                {/* Right Side: Clean Login Form */}
                <Col lg={6} className="d-flex align-items-center justify-content-center p-4 p-sm-5 bg-white">
                  <div className="w-100" style={{ maxWidth: '420px' }}>
                    {/* Mobile Brand Header */}
                    <div className="d-lg-none text-center mb-4">
                      <img src="/emblem.png" alt="Aim Higher" height="48" />
                      <h4 className="fw-bold mt-2 mb-0">Aim Higher</h4>
                      <small className="text-muted">Student Portal</small>
                    </div>

                    {/* Role Toggle Pill Header */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div>
                        <h2 className="fw-bold mb-1" style={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
                          Welcome Back
                        </h2>
                        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                          Enter your student credentials to log in.
                        </p>
                      </div>
                      <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 fw-semibold">
                        Student
                      </span>
                    </div>

                    {errorMsg && (
                      <Alert variant={isRoleMismatch ? "warning" : "danger"} className="py-2 px-3 small border-0 shadow-sm" onClose={() => setErrorMsg('')} dismissible>
                        <div className="d-flex flex-column gap-2">
                          <div>{errorMsg}</div>
                          {isRoleMismatch && (
                            <div>
                              <Button
                                variant="success"
                                size="sm"
                                className="fw-semibold px-3 py-1"
                                onClick={() => navigate('/auth/teacher/login', { state: { email: formData.email } })}
                              >
                                Go to Instructor Login &rarr;
                              </Button>
                            </div>
                          )}
                        </div>
                      </Alert>
                    )}

                    <GoogleAuthButton
                      text={googleLoading ? "Signing in with Google..." : "Continue with Google"}
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || loading}
                    />

                    <div className="auth-divider">
                      <span>or continue with email</span>
                    </div>

                    <Form onSubmit={onSubmit} autoComplete="off">
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
                            className="ps-5"
                            style={{
                              borderRadius: '12px',
                              padding: '13px 16px 13px 44px',
                              border: '1.5px solid #e2e8f0',
                              fontSize: '15px',
                              backgroundColor: '#f8fafc',
                              color: '#0f172a'
                            }}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <Form.Label className="fw-semibold text-secondary small mb-0">
                            Password
                          </Form.Label>
                          <Link to="/forgot-password" style={{ fontSize: '13px', textDecoration: 'none', color: '#2563eb' }}>
                            Forgot password?
                          </Link>
                        </div>
                        <div className="position-relative">
                          <div className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted">
                            <FiLock size={18} />
                          </div>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={password}
                            onChange={onChange}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                            className="ps-5 pe-5"
                            style={{
                              borderRadius: '12px',
                              padding: '13px 44px 13px 44px',
                              border: '1.5px solid #e2e8f0',
                              fontSize: '15px',
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
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                          </Button>
                        </div>
                      </Form.Group>

                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <Form.Check
                          type="checkbox"
                          id="rememberStudent"
                          label="Keep me logged in"
                          className="text-muted small"
                        />
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
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In to Student Portal <FiArrowRight size={17} />
                          </>
                        )}
                      </Button>
                    </Form>

                    {/* Switch role & Register footer */}
                    <div className="text-center mt-4 pt-3 border-top">
                      <p className="text-muted mb-2 small">
                        Don't have an account?{' '}
                        <Link
                          to="/auth/student/register"
                          className="fw-bold text-decoration-none"
                          style={{ color: '#2563eb' }}
                        >
                          Sign Up as Student
                        </Link>
                      </p>
                      <div className="d-flex align-items-center justify-content-center gap-2 mt-3 pt-2">
                        <span className="text-muted small">Are you a teacher?</span>
                        <Link
                          to="/auth/teacher/login"
                          className="badge bg-light text-dark text-decoration-none border py-2 px-3 fw-semibold rounded-pill"
                        >
                          Teacher Portal →
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

export default StudentLogin;
