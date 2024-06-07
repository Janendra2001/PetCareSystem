import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Collapse, Card, Alert, Form } from 'react-bootstrap';

const PetOwners = () => {
    const [petOwners, setPetOwners] = useState([]);
    const [filteredPetOwners, setFilteredPetOwners] = useState([]);
    const [open, setOpen] = useState({});
    const [pets, setPets] = useState({});
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPetOwners();
    }, []);

    const fetchPetOwners = async () => {
        try {
            const response = await axios.get('http://localhost:3000/auth/petowners');
            setPetOwners(response.data);
            setFilteredPetOwners(response.data);
        } catch (error) {
            console.error('Error fetching pet owners:', error);
            setError('An error occurred while fetching pet owners.');
        }
    };

    const fetchPets = async (petOwnerId) => {
        if (pets[petOwnerId]) {
            setOpen(prevOpen => ({ ...prevOpen, [petOwnerId]: !prevOpen[petOwnerId] }));
        } else {
            try {
                const response = await axios.get(`http://localhost:3000/auth/petowner/${petOwnerId}/pets`);
                setPets(prevPets => ({ ...prevPets, [petOwnerId]: response.data }));
                setOpen(prevOpen => ({ ...prevOpen, [petOwnerId]: true }));
            } catch (error) {
                console.error('Error fetching pets:', error);
                setError('An error occurred while fetching pets.');
            }
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = petOwners.filter(owner =>
            owner.fname.toLowerCase().includes(query) ||
            owner.lname.toLowerCase().includes(query) ||
            owner.email.toLowerCase().includes(query)
        );
        setFilteredPetOwners(filtered);
    };

    return (
        <div className='container mt-3'>
            <h3 className='text-center mb-4'>Registered Pet Owners</h3>
            <Form className='mb-3'>
                <Form.Group controlId='search'>
                    <Form.Control
                        type='text'
                        placeholder='Search by name or email'
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </Form.Group>
            </Form>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Contact</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPetOwners.map((petOwner) => (
                        <React.Fragment key={petOwner.id}>
                            <tr onClick={() => fetchPets(petOwner.id)} style={{ cursor: 'pointer' }}>
                                <td>{petOwner.id}</td>
                                <td>{petOwner.fname}</td>
                                <td>{petOwner.lname}</td>
                                <td>{petOwner.username}</td>
                                <td>{petOwner.email}</td>
                                <td>{petOwner.contact}</td>
                            </tr>
                            <tr>
                                <td colSpan="6" style={{ padding: 0, border: 'none' }}>
                                    <Collapse in={open[petOwner.id]}>
                                        <div>
                                            {pets[petOwner.id] && pets[petOwner.id].length > 0 ? (
                                                <Card body>
                                                    <Table striped bordered hover responsive className='mb-0'>
                                                        <thead>
                                                            <tr>
                                                                <th>Pet ID</th>
                                                                <th>Name</th>
                                                                <th>Species</th>
                                                                <th>Breed</th>
                                                                <th>Sex</th>
                                                                <th>Birth Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {pets[petOwner.id].map((pet) => (
                                                                <tr key={pet.petid}>
                                                                    <td>{pet.petid}</td>
                                                                    <td>{pet.petName}</td>
                                                                    <td>{pet.species}</td>
                                                                    <td>{pet.breed}</td>
                                                                    <td>{pet.sex}</td>
                                                                    <td>{new Date(pet.birthDate).toLocaleDateString()}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </Card>
                                            ) : (
                                                <Card body>No pets registered.</Card>
                                            )}
                                        </div>
                                    </Collapse>
                                </td>
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </Table>
            {error && <Alert variant='danger' className='mt-3'>{error}</Alert>}
        </div>
    );
};

export default PetOwners;
