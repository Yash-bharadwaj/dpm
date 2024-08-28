import React from 'react';
import { useLocation } from 'react-router-dom';
import "../App.css";

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav aria-label="breadcrumb" style={{ marginTop: '4.4rem', marginLeft: '1.2rem' }}>
      <ol className="breadcrumb">
        <li className="breadcrumb-item">Home</li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const label = value ; 

          return last ? (
            <li style={{fontSize:'14px'}} key={index} className="breadcrumb-item active" aria-current="page">
              {label}
            </li>
          ) : (
            <li key={index} className="breadcrumb-item">
              {label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
