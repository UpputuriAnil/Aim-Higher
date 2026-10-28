import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiLinkedin, FiGithub, FiMail, FiPhone, FiMapPin, FiChevronRight } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="py-5 mt-5">
      <Container>
        <Row className="gy-4">
          {/* Brand Info */}
          <Col lg={4} md={6} className="mb-2">
            <div className="d-flex align-items-center mb-3">
              <img 
                src="/emblem.png" 
                alt="Aim Higher" 
                height="46" 
                className="me-2"
                style={{ objectFit: 'contain' }}
              />
              <h4 className="mb-0 text-white fw-bold">Aim Higher</h4>
            </div>
            <p className="text-white fw-semibold mb-2" style={{ color: '#38bdf8' }}>
              Learn Today. Lead Tomorrow.
            </p>
            <p className="footer-desc mb-3">
              A comprehensive learning management system designed to empower students 
              and educators to reach new academic and professional heights.
            </p>
            <div className="d-flex gap-2 mt-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-icon-btn">
                <FiFacebook size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="social-icon-btn">
                <FiTwitter size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-icon-btn">
                <FiLinkedin size={18} />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="social-icon-btn">
                <FiGithub size={18} />
              </a>
            </div>
          </Col>
          
          {/* Quick Links */}
          <Col lg={2} md={6} sm={6} className="mb-2">
            <h6 className="mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>Quick Links</h6>
            <div className="d-flex flex-column gap-1">
              <Link to="/" className="footer-link d-inline-flex align-items-center">
                <FiChevronRight size={14} className="me-1 opacity-50" /> Home
              </Link>
              <Link to="/about" className="footer-link d-inline-flex align-items-center">
                <FiChevronRight size={14} className="me-1 opacity-50" /> About Us
              </Link>
              <Link to="/contact" className="footer-link d-inline-flex align-items-center">
                <FiChevronRight size={14} className="me-1 opacity-50" /> Contact
              </Link>
              <Link to="/auth/student/login" className="footer-link d-inline-flex align-items-center">
                <FiChevronRight size={14} className="me-1 opacity-50" /> Student Login
              </Link>
              <Link to="/auth/teacher/login" className="footer-link d-inline-flex align-items-center">
                <FiChevronRight size={14} className="me-1 opacity-50" /> Teacher Login
              </Link>
            </div>
          </Col>
          
          {/* Features */}
          <Col lg={3} md={6} sm={6} className="mb-2">
            <h6 className="mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>Features</h6>
            <div className="d-flex flex-column gap-1">
              <span className="footer-link d-inline-flex align-items-center">
                <FiChevronRight size={14} className="me-1 opacity-50" /> Course Management
              </span>
              <span className="footer-link d-inline-flex align-items-center">
                <FiChevronRight size={14} className="me-1 opacity-50" /> Assignment Tracking
              </span>
              <span className="footer-link d-inline-flex align-items-center">
                <FiChevronRight size={14} className="me-1 opacity-50" /> Grade Management
              </span>
              <span className="footer-link d-inline-flex align-items-center">
                <FiChevronRight size={14} className="me-1 opacity-50" /> Student Analytics
              </span>
              <span className="footer-link d-inline-flex align-items-center">
                <FiChevronRight size={14} className="me-1 opacity-50" /> Teacher Dashboard
              </span>
            </div>
          </Col>
          
          {/* Contact Info */}
          <Col lg={3} md={6} className="mb-2">
            <h6 className="mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>Contact Info</h6>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center footer-contact-item">
                <div className="p-2 rounded-circle me-3" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <FiMail size={16} />
                </div>
                <span>contact@aimhigher.edu</span>
              </div>
              <div className="d-flex align-items-center footer-contact-item">
                <div className="p-2 rounded-circle me-3" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <FiPhone size={16} />
                </div>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="d-flex align-items-start footer-contact-item">
                <div className="p-2 rounded-circle me-3 mt-1" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <FiMapPin size={16} />
                </div>
                <span>
                  123 Education Street<br />
                  Learning City, LC 12345
                </span>
              </div>
            </div>
          </Col>
        </Row>
        
        <hr className="my-4" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }} />
        
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
            <p className="footer-copyright mb-0">
              © {new Date().getFullYear()} Aim Higher. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-4">
              <Link to="/about" className="footer-bottom-link text-decoration-none">
                Privacy Policy
              </Link>
              <Link to="/about" className="footer-bottom-link text-decoration-none">
                Terms of Service
              </Link>
              <Link to="/contact" className="footer-bottom-link text-decoration-none">
                Cookie Policy
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
