import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';

const Profile = () => {
  const [admin, setAdmin] = useState({});
  const [error, setError] = useState({});
  const [message, setMessage] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/auth/getprofile`);
      setAdmin(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError((prevError) => ({ ...prevError, general: 'An error occurred while fetching profile.' }));
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateContact = (contact) => {
    const contactRegex = /^[0-9]{10}$/; // Example: 10 digits phone number
    return contactRegex.test(contact);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!validateEmail(admin.email)) {
      newErrors.email = 'Enter a valid email.';
    }

    if (!validateContact(admin.ContactNo)) {
      newErrors.ContactNo = 'Enter a valid contact number.';
    }

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3000/auth/updateprofile`, admin);
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError((prevError) => ({ ...prevError, general: 'An error occurred while updating profile.' }));
    }
  };

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
      newErrors.newPassword = 'New password must be at least 6 characters long.';
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3000/auth/password`, passwordData);
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error updating password:', error);
      setError((prevError) => ({ ...prevError, currentPassword: 'Current password you entered is incorrect.' }));
    }
  };

  return (
    <div className='container mt-3'>
      <h3 className='text-start mb-4'>Welcome {admin.FirstName} {admin.LastName}</h3>
      {error.general && <Alert variant='danger'>{error.general}</Alert>}
      {message && <Alert variant='success'>{message}</Alert>}
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Form onSubmit={handleProfileUpdate}>
            <Form.Group className='mb-3'>
              <Form.Label>Your Registered ID</Form.Label>
              <Form.Control
                type='text'
                value={admin.ID || ''}
                readOnly
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>User Name</Form.Label>
              <Form.Control
                type='text'
                value={admin.UserName || ''}
                onChange={(e) => setAdmin({ ...admin, UserName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type='text'
                value={admin.FirstName || ''}
                onChange={(e) => setAdmin({ ...admin, FirstName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type='text'
                value={admin.LastName || ''}
                onChange={(e) => setAdmin({ ...admin, LastName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type='email'
                value={admin.email || ''}
                onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                isInvalid={!!error.email}
              />
              <Form.Control.Feedback type='invalid'>
                {error.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Contact</Form.Label>
              <Form.Control
                type='text'
                value={admin.ContactNo || ''}
                onChange={(e) => setAdmin({ ...admin, ContactNo: e.target.value })}
                isInvalid={!!error.ContactNo}
              />
              <Form.Control.Feedback type='invalid'>
                {error.ContactNo}
              </Form.Control.Feedback>
            </Form.Group>
            <Button type='submit' variant='success' className='rounded-3'>Update Profile</Button>
          </Form>
        </Col>
        <Col md={6}>
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

export default Profile;
