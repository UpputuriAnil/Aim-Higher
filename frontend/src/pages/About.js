import React from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Badge
} from 'react-bootstrap';
import {
  FiTarget,
  FiBookOpen,
  FiAward,
  FiUsers,
  FiTrendingUp,
  FiShield,
  FiGlobe
} from 'react-icons/fi';

const About = () => {
  const teamMembers = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'CEO & Founder',
      bio: 'Educational technology expert with 15+ years of experience in digital learning platforms.',
      image: '/api/placeholder/team1'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      bio: 'Full-stack developer specializing in scalable web applications and cloud infrastructure.',
      image: '/api/placeholder/team2'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Education',
      bio: 'Former educator with expertise in curriculum design and pedagogical best practices.',
      image: '/api/placeholder/team3'
    },
    {
      name: 'David Kim',
      role: 'Lead Designer',
      bio: 'UX/UI designer focused on creating intuitive and engaging learning experiences.',
      image: '/api/placeholder/team4'
    }
  ];

  const values = [
    {
      icon: <FiTarget size={24} />,
      title: 'Mission-Driven',
      description: 'We are committed to making quality education accessible to everyone, everywhere.'
    },
    {
      icon: <FiBookOpen size={24} />,
      title: 'Innovation',
      description: 'Continuously improving our platform with cutting-edge technology and educational research.'
    },
    {
      icon: <FiAward size={24} />,
      title: 'Excellence',
      description: 'Setting the highest standards for educational content and user experience.'
    },
    {
      icon: <FiUsers size={24} />,
      title: 'Community',
      description: 'Building a supportive community of learners and educators worldwide.'
    }
  ];

  const milestones = [
    {
      year: '2019',
      title: 'Founded',
      description: 'LMS Platform was founded with a vision to transform online education.'
    },
    {
      year: '2020',
      title: 'First 1000 Students',
      description: 'Reached our first major milestone with 1000 active learners.'
    },
    {
      year: '2021',
      title: 'Platform Expansion',
      description: 'Launched mobile app and added advanced analytics features.'
    },
    {
      year: '2022',
      title: 'Global Reach',
      description: 'Expanded to serve students and teachers in 50+ countries.'
    },
    {
      year: '2023',
      title: 'AI Integration',
      description: 'Introduced AI-powered personalization and smart grading features.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-bg text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">
                Empowering Education Through Technology
              </h1>
              <p className="lead mb-4">
                We are dedicated to creating innovative learning solutions that bridge the gap 
                between traditional education and digital transformation. Our platform serves thousands 
                of students and educators worldwide, providing tools that make learning 
                engaging, accessible, and effective.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <div className="d-flex align-items-center">
                  <FiUsers className="me-2" />
                  <div>
                    <div className="h4 mb-0">50,000+</div>
                    <div className="small">Active Users</div>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <FiGlobe className="me-2" />
                  <div>
                    <div className="h4 mb-0">120+</div>
                    <div className="small">Countries</div>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <FiBookOpen className="me-2" />
                  <div>
                    <div className="h4 mb-0">10,000+</div>
                    <div className="small">Courses</div>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <img
                src="/api/placeholder/about-hero"
                alt="About LMS Platform"
                className="img-fluid rounded shadow-lg"
                style={{ maxHeight: '400px' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Values Section */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Our Values</h2>
            <p className="lead text-muted">
              The principles that guide everything we do
            </p>
          </div>
          
          <Row className="g-4">
            {values.map((value, index) => (
              <Col md={6} lg={3} key={index}>
                <Card className="border-0 shadow-sm h-100 text-center">
                  <Card.Body className="p-4">
                    <div className="text-primary mb-3">
                      {value.icon}
                    </div>
                    <h5 className="mb-3">{value.title}</h5>
                    <p className="text-muted">{value.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Story Section */}
      <section className="py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h2 className="fw-bold mb-4">Our Story</h2>
              <p className="mb-3">
                LMS Platform began as a simple idea: what if education could be more accessible, 
                engaging, and effective for everyone? Our founder, a former educator frustrated 
                with traditional learning management systems, set out to build something better.
              </p>
              <p className="mb-3">
                Today, we're proud to serve a global community of learners and educators who 
                share our passion for innovative education. From K-12 schools to universities, 
                from corporate training to individual learners, our platform adapts to meet 
                diverse educational needs.
              </p>
              <p>
                We believe that technology should enhance, not replace, the human connection 
                that makes learning meaningful. That's why we focus on creating tools that 
                empower teachers to teach better and students to learn more effectively.
              </p>
            </Col>
            <Col lg={6} className="text-center">
              <img
                src="/api/placeholder/story"
                alt="Our Story"
                className="img-fluid rounded shadow"
                style={{ maxHeight: '400px' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Milestones Section */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Our Journey</h2>
            <p className="lead text-muted">
              Key milestones in our growth story
            </p>
          </div>
          
          <Row className="g-4">
            {milestones.map((milestone, index) => (
              <Col md={6} lg={4} key={index}>
                <Card className="border-0 shadow-sm h-100 text-center">
                  <Card.Body className="p-4">
                    <div className="text-primary mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-block">
                        <div className="h3 mb-0">{milestone.year}</div>
                      </div>
                    </div>
                    <h5 className="mb-3">{milestone.title}</h5>
                    <p className="text-muted">{milestone.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Team Section */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Meet Our Team</h2>
            <p className="lead text-muted">
              The passionate people behind LMS Platform
            </p>
          </div>
          
          <Row className="g-4">
            {teamMembers.map((member, index) => (
              <Col md={6} lg={3} key={index}>
                <Card className="border-0 shadow-sm h-100 text-center">
                  <Card.Body className="p-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="rounded-circle mb-3"
                      width="100"
                      height="100"
                      style={{ objectFit: 'cover' }}
                    />
                    <h5 className="mb-2">{member.name}</h5>
                    <Badge bg="primary" className="mb-3">{member.role}</Badge>
                    <p className="text-muted small">{member.bio}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 gradient-bg text-white">
        <Container className="text-center">
          <h2 className="fw-bold mb-3">Join Our Mission</h2>
          <p className="lead mb-4">
            Be part of the future of education. Whether you're a student looking to learn 
            or a teacher ready to inspire, we have a place for you.
          </p>
          
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <a 
              href="/auth/student/register" 
              className="btn btn-light btn-lg"
            >
              Start Learning
            </a>
            <a 
              href="/auth/teacher/register" 
              className="btn btn-outline-light btn-lg"
            >
              Start Teaching
            </a>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default About;
