import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const MedicationItems = ({ doctorId }) => {
  const [medications, setMedications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [editFormData, setEditFormData] = useState({
    type: '',
    name: '',
    expDate: '',
    receivedIssuedStatus: '',
    quantity: '',
    balance: ''
  });
  const [initialEditFormData, setInitialEditFormData] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await axios.get('http://localhost:3000/auth/medicationitems');
      setMedications(response.data);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };

  const handleDelete = (id) => {
    setShowDeleteModal(true);
    setSelectedMedication(id);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/auth/medicationitems/${selectedMedication}`);
      fetchMedications();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  const handleEdit = (medication) => {
    setSelectedMedication(medication.medicationItemid);
    const initialData = {
      type: medication.type,
      name: medication.name,
      expDate: medication.expDate.split('T')[0], // Ensure correct date format
      receivedIssuedStatus: medication.receivedIssuedStatus,
      quantity: medication.quantity,
      balance: medication.balance
    };
    setEditFormData(initialData);
    setInitialEditFormData(initialData);
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();

    let newBalance = parseInt(editFormData.balance, 10);
    const quantity = parseInt(editFormData.quantity, 10);
    if (editFormData.receivedIssuedStatus === 'Received') {
      newBalance += quantity;
    } else if (editFormData.receivedIssuedStatus === 'Issued') {
      newBalance -= quantity;
    }

    const updatedData = { ...editFormData, balance: newBalance };

    // Remove expDate from updatedData if it hasn't changed
    if (editFormData.expDate === initialEditFormData.expDate) {
      delete updatedData.expDate;
    }

    try {
      await axios.put(`http://localhost:3000/auth/medicationitems/${selectedMedication}`, updatedData);
      fetchMedications();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating medication:', error);
    }
  };

  const formatExpDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatLastUpdatedDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const filteredMedications = medications.filter(medication => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatches = medication.name.toLowerCase().includes(searchLower);
    const typeMatches = medication.type.toLowerCase().includes(searchLower);
    return nameMatches || typeMatches;
  });

  const isDoctorDashboard = location.pathname.includes('doctordashboard');
  const linkPath = isDoctorDashboard 
    ? `/doctordashboard/${doctorId}/addmedicationitems`
    : '/dashboard/addmedicationitems';

  return (
    <div className='px-5 mt-3'>
      <div className='d-flex justify-content-center'>
        <h3>Medication Items List</h3>
      </div>
      <Form className='mb-3'>
        <Form.Group controlId='search'>
          <Form.Control
            type='text'
            placeholder='Search by type or name'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Form.Group>
      </Form>
      <Link to={linkPath} className='btn btn-success rounded-3 mb-3'>
        Add Medication Item
      </Link>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Name</th>
            <th>Expiration Date</th>
            <th>Status</th>
            <th>Quantity</th>
            <th>Last Updated Date</th>
            <th>Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMedications.map((medication) => (
            <tr key={medication.medicationItemid}>
              <td>{medication.medicationItemid}</td>
              <td>{medication.type}</td>
              <td>{medication.name}</td>
              <td>{formatExpDate(medication.expDate)}</td>
              <td>{medication.receivedIssuedStatus}</td>
              <td>{medication.quantity}</td>
              <td>{formatLastUpdatedDate(medication.lastUpdatedDate)}</td>
              <td>{medication.balance}</td>
              <td>
                <Button
                  variant='primary'
                  onClick={() => handleEdit(medication)}
                  className='me-2 rounded-3'
                >
                  
                  Update
                </Button>
                <Button variant='danger' onClick={() => handleDelete(medication.medicationItemid)} className='rounded-3'>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Medication</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this medication?</Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDeleteModal(false)} className='rounded-3'>
            Cancel
          </Button>
          <Button variant='danger' onClick={confirmDelete} className='rounded-3'>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Medication</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditFormSubmit}>
            <Form.Group controlId='type'>
              <Form.Label>Type</Form.Label>
              <Form.Control
                type='text'
                name='type'
                value={editFormData.type}
                onChange={handleEditFormChange}
              />
            </Form.Group>
            <Form.Group controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                name='name'
                value={editFormData.name}
                onChange={handleEditFormChange}
              />
            </Form.Group>
            <Form.Group controlId='expDate'>
              <Form.Label>Expiration Date</Form.Label>
              <Form.Control
                type='date'
                name='expDate'
                value={editFormData.expDate}
                onChange={handleEditFormChange}
              />
            </Form.Group>
            <Form.Group controlId='receivedIssuedStatus'>
              <Form.Label>Status</Form.Label>
              <Form.Control
                as='select'
                name='receivedIssuedStatus'
                value={editFormData.receivedIssuedStatus}
                onChange={handleEditFormChange}
              >
                <option value='Received'>Received</option>
                <option value='Issued'>Issued</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId='quantity'>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type='number'
                name='quantity'
                value={editFormData.quantity}
                onChange={handleEditFormChange}
                min={1}
              />
            </Form.Group>
            <Form.Group controlId='balance'>
              <Form.Label>Balance</Form.Label>
              <Form.Control
                type='number'
                name='balance'
                value={editFormData.balance}
                onChange={handleEditFormChange}
                readOnly
              />
            </Form.Group>
            <Button variant='success' type='submit' className='mt-3 rounded-3'>
              Update the medication item
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MedicationItems;
