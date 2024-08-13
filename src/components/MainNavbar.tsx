import { Nav, Navbar } from "react-bootstrap";
import Logo from '../assets/images/logoBlusapphire.png';


import { MdHelpOutline } from "react-icons/md";

const url = import.meta.env.VITE_REACT_APP_DOCS;

const MainNavbar = () => {
  const onDocsClick = () => {
    window.open(url, "_blank");
  };

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
    
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/">Home</Nav.Link>
        </Nav>
      </Navbar.Collapse>

      <Nav.Link onClick={onDocsClick} style={{ marginRight: "12px" }}>
        <MdHelpOutline
          style={{ height: "20px", width: "20px", fill: "#fff" }}
        />
      </Nav.Link>
    </Navbar>
  );
};

export default MainNavbar;