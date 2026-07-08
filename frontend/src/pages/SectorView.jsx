import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, AlertTriangle, Calendar } from 'lucide-react';

const SECTORS_DATA = {
  'biblioteca': { name: 'Biblioteca', subSectors: [{id:'salas', name:'Salas'}, {id:'logias', name:'Logias'}, {id:'baños', name:'Baños'}] },
  'gym': { name: 'Gimnasio', subSectors: [{id:'salas', name:'Salas'}, {id:'baños', name:'Baños'}, {id:'cancha', name:'Cancha'}] },
  'laboratorios': { name: 'Laboratorios', subSectors: [{id:'salas', name:'Salas'}] },
  'aula-principal': { name: 'Aula Principal', subSectors: [{id:'baños', name:'Baños'}, {id:'salas', name:'Salas'}, {id:'casino', name:'Casino'}] },
};

// URL Backend - Para MVP usar localhost:3000 o la IP del EC2
const API_URL = 'http://localhost:3000/api';

export default function SectorView() {
  const { sectorId } = useParams();
  const navigate = useNavigate();
  const sector = SECTORS_DATA[sectorId];
  
  const [activeSubSector, setActiveSubSector] = useState(sector?.subSectors[0]?.id || '');
  const [reports, setReports] = useState([]);
  const [sortBy, setSortBy] = useState('utility'); // 'utility', 'importance', 'date'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sector) return;
    fetchReports();
  }, [sectorId, activeSubSector, sortBy]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const fullSubSectorId = `${sectorId}/${activeSubSector}`;
      const res = await fetch(`${API_URL}/reports?subSector=${fullSubSectorId}&sort=${sortBy}`);
      const data = await res.json();
      setReports(data || []);
    } catch (err) {
      console.error(err);
      // Fallback para dev local si el backend no está arriba
      setReports([]);
    }
    setLoading(false);
  };

  const handleLike = async (reportId) => {
    try {
      await fetch(`${API_URL}/reports/${reportId}/like`, { method: 'POST' });
      fetchReports(); // Recargar para actualizar likes
    } catch (error) {
      console.error(error);
    }
  };

  if (!sector) return <div>Sector no encontrado</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)} title="Volver">
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ fontSize: '2rem' }}>{sector.name}</h2>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Selecciona un Sub-Sector:</h3>
        <div className="subsector-list">
          {sector.subSectors.map(sub => (
            <button
              key={sub.id}
              className={`subsector-pill ${activeSubSector === sub.id ? 'active' : ''}`}
              onClick={() => setActiveSubSector(sub.id)}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      <div className="filters">
        <span style={{ color: 'var(--text-secondary)' }}>Ordenar por:</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="utility">Utilidad (Más Likes)</option>
          <option value="importance">Importancia (Mayor primero)</option>
          <option value="date">Fecha (Más recientes)</option>
        </select>
        
        <Link 
          to={`/reportar/${sectorId}/${activeSubSector}`} 
          className="btn-primary" 
          style={{ width: 'auto', marginLeft: 'auto', textDecoration: 'none' }}
        >
          + Nuevo Reporte
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando reportes...</div>
      ) : reports.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          No hay reportes para este sub-sector. ¡Sé el primero en reportar!
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map(report => (
            <div key={report.id} className="report-card glass-card">
              <div className="report-header">
                <div>
                  <h3 className="report-title">{report.title}</h3>
                  <div className="report-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} /> 
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertTriangle size={14} />
                      Nivel: {report.importance}
                    </span>
                  </div>
                </div>
                <span className={`badge ${
                  report.importance >= 4 ? 'badge-alta' : report.importance === 3 ? 'badge-media' : 'badge-baja'
                }`}>
                  {report.importance >= 4 ? 'Alta' : report.importance === 3 ? 'Media' : 'Baja'}
                </span>
              </div>
              <p className="report-description">{report.description}</p>
              <div className="report-footer">
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  A {report.utility || 0} personas les sirvió esto
                </span>
                <button className="btn-like" onClick={() => handleLike(report.id)}>
                  <ThumbsUp size={16} /> Me sirvió
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
