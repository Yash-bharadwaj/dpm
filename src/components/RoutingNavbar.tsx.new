import React from "react";
import { Nav, Navbar, Container } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { colors } from "../theme/theme";

interface RoutingNavbarProps {
  tabs?: Array<{
    id: string;
    label: string;
    href: string;
  }>;
}

const RoutingNavbar: React.FC<RoutingNavbarProps> = ({
  tabs = [
    { id: 'overview', label: 'Overview', href: '#overview' },
    { id: 'sources', label: 'Sources', href: '#sources' },
    { id: 'destinations', label: 'Destinations', href: '#destinations' },
    { id: 'transforms', label: 'Transforms', href: '#transforms' },
    { id: 'functions', label: 'Functions', href: '#functions' },
  ]
}) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.id || '');

  // Get the hash from the URL
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Update active tab based on URL hash if present
  React.useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && tabs.some(tab => tab.id === hash)) {
      setActiveTab(hash);
    } else if (!activeTab && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [location.hash, tabs, activeTab]);

  return (
    <Navbar
      className="bg-body-tertiary routing-navbar border-bottom shadow-sm slide-up"
      fixed="top"
      style={{marginTop:'3.5rem'}}
      expand="lg"
    >
      <Container fluid>
        <Navbar.Toggle aria-controls="routing-navbar-nav" />
        <Navbar.Collapse id="routing-navbar-nav">
          <Nav className="me-auto">
            {tabs.map(tab => (
              <Nav.Link
                key={tab.id}
                as="a"
                href={tab.href}
                onClick={() => handleTabClick(tab.id)}
                className="mx-1 px-3 py-2"
                style={{
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  color: activeTab === tab.id ? colors.primary.main : colors.neutral.darkerGray,
                  borderBottom: activeTab === tab.id ? `2px solid ${colors.primary.main}` : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </Nav.Link>
            ))}
          </Nav>
          
          <div className="d-flex gap-2">
            <Nav.Link 
              as={Link} 
              to="/"
              className="btn btn-outline-primary btn-sm"
            >
              Back to Devices
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/versions"
              className="btn btn-primary btn-sm"
            >
              Versions
            </Nav.Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default RoutingNavbar;