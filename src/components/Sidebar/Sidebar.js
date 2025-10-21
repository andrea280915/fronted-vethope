import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import logoImage from '../../Images/Logo.png';

// --- DEFINICIÓN CENTRALIZADA DE ELEMENTOS DEL MENÚ Y SUS ROLES PERMITIDOS ---
// Si deseas modificar o añadir un enlace, hazlo aquí, definiendo qué roles tienen acceso.
const menuRoles = [
    { 
        name: 'Dashboard', 
        path: '/admin/dashboard', 
        icon: '🏠', 
        roles: ['Administrador', 'Veterinario', 'Recepcionista'] // Todos
    },
    { 
        name: 'Registrar Usuario', 
        path: '/admin/usuarios/registro', 
        icon: '🧑', 
        roles: ['Administrador'] // SOLO ADMINISTRADOR
    },
    { 
        name: 'Registrar Cliente', 
        path: '/admin/clientes/registro', 
        icon: '👤', 
        roles: ['Administrador', 'Recepcionista'] 
    },
    { 
        name: 'Registrar Mascota', 
        path: '/admin/mascotas/registro', 
        icon: '🐾', 
        roles: ['Administrador', 'Recepcionista'] 
    },
    { 
        name: 'Agendar Cita', 
        path: '/admin/citas/agendar', 
        icon: '📅', 
        roles: ['Administrador', 'Veterinario', 'Recepcionista'] 
    },
    { 
        name: 'Stock', 
        path: '/admin/stock', 
        icon: '📦', 
        roles: ['Administrador', 'Recepcionista'] 
    },
    { 
        name: 'Vender Productos', 
        path: '/admin/productos/venta', 
        icon: '🛒', 
        roles: ['Administrador', 'Recepcionista'] 
    },
];

// El componente ahora acepta la propiedad 'userRole' (pasada desde AdminLayout)
const Sidebar = ({ userRole }) => {
    const location = useLocation();

    // 1. FILTRADO: Determina qué elementos del menú mostrar
    const filteredMenuItems = menuRoles.filter(item => 
        // El elemento se incluye si el rol actual del usuario está dentro de la lista de roles permitidos
        item.roles.includes(userRole)
    );

    // Función auxiliar para determinar si un enlace está activo.
    const isPathActive = (path) => {
        // Coincidencia exacta para el Dashboard
        if (path === '/admin/dashboard') {
            return location.pathname === path;
        }
        // Coincidencia parcial para otras rutas (útil para sub-rutas)
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo-wrapper">
                    <div className="logo-image-container">
                        <img src={logoImage} alt="Logo VetHope" className="logo-icon" /> 
                    </div>
                </div>
                
                <p className="sidebar-logo-text">VetHope</p>
                
                {/* Muestra el Rol del usuario logueado */}
                <p className="user-role-text">{userRole || 'Cargando...'}</p> 
            </div>
            
            <nav className="sidebar-nav">
                <ul>
                    {/* Renderiza solo los elementos que pasaron el filtro de rol */}
                    {filteredMenuItems.map((item) => (
                        <li 
                            key={item.name} 
                            className={`nav-item ${isPathActive(item.path) ? 'active' : ''}`}
                        >
                            <Link to={item.path}>
                                <span>{item.icon}</span> {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
