import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Form } from 'react-bootstrap';
import axios from 'axios';

const CheckMedicationItems = () => {
  const [medications, setMedications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await axios.get('http://localhost:3000/auth/medication');
      setMedications(response.data);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };


  const filteredMedications = medications.filter(medication => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatches = medication.name.toLowerCase().includes(searchLower);
    const typeMatches = medication.type.toLowerCase().includes(searchLower);
    return nameMatches || typeMatches;
  });

  return (
    <div className='px-5 mt-3'>
      <div className='d-flex justify-content-center'>
        <h3>Medication Items List</h3>
      </div>
      <Form className='mb-3'>
        <Form.Group controlId='search'>
          <Form.Control
            type='text'
            placeholder='Search by type or name'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Form.Group>
      </Form>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Name</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {filteredMedications.map((medication) => (
            <tr key={medication.medicationItemid}>
              <td>{medication.medicationItemid}</td>
              <td>{medication.type}</td>
              <td>{medication.name}</td>
              <td>{medication.balance}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CheckMedicationItems;
