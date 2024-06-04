import { Container, Nav, Navbar } from "react-bootstrap";

const RoutingNavbar = () => {
  return (
    <Navbar
      className="bg-body-tertiary small-navbar routing-navbar"
      data-bs-theme="light"
      fixed="top"
    >
      <Container>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Overview</Nav.Link>
            {/* <Nav.Link href="#link">Routing</Nav.Link> */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default RoutingNavbar;
