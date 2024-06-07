import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';

const AddPet = () => {
  const { petownerId } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    petName: '',
    birthDate: '',
    sex: '',
    species: '',
    breed: ''
  });
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('petownerId', petownerId);
    formData.append('petName', values.petName);
    formData.append('birthDate', values.birthDate);
    formData.append('sex', values.sex);
    formData.append('species', values.species);
    formData.append('breed', values.breed);
    formData.append('photo', photo);

    try {
      const response = await axios.post(`http://localhost:3000/petowner/addpet`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        setSuccess('Pet registered successfully');
        setError(null);
        setTimeout(() => {
          navigate(`/petownerdashboard/${petownerId}/pets`);
        }, 2000);
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Pet already registered.');
    }
  };

  return (
    <div className='px-5 mt-3'>
      <div><Link to={`/petownerdashboard/${petownerId}/pets`} className='btn btn-primary rounded-3 ml-2 pl-3'>Back</Link></div>
      <div className='d-flex justify-content-center'>
        <h3>Add a New Pet</h3>
      </div>
      {success && <div className='alert alert-success'>{success}</div>}
      {error && <div className='alert alert-danger'>{error}</div>}
      <Row className="justify-content-md-center">
          <Col md={6}>
      <form onSubmit={handleSubmit} className='mt-3'>
        <div className='mb-3'>
          <label htmlFor="petName"><strong>Pet Name</strong></label>
          <input type="text" id="petName" name="petName" value={values.petName}
            onChange={(e) => setValues({ ...values, petName: e.target.value })}
            className='form-control' required />
        </div>
        <div className='mb-3'>
          <label htmlFor="birthDate"><strong>Birth Date</strong></label>
          <input type="date" id="birthDate" name="birthDate" value={values.birthDate}
            onChange={(e) => setValues({ ...values, birthDate: e.target.value })}
            className='form-control' required />
        </div>
        <div className='mb-3'>
          <label htmlFor="sex"><strong>Sex</strong></label>
          <select id="sex" name="sex" value={values.sex}
            onChange={(e) => setValues({ ...values, sex: e.target.value })}
            className='form-control' required>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className='mb-3'>
          <label htmlFor="species"><strong>Species</strong></label>
          <input type="text" id="species" name="species" value={values.species}
            onChange={(e) => setValues({ ...values, species: e.target.value })}
            className='form-control' required />
        </div>
        <div className='mb-3'>
          <label htmlFor="breed"><strong>Breed</strong></label>
          <input type="text" id="breed" name="breed" value={values.breed}
            onChange={(e) => setValues({ ...values, breed: e.target.value })}
            className='form-control' required />
        </div>
        <div className='mb-3'>
          <label htmlFor="photo"><strong>Photo</strong></label>
          <input type="file" id="photo" name="photo"
            onChange={(e) => setPhoto(e.target.files[0])}
            className='form-control' required />
        </div>
        <div className='mt-4'>
            <div><button type="submit" className='btn btn-success rounded-3'>Register the Pet</button></div>
            <br/>
            
        </div>
      </form>
          </Col>
        </Row>
    </div>
  );
}

export default AddPet;