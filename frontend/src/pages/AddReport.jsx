import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function AddReport() {
  const { sectorId, subSectorId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      if (imageFile) {
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
          alert('Configuración de Cloudinary faltante en .env');
          setLoading(false);
          return;
        }
        
        const formDataCloudinary = new FormData();
        formDataCloudinary.append('file', imageFile);
        formDataCloudinary.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formDataCloudinary
        });

        if (!uploadRes.ok) {
          throw new Error('Error al subir la imagen a Cloudinary');
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.secure_url;
      }

      const fullSubSector = `${sectorId}/${subSectorId}`;
      const userLocal = JSON.parse(localStorage.getItem('ulalert_user'));
      
      const res = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userLocal?.token}`
        },
        body: JSON.stringify({
          subSector: fullSubSector,
          ...formData,
          imageUrl
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
            <label htmlFor="image">Adjuntar Fotografía (Opcional)</label>
            <input 
              type="file" 
              id="image" 
              accept=".png, .jpg, .jpeg, .webp"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            <small className="text-secondary" style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.85rem' }}>
              Formatos admitidos: PNG, JPG, JPEG, WEBP.
            </small>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        </form>
      </div>
    </div>
  );
}