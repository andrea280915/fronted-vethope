import React from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';

const ServicesPage = () => {
    return (
        <AdminLayout>
            <div style={{ padding: '20px' }}>
                <h1 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Gestión de Servicios (Veterinario / Peluquería)</h1>
                <p style={{ color: '#555', marginTop: '15px' }}>
                    Esta página está lista para ser implementada. Aquí se gestionarán las citas, diagnósticos, historial médico o servicios de peluquería.
                </p>
                <p style={{ fontWeight: 'bold' }}>Roles con acceso:</p>
                <ul>
                    <li>Administrador</li>
                    <li>Veterinario</li>
                </ul>
            </div>
        </AdminLayout>
    );
};

export default ServicesPage;
