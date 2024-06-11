import React from 'react';
import axios from 'axios';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import "bootstrap-icons/font/bootstrap-icons.css";
import './style.css'; 

const DoctorDashboard = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;
  const handleLogout = () => {
    axios.get('http://localhost:3000/doctor/logout')
    .then((result) => {
    if(result.data.Status){
      localStorage.removeItem("valid")
          navigate('/');
    }
})
}

  return (
    <div className="container-fluid ">
      <div className="row flex-nowrap">
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 custom-bg">
          <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100 ">
            <Link
              to={`/home`}
              className="d-flex align-items-center pb-3 mb-md-1 mt-md-3 me-md-auto text-white text-decoration-none"
            >
              <span className="fs-5 fw-bolder d-none d-sm-inline">
                Back to Home
              </span>
            </Link>
            <ul
              className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
              id="menu"
            >
              <li className="w-100">
                <Link
                  to={`/doctordashboard/${doctorId}`}
                  className="d-flex nav-link text-white px-0 align-middle"
                >
                  <i className="fs-4 bi-speedometer2 ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Dashboard</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to={`/doctordashboard/${doctorId}/doctorappointments`}
                  className="d-flex nav-link text-white px-0 align-middle"
                >
                  <i className="fs-4 bi bi-person-vcard ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Appointments</span>
                </Link>
              </li>
        <li className="w-100"> 
          <Link 
          to={`/doctordashboard/${doctorId}/doctors`}
          className="d-flex nav-link text-white px-0 align-middle" 
          > 
          <i className="fs-4 bi bi-people ms-2"></i> 
          <span className="ms-2 d-none d-sm-inline">Doctors</span> 
          </Link> 
        </li> 
        <li className="w-100"> 
          <Link 
          to={`/doctordashboard/${doctorId}/petowners`}
          className="d-flex nav-link text-white px-0 align-middle" 
          > 
          <i className="fs-4 bi bi-people-fill ms-2"></i> 
          <span className="ms-2 d-none d-sm-inline">Pet Owners</span> 
          </Link> 
        </li> 
        <li className="w-100"> 
          <Link 
          to={`/doctordashboard/${doctorId}/managepets`}
          className="d-flex nav-link text-white px-0 align-middle" 
          > 
          <i className="fs-4 bi-columns ms-2"></i> 
          <span className="ms-2 d-none d-sm-inline">Pets</span> 
          </Link> 
        </li>
        <li className="w-100">
                <Link
                  to={`/doctordashboard/${doctorId}/entercases`}
                  className="d-flex nav-link text-white px-0 align-middle"
                >
                  <i className="fs-4 bi bi-card-list ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Enter Cases</span>
                </Link>
              </li>
        <li className="w-100"> 
          <Link 
          to={`/doctordashboard/${doctorId}/medicationitems`}
          className="d-flex nav-link text-white px-0 align-middle" 
          > 
          <i className="fs-4 bi bi-prescription2 ms-2"></i> 
          <span className="ms-2 d-none d-sm-inline">Medication Items</span> 
          </Link> 
        </li> 
        <li className="w-100"> 
          <Link 
          to={`/doctordashboard/${doctorId}/doctorprofile`} 
          className="d-flex nav-link text-white px-0 align-middle" 
          > 
          <i className="fs-4 bi-person ms-2"></i> 
          <span className="ms-2 d-none d-sm-inline">Profile</span> 
          </Link> 
  </li>
        <li className="w-100" onClick={handleLogout}> 
          <Link 
          className="d-flex nav-link text-white px-0 align-middle" 
          > 
          <i className="fs-4 bi-power ms-2"></i> 
          <span className="ms-2 d-none d-sm-inline">Logout</span> 
          </Link> 
        </li> 
      </ul>
        </div>
      </div> 
      <div className="col p-0 m-0"> 
        <div className="p-2 d-flex justify-content-end shadow"> 
          <h4 className="dashboard_heading">Royal Pet Care</h4>
        </div> 
        <Outlet /> 
      </div>
    </div>
  </div>
  )
}

export default DoctorDashboard