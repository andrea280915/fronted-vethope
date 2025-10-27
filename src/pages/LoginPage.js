import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginService } from '../services/authService';
import './LoginPage.css';
import loginDoctorImage from '../Images/Fotografia.png';
import logoImage from '../Images/Logo.png';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ usuario: '', contrasena: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginService(credentials.usuario, credentials.contrasena);
      console.log('[LOGIN SUCCESS]', data);

      // Guardar token
      if (data.token) localStorage.setItem('token', data.token);

      // Actualizar contexto global
      login({ name: data.user?.name || 'Usuario' }, data.user?.role || 'Invitado');

      // Redirigir según rol
      const role = data.user?.role;
      if (role === 'Administrador') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'Veterinario') {
        navigate('/vet/dashboard', { replace: true });
      } else if (role === 'Recepcionista') {
        navigate('/recepcion/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('[LOGIN ERROR]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left-panel">
        <div className="logo-vethope-overlay">
          <img src={logoImage} alt="VetHope Logo" />
        </div>
        <img
          src={loginDoctorImage}
          alt="Veterinaria con Mascota"
          className="doctor-image"
          style={{ width: '85%' }}
        />
      </div>

      <div className="login-right-panel">
        <div className="login-form-container">
          <h2>Bienvenido</h2>

          {error && <div className="login-error">{error}</div>}

          <div className="login-form-wrapper">
            <form onSubmit={handleLogin}>
              <label htmlFor="usuario">Usuario</label>
              <input
                type="text"
                id="usuario"
                name="usuario"
                placeholder="Ingrese usuario"
                value={credentials.usuario}
                onChange={handleChange}
                required
              />
              <label htmlFor="contrasena">Contraseña</label>
              <input
                type="password"
                id="contrasena"
                name="contrasena"
                placeholder="Contraseña"
                value={credentials.contrasena}
                onChange={handleChange}
                required
              />
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
