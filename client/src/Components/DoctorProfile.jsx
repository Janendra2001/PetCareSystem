import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Form, Button, Alert, Image, Row, Col } from 'react-bootstrap';

const DoctorProfile = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState({});
  const [error, setError] = useState({});
  const [message, setMessage] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required.';
    }

    if (passwordData.newPassword.length < 3) {
      newErrors.newPassword = 'New password must be at least 3 characters long.';
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3000/doctor/${doctorId}/password`, passwordData);
      setMessage(response.data.message);
      // Clear password fields after successful update
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setError((prevError) => ({ ...prevError, currentPassword: 'Current password you entered is incorrect.' }));
    }
  };

  return (
    <div className='container mt-3'>
      <Row className="justify-content-md-center">
        <Col md={6}>
          {error.general && <Alert variant='danger'>{error.general}</Alert>}
          {message && <Alert variant='success'>{message}</Alert>}
          <Form className='mt-4' onSubmit={handlePasswordUpdate}>
            <h5>Update Password</h5>
            <Form.Group className='mb-3'>
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type='password'
                name='currentPassword'
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                isInvalid={!!error.currentPassword}
              />
              <Form.Control.Feedback type='invalid'>
                {error.currentPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type='password'
                name='newPassword'
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                isInvalid={!!error.newPassword}
              />
              <Form.Control.Feedback type='invalid'>
                {error.newPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Re-enter New Password</Form.Label>
              <Form.Control
                type='password'
                name='confirmNewPassword'
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                isInvalid={!!error.confirmNewPassword}
              />
              <Form.Control.Feedback type='invalid'>
                {error.confirmNewPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Button type='submit' variant='success' className='rounded-3'>Update Password</Button>
          </Form>
        </Col>
      </Row>
      <br />
    </div>
  );
};

export default DoctorProfile;
