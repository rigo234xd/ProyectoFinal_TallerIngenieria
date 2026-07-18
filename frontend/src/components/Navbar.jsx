import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useContext(AuthContext);

  return (
    <nav className="navbar glass-card">
      <h1><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>ULAlert</Link></h1>
      <div className="nav-links">
        <Link to="/">Inicio</Link>
        {user ? (
          <>
            <Link to="/perfil" style={{ marginLeft: '1rem' }}>Mi Perfil</Link>
            {user.role === 'admin' && (
              <Link to="/admin" style={{ marginLeft: '1rem' }}>Admin</Link>
            )}
          </>
        ) : (
          <Link to="/login" style={{ marginLeft: '1rem' }}>Ingresar</Link>
        )}
      </div>
    </nav>
  );
}
