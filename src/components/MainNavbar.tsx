import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar, Nav, Offcanvas, Container } from "react-bootstrap";
import Logo from "../assets/images/logoBlusapphire.png";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { DeviceContext } from "../utils/DeviceContext";
import { MdHelpOutline, MdSettings } from "react-icons/md";
import '../App.css';
import { colors } from "../theme/theme";
import Badge from "../components/common/Badge";

const MainNavbar: React.FC = () => {
  const location = useLocation();
  const deviceContext = useContext(DeviceContext);
  const [show, setShow] = useState(false);
  const isHomePage = location.pathname === "/";
  const isRoutingPage = location.pathname === "/routing";
  const isVersionsPage = location.pathname.startsWith("/versions");
  const url = import.meta.env.VITE_REACT_APP_DOCS; // GitBook documentation URL

  if (!deviceContext) {
    return null;
  }

  const { selectedDevice } = deviceContext;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const activeStyle = {
    borderBottom: `2px solid ${colors.primary.main}`,
    color: colors.primary.main,
    fontWeight: 600,
  };

  const inactiveStyle = {
    color: colors.neutral.darkerGray,
    fontWeight: 500,
  };

  const navLinkStyle = {
    padding: '0.75rem 1rem',
    transition: 'all 0.2s ease',
    borderRadius: '4px 4px 0 0',
  };

  return (
    <>
      <Navbar
        className="bg-body-tertiary main-navbar shadow-sm slide-right"
        fixed="top"
        expand="lg"
      >
        <Container fluid>
          <div className="d-flex align-items-center">
            <img
              src={Logo}
              alt="Logo"
              className="me-2"
              style={{ height: '2.2rem', padding: '3px' }}
            />
            <Navbar.Brand
              as={Link}
              to="/"
              className="d-flex align-items-center"
              style={{ 
                color: colors.primary.main, 
                fontWeight: 600, 
                fontSize: '1.25rem'
              }}
            >
              Data Pipeline Manager
            </Navbar.Brand>
          </div>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                as={Link}
                to="/"
                className="mx-1 d-flex align-items-center"
                style={{
                  ...navLinkStyle,
                  ...(isHomePage ? activeStyle : inactiveStyle),
                }}
              >
                Devices
              </Nav.Link>
              
              {selectedDevice && (
                <>
                  <Nav.Link
                    as={Link}
                    to="/routing"
                    className="mx-1 d-flex align-items-center"
                    style={{
                      ...navLinkStyle,
                      ...(isRoutingPage ? activeStyle : inactiveStyle),
                    }}
                  >
                    Pipeline
                  </Nav.Link>
                  
                  <Nav.Link
                    as={Link}
                    to={`/versions/${selectedDevice}`}
                    className="mx-1 d-flex align-items-center"
                    style={{
                      ...navLinkStyle,
                      ...(isVersionsPage ? activeStyle : inactiveStyle),
                    }}
                  >
                    Versions
                  </Nav.Link>
                </>
              )}
            </Nav>
            
            <div className="d-flex align-items-center">
              {selectedDevice && (
                <Badge 
                  variant="primary" 
                  size="md" 
                  pill
                  className="me-3"
                >
                  Device: {selectedDevice}
                </Badge>
              )}
              
              <div className="d-flex align-items-center gap-3">
                <Nav.Link 
                  className="nav-icon p-2"
                  style={{ 
                    borderRadius: '50%', 
                    backgroundColor: `${colors.neutral.lighterGray}` 
                  }}
                >
                  <FaBell style={{ fontSize: "1.1rem", color: colors.neutral.darkerGray }} />
                </Nav.Link>
                
                <Nav.Link 
                  className="nav-icon p-2"
                  style={{ 
                    borderRadius: '50%', 
                    backgroundColor: `${colors.neutral.lighterGray}` 
                  }}
                >
                  <MdSettings style={{ fontSize: "1.3rem", color: colors.neutral.darkerGray }} />
                </Nav.Link>
                
                <Nav.Link 
                  onClick={handleShow} 
                  className="nav-icon p-2"
                  style={{ 
                    borderRadius: '50%', 
                    backgroundColor: `${colors.neutral.lighterGray}` 
                  }}
                >
                  <MdHelpOutline style={{ fontSize: "1.3rem", color: colors.neutral.darkerGray }} />
                </Nav.Link>
                
                <Nav.Link className="ms-2 d-flex align-items-center">
                  <FaUserCircle style={{ fontSize: "1.5rem", color: colors.primary.main }} />
                </Nav.Link>
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Offcanvas 
        show={show} 
        onHide={handleClose} 
        placement="end" 
        className="documentation-drawer"
      >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold">Documentation</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <iframe
            src={url}
            title="Documentation"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default MainNavbar;