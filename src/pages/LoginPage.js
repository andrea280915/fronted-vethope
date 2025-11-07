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

  // 🟦 Mapeo de roles del backend a frontend
  const mapRole = (backendRole) => {
    const roleMap = {
      'ADMIN': 'Administrador',
      'VETERINARIO': 'Veterinario',
      'RECEPCIONISTA': 'Recepcionista',
    };
    return roleMap[backendRole] || 'Invitado';
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!credentials.usuario.trim() || !credentials.contrasena.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await loginService(credentials.usuario, credentials.contrasena);
      console.log('[LOGIN SUCCESS]', data);

      // ✅ Guardar token
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // ✅ Tomar usuario del backend
      const usuario = data.usuario;
      if (!usuario) throw new Error('No se encontró información del usuario en la respuesta');

      // ✅ Mapeamos el rol del backend al frontend
      const frontendRole = mapRole(usuario.rol);

      // ✅ Guardar datos del usuario en localStorage
      localStorage.setItem('userRole', frontendRole);
      localStorage.setItem('userName', usuario.nombre || 'Usuario');

      // ✅ Pasamos el usuario completo al AuthContext
      login({
        nombre: usuario.nombre,
        rol: frontendRole, // este será leído por el AuthContext
      });

      // ✅ Redirección según rol
      redirectByRole(frontendRole);

    } catch (err) {
      console.error('[LOGIN ERROR]', err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    const routes = {
      'Administrador': '/admin/dashboard',
      'Veterinario': '/vet/dashboard',
      'Recepcionista': '/recepcion/dashboard',
    };

    const route = routes[role] || '/';
    navigate(route, { replace: true });
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
              <div className="form-group">
                <label htmlFor="usuario">Usuario</label>
                <input
                  type="text"
                  id="usuario"
                  name="usuario"
                  placeholder="Ingrese usuario"
                  value={credentials.usuario}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contrasena">Contraseña</label>
                <input
                  type="password"
                  id="contrasena"
                  name="contrasena"
                  placeholder="Contraseña"
                  value={credentials.contrasena}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

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
