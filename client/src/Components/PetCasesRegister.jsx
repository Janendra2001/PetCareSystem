import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Table, Button, Alert, Modal, FormControl } from 'react-bootstrap';

const PetCasesRegister = () => {
  const { doctorId, petId } = useParams();
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [searchTerm, cases]);

  const fetchCases = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/doctor/${doctorId}/pets/${petId}/cases`);
      setCases(response.data);
      setFilteredCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
      setError('An error occurred while fetching cases.');
    }
  };

  const filterCases = () => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = cases.filter(c => c.caseType.toLowerCase().includes(lowercasedTerm));
    setFilteredCases(filtered);
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

  const formatNextVaccinationDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className='container mt-3'>
      <div className='text-start mt-3'>
        <Link to={`/doctordashboard/${doctorId}/managepets`} className='btn btn-primary rounded-3'>Back to Manage Pets</Link>
      </div>
      <br/>
      <h3 className='text-center mb-4'>Pet Case Register</h3>
      {error && <Alert variant='danger'>{error}</Alert>}
      {successMessage && <Alert variant='success'>{successMessage}</Alert>}

      <FormControl
        type='text'
        placeholder='Search by case type...'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className='mb-3'
      />

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Case Date</th>
            <th>Diagnosis</th>
            <th>Case Type</th>
            <th>Weight (Kg)</th>
            <th>Treatment</th>
            <th>Prescription</th>
            <th>Remarks</th>
            <th>Next Vaccination Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredCases.map((c) => (
            <tr key={c.caseid}>
              <td>{formatCaseDate(c.caseDate)}</td>
              <td>{c.diagnosis}</td>
              <td>{c.caseType}</td>
              <td>{c.weight}</td>
              <td>{c.treatment}</td>
              <td>{c.prescription}</td>
              <td>{c.remarks}</td>
              <td>{formatNextVaccinationDate(c.nextVaccinationDate)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default PetCasesRegister;
