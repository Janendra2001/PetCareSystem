import react from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './navbar.css';
import { useNavigate } from 'react-router-dom';


const NavBar = () => { 
  const navigate = useNavigate()
  return (
    <Navbar expand="lg" className="navbar">
      <Container>
        <Navbar.Brand href="/home" className='brand'>ROYAL PET CARE</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/home" className='nav-link text-light ms-3'>Home</Nav.Link>
            <Nav.Link href="/blog" className='nav-link text-light ms-3'>Blogs</Nav.Link>
            <Nav.Link href="/meetyourdoctor" className='nav-link text-light ms-3'>Meet Your Doctor</Nav.Link>

          </Nav>
          
          <Nav className='ms-3'>
          <button type="button" className='btn btn-success rounded-3' onClick={() => {navigate('/')}}>Login</button>
          </Nav><br/>
          <Nav className='ms-3'>
          <button type="button" className='btn btn-outline-success rounded-3' onClick={() => {navigate('/register')}}>Sign Up</button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
