import AdminLayout from '../components/AdminLayout/AdminLayout';
import React, { useState } from 'react'; 
import citas from '../Images/citas.png';


// 1. Clientes (Dueños)
const initialClientsData = [
    { id: 1, nombre: 'Juan', apellido: 'Pérez' },
    { id: 2, nombre: 'María', apellido: 'Gómez' },
];

// 2. Mascotas (Relacionadas a Clientes)
const initialPetsData = [
    { id: 10, nombre: 'Boby', clientId: 1, especie: 'Perro' },
    { id: 20, nombre: 'Michi', clientId: 2, especie: 'Gato' },
];

// 3. Atenciones/Consultas Iniciales (incluye Diagnóstico y Receta)
const initialConsultationsData = [
    { id: 1, fecha: '2025-10-06', hora: '10:00', petId: 10, clientId: 1, diagnostico: 'Tos de perrera', receta: 'Antibiótico 7 días' },
    { id: 2, fecha: '2025-09-30', hora: '15:30', petId: 20, clientId: 2, diagnostico: 'Control post-operatorio', receta: 'Ninguna' },
];

// --- COMPONENTE MODAL REUTILIZABLE ---
const Modal = ({ isOpen, title, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{title}</h2>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                {children}
            </div>
        </div>
    );
};


const ScheduleAppointmentPage = () => {
    const [consultations, setConsultations] = useState(initialConsultationsData);
    const [clients] = useState(initialClientsData);
    const [pets] = useState(initialPetsData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const defaultFormData = { 
        id: null, 
        fecha: new Date().toISOString().substring(0, 10), // Fecha actual por defecto
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }), // Hora actual
        petId: '', 
        clientId: '', 
        diagnostico: '', 
        receta: '' 
    };
    
    const [formData, setFormData] = useState(defaultFormData);
    
    // --- HELPERS (Funciones de Soporte) ---

    const getClientName = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        return client ? `${client.nombre} ${client.apellido}` : 'Desconocido';
    };

    const getPetName = (petId) => {
        const pet = pets.find(p => p.id === petId);
        return pet ? pet.nombre : 'Desconocida';
    };
    
    // Filtra las mascotas basadas en el Cliente seleccionado
    const getPetsByClient = (clientId) => {
        const numericClientId = Number(clientId);
        return pets.filter(pet => pet.clientId === numericClientId);
    };

    // --- MANEJO DEL MODAL Y FORMULARIO ---
    
    const openCreateModal = () => {
        setIsEditing(false);
        setFormData(defaultFormData);
        setIsModalOpen(true);
    };

    const openEditModal = (consultation) => {
        setIsEditing(true);
        // Aseguramos que los IDs sean string para el <select>
        setFormData({ 
            ...consultation, 
            clientId: String(consultation.clientId),
            petId: String(consultation.petId)
        }); 
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newState = { ...prev, [name]: value };

            // Si se cambia el cliente, reinicia la mascota seleccionada
            if (name === 'clientId' && value !== prev.clientId) {
                newState.petId = ''; 
            }
            return newState;
        });
    };
    
    // --- FUNCIONES CRUD ---

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Convertir IDs a número antes de guardar
        const dataToSave = { 
            ...formData, 
            clientId: Number(formData.clientId),
            petId: Number(formData.petId),
        };

        if (isEditing) {
            // Lógica de ACTUALIZAR
            setConsultations(consultations.map(c => 
                c.id === dataToSave.id ? dataToSave : c
            ));
        } else {
            // Lógica de CREAR
            const newId = consultations.length > 0 ? Math.max(...consultations.map(c => c.id)) + 1 : 1;
            const newConsultation = { ...dataToSave, id: newId };
            setConsultations([...consultations, newConsultation]);
        }
        closeModal();
    };

    const eliminarConsulta = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este registro de atención?')) {
            setConsultations(consultations.filter(c => c.id !== id));
        }
    };
    

    return (
        <AdminLayout>
            <div className="consultations-container">
                <div className="page-header">
                    <h1>REGISTRO DE <span> CITAS</span></h1>
                    <p className="subtitle">Registro de diagnósticos, tratamientos y recetas.</p>
                </div>

                {/* Controles: Búsqueda y Botón Agregar */}
                <div className="stock-controls">
                    <input 
                        type="text" 
                        placeholder="Buscar por mascota, diagnóstico o cliente..." 
                        className="search-input"
                    />
                    <button className="btn-add-stock" onClick={openCreateModal}>
                        + Registrar Nueva Atención
                    </button>
                </div>
                
                {/* --- TABLA DE LECTURA (READ/LISTAR) --- */}
                <div className="stock-table-container">
                    <table className="vet-table">
                        <thead>
                            <tr>
                                <th style={{width: '10%'}}>Fecha</th>
                                <th style={{width: '15%'}}>Mascota</th>
                                <th style={{width: '25%'}}>Diagnóstico</th>
                                <th style={{width: '30%'}}>Cliente</th>
                                <th style={{width: '20%'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consultations.map(c => (
                                <tr key={c.id}>
                                    <td>{c.fecha}</td>
                                    <td>{getPetName(c.petId)}</td>
                                    <td>{c.diagnostico}</td>
                                    <td>{getClientName(c.clientId)}</td>
                                    <td>
                                        <button 
                                            className="btn-action edit" 
                                            onClick={() => openEditModal(c)}
                                        >
                                            Detalle/Editar
                                        </button>
                                        <button 
                                            className="btn-action delete" 
                                            onClick={() => eliminarConsulta(c.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL DE CREACIÓN/EDICIÓN (UPDATE) --- */}
            <Modal 
                isOpen={isModalOpen} 
                title={isEditing ? "Editar Atención Clínica" : "Registrar Nueva Atención"} 
                onClose={closeModal}
            >
                <form className="consultation-form" onSubmit={handleSubmit}>
                    
                    {/* Fila 1: Fecha y Hora */}
                    <div className="form-group-row two-columns">
                        <div className="form-group">
                            <label htmlFor="fecha">Fecha:</label>
                            <input type="date" id="fecha" name="fecha" value={formData.fecha} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="hora">Hora:</label>
                            <input type="time" id="hora" name="hora" value={formData.hora} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Fila 2: Cliente y Mascota */}
                    <div className="form-group-row two-columns">
                        <div className="form-group">
                            <label htmlFor="clientId">Cliente:</label>
                            <select 
                                id="clientId" name="clientId" 
                                value={formData.clientId} onChange={handleChange} required
                            >
                                <option value="" disabled>-- Seleccione Cliente --</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.nombre} {client.apellido}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="petId">Mascota:</label>
                            <select 
                                id="petId" name="petId" 
                                value={formData.petId} onChange={handleChange} required
                                disabled={!formData.clientId}
                            >
                                <option value="" disabled>-- Seleccione Mascota --</option>
                                {getPetsByClient(formData.clientId).map(pet => (
                                    <option key={pet.id} value={pet.id}>
                                        {pet.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Fila 3: Diagnóstico */}
                    <div className="form-group">
                        <label htmlFor="diagnostico">Diagnóstico:</label>
                        <textarea id="diagnostico" name="diagnostico" value={formData.diagnostico} onChange={handleChange} required rows="3"></textarea>
                    </div>

                    {/* Fila 4: Receta / Tratamiento */}
                    <div className="form-group">
                        <label htmlFor="receta">Receta / Tratamiento:</label>
                        <textarea id="receta" name="receta" value={formData.receta} onChange={handleChange} required rows="3"></textarea>
                    </div>

                    <button type="submit" className="btn-submit-modal">
                        {isEditing ? "Guardar Cambios" : "Registrar Atención"}
                    </button>
                </form>
            </Modal>
        </AdminLayout>
    );
};

export default ScheduleAppointmentPage;
