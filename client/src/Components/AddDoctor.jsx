import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';


const AddDoctor = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNo: '',
    education: '',
    regNo: '',
    experience: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [contactError, setContactError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.username || !formData.firstname || !formData.lastname || !formData.email || !formData.contactNo || !formData.password || !formData.confirmPassword || !formData.education || !formData.regNo || !formData.experience) {
      return setError("All fields are required");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      setEmailError("Enter a valid email address");
      return;
    }
    if (!/^\d{10}$/.test(formData.contactNo)) {
      setContactError("Enter a valid contact number");
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/doctor/adddoctor', formData);
      setSuccess(response.data.message);
      setFormData({
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
        contactNo: '',
        education: '',
        regNo: '',
        experience: ''
      });
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <div>
      <Container>
        <br/>
      <Link to={`/dashboard/doctors`} className='btn btn-primary rounded-3 ml-2 pl-3'>Back</Link>
        <Row className="justify-content-md-center">
          <Col md={6}>
            <h2 className="my-4">Doctor Registration</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formUserName">
                <Form.Label>User Name</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your user name"
                />
              </Form.Group>
              <Form.Group controlId="formFirstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                />
              </Form.Group>
              <Form.Group controlId="formLastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
                {emailError && <div className="text-danger">{emailError}</div>}
              </Form.Group>
              <Form.Group controlId="formContactNo">
                <Form.Label>Contact</Form.Label>
                <Form.Control
                  type="text"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  placeholder="Enter your Contact No"
                />
                {contactError && <div className="text-danger">{contactError}</div>}
              </Form.Group>
              <Form.Group controlId="formEducation">
                <Form.Label>Education</Form.Label>
                <Form.Control
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="Enter your education"
                />
              </Form.Group>
              <Form.Group controlId="formExperience">
                <Form.Label>Experience</Form.Label>
                <Form.Control
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Enter your experience"
                />
              </Form.Group>
              <Form.Group controlId="formRegNo">
                <Form.Label>Reg No</Form.Label>
                <Form.Control
                  type="text"
                  name="regNo"
                  value={formData.regNo}
                  onChange={handleChange}
                  placeholder="Enter the registration number"
                />
              </Form.Group>
              <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </Form.Group>
              <Form.Group controlId="formConfirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </Form.Group>
              <div>
              <div><Button variant="success" type="submit" className="mt-3 rounded-3">
                Register
              </Button></div>
              <br/>
            
        </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddDoctor;