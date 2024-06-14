import React from 'react'
import NavBar from './NavBar/NavBar'
import './homepage.css'
import './homePage.scss'
import video from '../Assets/pet.mp4'


const HomePage = () => {
  return (
    <div>
      <div>
        <NavBar></NavBar>
      </div>
      <section className="home position-relative">
  <div className="overlay position-absolute top-0 start-0 w-100 h-100"></div>
  <video
    src={video}
    muted
    autoPlay
    loop
    type="video/mp4"
    className="w-100 h-100 object-fit-cover"
    style={{ position: 'absolute', top: '0', left: '0', zIndex: '-1' }}
  ></video>
  <div className="homeContent container position-relative d-flex align-items-left justify-content-left" style={{ height: '100vh' }}>
    <div className="textDiv text-left">
      <span className="smallText d-block mb-2">
        One stop solution for all your pet needs
      </span>
      <h1 className="homeTitle display-4">
      <strong>ROYAL PET CARE</strong>
      </h1>
      <span className="text d-block mb-2">
        Open hours - 4.00 pm to 9.00 pm everyday
      </span>
    </div>
  </div>
</section>

    </div>
  )
}

export default HomePage