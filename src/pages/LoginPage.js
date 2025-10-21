import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Reintroducimos useNavigate
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';
import loginDoctorImage from '../Images/Fotografia.png';
import logoImage from '../Images/Logo.png';

const doctorImage = loginDoctorImage;
const logoIcon = logoImage; 

// Usuarios simulados con sus roles
const MOCK_USERS = [
    { user: 'admin', pass: '1234', role: 'Administrador', name: 'Dr. Admin' },
    { user: 'vet', pass: '1234', role: 'Veterinario', name: 'Dra. María' },
    { user: 'recep', pass: '1234', role: 'Recepcionista', name: 'Laura' },
];

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ usuario: '', contrasena: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate(); // <-- Instanciamos useNavigate

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        
        const inputUsuario = credentials.usuario.toLowerCase();
        
        const userFound = MOCK_USERS.find(
            u => u.user === inputUsuario && u.pass === credentials.contrasena
        );

        if (userFound) {
            console.log(`[LOGIN] Credenciales verificadas. Llamando a login() con rol: ${userFound.role}`);
            login({ name: userFound.name }, userFound.role);
            
            // CORRECCIÓN CLAVE: Navegamos directamente al Dashboard
            navigate('/admin/dashboard', { replace: true });

        } else {
            console.error('[LOGIN] Fallo de credenciales: Usuario o contraseña incorrecta.');
            setError('Credenciales incorrectas. Pruebe: admin/1234, vet/1234 o recep/1234');
        }
    };

    return (
        <div className="login-page">
            <div className="login-left-panel">
                <div className="logo-vethope-overlay">
                    <img src={logoIcon} alt="VetHope Logo" />
                </div>
                <img src={doctorImage} alt="Veterinaria con Mascota" className="doctor-image" style={{ width: '85%' }}/>
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
                            <button type="submit" className="login-btn">Iniciar Sesion</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
