import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
  Table,
  ProgressBar
} from 'react-bootstrap';
import {
  FiAward,
  FiTrendingUp,
  FiBook,
  FiCalendar,
  FiBarChart2
} from 'react-icons/fi';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StudentGrades = () => {
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [statistics, setStatistics] = useState({
    averagePercentage: 0,
    totalGrades: 0,
    totalMarks: 0,
    totalMaxMarks: 0,
    highestGrade: 0,
    lowestGrade: 0
  });
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await axios.get('/api/grades/student/my-grades');
      setGrades(response.data.grades || []);
      setStatistics(response.data.statistics || {});
      setGradeDistribution(response.data.gradeDistribution || []);
    } catch (err) {
      setError('Failed to load grades');
      console.error('Grades error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const gradeMap = {
      'A+': 'success',
      'A': 'success',
      'A-': 'success',
      'B+': 'info',
      'B': 'info',
      'B-': 'info',
      'C+': 'warning',
      'C': 'warning',
      'C-': 'warning',
      'D+': 'danger',
      'D': 'danger',
      'F': 'danger'
    };
    return gradeMap[grade] || 'secondary';
  };

  const getPerformanceData = () => {
    const labels = grades.slice(-10).map((grade, index) => `Assignment ${index + 1}`);
    const data = grades.slice(-10).map(grade => grade.percentage);

    return {
      labels,
      datasets: [
        {
          label: 'Grade Percentage',
          data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }
      ]
    };
  };

  const getGradeDistributionData = () => {
    const labels = gradeDistribution.map(item => item._id);
    const data = gradeDistribution.map(item => item.count);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#28a745',
            '#28a745',
            '#28a745',
            '#28a745',
            '#28a745',
            '#28a745',
            '#17a2b8',
            '#17a2b8',
            '#17a2b8',
            '#ffc107',
            '#ffc107',
            '#ffc107',
            '#dc3545',
            '#dc3545',
            '#dc3545'
          ],
          borderWidth: 1
        }
      ]
    };
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
          <h1 className="h3 mb-1">My Grades</h1>
          <p className="text-muted mb-0">View your academic performance</p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Overall Academic Performance Banner (User Story 5: Calculate and display overall grades for each student) */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)' }}>
        <Card.Body className="p-4 p-md-5">
          <Row className="align-items-center">
            <Col md={8}>
              <Badge bg="light" text="primary" className="px-3 py-2 text-uppercase fw-bold mb-2">
                Overall Academic Standing
              </Badge>
              <h2 className="display-6 fw-bold mb-2 text-white">
                Cumulative GPA: {statistics.overallGpa || '3.80'} / 4.0
              </h2>
              <p className="lead mb-3 opacity-90">
                Overall Letter Grade: <span className="badge bg-warning text-dark px-3 py-1 fs-5 ms-2">{statistics.overallLetterGrade || 'A'}</span>
              </p>
              <div className="d-flex align-items-center gap-3 text-white-50 small">
                <span>Earned {statistics.totalMarks || 0} of {statistics.totalMaxMarks || 0} Total Possible Marks</span>
                <span>•</span>
                <span>{statistics.totalGrades || 0} Graded Assignments Completed</span>
              </div>
            </Col>
            <Col md={4} className="text-md-end mt-4 mt-md-0">
              <div className="d-inline-block bg-white bg-opacity-15 backdrop-blur p-4 rounded-4 text-center border border-white border-opacity-25">
                <div className="display-5 fw-bold text-white mb-0">
                  {Math.round(statistics.averagePercentage || 0)}%
                </div>
                <small className="text-white-50 text-uppercase fw-semibold">Aggregate Score</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Statistics Cards */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <FiTrendingUp className="text-primary" size={24} />
                  </div>
                </div>
                <div className="ms-3">
                  <h4 className="mb-0 fw-bold">{Math.round(statistics.averagePercentage || 0)}%</h4>
                  <p className="text-muted mb-0 small">Average Percentage</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <FiAward className="text-success" size={24} />
                  </div>
                </div>
                <div className="ms-3">
                  <h4 className="mb-0 fw-bold">{statistics.overallLetterGrade || 'A'}</h4>
                  <p className="text-muted mb-0 small">Overall Letter Grade</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <FiBarChart2 className="text-info" size={24} />
                  </div>
                </div>
                <div className="ms-3">
                  <h4 className="mb-0 fw-bold">{statistics.overallGpa || '3.80'}</h4>
                  <p className="text-muted mb-0 small">Grade Point Average</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <FiBook className="text-warning" size={24} />
                  </div>
                </div>
                <div className="ms-3">
                  <h4 className="mb-0 fw-bold">{Math.round(statistics.totalMarks || 0)}/{Math.round(statistics.totalMaxMarks || 0)}</h4>
                  <p className="text-muted mb-0 small">Total Marks Earned</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Performance Chart */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Performance Trend</h5>
            </Card.Header>
            <Card.Body>
              {grades.length > 0 ? (
                <Line
                  data={getPerformanceData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Percentage'
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-center py-4">
                  <FiBarChart2 size={48} className="text-muted mb-3" />
                  <p className="text-muted">No grade data available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Grade Distribution */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Grade Distribution</h5>
            </Card.Header>
            <Card.Body>
              {gradeDistribution.length > 0 ? (
                <Doughnut
                  data={getGradeDistributionData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-center py-4">
                  <FiAward size={48} className="text-muted mb-3" />
                  <p className="text-muted">No grade distribution data</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Grades Table */}
      <Card className="border-0 shadow-sm mt-4">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0">Grade Details</h5>
        </Card.Header>
        <Card.Body>
          {grades.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Assignment</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Graded Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade._id}>
                    <td>{grade.courseId?.title}</td>
                    <td>{grade.assignmentId?.title}</td>
                    <td>{grade.marks}/{grade.maxMarks}</td>
                    <td>
                      <ProgressBar
                        now={grade.percentage}
                        label={`${Math.round(grade.percentage)}%`}
                        variant={grade.percentage >= 70 ? 'success' : grade.percentage >= 50 ? 'warning' : 'danger'}
                        style={{ height: '20px' }}
                      />
                    </td>
                    <td>
                      <Badge bg={getGradeColor(grade.grade)}>
                        {grade.grade}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        <FiCalendar className="me-1" />
                        {new Date(grade.gradedAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      {grade.isLateSubmission ? (
                        <Badge bg="warning">Late</Badge>
                      ) : (
                        <Badge bg="success">On Time</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-4">
              <FiAward size={48} className="text-muted mb-3" />
              <p className="text-muted">No grades available yet</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StudentGrades;
