import React, { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, AlertTriangle, ThumbsUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [myReports, setMyReports] = useState([]);
  const [myLikes, setMyLikes] = useState([]);
  const [error, setError] = useState(null);
  
  const [viewAllReports, setViewAllReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        
        if (!res.ok) throw new Error('Error al cargar perfil');
        
        const data = await res.json();
        // Ordenar por fecha descendente
        const sortedReports = (data.myReports || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMyReports(sortedReports);
        setMyLikes(data.myLikes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleLike = async (reportId) => {
    try {
      const res = await fetch(`${API_URL}/api/reports/${reportId}/like`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (res.status === 400) {
        alert("Ya has apoyado este reporte anteriormente.");
        return;
      }
      if (!res.ok) throw new Error("Error al dar like");

      // Recargar datos
      const profileRes = await fetch(`${API_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await profileRes.json();
      const sortedReports = (data.myReports || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMyReports(sortedReports);
      setMyLikes(data.myLikes || []);
      
      if (selectedReport) {
        const updatedReport = sortedReports.find(r => r.id === selectedReport.id);
        if (updatedReport) setSelectedReport(updatedReport);
      }
    } catch (err) {
      console.error(err);
      alert("Hubo un error al procesar tu apoyo.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem' }}>Cargando tu perfil...</div>;
  }

  const renderReportCard = (report) => (
    <div key={report.id} className="report-card glass-card" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
      <div className="report-header" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 className="report-title">{report.title}</h3>
          <div className="report-meta">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={14} /> 
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertTriangle size={14} />
              Criticidad: <strong style={{textTransform:'capitalize'}}>{report.criticidad?.replace('_',' ')}</strong>
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <span className={`badge ${report.estado === 'en_progreso' ? 'badge-media' : report.estado === 'pendiente' ? 'badge-media' : 'badge-baja'}`}>
            {report.estado === 'en_progreso' ? 'En Progreso' : report.estado === 'pendiente' ? 'Pendiente' : 'Aprobado'}
          </span>
        </div>
      </div>
      
      <div className="report-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            A {report.utility || 0} personas
          </span>
          <button className="btn-like" onClick={(e) => { e.stopPropagation(); handleLike(report.id); }}>
            <ThumbsUp size={16} /> Me sirvió
          </button>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.9rem' }} onClick={() => setSelectedReport(report)}>
          Ver Detalles
        </button>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!selectedReport) return null;
    return createPortal(
      <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, overflowY: 'auto' }}>
        <div className="modal-content glass-card animate-fade-in" style={{ width: '90%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{selectedReport.title}</h3>
            <button 
              onClick={() => setSelectedReport(null)}
              style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              &times;
            </button>
          </div>
          
          <div className="report-meta" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={14} /> 
              {new Date(selectedReport.createdAt).toLocaleDateString()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertTriangle size={14} />
              Criticidad: <strong style={{textTransform:'capitalize'}}>{selectedReport.criticidad?.replace('_',' ')}</strong>
            </span>
            <span className={`badge ${selectedReport.estado === 'en_progreso' ? 'badge-media' : selectedReport.estado === 'pendiente' ? 'badge-media' : 'badge-baja'}`}>
              {selectedReport.estado === 'en_progreso' ? 'En Progreso' : selectedReport.estado === 'pendiente' ? 'Pendiente' : 'Aprobado'}
            </span>
          </div>

          <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>{selectedReport.description}</p>
          
          {selectedReport.imageUrl && (
            <div className="report-image-container" style={{ height: 'auto', maxHeight: '500px' }}>
              <img src={selectedReport.imageUrl} alt="Evidencia del reporte" style={{ objectFit: 'contain' }} />
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Lugar: {selectedReport.subSector}
            </span>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  if (viewAllReports) {
    return (
      <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
        <div className="page-header">
          <button className="btn-back" onClick={() => setViewAllReports(false)} title="Volver al Perfil">
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ fontSize: '1.75rem' }}>Todos Mis Reportes</h2>
        </div>
        
        <div className="reports-grid">
          {myReports.map(renderReportCard)}
        </div>
        
        {renderModal()}
      </div>
    );
  }

  const latestReports = myReports.slice(0, 3);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        <header className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user?.picture && <img src={user.picture} alt="Perfil" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{user?.name}</h2>
            <p className="text-secondary" style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>{user?.email}</p>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
        </header>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Reportes Apoyados</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', lineHeight: '1' }}>{myLikes.length}</span>
            <span className="text-secondary">incidentes de la comunidad</span>
          </div>
        </div>

      </div>

      {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Mis Últimos Reportes</h3>
            {myReports.length > 3 && (
              <button className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1.5rem' }} onClick={() => setViewAllReports(true)}>
                Ver Todos Mis Reportes ({myReports.length})
              </button>
            )}
          </div>
          
          {myReports.length === 0 ? (
            <p className="text-secondary mt-2">Aún no has creado reportes.</p>
          ) : (
            <div className="reports-grid">
              {latestReports.map(renderReportCard)}
            </div>
          )}
        </div>
      </div>

      {renderModal()}
    </div>
  );
}

