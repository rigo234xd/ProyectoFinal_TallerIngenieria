import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const Admin = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [criticidad, setCriticidad] = useState('media');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingReports();
  }, []);

  const fetchPendingReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/reports/admin`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setReports(data);
    } catch (error) {
      console.error("Error cargando reportes admin:", error);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (estado) => {
    if (!selectedReport) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/reports/${selectedReport.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ estado, criticidad: criticidad || selectedReport.criticidad })
      });

      if (res.ok) {
        setSelectedReport(null);
        fetchPendingReports();
      } else {
        alert("Error al actualizar estado");
      }
    } catch (error) {
      console.error(error);
    }
    setProcessing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pendientes = reports.filter(r => r.estado === 'pendiente');
  const enCurso = reports.filter(r => r.estado === 'aprobado' || r.estado === 'en_progreso');

  return (
    <div className="admin-container animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <header className="admin-header glass-card">
        <div>
          <h2>Panel de Administración</h2>
          <p>Bienvenido, {user?.email}</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
      </header>

      <div className="admin-content">
        <div className="glass-card stat-card">
          <h3>Nuevos Pendientes</h3>
          <p className="stat-number">{pendientes.length}</p>
        </div>
        <div className="glass-card stat-card">
          <h3>En Curso</h3>
          <p className="stat-number">{enCurso.length}</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h3>Gestión Activa</h3>
        {loading ? (
          <p>Cargando...</p>
        ) : reports.length === 0 ? (
          <p className="text-secondary mt-2">No hay reportes activos.</p>
        ) : (
          <div className="reports-grid" style={{ marginTop: '1rem' }}>
            {reports.map(report => (
              <div key={report.id} className="report-card glass-card" style={{ cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => { setSelectedReport(report); setCriticidad(report.criticidad === 'por_asignar' ? 'media' : report.criticidad); }}>
                <div className="report-header">
                  <h3 className="report-title">{report.title}</h3>
                  <span className={`badge ${report.estado === 'pendiente' ? 'badge-media' : report.estado === 'en_progreso' ? 'badge-alta' : 'badge-baja'}`}>{report.estado}</span>
                </div>
                <p className="report-description" style={{ marginBottom: '0.5rem' }}>{report.description}</p>
                <small className="text-secondary">SubSector: {report.subSector}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedReport && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, overflowY: 'auto' }}>
          <div className="modal-content glass-card" style={{ width: '90%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Gestionar Reporte</h3>
            <p><strong>Título:</strong> {selectedReport.title}</p>
            <p style={{ margin: '1rem 0' }}><strong>Descripción:</strong> {selectedReport.description}</p>
            
            {selectedReport.imageUrl && (
              <div style={{ margin: '1rem 0', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={selectedReport.imageUrl} alt="Evidencia" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
              </div>
            )}
            
            <div className="form-group">
              <label>Criticidad Definitiva</label>
              <select value={criticidad} onChange={e => setCriticidad(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              {selectedReport.estado === 'pendiente' && (
                <>
                  <button className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--success)', color: 'white', border: 'none' }} onClick={() => handleUpdateStatus('aprobado')} disabled={processing}>Aprobar</button>
                  <button className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--danger)', color: 'white', border: 'none' }} onClick={() => handleUpdateStatus('rechazado')} disabled={processing}>Rechazar</button>
                </>
              )}
              {selectedReport.estado === 'aprobado' && (
                <button className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--accent)', color: 'white', border: 'none' }} onClick={() => handleUpdateStatus('en_progreso')} disabled={processing}>Marcar En Progreso</button>
              )}
              {selectedReport.estado === 'en_progreso' && (
                <button className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--success)', color: 'white', border: 'none' }} onClick={() => handleUpdateStatus('resuelto')} disabled={processing}>Marcar Resuelto</button>
              )}
              <button className="btn-back" style={{ flex: '1 1 100%' }} onClick={() => setSelectedReport(null)} disabled={processing}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
