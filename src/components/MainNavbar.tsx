import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar, Nav, Offcanvas } from "react-bootstrap";
import Logo from "../assets/images/logoBlusapphire.png";
import { FaBell } from "react-icons/fa";
import { DeviceContext } from "../utils/DeviceContext";
import { MdHelpOutline } from "react-icons/md";
import '../App.css';

const MainNavbar: React.FC = () => {
  const location = useLocation();
  const deviceContext = useContext(DeviceContext);
  const [show, setShow] = useState(false);
  const [docsContent, setDocsContent] = useState<string>("");
  const isHomePage = location.pathname === "/";
  const isVersionsPage = location.pathname.startsWith("/versions");
  const url = import.meta.env.VITE_REACT_APP_DOCS;

  if (!deviceContext) {
    return null;
  }

  const { selectedDevice } = deviceContext;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await fetch(url);
        const htmlContent = await response.text();
        setDocsContent(htmlContent);
      } catch (error) {
        console.error("Error fetching documentation:", error);
        setDocsContent("Unable to load documentation.");
      }
    };

    if (show) {
      fetchDocs();
    }
  }, [show, url]);

  return (
    <>
      <Navbar
        className="bg-body-tertiary small-navbar main-navbar"
        fixed="top"
        style={{ height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1rem' }}>
          <img
            src={Logo}
            alt="Logo"
            style={{ height: '2rem', marginRight: '0.5rem', padding: '3px' }}
          />
          <Navbar.Brand
            href="/"
            style={{ color: '#11a1cd', fontWeight: '600', fontSize: '20px' }}
          >
            Data Pipeline Manager
          </Navbar.Brand>
        </div>

        {!isHomePage && (
          <Nav
            className="me-auto"
            style={{ display: "flex", alignItems: "center" }}
          >
            <Nav.Link
              as={Link}
              to="/"
              style={{
                borderBottom: isHomePage ? "2px solid #11a1cd" : "none",
                color: isHomePage ? "#11a1cd" : "inherit",
                fontWeight: isHomePage ? "600" : "normal",
                marginRight: "1rem",
              }}
            >
              Devices
            </Nav.Link>
            {selectedDevice && (
              <Nav.Link
                as={Link}
                to={`/versions/${selectedDevice}`}
                style={{
                  borderBottom: isVersionsPage ? "2px solid #11a1cd" : "none",
                  color: isVersionsPage ? "#11a1cd" : "inherit",
                  fontWeight: isVersionsPage ? "600" : "normal",
                }}
              >
                Versions
              </Nav.Link>
            )}
          </Nav>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginRight: '1rem' }}>
          {!isHomePage && selectedDevice && (
            <div style={{ fontSize: "14px" }}>
              Device: <span style={{ fontWeight: "600" }}>{selectedDevice}</span>
            </div>
          )}

          <div style={{ position: "relative", display: "flex" }}>
            <FaBell style={{ fontSize: "1.3rem", color: "black" }} />
          </div>

          <Nav.Link onClick={handleShow} style={{ marginRight: "12px" }}>
            <MdHelpOutline style={{ fontSize:'24px' }} />
          </Nav.Link>
        </div>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
      </Navbar>

      <Offcanvas show={show} onHide={handleClose} placement="end" style={{Width:'50%'}} >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title >Documentation</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div
            dangerouslySetInnerHTML={{ __html: docsContent }}
            style={{ width: "100%", height: "100%", overflowY: "auto" }}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default MainNavbar;