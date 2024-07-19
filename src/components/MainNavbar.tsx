import { Container, Nav, Navbar } from "react-bootstrap";

const MainNavbar = () => {
  return (
    <Navbar
      className="bg-body-tertiary small-navbar main-navbar"
      data-bs-theme="dark"
      fixed="top"
      style={{ backgroundColor: "#008ac1 !important" }}
    >
      <Container>
        <Navbar.Brand href="/">Data Pipeline Manager</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar;
