import React from 'react';
import { useAuth } from '../../context/AuthContext'; // <-- Importa useAuth
import { Navigate } from 'react-router-dom'; // Para redireccionar si hay logout
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
// Los estilos están en index.css

const AdminLayout = ({ children }) => {
    // 1. Obtener el rol del usuario desde el contexto
    const { role, isLoading, logout } = useAuth();
    
    // Opcional: Si está cargando, muestra un spinner o pantalla de carga
    if (isLoading) {
        return <div style={{padding: '50px', textAlign: 'center'}}>Cargando interfaz...</div>;
    }

    // 2. Si el rol es nulo, significa que la sesión ha expirado o hubo un error de acceso
    //    Aunque ProtectedRoute ya lo maneja, es una buena práctica tener un fallback aquí
    if (!role) {
        // Redirige al login si no hay rol
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            {/* El Header puede usar 'role' y 'user.name' si deseas */}
            <Header userRole={role} onLogout={logout} /> 
            
            <div className="admin-wrapper">
                {/* 3. Pasar el rol al Sidebar para que sepa qué opciones mostrar */}
                <Sidebar userRole={role} /> 
                
                <main className="admin-content-area">
                    {children}
                </main>
            </div>
        </>
    );
};

export default AdminLayout;
