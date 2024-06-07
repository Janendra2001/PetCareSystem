import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [showRequested, setShowRequested] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchPendingAppointments();
  }, []);

  const fetchAppointments = async () => {
    const response = await axios.get('http://localhost:3000/auth/appointments');
    setAppointments(response.data);
  };

  const fetchPendingAppointments = async () => {
    const response = await axios.get('http://localhost:3000/auth/pending-appointments');
    setPendingAppointments(response.data);
  };

  const handleAccept = async (appointmentId) => {
    await axios.post(`http://localhost:3000/auth/appointments/${appointmentId}/accept`);
    fetchAppointments();
    fetchPendingAppointments();
  };

  const handleDecline = async (appointmentId) => {
    await axios.post(`http://localhost:3000/auth/appointments/${appointmentId}/decline`);
    fetchAppointments();
    fetchPendingAppointments();
  };

  const handleInProgress = async (appointmentId) => {
    await axios.post(`http://localhost:3000/auth/appointments/${appointmentId}/inprogress`);
    fetchPendingAppointments();
  };

  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="container">
      <button className="btn btn-primary mt-4 rounded-3" onClick={() => setShowRequested(!showRequested)}>
        {showRequested ? 'Hide Requested Appointments' : 'Show Requested Appointments'}
      </button>
      {showRequested && (
        <div>
          <h2 className="mt-4">Requested Appointments</h2>
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr>
                  <th>AppointmentID</th>
                  <th>PetID</th>
                  <th>AppointmentType</th>
                  <th>OtherSurgery</th>
                  <th>Contact No</th>
                  <th>AppointmentDate</th>
                  <th>SlotNo</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.sort((a, b) => new Date(a.AppointmentDate) - new Date(b.AppointmentDate)).map((appointment) => (
                  <tr key={appointment.AppointmentID}>
                    <td>{appointment.AppointmentID}</td>
                    <td>{appointment.petid}</td>
                    <td>{appointment.AppointmentType}</td>
                    <td>{appointment.OtherSurgery}</td>
                    <td>{appointment.ContactNo}</td>
                    <td>{formatAppointmentDate(appointment.AppointmentDate)}</td>
                    <td>{appointment.SlotNo}</td>
                    <td>{appointment.Status}</td>
                    <td>
                      <button
                        className="btn btn-primary me-2 rounded-3"
                        onClick={() => handleAccept(appointment.AppointmentID)}
                      >
                        Accept
                      </button><br/><br/>
                      <button
                        className="btn btn-danger rounded-3"
                        onClick={() => handleDecline(appointment.AppointmentID)}
                      >
                        Decline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 className="mt-4">Today's Appointments</h2>
      <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover">
          <thead>
            <tr>
              <th>AppointmentID</th>
              <th>PetID</th>
              <th>AppointmentType</th>
              <th>OtherSurgery</th>
              <th>Contact No</th>
              <th>AppointmentDate</th>
              <th>SlotNo</th>
              <th>Status</th>
              <th>Actions</th>
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
                <td>{appointment.Status}</td>
                <td>
                  <button
                    className="btn btn-success rounded-3"
                    onClick={() => handleInProgress(appointment.AppointmentID)}
                  >
                    In Progress
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;
