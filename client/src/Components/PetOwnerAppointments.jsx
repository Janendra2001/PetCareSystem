import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const PetOwnerAppointments = () => {
  const { petownerId } = useParams();
  const [pets, setPets] = useState([]);
  const [appointmentType, setAppointmentType] = useState('');
  const [otherSurgery, setOtherSurgery] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedPets, setSelectedPets] = useState([]);
  const [contactNo, setContactNo] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:3000/petowner/${petownerId}/pets`)
      .then(response => setPets(response.data))
      .catch(error => console.error('Error fetching pets:', error));

    fetchAppointments();
  }, [petownerId]);

  useEffect(() => {
    if (appointmentDate) {
      axios.get(`http://localhost:3000/petowner/appointments/availableslots?appointmentDate=${appointmentDate}`)
        .then(response => setAvailableSlots(response.data))
        .catch(error => console.error('Error fetching available slots:', error));
    }
  }, [appointmentDate]);

  const fetchAppointments = () => {
    axios.get(`http://localhost:3000/petowner/${petownerId}/appointments`)
      .then(response => setAppointments(response.data))
      .catch(error => console.error('Error fetching appointments:', error));
  };

  const handleAppointmentRequest = (e) => {
    e.preventDefault();
    const appointmentsToRequest = selectedPets.map(petId => ({
      petid: petId,
      appointmentType,
      otherSurgery: appointmentType === 'OtherSurgeries' ? otherSurgery : '',
      contactNo,
      appointmentDate,
      slotNo: selectedSlot,
      status: 'Requested'
    }));

    axios.post('http://localhost:3000/petowner/appointments', { appointments: appointmentsToRequest })
      .then(response => {
        alert('Appointment request submitted successfully');
        setShowForm(false);
        fetchAppointments();
      })
      .catch(error => console.error('Error submitting appointment request:', error));
  };

  const handleCancelAppointment = (appointmentId) => {
    axios.put(`http://localhost:3000/petowner/appointments/${appointmentId}/cancel`)
      .then(response => {
        alert('Appointment canceled successfully');
        fetchAppointments();
      })
      .catch(error => console.error('Error canceling appointment:', error));
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
      <h2 className='text-start text-black'>Schedule your appointment here</h2>
      <br />
      <button className="btn btn-primary mb-4 rounded-3" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Hide Appointment Form' : 'Make an Appointment'}
      </button>
      
      {showForm && (
        <form onSubmit={handleAppointmentRequest} className="mb-5">
          <div className="form-group">
            <label>Select Pet(s)</label>
            <select
              multiple
              className="form-control"
              onChange={(e) => setSelectedPets([...e.target.selectedOptions].map(option => option.value))}
            >
              {pets.map(pet => (
                <option key={pet.petid} value={pet.petid}>
                  {pet.petName} ({pet.petid})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Appointment Type</label>
            <select
              className="form-control"
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
            >
              <option value="Treatments">Treatments</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Surgery(Histerectomy)">Surgery (Histerectomy) - only on Saturdays</option>
              <option value="OtherSurgeries">Other Surgeries</option>
            </select>
          </div>
          {appointmentType === 'OtherSurgeries' && (
            <div className="form-group">
              <label>Specify Surgery</label>
              <input
                type="text"
                className="form-control"
                value={otherSurgery}
                onChange={(e) => setOtherSurgery(e.target.value)}
              />
            </div>
          )}
          <div className="form-group">
            <label>Contact No</label>
            <input
              type="text"
              className="form-control"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Appointment Date</label>
            <input
              type="date"
              className="form-control"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />
          </div>
          {appointmentDate && (
            <div className="form-group">
              <label>Available Slots</label>
              <select
                className="form-control"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
              >
                {availableSlots.map(SlotNo => (
                  <option key={SlotNo} value={SlotNo}>{SlotNo}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary rounded-3">Request Appointment</button>
        </form>
      )}

      <h2 className='text-center text-primary'>Your Appointments</h2>
      <br />
      <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover">
          <thead>
            <tr>
              <th>AppointmentID</th>
              <th>AppointmentDate</th>
              <th>SlotNo</th>
              <th>PetID</th>
              <th>AppointmentType</th>
              <th>OtherSurgery</th>
              <th>Contact No</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.sort((a, b) => new Date(b.AppointmentDate) - new Date(a.AppointmentDate)).map((appointment) => (
              <tr key={appointment.AppointmentID}>
                <td>{appointment.AppointmentID}</td>
                <td>{formatAppointmentDate(appointment.AppointmentDate)}</td>
                <td>{appointment.SlotNo}</td>
                <td>{appointment.petid}</td>
                <td>{appointment.AppointmentType}</td>
                <td>{appointment.OtherSurgery}</td>
                <td>{appointment.ContactNo}</td>
                <td
                  style={{
                    backgroundColor:
                      appointment.Status === 'Requested' ? '#93FFE8'
                        : appointment.Status === 'Accepted' ? '#5cb85c'
                          : appointment.Status === 'Declined' ? '#FF0000'
                            : appointment.Status === 'Canceled' ? '#FFCCCB'
                            : appointment.Status === 'Completed' ? '#008000'
                            : appointment.Status === 'In Progress' ? '#f0ad4e'
                              : '#5bc0de',
                  }}>{appointment.Status}</td>
                <td>
                {appointment.Status !== 'Completed' && appointment.Status !== 'InProgress' && appointment.Status !== 'Declined' && appointment.Status !== 'Canceled' &&(
                  <button className="btn btn-danger rounded-3" onClick={() => handleCancelAppointment(appointment.AppointmentID)}>
                    Cancel
                  </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PetOwnerAppointments;
