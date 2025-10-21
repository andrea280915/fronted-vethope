import React from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import './DashboardPage.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import DashboardBG from '../Images/inicio.png';
import VethopeLogoGrande from '../Images/logo_inicio.png';

// --- Definición de las Acciones del Dashboard ---
const dashboardActions = [
  {
    name: 'Agendar Cita',
    path: '/admin/citas/agendar',
    className: 'btn-cita',
    icon: '📅',
    roles: ['Administrador', 'Veterinario', 'Recepcionista'],
  },
  {
    name: 'Vender Productos',
    path: '/admin/productos/venta',
    className: 'btn-productos',
    icon: '🛒',
    roles: ['Administrador', 'Recepcionista'],
  },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  // Normalizamos el texto del rol (por si viene en minúsculas o con espacios)
  const normalizedRole = role ? role.trim().toLowerCase() : '';

  // Filtrado basado en rol normalizado
  const availableActions = dashboardActions.filter((action) => {
    return action.roles.some(
      (r) => r.toLowerCase() === normalizedRole
    );
  });

  const handleNavigate = (path) => {
    navigate(path);
  };

  if (!role) {
    return (
      <AdminLayout>
        <div className="loading-dashboard">Cargando permisos...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="page-header">
        <h1>
          Hola, <span className="role">{role}</span>. Bienvenido/a a{' '}
          <span className="brand">VetHope</span>
        </h1>
      </div>

      <div
        className="welcome-section"
        style={{ backgroundImage: `url(${DashboardBG})` }}
      >
        <div className="overlay-content">
          <h2>Bienvenido a VetHope</h2>
          <a href="#about" className="about-link">
            Acerca de Nosotros
          </a>
          <p>
            Tenemos como misión ofrecer servicios médicos veterinarios de
            calidad, con amplia experiencia, trato personalizado y seguimiento
            de las necesidades de cada mascota.
          </p>

          <div className="button-group">
            {availableActions.map((action) => (
              <button
                key={action.name}
                className={action.className}
                onClick={() => handleNavigate(action.path)}
              >
                {action.icon} {action.name}
              </button>
            ))}
          </div>
        </div>

        <img
          src={VethopeLogoGrande}
          alt="VetHope Logo Grande"
          className="large-logo-overlay"
        />
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
