import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

const AddMedicationItems = () => {
  const { doctorId } = useParams(); // Retrieve doctorId from URL params
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    expDate: '',
    serialNo: '',
    receivedIssuedStatus: '',
    quantity: '',
    balance: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call backend API to check if medicine already exists
    fetch('http://localhost:3000/auth/check-medicine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: formData.name })
    })
    .then(response => response.json())
    .then(data => {
      if (data.exists) {
        setErrorMessage('This medicine already exists');
      } else {
        // If medicine does not exist, submit form data
        submitFormData();
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  const submitFormData = () => {
    // Call backend API to submit form data
    fetch('http://localhost:3000/auth/medicationitems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      setSuccessMessage('Medication item added successfully');
      // Optionally reset the form or provide feedback to the user
      setFormData({
        type: '',
        name: '',
        expDate: '',
        serialNo: '',
        receivedIssuedStatus: '',
        quantity: '',
        balance: ''
      });
      setErrorMessage('');
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };
  const isDoctorDashboard = location.pathname.includes('doctordashboard');
  const linkPath = isDoctorDashboard 
    ? `/doctordashboard/${doctorId}/medicationitems`
    : '/dashboard/medicationitems';
  return (
    <div className='d-flex justify-content-center align-items-center h-85'>
    <div className='p-3 rounded w-50 border'>
      <h3 className='text-center'>Add Medication Item</h3>
      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
      {successMessage && <div className='alert alert-success'>{successMessage}</div>}
      <form className='row g-1' onSubmit={handleSubmit}>
          <div className='col-12'>
            <label htmlFor='type' className='form-label'>Type</label>
            <select name='type' id='type' className='form-select' value={formData.type} onChange={handleChange}>
              <option value=''>Select Type</option>
              <option value='Drug'>Drugs</option>
              <option value='Vaccine'>Vaccines</option>
              <option value='Other'>Others</option>
            </select>
          </div>
          <div className='col-12'>
            <label htmlFor='name' className='form-label'>Name</label>
            <input type='text' name='name' className='form-control' id='name' placeholder='Enter Name' value={formData.name} onChange={handleChange} required />
          </div>
          <div className='col-12'>
            <label htmlFor='expDate' className='form-label'>Expiration Date</label>
            <input type='date' name='expDate' className='form-control' id='expDate' value={formData.expDate} onChange={handleChange} required />
          </div>
          <div className='col-12'>
            <label htmlFor='receivedIssuedStatus' className='form-label'>Status</label>
            <select name='receivedIssuedStatus' id='receivedIssuedStatus' className='form-select' value={formData.receivedIssuedStatus} onChange={handleChange}>
              <option value=''>Select Status</option>
              <option value='Received'>Received</option>
              <option value='Issued'>Issued</option>
            </select>
          </div>
          <div className='col-12'>
            <label htmlFor='quantity' className='form-label'>Quantity</label>
            <input
              type='number'
              name='quantity'
              className='form-control'
              id='quantity'
              placeholder='Enter Quantity'
              value={formData.quantity}
              onChange={handleChange}
              min='1'
              required
            />
          </div>
          <div className='col-12'>
            <label htmlFor='balance' className='form-label'>Balance</label>
            <input
              type='number'
              name='balance'
              className='form-control'
              id='balance'
              placeholder='Balance is auto calculated'
              value={formData.balance}
              readOnly
            />
          </div>
          <div className='mt-4'>
          <div className='col-12'>
            <button type='submit' className='btn btn-success w-100 rounded-3'>Add Medication Item</button>
            </div>
            <br/>
            <Link to={linkPath} className='btn btn-primary rounded-3 ml-2 pl-3'>Back</Link>
        </div>
        </form>
        
      </div>
    </div>
  );
};

export default AddMedicationItems;
