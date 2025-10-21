import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { useClients } from '../context/ClientsContext'; // 👈 Importamos el contexto global
import cliente from '../Images/doctor.png'; 
import './RegisterClientPage.css';

const Modal = ({ isOpen, title, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

const RegisterClientPage = () => {
    const { clients, addClient, updateClient, deleteClient } = useClients(); // 👈 Accedemos al contexto
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        id: null, nombre: '', apellido: '', dni: '', email: '', telefono: '', direccion: ''
    });

    const openCreateModal = () => {
        setIsEditing(false);
        setFormData({ id: null, nombre: '', apellido: '', dni: '', email: '', telefono: '', direccion: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (client) => {
        setIsEditing(true);
        setFormData(client);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);
    const closeConfirmModal = () => { setIsConfirmModalOpen(false); setClientToDelete(null); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            updateClient(formData);
        } else {
            const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
            addClient({ ...formData, id: newId });
        }
        closeModal();
    };

    const askForDelete = (id) => {
        setClientToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        deleteClient(clientToDelete);
        closeConfirmModal();
    };

    const filteredClients = clients.filter(client => {
        const fullSearch = `${client.nombre} ${client.apellido} ${client.dni} ${client.telefono}`.toLowerCase();
        return fullSearch.includes(searchTerm.toLowerCase());
    });

    const RegistrationForm = (
        <form className="client-registration-form" onSubmit={handleSubmit}>
            <div className="form-group-row two-columns">
                <div className="form-group">
                    <label>Nombre:</label>
                    <input name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Apellido:</label>
                    <input name="apellido" value={formData.apellido} onChange={handleChange} required />
                </div>
            </div>

            <div className="form-group-row two-columns">
                <div className="form-group">
                    <label>DNI:</label>
                    <input name="dni" value={formData.dni} onChange={handleChange} maxLength="8" required />
                </div>
                <div className="form-group">
                    <label>Teléfono:</label>
                    <input name="telefono" value={formData.telefono} onChange={handleChange} required />
                </div>
            </div>

            <div className="form-group">
                <label>Email:</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>Dirección:</label>
                <input name="direccion" value={formData.direccion} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn-submit-modal">
                {isEditing ? "Guardar Cambios" : "Registrar Cliente"}
            </button>
        </form>
    );

    return (
        <AdminLayout>
            <div className="register-client-container">
                <div className="page-header">
                    <h1>REGISTRO DE <span>CLIENTES</span></h1>
                    <p className="subtitle">Gestión de la información del dueño de la mascota.</p>
                </div>

                <div className="stock-controls">
                    <input
                        type="text"
                        placeholder="Buscar cliente por nombre, DNI o teléfono..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn-add-stock" onClick={openCreateModal}>
                        + Registrar Nuevo Cliente
                    </button>
                </div>

                <div className="stock-table-container">
                    <table className="vet-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre Completo</th>
                                <th>DNI</th>
                                <th>Teléfono</th>
                                <th>Dirección</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length > 0 ? (
                                filteredClients.map(client => (
                                    <tr key={client.id}>
                                        <td>{client.id}</td>
                                        <td>{client.nombre} {client.apellido}</td>
                                        <td>{client.dni}</td>
                                        <td>{client.telefono}</td>
                                        <td>{client.direccion}</td>
                                        <td className="actions-cell">
                                            <button className="btn-action edit" onClick={() => openEditModal(client)}>Editar</button>
                                            <button className="btn-action delete" onClick={() => askForDelete(client.id)}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center">No se encontraron clientes.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} title={isEditing ? "Editar Cliente" : "Registrar Nuevo Cliente"} onClose={closeModal}>
                {RegistrationForm}
            </Modal>

            <Modal isOpen={isConfirmModalOpen} title="Confirmar Eliminación" onClose={closeConfirmModal}>
                <div className="confirm-modal-content">
                    <p>¿Estás seguro de eliminar este cliente?</p>
                    <div className="confirm-buttons">
                        <button className="btn-secondary" onClick={closeConfirmModal}>Cancelar</button>
                        <button className="btn-danger" onClick={confirmDelete}>Sí, eliminar</button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
};

export default RegisterClientPage;
