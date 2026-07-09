import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Dumbbell, Beaker, Users } from 'lucide-react';

const SECTORS = [
  { id: 'biblioteca', name: 'Biblioteca', icon: <BookOpen size={32} />, desc: 'Salas de estudio, logias y más' },
  { id: 'gym', name: 'Gimnasio', icon: <Dumbbell size={32} />, desc: 'Salas, multicancha y baños' },
  { id: 'laboratorios', name: 'Laboratorios', icon: <Beaker size={32} />, desc: 'Equipos y salas de computación' },
  { id: 'aula-principal', name: 'Aula Principal', icon: <Users size={32} />, desc: 'Salas principales, baños y casino' }
];

export default function Home() {
  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Sectores de la Universidad</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Selecciona un sector en el mapa para ver o realizar reportes.
        </p>
      </div>

      <div className="map-grid">
        {SECTORS.map(sector => (
          <Link to={`/sector/${sector.id}`} key={sector.id} className="sector-card glass-card">
            <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
              {sector.icon}
            </div>
            <h2>{sector.name}</h2>
            <p>{sector.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
