import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from 'react-bootstrap';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/doctor/appointments/pending/doctor')
      .then(response => setAppointments(response.data))
      .catch(error => console.error('Error fetching appointments:', error));
  }, []);

  return (
    <div className="container mt-3">
      <h3 className="text-center mb-4">Pending Appointments</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Appointment ID</th>
            <th>Pet ID</th>
            <th>Pet Owner ID</th>
            <th>Type</th>
            <th>Date</th>
            <th>Time Slot</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(app => (
            <tr key={app.AppointmentID}>
              <td>{app.AppointmentID}</td>
              <td>{app.petid}</td>
              <td>{app.petOwnerid}</td>
              <td>{app.AppointmentType}</td>
              <td>{app.AppointmentDate}</td>
              <td>{`Slot ${app.AppointmentTimeSlot}`}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DoctorDashboard;
