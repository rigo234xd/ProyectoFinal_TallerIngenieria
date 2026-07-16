import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [error, setError] = useState('');
  const { loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    const result = await loginWithGoogle(credentialResponse);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Error al iniciar sesión');
    }
  };

  const handleGoogleError = () => {
    setError('Fallo la conexión con Google. Intenta de nuevo.');
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="glass-card login-card">
        <h2>Iniciar Sesión</h2>
        <p className="login-subtitle">Ingresa con tu cuenta institucional para reportar o administrar</p>
        
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_blue"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        <div className="login-hint">
          <small>Solo se admiten correos <b>@alumnos.ulagos.cl</b></small>
        </div>
      </div>
    </div>
  );
};

export default Login;
