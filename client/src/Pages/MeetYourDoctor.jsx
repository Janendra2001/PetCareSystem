import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import img from '../images/doctor.jpg';
import NavBar from './NavBar/NavBar';

const MeetYourDoctor = () => {
  return (
    <div>
      <NavBar />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0 rounded-3" style={{ backgroundColor: '#e1e1e1' }}>
              <div className="card-body text-center">
                <h2 className="card-title text-dark">Dr. Geetha Muthuwaththa</h2>
                <h5 className="card-subtitle mb-3 text-secondary">BVSc (Sri Lanka)</h5>
                <img 
                  src={img}
                  alt="Dr. Geetha Muthuwaththa" 
                  className="img-fluid rounded-circle mb-3 mx-auto d-block" 
                  style={{ width: '210px', height: '210px', objectFit: 'cover', border: '5px solid #fff' }}
                />
                <p className="card-text text-dark">
                  <strong>Dr. Muthuwaththa graduated from the University of Peradeniya in 1993 and joined the Department of Animal Production and Health as a government veterinary surgeon. She has 31 years of experience as a government veterinary surgeon and private practitioner.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MeetYourDoctor;
