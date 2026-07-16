import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [myReports, setMyReports] = useState([]);
  const [myLikes, setMyLikes] = useState([]); // Array de IDs
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        
        if (!res.ok) {
          throw new Error('Error al cargar perfil');
        }
        
        const data = await res.json();
        setMyReports(data.myReports || []);
        setMyLikes(data.myLikes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem' }}>Cargando tu perfil...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <header className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        {user?.picture && <img src={user.picture} alt="Perfil" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />}
        <div style={{ flex: 1 }}>
          <h2>{user?.name}</h2>
          <p className="text-secondary">{user?.email}</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
      </header>

      {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        <div className="glass-card">
          <h3>Mis Reportes Creados ({myReports.length})</h3>
          {myReports.length === 0 ? (
            <p className="text-secondary mt-2">Aún no has creado reportes.</p>
          ) : (
            <ul style={{ marginTop: '1rem', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myReports.map(report => (
                <li key={report.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong>{report.title}</strong>
                    <span className={`badge ${report.estado === 'pendiente' ? 'badge-media' : report.estado === 'aprobado' ? 'badge-alta' : 'badge-baja'}`}>
                      {report.estado}
                    </span>
                  </div>
                  <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{report.subSector}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card">
          <h3>Reportes Apoyados ({myLikes.length})</h3>
          {myLikes.length === 0 ? (
            <p className="text-secondary mt-2">No has apoyado ningún reporte aún.</p>
          ) : (
            <p className="text-secondary mt-2">Has apoyado un total de {myLikes.length} reportes de la comunidad.</p>
          )}
        </div>

      </div>
    </div>
  );
}
