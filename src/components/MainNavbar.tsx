// MainNavbar.tsx
import React, { useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";
import Logo from "../assets/images/logoBlusapphire.png";
import { FaBell } from "react-icons/fa";
import { DeviceContext } from "../utils/DeviceContext"; // import context

import { MdHelpOutline } from "react-icons/md";

const MainNavbar = () => {
  const location = useLocation();
  const deviceContext = useContext(DeviceContext); // get the context
  const isHomePage = location.pathname === "/";
  const isVersionsPage = location.pathname === "/versions";
  const url = import.meta.env.VITE_REACT_APP_DOCS;

  // If the context is not available, handle it gracefully
  if (!deviceContext) {
    return null; // or return some fallback UI
  }

  const { selectedDevice } = deviceContext;

  const onDocsClick = () => {
    window.open(url, "_blank");
  };

  return (
    <Navbar
      className="bg-body-tertiary small-navbar main-navbar"
      fixed="top"
      style={{
        height: "3.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", marginLeft: "1rem" }}
      >
        <img
          src={Logo}
          alt="Logo"
          style={{ height: "2rem", marginRight: "0.5rem", padding: "3px" }}
        />
        <Navbar.Brand
          href="/"
          style={{ color: "#11a1cd", fontWeight: "600", fontSize: "20px" }}
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
          <Nav.Link
            as={Link}
            to="/versions"
            style={{
              borderBottom: isVersionsPage ? "2px solid #11a1cd" : "none",
              color: isVersionsPage ? "#11a1cd" : "inherit",
              fontWeight: isVersionsPage ? "600" : "normal",
            }}
          >
            Versions
          </Nav.Link>
        </Nav>
      )}
      <div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {selectedDevice && (
            <div style={{ fontSize: "14px" }}>
              Selected Device:{" "}
              <span style={{ fontWeight: "600" }}> {selectedDevice}</span>
            </div>
          )}

          <div
            style={{
              position: "relative",
              marginRight: "1rem",
              display: "flex",
            }}
          >
            <FaBell style={{ fontSize: "1.3rem", color: "black" }} />
            <div
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                backgroundColor: "red",
                color: "white",
                borderRadius: "50%",
                width: "16px",
                height: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              3
            </div>
          </div>

          <Nav.Link onClick={onDocsClick} style={{ marginRight: "12px" }}>
            <MdHelpOutline style={{ height: "20px", width: "20px" }} />
          </Nav.Link>
        </div>
      </div>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
    </Navbar>
  );
};

export default MainNavbar;
