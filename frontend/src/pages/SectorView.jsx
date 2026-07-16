import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, AlertTriangle, Calendar } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const SECTORS_DATA = {
  'biblioteca': { name: 'Biblioteca', subSectors: [{id:'salas', name:'Salas'}, {id:'logias', name:'Logias'}, {id:'baños', name:'Baños'}] },
  'gym': { name: 'Gimnasio', subSectors: [{id:'salas', name:'Salas'}, {id:'baños', name:'Baños'}, {id:'cancha', name:'Cancha'}] },
  'laboratorios': { name: 'Laboratorios', subSectors: [{id:'salas', name:'Salas'}] },
  'aula-principal': { name: 'Aula Principal', subSectors: [{id:'baños', name:'Baños'}, {id:'salas', name:'Salas'}, {id:'casino', name:'Casino'}] },
};

// Tu nueva URL de API Gateway
const API_URL = import.meta.env.VITE_API_URL;

export default function SectorView() {
  const { sectorId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
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
      // Ahora consume el endpoint público
      const res = await fetch(`${API_URL}/api/reports/public?subSector=${fullSubSectorId}&sort=${sortBy}`);
      const data = await res.json();
      
      // CORRECCIÓN 2: El salvavidas. Asegurarnos de que si hay un error, reports sea un arreglo vacío y no colapse
      if (Array.isArray(data)) {
        setReports(data);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error("Error al obtener reportes:", err);
      setReports([]);
    }
    setLoading(false);
  };

  const handleLike = async (reportId) => {
    if (!user) {
      alert("Debes iniciar sesión con tu correo institucional para apoyar un reporte.");
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/reports/${reportId}/like`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (res.status === 400) {
        alert("Ya has apoyado este reporte anteriormente.");
        return;
      }
      if (!res.ok) {
        throw new Error("Error en el servidor");
      }

      fetchReports(); // Recargar para actualizar likes
    } catch (error) {
      console.error("Error al dar like:", error);
      alert("Hubo un error al procesar tu apoyo.");
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
          {/* CORRECCIÓN 4: Agregamos el '?' al map por máxima seguridad */}
          {reports?.map(report => (
            <div key={report.id} className="report-card glass-card">
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
                  <span className={`badge ${report.estado === 'en_progreso' ? 'badge-media' : 'badge-baja'}`}>
                    {report.estado === 'en_progreso' ? '🚧 En Progreso' : '✅ Aprobado'}
                  </span>
                </div>
              </div>
              <p className="report-description" style={{ marginTop: '0.5rem' }}>{report.description}</p>
              
              {report.imageUrl && (
                <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={report.imageUrl} alt="Evidencia del reporte" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                </div>
              )}
              
              <div className="report-footer" style={{ marginTop: '1rem' }}>
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