import { Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

const RoutingNavbar = () => {
  return (
    <Navbar
      className="bg-body-tertiary small-navbar routing-navbar"
      data-bs-theme="light"
      fixed="top"
      style={{marginTop:'3.2rem'}}
    
    >
      <Navbar.Toggle aria-controls="basic-navbar-nav"  />
      <Navbar.Collapse id="basic-navbar-nav"  >
        <Nav className="me-auto">
          <Nav.Link href="#home">Devices</Nav.Link>
          <Nav.Link as={Link} to="/versions">
            Versions
          </Nav.Link>
          {/* <Nav.Link href="#link">Routing</Nav.Link> */}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default RoutingNavbar;
