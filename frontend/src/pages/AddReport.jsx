import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const API_URL = 'https://3kq508aiof.execute-api.us-east-1.amazonaws.com';

export default function AddReport() {
  const { sectorId, subSectorId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    importance: '3'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullSubSector = `${sectorId}/${subSectorId}`;
      
      // CORRECCIÓN: Se agregó "/api" antes de "/reports"
      const res = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subSector: fullSubSector,
          ...formData
        })
      });

      if (res.ok) {
        navigate(`/sector/${sectorId}`);
      } else {
        alert('Error al enviar el reporte. Revisa la consola para más detalles.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)} title="Volver">
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ fontSize: '1.75rem' }}>Nuevo Reporte</h2>
      </div>

      <div className="glass-card">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Reportando en: <strong style={{ color: 'var(--text-primary)' }}>{sectorId} / {subSectorId}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título del Reporte</label>
            <input 
              type="text" 
              id="title" 
              required 
              placeholder="Ej: Foco fundido en sala 2"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea 
              id="description" 
              rows="4" 
              required 
              placeholder="Detalles de la situación..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="importance">Nivel de Importancia (1-5)</label>
            <select 
              id="importance" 
              value={formData.importance}
              onChange={(e) => setFormData({...formData, importance: e.target.value})}
            >
              <option value="1">1 - Muy Baja</option>
              <option value="2">2 - Baja</option>
              <option value="3">3 - Media</option>
              <option value="4">4 - Alta</option>
              <option value="5">5 - Crítica / Urgente</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        </form>
      </div>
    </div>
  );
}