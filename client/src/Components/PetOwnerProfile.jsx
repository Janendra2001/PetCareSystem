import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Form, Button, Alert, Image, Row, Col } from 'react-bootstrap';

const PetOwnerProfile = () => {
  const { petownerId } = useParams();
  const [petowners, setPetOwner] = useState({});
  const [newPhoto, setNewPhoto] = useState(null);
  const [error, setError] = useState({});
  const [message, setMessage] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    fetchPetOwnerProfile();
  }, []);

  const fetchPetOwnerProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/petowner/${petownerId}`);
      setPetOwner(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError((prevError) => ({ ...prevError, general: 'An error occurred while fetching profile.' }));
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await axios.post(`http://localhost:3000/petowner/${petownerId}/uploadphoto`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPetOwner((prev) => ({ ...prev, photo: response.data.photo }));
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError((prevError) => ({ ...prevError, general: 'An error occurred while uploading the photo.' }));
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

    if (!validateEmail(petowners.email)) {
      newErrors.email = 'Enter a valid email.';
    }

    if (!validateContact(petowners.contact)) {
      newErrors.contact = 'Enter a valid contact number.';
    }

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3000/petowner/${petownerId}`, petowners);
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError((prevError) => ({ ...prevError, general: 'The email address already registered.' }));
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
      const response = await axios.put(`http://localhost:3000/petowner/${petownerId}/password`, passwordData);
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error updating password:', error);
      setError((prevError) => ({ ...prevError, currentPassword: 'Current password you entered is incorrect.' }));
    }
  };

  return (
    <div className='container mt-3'>
      <h3 className='text-start mb-4'>Welcome {petowners.fname} {petowners.lname}</h3>
      {error.general && <Alert variant='danger'>{error.general}</Alert>}
      {message && <Alert variant='success'>{message}</Alert>}
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Row className="justify-content-md-center">
            <Col md={6}>
              <Image
                src={petowners.photo ? `http://localhost:3000/uploads/${petowners.photo}` : 'default-photo.jpg'}
                fluid
                className='mb-3 rounded-circle'
                style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => document.getElementById('photoUpload').click()}
              />
              <input
                type="file"
                id="photoUpload"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
            </Col>
          </Row>
          <Form onSubmit={handleProfileUpdate}>
            <Form.Group className='mb-3'>
              <Form.Label>Your Registered ID</Form.Label>
              <Form.Control
                type='text'
                value={petowners.id || ''}
                readOnly
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type='text'
                value={petowners.fname || ''}
                onChange={(e) => setPetOwner({ ...petowners, fname: e.target.value })}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type='text'
                value={petowners.lname || ''}
                onChange={(e) => setPetOwner({ ...petowners, lname: e.target.value })}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type='email'
                value={petowners.email || ''}
                onChange={(e) => setPetOwner({ ...petowners, email: e.target.value })}
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
                value={petowners.contact || ''}
                onChange={(e) => setPetOwner({ ...petowners, contact: e.target.value })}
                isInvalid={!!error.contact}
              />
              <Form.Control.Feedback type='invalid'>
                {error.contact}
              </Form.Control.Feedback>
            </Form.Group>
            <Button type='submit' variant='success' className='rounded-3'>Update Profile</Button>
          </Form>
        </Col>
        <Col md={6}>
        <br/><br/><br/>
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

export default PetOwnerProfile;
