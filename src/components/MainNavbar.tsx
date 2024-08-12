import { Nav, Navbar } from "react-bootstrap";

import { MdHelpOutline } from "react-icons/md";

const url = import.meta.env.VITE_REACT_APP_DOCS;

const MainNavbar = () => {
  const onDocsClick = () => {
    window.open(url, "_blank");
  };

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

      <Nav.Link onClick={onDocsClick} style={{ marginRight: "12px" }}>
        <MdHelpOutline
          style={{ height: "20px", width: "20px", fill: "#fff" }}
        />
      </Nav.Link>
    </Navbar>
  );
};

export default MainNavbar;
