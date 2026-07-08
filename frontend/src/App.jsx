import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import SectorView from './pages/SectorView';
import AddReport from './pages/AddReport';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar glass-card">
          <h1>ULAlert</h1>
          <div className="nav-links">
            <Link to="/">Inicio</Link>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sector/:sectorId" element={<SectorView />} />
          <Route path="/reportar/:sectorId/:subSectorId" element={<AddReport />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
