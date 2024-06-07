import React, { useState } from 'react';
import './style.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from '../Pages/NavBar/NavBar';

const PetOwnerLogin = () => {
    const [values, setValues] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/petowner/petownerlogin', {
                email: values.email,
                password: values.password, // Send the plain password to the server
            });
            if (response.data.loginstatus) {
                navigate(`/petownerdashboard/${response.data.petownerId}/petownerprofile`);
            } else {
                setError(response.data.Error);
            }
        } catch (error) {
            console.error('Error:', error);
            setError("Wrong Email or Password. Please try again."); // Handle network or server errors
        }
    };

    return (
        <div>
            <NavBar />
            <div className='d-flex justify-content-center align-items-center vh-100 loginPage'>
                <div className='p-3 rounded w-25 border loginForm'>
                    <div className='text-warning'>
                        {error && error}
                    </div>
                    <h2>Login Page</h2>
                    <form onSubmit={handleSubmit}>
                        <div className='mb-3'>
                            <label htmlFor="email"><strong>Email</strong></label>
                            <input type="email" id="email" name="email" autoComplete='off' placeholder='Enter Email'
                                value={values.email} // Ensure that the value is controlled by state
                                onChange={(e) => setValues({ ...values, email: e.target.value })} className='form-control rounded-0' />
                        </div>
                        <div className='mb-3'>
                            <label htmlFor="password"><strong>Password</strong></label>
                            <input type="password" id="password" name="password" placeholder='Enter Password'
                                value={values.password} // Ensure that the value is controlled by state
                                onChange={(e) => setValues({ ...values, password: e.target.value })} className='form-control rounded-0' />
                        </div>
                        <button className='btn btn-outline-success w-100 rounded-0 mb-2'>Log in</button>
                        <div className='mb-1'>
                            <input type="checkbox" name="tick" id="tick" className='me-3' />
                            <label htmlFor="password">You agree with the terms & conditions</label>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PetOwnerLogin;