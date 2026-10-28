import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiMessageSquare,
  FiClock,
  FiUser
} from 'react-icons/fi';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { name, email, subject, message } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/contact', formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send message';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <FiMail size={24} />,
      title: 'Email Us',
      details: 'anilupputuri000@gmail.com',
      description: 'Get in touch via email for general inquiries'
    },
    {
      icon: <FiPhone size={24} />,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      description: 'Available Monday-Friday, 9AM-6PM EST'
    },
    {
      icon: <FiMapPin size={24} />,
      title: 'Visit Us',
      details: '123 Education Street, Learning City, LC 12345',
      description: 'Stop by our office for in-person meetings'
    },
    {
      icon: <FiClock size={24} />,
      title: 'Office Hours',
      details: 'Monday - Friday: 9AM - 6PM EST',
      description: 'Closed on weekends and holidays'
    }
  ];

  const faqItems = [
    {
      question: 'How do I get started as a student?',
      answer: 'Simply click on "Join as Student" and fill out the registration form. Once registered, you can browse courses and enroll in ones that interest you.'
    },
    {
      question: 'Can I create multiple courses as a teacher?',
      answer: 'Yes! As a teacher, you can create unlimited courses. We provide tools to help you manage multiple courses efficiently.'
    },
    {
      question: 'Is there a mobile app available?',
      answer: 'Yes, we have mobile apps for both iOS and Android. You can download them from the App Store or Google Play Store.'
    },
    {
      question: 'How do assignments work?',
      answer: 'Teachers create assignments with due dates and requirements. Students submit their work, and teachers provide grades and feedback through the platform.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for course payments.'
    }
  ];

  if (submitted) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Card className="border-0 shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Card.Body className="p-5">
              <div className="text-success mb-4">
                <FiSend size={48} />
              </div>
              <h3 className="mb-3">Message Sent Successfully!</h3>
              <p className="text-muted mb-4">
                Thank you for contacting us. We've received your message and will get back to you within 24 hours.
              </p>
              <Button 
                variant="primary" 
                onClick={() => setSubmitted(false)}
                className="btn-gradient"
              >
                Send Another Message
              </Button>
            </Card.Body>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-bg text-white py-5">
        <Container>
          <div className="text-center">
            <h1 className="display-4 fw-bold mb-4">Get in Touch</h1>
            <p className="lead mb-0">
              Have questions? We're here to help. Reach out through any of the channels below.
            </p>
          </div>
        </Container>
      </section>

      {/* Contact Info Section */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Contact Information</h2>
            <p className="lead text-muted">
              Multiple ways to reach us for your convenience
            </p>
          </div>
          
          <Row className="g-4">
            {contactInfo.map((info, index) => (
              <Col md={6} lg={3} key={index}>
                <Card className="border-0 shadow-sm h-100 text-center">
                  <Card.Body className="p-4">
                    <div className="text-primary mb-3">
                      {info.icon}
                    </div>
                    <h5 className="mb-2">{info.title}</h5>
                    <p className="fw-semibold mb-2">{info.details}</p>
                    <p className="text-muted small">{info.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        <Row className="g-4">
          {/* Contact Form */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Send us a Message</h5>
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={onSubmit}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Your Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={name}
                          onChange={onChange}
                          placeholder="Enter your name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={email}
                          onChange={onChange}
                          placeholder="Enter your email"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control
                      type="text"
                      name="subject"
                      value={subject}
                      onChange={onChange}
                      placeholder="What is this regarding?"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="message"
                      value={message}
                      onChange={onChange}
                      placeholder="Tell us more about your inquiry..."
                      rows="6"
                      required
                      maxLength="1000"
                    />
                    <Form.Text className="text-muted">
                      {message.length}/1000 characters
                    </Form.Text>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="btn-gradient w-100"
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend className="me-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* FAQ Section */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <FiMessageSquare className="me-2" />
                  Frequently Asked Questions
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="accordion" id="faqAccordion">
                  {faqItems.map((item, index) => (
                    <div className="accordion-item" key={index}>
                      <h2 className="accordion-header" id={`heading${index}`}>
                        <button 
                          className="accordion-button collapsed" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target={`#collapse${index}`}
                          aria-expanded="false" 
                          aria-controls={`collapse${index}`}
                        >
                          {item.question}
                        </button>
                      </h2>
                      <div 
                        id={`collapse${index}`} 
                        className="accordion-collapse collapse" 
                        aria-labelledby={`heading${index}`}
                        data-bs-parent="#faqAccordion"
                      >
                        <div className="accordion-body">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Contact;
