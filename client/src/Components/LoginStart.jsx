import React from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../Pages/NavBar/NavBar'

const LoginStart = () => {
    const navigate = useNavigate()
  return (
    <div>
        <NavBar></NavBar>
    <div className='d-flex justify-content-center align-items-center vh-100 loginPage'>
        <div className='p-3 rounded w-25 loginForm '> 
            <h2 className='text-center'>Login As</h2> 
           <div className='d-flex justify-content-between mt-5 mb-2 '> 
           <div className="d-grid gap-2 col-6 mx-auto">
           <button type="button" className="btn btn-outline-primary" onClick={() => {navigate('/petownerlogin')}}>
                PetOwner
            </button>
            <button type="button" className="btn btn-outline-info" onClick={() => {navigate('/doctorlogin')}}>
                Doctor
            </button>
            <button type="button" className="btn btn-outline-success" onClick={() => {navigate('/adminlogin')}}>
                Admin
            </button> 
            </div>
           </div>
        </div>
    </div>
    </div>
  )
}

export default LoginStart