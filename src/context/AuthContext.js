import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Al cargar, verifica el rol en el almacenamiento local
        const storedRole = localStorage.getItem('user_role');
        if (storedRole) {
            setRole(storedRole);
            setUser({ name: localStorage.getItem('user_name') || 'Usuario' });
            console.log(`[AUTH] Rol cargado desde Storage: ${storedRole}`);
        } else {
            console.log('[AUTH] No se encontró rol en Storage. Usuario no autenticado.');
        }
        // Una vez revisado el storage, la carga termina
        setIsLoading(false); 
    }, []);

    const login = (userData, userRole) => {
        localStorage.setItem('user_role', userRole);
        localStorage.setItem('user_name', userData.name);
        setUser(userData);
        setRole(userRole);
        
        // LOGGING CLAVE
        console.log(`[AUTH] ¡LOGIN EXITOSO! Rol establecido a: ${userRole}`);
        console.log('[AUTH] Redirección pendiente por App.js...');
    };

    const logout = () => {
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        setUser(null);
        setRole(null);
        console.log('[AUTH] Sesión cerrada. Limpiando Storage.');
    };

    return (
        <AuthContext.Provider value={{ user, role, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
