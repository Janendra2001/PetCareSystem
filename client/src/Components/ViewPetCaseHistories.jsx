import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Table, Form, Modal, Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ViewPetCaseHistories = () => {
  const { petownerId, petId } = useParams();
  console.log(`Pet Owner ID: ${petownerId}, Pet ID: ${petId}`);
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportDetails, setReportDetails] = useState(null);

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

  const fetchReportDetails = async () => {
    try {
      const url = `http://localhost:3000/petowner/${petownerId}/pets/${petId}/reportdetails`;
      console.log(`Fetching report details from URL: ${url}`);
      const response = await axios.get(url);
      console.log('Fetched report details:', response.data);
      setReportDetails(response.data);
      setShowReport(true);
    } catch (error) {
      console.error('Error fetching report details:', error);
    }
  };

  const generatePDF = () => {
    const input = document.getElementById('reportContent');
    html2canvas(input)
      .then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'PNG', 10, 10);
        pdf.save("vaccination_report.pdf");
      });
  };

  const formatBirthDate = (dateString) => {
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
      <div className='d-flex justify-content-end mb-3'>
      <Button variant='success' className='mb-3 rounded-3' onClick={fetchReportDetails}>Generate Vaccination Report</Button>
      </div>
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
            <tr key={c.id}>
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

      <Modal show={showReport} onHide={() => setShowReport(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vaccination Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reportDetails && (
            <div id="reportContent" className="p-3">
              <h4 className="text-center">Vaccination Report</h4>
              <h5 className="text-center">Pet Animal Clinic</h5>
              <h6 className="text-center">Royal Pet Care, Matale Junction, Anuradhapura</h6>
              <hr className='bg-dark'/>
              <div className="d-flex justify-content-between mb-4">
                <div>
                  <p><strong>Pet Owner ID:</strong> {reportDetails.petOwner.id}</p>
                  <p><strong>Pet Owner Name:</strong> {reportDetails.petOwner.username}</p>
                  <p><strong>PetID:</strong> {reportDetails.pet.petid}</p>
                  <p><strong>PetName:</strong> {reportDetails.pet.petName}</p>
                  <p><strong>Date of Birth:</strong> {formatBirthDate(reportDetails.pet.birthDate)}</p>
                  <p><strong>Species:</strong> {reportDetails.pet.species}</p>
                  <p><strong>Breed:</strong> {reportDetails.pet.breed}</p>
                </div>
                <div>
                  <p><strong><u>Clinic Details</u></strong></p>
                  <p><strong>Contact:</strong> 0711235431</p>
                  <p><strong>Report Issued Date:</strong> {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Vaccine Name</th>
                    <th>Weight (Kg)</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportDetails.vaccineCases.map((c, index) => (
                    <tr key={index}>
                      <td>{c.treatment}</td>
                      <td>{c.weight}</td>
                      <td>{new Date(c.caseDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="mt-4 d-flex justify-content-between">
              <p><strong>Veterinarian Signature:</strong> _________________________________ </p>
              <p><strong>Date: ___________</strong></p>
              </div>
              <hr className='bg-dark'/>
              <p className="text-center">Thank you for visiting our clinic</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReport(false)} className='rounded-3'>Close</Button>
          <Button variant="primary" onClick={generatePDF}className='rounded-3'>Download PDF</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ViewPetCaseHistories;
