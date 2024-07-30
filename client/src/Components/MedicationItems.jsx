import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

const MedicationItems = ({ doctorId }) => {
  const [medications, setMedications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [petCases, setPetCases] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditMinQuantityModal, setShowEditMinQuantityModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [editFormData, setEditFormData] = useState({
    type: '',
    name: '',
    expDate: '',
    receivedIssuedStatus: '',
    quantity: '',
    balance: '',
    minquantity: ''
  });
  const [editMinQuantity, setEditMinQuantity] = useState('');
  const [initialEditFormData, setInitialEditFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchMedications();
    fetchPetCases();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await axios.get('http://localhost:3000/auth/medicationitems');
      setMedications(response.data);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };

  const fetchPetCases = async () => {
    try {
      const response = await axios.get('http://localhost:3000/auth/petcases/notfinished');
      setPetCases(response.data);
    } catch (error) {
      console.error('Error fetching pet cases:', error);
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
      expDate: medication.expDate.split('T')[0], 
      receivedIssuedStatus: medication.receivedIssuedStatus,
      quantity: medication.quantity,
      balance: medication.balance,
    };
    setEditFormData(initialData);
    setInitialEditFormData(initialData);
    setShowEditModal(true);
  };

  const handleEditMinQuantity = (medication) => {
    setSelectedMedication(medication.medicationItemid);
    setEditMinQuantity(medication.minquantity);
    setShowEditMinQuantityModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleMinQuantityChange = (e) => {
    setEditMinQuantity(e.target.value);
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();

    let newBalance = parseInt(editFormData.balance, 10);
    const quantity = parseInt(editFormData.quantity, 10);
    if (editFormData.receivedIssuedStatus === 'Received') {
      newBalance += quantity;
    } else if (editFormData.receivedIssuedStatus === 'Issued') {
      if (quantity > newBalance) {
        setErrorMessage('The existing quantity is not enough for the issued.');
        return;
      }
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
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating medication:', error);
    }
  };

  const handleMinQuantitySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/auth/medicationitems/minquantity/${selectedMedication}`, {
        minquantity: editMinQuantity
      });
      fetchMedications();
      setShowEditMinQuantityModal(false);
    } catch (error) {
      console.error('Error updating min quantity:', error);
    }
  };

  const handleFinishCase = async (caseId) => {
    try {
      await axios.put(`http://localhost:3000/auth/petcases/finish/${caseId}`);
      fetchPetCases();
    } catch (error) {
      console.error('Error finishing pet case:', error);
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

  // Sort medications to display those with quantity <= minquantity at the top
  const sortedMedications = filteredMedications.sort((a, b) => {
    if (a.balance <= a.minquantity && b.balance > b.minquantity) {
      return -1;
    } else if (a.balance > a.minquantity && b.balance <= b.minquantity) {
      return 1;
    }
    return 0;
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
      <h3 className='mt-5 text-center'>Not Finished Pet Cases</h3>
      <Table striped bordered hover responsive className='mt-3'>
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Case Date</th>
            <th>Diagnosis</th>
            <th>Case Type</th>
            <th>Treatment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {petCases.map((petCase) => (
            <tr key={petCase.caseid}>
              <td>{petCase.caseid}</td>
              <td>{formatExpDate(petCase.caseDate)}</td>
              <td>{petCase.diagnosis}</td>
              <td>{petCase.caseType}</td>
              <td>{petCase.treatment}</td>
              <td>
                <Button
                  variant='primary'
                  onClick={() => handleFinishCase(petCase.caseid)}
                  className='rounded-3'
                >
                  Finish
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h3 className='mt-5 text-center'>Stock Items</h3>
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
            <th>Min Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedMedications.map((medication) => (
            <tr 
              key={medication.medicationItemid} 
              className={medication.balance <= medication.minquantity ? 'low-quantity' : ''}
            >
              <td
              style={{
                backgroundColor:
                medication.balance === 0 ? '#ee6b6e':
                  medication.balance <= medication.minquantity ? '#BCD2E8'
                          : '',
              }}>{medication.medicationItemid}</td>
              <td
              style={{
                backgroundColor:
                medication.balance === 0 ? '#ee6b6e':
                  medication.balance <= medication.minquantity ? '#BCD2E8'
                          : '',
              }}>{medication.type}</td>
              <td
              style={{
                backgroundColor:
                medication.balance === 0 ? '#ee6b6e':
                  medication.balance <= medication.minquantity ? '#BCD2E8'
                          : '',
              }}>{medication.name}</td>
              <td
              style={{
                backgroundColor:
                medication.balance === 0 ? '#ee6b6e':
                new Date(medication.expDate) < new Date() ? '#ffcccb' :
                  medication.balance <= medication.minquantity ? '#BCD2E8'
                          : '',
              }}>{formatExpDate(medication.expDate)}</td>
              <td
              style={{
                backgroundColor:
                medication.balance === 0 ? '#ee6b6e':
                  medication.balance <= medication.minquantity ? '#BCD2E8'
                          : '',
              }}>{medication.receivedIssuedStatus}</td>
              <td
              style={{
                backgroundColor:
                medication.balance === 0 ? '#ee6b6e':
                  medication.balance <= medication.minquantity ? '#BCD2E8'
                          : '',
              }}>{medication.quantity}</td>
              <td
              style={{
                backgroundColor:
                medication.balance === 0 ? '#ee6b6e':
                  medication.balance <= medication.minquantity ? '#BCD2E8'
                          : '',
              }}>{formatLastUpdatedDate(medication.lastUpdatedDate)}</td>
              <td
              style={{
                backgroundColor:
                medication.balance === 0 ? '#ee6b6e':
                  medication.balance <= medication.minquantity ? '#BCD2E8'
                          : '',
              }}>{medication.balance}</td>
              <td
              style={{
                backgroundColor:
                medication.balance === 0 ? '#ee6b6e':
                  medication.balance <= medication.minquantity ? '#BCD2E8'
                          : '',
              }}>{medication.minquantity}<br/>
              <Button
                  variant='primary'
                  onClick={() => handleEditMinQuantity(medication)}
                  className='me-2 rounded-3 mt-3'
                >
                  Edit
                </Button></td>
              <td
              style={{
                backgroundColor:
                medication.balance === 0 ? '#ee6b6e':
                  medication.balance <= medication.minquantity ? '#BCD2E8'
                          : '',
              }}>
                <Button
                  variant='primary'
                  onClick={() => handleEdit(medication)}
                  className='me-2 rounded-3 mb-3'
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
          <Modal.Title>Update Medication</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant='danger'>{errorMessage}</Alert>}
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
                min={0}
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

      <Modal show={showEditMinQuantityModal} onHide={() => setShowEditMinQuantityModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Min Quantity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleMinQuantitySubmit}>
            <Form.Group controlId='minquantity'>
              <Form.Label>New Min Quantity</Form.Label>
              <Form.Control
                type='number'
                name='minquantity'
                value={editMinQuantity}
                onChange={handleMinQuantityChange}
                min={1}
              />
            </Form.Group>
            <Button variant='success' type='submit' className='mt-3 rounded-3'>
              Update Min Quantity
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MedicationItems;
