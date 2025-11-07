import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Al cargar, verifica el rol en el almacenamiento local
        const storedRole = localStorage.getItem('userRole');
        const storedUserName = localStorage.getItem('userName');

        if (storedRole) {
            setRole(storedRole);
            setUser({ name: storedUserName || 'Usuario' });
            console.log(`[AUTH] Rol cargado desde Storage: ${storedRole}`);
        } else {
            console.log('[AUTH] No se encontró rol en Storage. Usuario no autenticado.');
        }
        setIsLoading(false); 
    }, []);

     const login = (userData) => {
        const userRole = userData?.rol; // 👈 tomamos el rol directamente del usuario

        if (!userRole) {
            console.warn('[AUTH] Advertencia: usuario sin rol definido en el body:', userData);
        }

        localStorage.setItem('userRole', userRole || 'SinRol');
        localStorage.setItem('userName', userData?.name || 'Usuario');

        setUser(userData);
        setRole(userRole || 'SinRol');

        console.log(`[AUTH] ¡LOGIN EXITOSO! Rol establecido a: ${userRole}`);
        console.log('[AUTH] Redirección pendiente por App.js...');
    };

    const logout = () => {
        // 🔹 Nota: aquí debes borrar las mismas claves que guardaste arriba
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');

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
