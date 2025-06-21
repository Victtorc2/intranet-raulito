import React from 'react';

const Loader = ({ text = 'Cargando...' }) => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
      <div className="text-center">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 fs-5">{text}</p>
      </div>
    </div>
  );
};

export default Loader;