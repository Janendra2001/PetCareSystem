import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from 'react-bootstrap';

const ViewDoctors = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:3000/doctor/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error("There was an error fetching the doctors!", error);
    }
  };

  return (
    <div className='px-5 mt-3'>
      <div className='d-flex justify-content-center'>
        <h3>Doctor List</h3>
      </div>
        <div className='container mt-5'>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Username</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Contact No</th>
              <th>Status</th>
              <th>Education</th>
              <th>Reg No</th>
              <th>Experience (years)
              </th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>{doctor.username}</td>
                <td>{doctor.firstname}</td>
                <td>{doctor.lastname}</td>
                <td>{doctor.email}</td>
                <td>{doctor.contactNo}</td>
                <td>{doctor.status}</td>
                <td>{doctor.education}</td>
                <td>{doctor.regNo}</td>
                <td>{doctor.experience}</td>
                <td>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default ViewDoctors;