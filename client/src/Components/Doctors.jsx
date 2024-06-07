import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [deleteDoctorId, setDeleteDoctorId] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:3000/doctor/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error("There was an error fetching the doctors!", error);
    }
  };

  const handleEdit = (doctor) => {
    setEditDoctor(doctor);
    setShowEditModal(true);
  };

  const handleDeleteConfirmation = (id) => {
    setDeleteDoctorId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/doctor/deletedoctor/${deleteDoctorId}`);
      setShowDeleteModal(false);
      fetchDoctors();
    } catch (error) {
      console.error("There was an error deleting the doctor!", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/doctor/editdoctor/${editDoctor.id}`, editDoctor);
      setShowEditModal(false);
      fetchDoctors();
    } catch (error) {
      console.error("There was an error updating the doctor!", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditDoctor({ ...editDoctor, [name]: value });
  };

  return (
    <div className='px-5 mt-3'>
      <div className='d-flex justify-content-center'>
        <h3>Doctor List</h3>
      </div>
      <Link to='/dashboard/adddoctor' className='btn btn-success rounded-3'>
        Add Doctor</Link>
        <div className='container mt-5'>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
            <th>ID</th>
              <th>Username</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Contact No</th>
              <th>Status</th>
              <th>Education</th>
              <th>Reg No</th>
              <th>Experience</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>{doctor.id}</td>
                <td>{doctor.username}</td>
                <td>{doctor.firstname}</td>
                <td>{doctor.lastname}</td>
                <td>{doctor.email}</td>
                <td>{doctor.contactNo}</td>
                <td>{doctor.status}</td>
                <td>{doctor.education}</td>
                <td>{doctor.regNo}</td>
                <td>{doctor.experience}</td>
                <td>
                  <Button variant="primary" className="rounded-3" onClick={() => handleEdit(doctor)}>Edit</Button>{' '}<br/><br/>
                  <Button variant="danger" className="rounded-3" onClick={() => handleDeleteConfirmation(doctor.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Edit Doctor Modal */}
        {editDoctor && (
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Doctor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleEditSubmit}>
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" name="username" value={editDoctor.username} onChange={handleChange} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control type="text" name="firstname" value={editDoctor.firstname} onChange={handleChange} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control type="text" name="lastname" value={editDoctor.lastname} onChange={handleChange} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={editDoctor.email} onChange={handleChange} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Contact No</Form.Label>
                  <Form.Control type="text" name="contactNo" value={editDoctor.contactNo} onChange={handleChange} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Control type="text" name="status" value={editDoctor.status} onChange={handleChange} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Education</Form.Label>
                  <Form.Control type="text" name="education" value={editDoctor.education} onChange={handleChange} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Reg No</Form.Label>
                  <Form.Control type="text" name="regNo" value={editDoctor.regNo} onChange={handleChange} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Experience</Form.Label>
                  <Form.Control type="text" name="experience" value={editDoctor.experience} onChange={handleChange} />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        )}

        {/* Delete Doctor Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Doctor</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this doctor?</Modal.Body>
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
    </div>
  );
}

export default Doctors;