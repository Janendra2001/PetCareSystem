import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Form, Card, Row, Col, InputGroup, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ManagePets = () => {
  const { doctorId } = useParams();  // Use useParams to get doctorId from URL
  const [pets, setPets] = useState([]);
  const [searchParams, setSearchParams] = useState({
    petid: '',
    sex: '',
    species: '',
    breed: '',
    petOwnerid: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchParams]);

  const fetchPets = async () => {
    try {
      const response = await axios.get('http://localhost:3000/doctor/pets');
      setPets(response.data);
    } catch (error) {
      console.error('Error fetching pets:', error);
      setError('An error occurred while fetching pets.');
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get('http://localhost:3000/doctor/pets/search', { params: searchParams });
      setPets(response.data);
    } catch (error) {
      console.error('Error searching pets:', error);
      setError('An error occurred while searching pets.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prevParams) => ({
      ...prevParams,
      [name]: value
    }));
  };

  return (
    <div className='container mt-3'>
      <h3 className='text-start mb-4'>Pets</h3>
      <Form>
        <InputGroup className='mb-3'>
          <Form.Control
            type='text'
            placeholder='Search by Pet ID'
            name='petid'
            value={searchParams.petid}
            onChange={handleChange}
          />
          <Form.Control
            type='text'
            placeholder='Search by Sex'
            name='sex'
            value={searchParams.sex}
            onChange={handleChange}
          />
          <Form.Control
            type='text'
            placeholder='Search by Species'
            name='species'
            value={searchParams.species}
            onChange={handleChange}
          />
          <Form.Control
            type='text'
            placeholder='Search by Breed'
            name='breed'
            value={searchParams.breed}
            onChange={handleChange}
          />
          <Form.Control
            type='text'
            placeholder='Search by Pet Owner ID'
            name='petOwnerid'
            value={searchParams.petOwnerid}
            onChange={handleChange}
          />
        </InputGroup>
        <div className='d-flex justify-content-end mb-3'>
          <span>{pets.length} results found</span>
        </div>
      </Form>
      {error && <Alert variant='danger'>{error}</Alert>}
      <Row>
        {pets.map((pet) => (
          <Col key={pet.petid} xs={12} sm={6} md={4} lg={3} className='mb-4'>
            <Card className='h-100'>
              <Card.Img
                variant='top'
                src={pet.photo ? `http://localhost:3000/uploads/${pet.photo}` : 'default-pet.jpg'}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{pet.petName}</Card.Title>
                <Card.Text>
                  <strong>ID:</strong> {pet.petid}<br />
                  <strong>Birth Date:</strong> {new Date(pet.birthDate).toLocaleDateString()}<br />
                  <strong>Sex:</strong> {pet.sex}<br />
                  <strong>Species:</strong> {pet.species}<br />
                  <strong>Breed:</strong> {pet.breed}<br />
                  <strong>Registered Date:</strong> {new Date(pet.registeredDate).toLocaleDateString()}<br />
                  <strong>Pet Owner ID:</strong> {pet.petOwnerid}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ManagePets;
