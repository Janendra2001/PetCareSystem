import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';

const EnterCases = () => {
  const [petId, setPetId] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [caseData, setCaseData] = useState({
    diagnosis: '',
    caseType: 'treatment',
    weight: '',
    treatment: '',
    prescription: '',
    remarks: '',
    nextVaccinationDate: '',
  });
  const [petDetails, setPetDetails] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (petId) {
      fetchPetDetailsByPetId();
    } else if (contactNo) {
      fetchPetDetailsByContactNo();
    }
  }, [petId, contactNo]);

  const fetchPetDetailsByPetId = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/doctor/pet/${petId}`);
      setPetDetails(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching pet details:', error.response || error.message);
      setError('Pet ID is not registered in the system.');
      setPetDetails(null);
    }
  };

  const fetchPetDetailsByContactNo = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/doctor/appointment/${contactNo}`);
      setPetDetails(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching pet details:', error.response || error.message);
      setError('Appointment is not completed please visit the receptionist then complete the appointment.');
      setPetDetails(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCaseData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCaseSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/doctor/entercase', {
        petId: petDetails.petid,
        ...caseData,
        nextVaccinationDate: caseData.nextVaccinationDate || null,
      });
      setMessage(response.data.message);
      setError(null);
      // Reset form fields
      setPetId('');
      setContactNo('');
      setCaseData({
        diagnosis: '',
        caseType: 'treatment',
        weight: '',
        treatment: '',
        prescription: '',
        remarks: '',
        nextVaccinationDate: '',
      });
      setPetDetails(null);
    } catch (error) {
      console.error('Error entering case:', error.response || error.message);
      setError('Error entering case');
      setMessage(null);
    }
  };


  const formatBirthDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatRegisteredDate = (dateString) => {
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
    <div className='container mt-3'>
      <Row>
        <Col md={6}>
          <h3 className='text-center mb-4'>Enter Case Details</h3>
          {message && <Alert variant='success'>{message}</Alert>}
          {error && <Alert variant='danger'>{error}</Alert>}
          <Form onSubmit={handleCaseSubmit}>
            <Form.Group className='mb-3'>
              <Form.Label>Pet ID</Form.Label>
              <Form.Control
                type='text'
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                disabled={!!contactNo}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Contact No</Form.Label>
              <Form.Control
                type='text'
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                disabled={!!petId}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Diagnosis</Form.Label>
              <Form.Control
                type='text'
                name='diagnosis'
                value={caseData.diagnosis}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Case Type</Form.Label>
              <Form.Control
                as='select'
                name='caseType'
                value={caseData.caseType}
                onChange={handleInputChange}
              >
                <option value='treatment'>Treatment</option>
                <option value='surgery'>Surgery</option>
                <option value='vaccine'>Vaccine</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Weight (Kg)</Form.Label>
              <Form.Control
                type='number'
                step='0.01'
                name='weight'
                value={caseData.weight}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Treatment</Form.Label>
              <Form.Control
                as='textarea'
                name='treatment'
                value={caseData.treatment}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Prescription</Form.Label>
              <Form.Control
                as='textarea'
                name='prescription'
                value={caseData.prescription}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as='textarea'
                name='remarks'
                value={caseData.remarks}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Next Vaccination Date</Form.Label>
              <Form.Control
                type='date'
                name='nextVaccinationDate'
                value={caseData.nextVaccinationDate}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button type='submit' variant='success' className='rounded-3'>Enter Case</Button>
          </Form>
        </Col>
        <Col md={6}>
          <h3 className='text-center mb-4'>Pet Details</h3>
          {petDetails && (
            <Card style={{ maxWidth: '300px', margin: 'auto' }}>
              <Card.Img variant='top' src={`http://localhost:3000/uploads/${petDetails.photo}`} />
              <Card.Body>
                <Card.Title>{petDetails.name}</Card.Title>
                <Card.Text>
                  <strong>ID : </strong> {petDetails.petid}<br />
                  <strong>Name : </strong> {petDetails.name}<br />
                  <strong>Birth Date : </strong> {formatBirthDate(petDetails.birthDate)}<br />
                  <strong>Sex : </strong> {petDetails.sex}<br />
                  <strong>Species : </strong> {petDetails.species}<br />
                  <strong>Breed : </strong> {petDetails.breed}<br />
                  <strong>Registered Date : </strong> {formatRegisteredDate(petDetails.registeredDate)}<br />
                  <strong>Pet Owner ID : </strong> {petDetails.petOwnerid}<br />
                </Card.Text>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default EnterCases;
