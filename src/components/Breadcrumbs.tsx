import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import "../App.css";

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Hide breadcrumbs if the user is on the home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav aria-label="breadcrumb" style={{ marginTop: '4.4rem', marginLeft: '1.2rem' }}>
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/">Home</Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return last ? (
            <li key={to} className="breadcrumb-item active" aria-current="page">
              {value}
            </li>
          ) : (
            <li key={to} className="breadcrumb-item">
              <Link to={to}>{value}</Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;