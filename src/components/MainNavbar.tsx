import { Nav, Navbar } from "react-bootstrap";

const MainNavbar = () => {
  return (
    <Navbar
      className="bg-body-tertiary small-navbar main-navbar"
      data-bs-theme="dark"
      fixed="top"
      style={{ backgroundColor: "#008ac1 !important" }}
    >
      <Navbar.Brand href="/" style={{ marginLeft: "8px" }}>
        Data Pipeline Manager
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/">Home</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default MainNavbar;
