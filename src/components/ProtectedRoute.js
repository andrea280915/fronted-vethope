import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Ruta protegida por autenticación y rol.
 * - Redirige al login si el usuario no tiene sesión.
 * - Muestra mensaje de restricción si su rol no tiene acceso.
 */
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { role, isLoading, logout } = useAuth();
  const location = useLocation();

  // ⏳ Mostrar pantalla de carga mientras se valida sesión
  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Verificando autenticación...</h3>
      </div>
    );
  }

  // 🚫 Si no hay rol (usuario no autenticado)
  if (!role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 🔒 Si el rol no está permitido para esta ruta
  if (allowedRoles && !allowedRoles.includes(role)) {
    console.warn(
      `Acceso denegado. Rol actual: ${role}. Requiere uno de: ${allowedRoles.join(', ')}`
    );

    return (
      <div style={{ padding: '50px', textAlign: 'center', color: '#E74C3C' }}>
        <h1>🚫 Acceso Restringido</h1>
        <p>Tu rol (<strong>{role}</strong>) no tiene permiso para acceder a esta sección.</p>
        <button
          onClick={logout}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#3498DB',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  // ✅ Acceso permitido → Renderiza el componente
  return element;
};

export default ProtectedRoute;
