import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const DoctorAppointments = () => {
  const [pendingAppointments, setPendingAppointments] = useState([]);

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    const response = await axios.get('http://localhost:3000/auth/pending-appointments');
    setPendingAppointments(response.data);
  };

  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Today's Appointments</h2>
      <div className="table-responsive shadow-sm p-3 mb-5 bg-white rounded">
        <table className="table table-hover">
          <thead className="thead-light">
            <tr>
              <th>Appointment ID</th>
              <th>Pet ID</th>
              <th>Appointment Type</th>
              <th>Other</th>
              <th>Contact No</th>
              <th>Appointment Date</th>
              <th>Slot No</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pendingAppointments.map((appointment) => (
              <tr key={appointment.AppointmentID}>
                <td>{appointment.AppointmentID}</td>
                <td>{appointment.petid}</td>
                <td>{appointment.AppointmentType}</td>
                <td>{appointment.OtherSurgery}</td>
                <td>{appointment.ContactNo}</td>
                <td>{formatAppointmentDate(appointment.AppointmentDate)}</td>
                <td>{appointment.SlotNo}</td>
                <td>
                  <span className={`badge ${
                    appointment.Status === 'Requested' ? 'badge-info' :
                    appointment.Status === 'Accepted' ? 'badge-success' :
                    appointment.Status === 'Declined' ? 'badge-danger' :
                    appointment.Status === 'Canceled' ? 'badge-warning' :
                    appointment.Status === 'Completed' ? 'badge-primary' :
                    appointment.Status === 'In Progress' ? 'badge-secondary' : 'badge-light'
                  }`}>
                    {appointment.Status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorAppointments;
