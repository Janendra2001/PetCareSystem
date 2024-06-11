import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditPet = () => {
  const { petownerId, petid } = useParams();
  const [petDetails, setPetDetails] = useState({
    petName: '',
    birthDate: '',
    sex: '',
    species: '',
    breed: '',
    photo: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPetDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/petowner/${petownerId}/pets/${petid}`);
        const petData = response.data;
        // Convert the date format to yyyy-MM-dd
        petData.birthDate = petData.birthDate.split('T')[0];
        setPetDetails(petData);
      } catch (error) {
        console.error('Error fetching pet details:', error);
        setError('An error occurred while fetching pet details.');
      }
    };

    fetchPetDetails();
  }, [petownerId, petid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetDetails(prevDetails => ({ ...prevDetails, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if a photo is selected
    if (!selectedFile && !petDetails.photo) {
      setError('Please select a photo');
      return;
    }
  
    const formData = new FormData();
    formData.append('petName', petDetails.petName);
    formData.append('birthDate', petDetails.birthDate);
    formData.append('sex', petDetails.sex);
    formData.append('species', petDetails.species);
    formData.append('breed', petDetails.breed);
    if (selectedFile) {
      formData.append('photo', selectedFile);
    }
  
    try {
      await axios.put(`http://localhost:3000/petowner/${petownerId}/pets/${petid}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccessMessage('Pet details updated successfully');
      setTimeout(() => {
        setSuccessMessage('');
        navigate(`/petownerdashboard/${petownerId}/pets`);
      }, 2000);
    } catch (error) {
      console.error('Error updating pet details:', error);
      setError('An error occurred while updating pet details.');
    }
  };

  return (
    <div className="container mt-3">
      <div>
        <Link to={`/petownerdashboard/${petownerId}/pets`} className="btn btn-primary rounded-3 ml-2 pl-3">Back</Link>
      </div>
      <h3 className="text-center mb-4">Edit Pet Details</h3>
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label htmlFor="petName" className="form-label">Pet Name</label>
          <input 
            type="text" 
            className="form-control" 
            id="petName" 
            name="petName" 
            value={petDetails.petName} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="birthDate" className="form-label">Birth Date</label>
          <input 
            type="date" 
            className="form-control" 
            id="birthDate" 
            name="birthDate" 
            value={petDetails.birthDate} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="sex" className="form-label">Sex</label>
          <select 
            className="form-select" 
            id="sex" 
            name="sex" 
            value={petDetails.sex} 
            onChange={handleChange} 
            required
          >
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="species" className="form-label">Species</label>
          <select 
            type="text" 
            className="form-control" 
            id="species" 
            name="species" 
            value={petDetails.species} 
            onChange={handleChange} 
            required 
          >
            <option value="">Select Species</option>
            <option value="Canine">Canine</option>
            <option value="Feline">Feline</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="breed" className="form-label">Breed</label>
          <input 
            type="text" 
            className="form-control" 
            id="breed" 
            name="breed" 
            value={petDetails.breed} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="photo" className="form-label">Photo</label>
          <input 
            type="file" 
            className="form-control" 
            id="photo" 
            name="photo" 
            onChange={handleFileChange} 
          />
        </div>
        {petDetails.photo && (
            <div className="mb-3">
            <label><strong>Current Photo:</strong></label>
            <br/>
            <img 
            src={`http://localhost:3000/uploads/${petDetails.photo}`} 
            alt="Pet" 
            className="img-fluid" 
            style={{ maxWidth: '300px', maxHeight: '300px' }} // Adjust size here
            />
        </div>
)}
        <div className="mt-4">
          <div><button type="submit" className="btn btn-success rounded-3">Update Pet Details</button></div>
          <br/>
        </div>
      </form>
    </div>
  );
};

export default EditPet;