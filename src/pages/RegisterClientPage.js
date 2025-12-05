import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { clientService } from '../services/clienteService';
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
    const [clients, setClients] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    const editingClientId = useRef(null);

    const [formData, setFormData] = useState({
        id: null, 
        nombre: '', 
        apellido: '', 
        dni: '', 
        email: '', 
        telefono: ''
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const data = await clientService.getAll();
            setClients(data);
        } catch (err) {
            setError('Error al cargar los clientes. Verifica la conexión.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const createClient = async (clientData) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await clientService.create({
                dni: clientData.dni,
                nombre: clientData.nombre,
                apellido: clientData.apellido,
                email: clientData.email,
                telefono: clientData.telefono
            });
            setSuccessMessage('Cliente registrado exitosamente.');
            await fetchClients();
        } catch (err) {
            const errorMsg = err.response?.status === 400 
                ? 'Datos inválidos. Verifica la información ingresada.' 
                : 'Error al crear el cliente';
            setError(errorMsg);
            console.error('Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateClientAPI = async (id_cliente, clientData) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await clientService.update(id_cliente, {
                dni: clientData.dni,
                nombre: clientData.nombre,
                apellido: clientData.apellido,
                email: clientData.email,
                telefono: clientData.telefono
            });
            setSuccessMessage('Cliente actualizado exitosamente.');
            await fetchClients();
        } catch (err) {
            let errorMsg = 'Error al actualizar el cliente';
            
            if (err.response?.status === 404) {
                errorMsg = 'Cliente no encontrado';
            } else if (err.response?.status === 403) {
                errorMsg = 'No tienes permisos para actualizar este cliente';
            } else if (err.message === 'ID de cliente no válido') {
                errorMsg = err.message;
            }
            
            setError(errorMsg);
            console.error('Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteClientAPI = async (id_cliente) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await clientService.remove(id_cliente);
            setSuccessMessage('Cliente eliminado exitosamente.');
            await fetchClients();
        } catch (err) {
            let errorMsg = 'Error al eliminar el cliente';
            
            if (err.response?.status === 404) {
                errorMsg = 'Cliente no encontrado';
            } else if (err.response?.status === 403) {
                errorMsg = 'No tienes permisos para eliminar este cliente';
            } else if (err.response?.status === 409) {
                errorMsg = 'No se puede eliminar el cliente porque tiene registros asociados';
            }
            
            setError(errorMsg);
            console.error('Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        editingClientId.current = null;
        setFormData({ id: null, nombre: '', apellido: '', dni: '', email: '', telefono: '' });
        setIsModalOpen(true);
        setError(null);
        setSuccessMessage(null);
    };

    const openEditModal = (client) => {
        setIsEditing(true);
        editingClientId.current = client.id_cliente;

        const clientData = {
            id: client.id_cliente,
            nombre: client.nombre || '',
            apellido: client.apellido || '',
            dni: client.dni || '',
            email: client.email || '',
            telefono: client.telefono || ''
        };
        setFormData(clientData);
        setIsModalOpen(true);
        setError(null);
        setSuccessMessage(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setError(null);
        setSuccessMessage(null);
    };
    
    const closeConfirmModal = () => { 
        setIsConfirmModalOpen(false); 
        setClientToDelete(null);
        setError(null);
        setSuccessMessage(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Validación para DNI (solo números, máximo 8 dígitos)
        if (name === 'dni') {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length <= 8) {
                setFormData(prev => ({ ...prev, [name]: numericValue }));
            }
        } 
        // Validación para teléfono (solo números, máximo 15 dígitos)
        else if (name === 'telefono') {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length <= 15) {
                setFormData(prev => ({ ...prev, [name]: numericValue }));
            }
        }
        // Para los demás campos
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const clientIdentifier = editingClientId.current;
        
        try {
            if (isEditing) {
                if (!clientIdentifier) {
                    setError('Error: Identificador de cliente no válido');
                    return;
                }
                await updateClientAPI(clientIdentifier, formData);
            } else {
                await createClient(formData);
            }
            // Esperar un momento para que se vea el mensaje de éxito
            setTimeout(() => {
                closeModal();
            }, 1500);
        } catch (err) {
            console.error('❌ Error en handleSubmit:', err);
        }
    };

    const askForDelete = (id_cliente) => {
        setClientToDelete(id_cliente);
        setIsConfirmModalOpen(true);
        setError(null);
        setSuccessMessage(null);
    };

    const confirmDelete = async () => {
        try {
            await deleteClientAPI(clientToDelete);
            setTimeout(() => {
                closeConfirmModal();
            }, 1500);
        } catch (err) {
            // El error ya se maneja en deleteClientAPI
        }
    };

    const filteredClients = clients.filter(client => {
        const fullSearch = `${client.nombre} ${client.apellido} ${client.dni} ${client.telefono} ${client.email || ''}`.toLowerCase();
        return fullSearch.includes(searchTerm.toLowerCase());
    });

    const RegistrationForm = (
        <form className="client-registration-form" onSubmit={handleSubmit}>
            {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
            {successMessage && <div className="success-message" style={{color: 'green', marginBottom: '10px'}}>✅ {successMessage}</div>}
            
            <div className="form-group-row two-columns">
                <div className="form-group">
                    <label>Nombre:</label>
                    <input 
                        name="nombre" 
                        value={formData.nombre} 
                        onChange={handleChange} 
                        required 
                        disabled={loading}
                        placeholder="Ej: Juan"
                    />
                </div>
                <div className="form-group">
                    <label>Apellido:</label>
                    <input 
                        name="apellido" 
                        value={formData.apellido} 
                        onChange={handleChange} 
                        required 
                        disabled={loading}
                        placeholder="Ej: Pérez"
                    />
                </div>
            </div>

            <div className="form-group-row two-columns">
                <div className="form-group">
                    <label>DNI:</label>
                    <input 
                        name="dni" 
                        value={formData.dni} 
                        onChange={handleChange} 
                        maxLength="8" 
                        required 
                        disabled={loading}
                        placeholder="Ej: 12345678"
                    />
                </div>
                <div className="form-group">
                    <label>Teléfono:</label>
                    <input 
                        name="telefono" 
                        value={formData.telefono} 
                        onChange={handleChange} 
                        required 
                        disabled={loading}
                        placeholder="Ej: 987654321"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Email:</label>
                <input 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    disabled={loading}
                    placeholder="Ej: cliente@email.com"
                />
            </div>

            <button type="submit" className="btn-submit-modal" disabled={loading}>
                {loading ? 'Procesando...' : (isEditing ? "Guardar Cambios" : "Registrar Cliente")}
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

                {error && !isModalOpen && !isConfirmModalOpen && (
                    <div className="error-banner">
                        ⚠️ {error}
                    </div>
                )}

                {successMessage && !isModalOpen && !isConfirmModalOpen && (
                    <div className="success-banner">
                        ✅ {successMessage}
                    </div>
                )}

                <div className="stock-controls">
                    <input
                        type="text"
                        placeholder="Buscar cliente por nombre, apellido, DNI, teléfono o email..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={loading}
                    />
                    <button 
                        className="btn-add-stock" 
                        onClick={openCreateModal} 
                        disabled={loading}
                    >
                        + Registrar Nuevo Cliente
                    </button>
                </div>

                <div className="stock-table-container">
                    {loading && !isModalOpen && !isConfirmModalOpen && (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Cargando clientes...</p>
                        </div>
                    )}
                    
                    <table className="vet-table">
                        <thead>
                            <tr>
                                <th style={{ width: '110px' }}>DNI</th>
                                <th style={{ width: '200px' }}>Nombre Completo</th>
                                <th style={{ width: '120px' }}>Teléfono</th>
                                <th style={{ width: '250px' }}>Email</th>
                                <th style={{ width: '220px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client, index) => (
                                    <tr key={client.id_cliente || `client-${index}`}>
                                        <td style={{ width: '110px' }}>{client.dni || 'N/A'}</td>
                                        <td style={{ width: '200px' }}>
                                            <div className="client-name-cell">
                                                {client.nombre} {client.apellido}
                                            </div>
                                        </td>
                                        <td style={{ width: '120px' }}>{client.telefono || 'N/A'}</td>
                                        <td style={{ width: '250px' }}>{client.email || 'N/A'}</td>
                                        <td className="actions-cell" style={{ width: '220px' }}>
                                            <button 
                                                className="btn-action edit" 
                                                onClick={() => openEditModal(client)} 
                                                disabled={loading}
                                                title="Editar cliente"
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                className="btn-action delete" 
                                                onClick={() => askForDelete(client.id_cliente)} 
                                                disabled={loading}
                                                title="Eliminar cliente"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr key="no-clients">
                                    <td colSpan="5" className="text-center">
                                        {loading ? '' : searchTerm ? 'No se encontraron clientes con esa búsqueda.' : 'No hay clientes registrados.'}
                                    </td>
                                </tr>
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
                    {error && <div className="error-message">{error}</div>}
                    {successMessage && <div className="success-message">✅ {successMessage}</div>}
                    <p>¿Estás seguro de eliminar este cliente?</p>
                    <p className="warning-text">Esta acción no se puede deshacer.</p>
                    <div className="confirm-buttons">
                        <button className="btn-secondary" onClick={closeConfirmModal} disabled={loading}>Cancelar</button>
                        <button className="btn-danger" onClick={confirmDelete} disabled={loading}>
                            {loading ? 'Eliminando...' : 'Sí, eliminar'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
};

export default RegisterClientPage;
