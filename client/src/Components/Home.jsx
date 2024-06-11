import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col, Table } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const Home = () => {
  const [metrics, setMetrics] = useState({ totalPets: 0, totalPetOwners: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    fetchMetrics();
    fetchRecentActivities();
    fetchChartData();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('http://localhost:3000/auth/metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await axios.get('http://localhost:3000/auth/recentactivities');
      setRecentActivities(response.data);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/auth/chartdata');
      const data = response.data;
      setChartData({
        labels: data.map(item => item.month),
        datasets: [
          {
            label: 'Appointments',
            data: data.map(item => item.count),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };
  const formatCaseDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  return (
    <div className="container mt-3">
      <Row className="mb-4">
        <Col>
          <Card className="text-center shadow-sm border-23 border-light" style={{ backgroundColor: '#14385c', textDecoration:'none', color:'white'
          }}>
            <Card.Body>
              <Card.Title><h4><strong>Total Pet Owners</strong></h4></Card.Title>
              <Card.Text className="display-4">{metrics.totalPetOwners}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="text-center shadow-sm border-23 border-light" style={{ backgroundColor: '#14385c', textDecoration:'none', color:'white'
          }}>
            <Card.Body>
              <Card.Title><h4><strong>Total Pets</strong></h4></Card.Title>
              <Card.Text className="display-4">{metrics.totalPets}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm border-23 border-primary">
            <Card.Body>
              <h4 className="card-title"><strong>Appointments per Month</strong></h4>
              <div className="chart-container mt-3" style={{ width: '60%', height: '300px' }}>
                <Bar data={chartData} options={{ maintainAspectRatio: false }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <br/>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-23 border-dark">
            <Card.Body>
              <h4 className="card-title"><strong>Recent Activities</strong></h4>
              <Table striped bordered hover responsive className="mt-3">
                <thead style={{ backgroundColor: '#081f36', color: 'white' }}>
                  <tr>
                    <th>Case ID</th>
                    <th>Pet ID</th>
                    <th>Case Date</th>
                    <th>Diagnosis</th>
                    <th>Treatment</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map(activity => (
                    <tr key={activity.caseid}>
                      <td>{activity.caseid}</td>
                      <td>{activity.petid}</td>
                      <td>{formatCaseDate(activity.caseDate)}</td>
                      <td>{activity.diagnosis}</td>
                      <td>{activity.treatment}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <br/>
    </div>
  );
};

export default Home;
