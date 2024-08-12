import { Navbar } from "react-bootstrap";
import Logo from '../assets/images/logoBlusapphire.png';


const MainNavbar = () => {
  return (

    <Navbar
 
      className="bg-body-tertiary small-navbar main-navbar"
      fixed="top"
      style={{ height: '3.5rem', display: 'flex', alignItems: 'center' }}
    >
         
      <div style={{ display: 'flex', alignItems: 'center' , marginLeft:'1rem'}}>
        <img src={Logo} alt="Logo" style={{ height: '2rem', marginRight: '0.5rem', padding:'3px' }} />
        <Navbar.Brand href="/" style={{ color: '#11a1cd', fontWeight: '600', fontSize:'20px' }}>
          Data Pipeline Manager
   
        </Navbar.Brand>
       
      </div>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav"></Navbar.Collapse>
    
    </Navbar>
  );
};

export default MainNavbar;