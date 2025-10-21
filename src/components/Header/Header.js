import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Importamos el hook de autenticación
import './Header.css';
import avatarPlaceholder from '../../Images/Admin.png'; // Usamos tu importación de imagen

const Header = () => {
    // 1. Obtenemos el usuario, el rol y la función de logout del contexto
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();
    
    const avatarImage = avatarPlaceholder;
    
    // Manejo de carga: Si el usuario o el rol no se han cargado, mostramos un estado de carga simple
    if (!user || !role) {
        return (
            <header className="admin-header" style={{ justifyContent: 'center' }}>
                Cargando información de usuario...
            </header>
        );
    }

    // Obtenemos el nombre del objeto de usuario
    const displayUserName = user.name || 'Usuario'; 

    // 2. Función de Logout que usa el contexto
    const handleLogout = () => {
        logout(); // Llama a la función del contexto para limpiar la sesión
        navigate('/login', { replace: true }); // Redirige al login
    };

    return (
        <header className="admin-header">
            <span className="header-app-title">VetHope</span> 
            
            <div className="user-profile">
                {/* Imagen del Avatar */}
                <img src={avatarImage} alt="User Avatar" className="avatar" />
                
                {/* Información Dinámica: Nombre y Rol */}
                <div className="user-info-dynamic">
                    {/* Muestra el nombre del usuario (e.g., Dr. Admin, Dra. María) */}
                    <span className="name-text">{displayUserName}</span>
                    {/* Muestra el rol (e.g., Administrador, Veterinario) */}
                    <span className="role-text">{role}</span> 
                </div>
                
                {/* Botón de Logout */}
                <button className="logout-button" onClick={handleLogout}>
                    Salir
                </button>
            </div>
        </header>
    );
};

export default Header;
