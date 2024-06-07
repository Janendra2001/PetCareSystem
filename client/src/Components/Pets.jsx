import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

const Pets = () => {
  const { petownerId } = useParams();
  const [pets, setPets] = useState([]);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/petowner/${petownerId}/pets`);
        setPets(response.data);
      } catch (error) {
        console.error('Error fetching pets:', error);
        setError('An error occurred while fetching pets.');
      }
    };

    fetchPets();
  }, [petownerId]);

  const handleDeleteConfirmation = (petid) => {
    setPetToDelete(petid);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/petowner/${petownerId}/pets/${petToDelete}`);
      setPets(pets.filter(pet => pet.petid !== petToDelete));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting pet:', error);
      setError('An error occurred while deleting the pet.');
      setShowDeleteModal(false);
    }
  };

  return (
    <div className='container mt-3'>
      <div className='row mt-4'>
        <div className='col text-start'>
          <Link to={`/petownerdashboard/${petownerId}/pets/addpet`} className='btn btn-success rounded-3'>Add Pet</Link>
        </div>
      </div>
      <h3 className='text-center mb-4'>See, Who you care about!</h3>
      <div className='row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4'>
        {pets.map((pet) => (
          <div key={pet.petid} className='col'>
            <div className='card' style={{width: '350px'}}>
              <img 
                src={`http://localhost:3000/uploads/${pet.photo}`} 
                className='card-img-top' 
                alt={pet.petName}
                style={{ width: '100%', height: '300px', objectFit: 'cover' }} 
              />
              <div className='card-body d-flex flex-column justify-content-center'>
                <h5 className='card-title text-center text-primary'>{pet.petName}</h5>
                <p className='card-text text-center'>
                  <strong>PetID:</strong> {pet.petid}<br />
                  <strong>Species:</strong> {pet.species}<br />
                  <strong>Breed:</strong> {pet.breed}<br />
                  <strong>Sex:</strong> {pet.sex}<br />
                  <strong>Birth Date:</strong> {pet.birthDate}
                </p>
                <div className='d-grid gap-2 mt-auto'>
                  <Link to={`/petownerdashboard/${petownerId}/pets/${pet.petid}/view`} className='btn btn-outline-primary rounded-3'>View</Link>
                  <Link to={`/petownerdashboard/${petownerId}/pets/${pet.petid}/edit`} className='btn btn-outline-info rounded-3'>Edit</Link>
                  <button onClick={() => handleDeleteConfirmation(pet.petid)} className='btn btn-outline-danger rounded-3'>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {error && <div className='alert alert-danger mt-3'>{error}</div>}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Pet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this pet?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className='rounded-3'>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} className='rounded-3'>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Pets;
