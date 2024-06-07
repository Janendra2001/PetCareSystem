import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Table, Form } from 'react-bootstrap';

const ViewPetCaseHistories = () => {
  const { petownerId, petId } = useParams();
  console.log(`Pet Owner ID: ${petownerId}, Pet ID: ${petId}`);
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const url = `http://localhost:3000/petowner/${petownerId}/pets/${petId}/cases`;
        console.log(`Fetching cases from URL: ${url}`);
        const response = await axios.get(url);
        console.log('Fetched cases:', response.data);
        setCases(response.data);
        setFilteredCases(response.data);
      } catch (error) {
        console.error('Error fetching cases:', error);
      }
    };

    fetchCases();
  }, [petownerId, petId]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term === '') {
      setFilteredCases(cases);
    } else {
      setFilteredCases(cases.filter(c => c.caseType.toLowerCase().includes(term.toLowerCase())));
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
      <div className='text-left mt-3'>
        <Link to={`/petownerdashboard/${petownerId}/pets`} className='btn btn-primary rounded-3'>Back to Pets</Link>
      </div>
      <h3 className='text-center mb-4'>Pet Case Histories</h3>
      <Form.Control
        type='text'
        placeholder='Search by case type'
        value={searchTerm}
        onChange={handleSearch}
        className='mb-3'
      />
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Case Date</th>
            <th>Diagnosis</th>
            <th>Case Type</th>
            <th>Treatment</th>
            <th>Prescription</th>
            <th>Remarks</th>
            <th>Next Vaccination Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredCases.map((c) => (
            <tr key={c.id}>
              <td>{formatCaseDate(c.caseDate)}</td>
              <td>{c.diagnosis}</td>
              <td>{c.caseType}</td>
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

export default ViewPetCaseHistories;

