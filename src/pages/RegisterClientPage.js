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
    
    // useRef para mantener el ID del cliente que se está editando
    const editingClientId = useRef(null);

    const [formData, setFormData] = useState({
        id: null, 
        nombre: '', 
        apellido: '', 
        dni: '', 
        email: '', 
        telefono: ''
    });

    // Cargar clientes al montar el componente
    useEffect(() => {
        fetchClients();
    }, []);

    // Listar todos los clientes
    const fetchClients = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await clientService.getAll();
            setClients(data);
        } catch (err) {
            setError('Error al cargar los clientes');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Crear un nuevo cliente
    const createClient = async (clientData) => {
        setLoading(true);
        setError(null);
        try {
            await clientService.create({
                dni: clientData.dni,
                nombre: clientData.nombre,
                apellido: clientData.apellido,
                email: clientData.email,
                telefono: clientData.telefono
            });
            await fetchClients(); // Recargar la lista
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

    // Actualizar un cliente existente
    const updateClientAPI = async (dni, clientData) => {
        setLoading(true);
        setError(null);
        try {
            await clientService.update(dni, {
                dni: clientData.dni,
                nombre: clientData.nombre,
                apellido: clientData.apellido,
                email: clientData.email,
                telefono: clientData.telefono
            });
            await fetchClients(); // Recargar la lista
        } catch (err) {
            let errorMsg = 'Error al actualizar el cliente';
            
            if (err.response?.status === 404) {
                errorMsg = 'Cliente no encontrado';
            } else if (err.response?.status === 403) {
                errorMsg = 'No tienes permisos para actualizar este cliente';
            } else if (err.message === 'DNI de cliente no válido') {
                errorMsg = err.message;
            }
            
            setError(errorMsg);
            console.error('Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Eliminar un cliente
    const deleteClientAPI = async (dni) => {
        setLoading(true);
        setError(null);
        try {
            await clientService.remove(dni);
            await fetchClients(); // Recargar la lista
        } catch (err) {
            let errorMsg = 'Error al eliminar el cliente';
            
            if (err.response?.status === 404) {
                errorMsg = 'Cliente no encontrado';
            } else if (err.response?.status === 403) {
                errorMsg = 'No tienes permisos para eliminar este cliente';
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
        editingClientId.current = null; // Limpiamos el ref
        setFormData({ 
            id: null, 
            nombre: '', 
            apellido: '', 
            dni: '', 
            email: '', 
            telefono: '' 
        });
        setIsModalOpen(true);
        setError(null);
    };

    const openEditModal = (client) => {
        console.log('🔵 Abriendo modal para editar cliente:', client);
        
        setIsEditing(true);
        // Usamos DNI como identificador ya que la API no devuelve ID
        editingClientId.current = client.dni;
        
        // Aseguramos que todos los datos del cliente se copien correctamente
        const clientData = {
            id: client.dni, // Usamos DNI como ID
            nombre: client.nombre || '',
            apellido: client.apellido || '',
            dni: client.dni || '',
            email: client.email || '',
            telefono: client.telefono || ''
        };
        
        console.log('🟢 Datos del formulario:', clientData);
        console.log('🟢 DNI guardado en ref:', editingClientId.current);
        setFormData(clientData);
        setIsModalOpen(true);
        setError(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setError(null);
    };
    
    const closeConfirmModal = () => { 
        setIsConfirmModalOpen(false); 
        setClientToDelete(null);
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Obtenemos el DNI del ref que usamos como identificador
        const clientIdentifier = editingClientId.current;
        
        console.log('📝 Submit - isEditing:', isEditing);
        console.log('📝 Submit - clientIdentifier (DNI):', clientIdentifier);
        console.log('📝 Submit - formData:', formData);
        
        try {
            if (isEditing) {
                // Validar que existe el identificador antes de actualizar
                if (!clientIdentifier) {
                    setError('Error: Identificador de cliente no válido');
                    console.error('❌ Identificador no encontrado:', { clientIdentifier, formData });
                    return;
                }
                console.log('✏️ Actualizando cliente con DNI:', clientIdentifier);
                await updateClientAPI(clientIdentifier, formData);
            } else {
                console.log('➕ Creando nuevo cliente');
                await createClient(formData);
            }
            closeModal();
        } catch (err) {
            // El error ya se maneja en las funciones de API
            console.error('❌ Error en handleSubmit:', err);
        }
    };

    const askForDelete = (dni) => {
        setClientToDelete(dni);
        setIsConfirmModalOpen(true);
        setError(null);
    };

    const confirmDelete = async () => {
        try {
            await deleteClientAPI(clientToDelete);
            closeConfirmModal();
        } catch (err) {
            // El error ya se maneja en deleteClientAPI
        }
    };

    const filteredClients = clients.filter(client => {
        const fullSearch = `${client.nombre} ${client.apellido} ${client.dni} ${client.telefono}`.toLowerCase();
        return fullSearch.includes(searchTerm.toLowerCase());
    });

    const RegistrationForm = (
        <form className="client-registration-form" onSubmit={handleSubmit}>
            {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
            
            <div className="form-group-row two-columns">
                <div className="form-group">
                    <label>Nombre:</label>
                    <input 
                        name="nombre" 
                        value={formData.nombre} 
                        onChange={handleChange} 
                        required 
                        disabled={loading}
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
                    <div className="error-banner" style={{
                        backgroundColor: '#fee', 
                        color: '#c00', 
                        padding: '10px', 
                        marginBottom: '15px',
                        borderRadius: '5px',
                        border: '1px solid #fcc'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <div className="stock-controls">
                    <input
                        type="text"
                        placeholder="Buscar cliente por nombre, DNI o teléfono..."
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
                    {loading && <div style={{textAlign: 'center', padding: '20px'}}>Cargando...</div>}
                    
                    <table className="vet-table">
                        <thead>
                            <tr>
                                <th>DNI</th>
                                <th>Nombre Completo</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client, index) => (
                                    <tr key={client.dni || `client-${index}`}>
                                        <td>{client.dni}</td>
                                        <td>{client.nombre} {client.apellido}</td>
                                        <td>{client.telefono}</td>
                                        <td>{client.email || 'N/A'}</td>
                                        <td className="actions-cell">
                                            <button 
                                                className="btn-action edit" 
                                                onClick={() => openEditModal(client)}
                                                disabled={loading}
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                className="btn-action delete" 
                                                onClick={() => askForDelete(client.dni)}
                                                disabled={loading}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr key="no-clients"><td colSpan="5" className="text-center">
                                    {loading ? 'Cargando...' : 'No se encontraron clientes.'}
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                title={isEditing ? "Editar Cliente" : "Registrar Nuevo Cliente"} 
                onClose={closeModal}
            >
                {RegistrationForm}
            </Modal>

            <Modal 
                isOpen={isConfirmModalOpen} 
                title="Confirmar Eliminación" 
                onClose={closeConfirmModal}
            >
                <div className="confirm-modal-content">
                    {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
                    <p>¿Estás seguro de eliminar este cliente?</p>
                    <div className="confirm-buttons">
                        <button 
                            className="btn-secondary" 
                            onClick={closeConfirmModal} 
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            className="btn-danger" 
                            onClick={confirmDelete} 
                            disabled={loading}
                        >
                            {loading ? 'Eliminando...' : 'Sí, eliminar'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
};

export default RegisterClientPage;
