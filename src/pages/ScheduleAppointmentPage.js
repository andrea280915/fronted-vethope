import AdminLayout from '../components/AdminLayout/AdminLayout';
import React, { useState, useEffect } from 'react'; 
import citaService from '../services/citaService';
import clientService from '../services/clienteService';
import mascotaService from '../services/mascotaService';
import { userList } from '../services/userService';
import citas from '../Images/citas.png';
import './ScheduleAppointmentPage.css'; // Asegúrate de tener tu CSS

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
    const [citas, setCitas] = useState([]);
    const [clients, setClients] = useState([]);
    const [pets, setPets] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const defaultFormData = { 
        id_cita: null, 
        fecha: new Date().toISOString().substring(0, 10), 
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }), 
        motivo: '',
        id_cliente: '', 
        id_mascota: '', 
        id_usuario: '',
    };
    
    const [formData, setFormData] = useState(defaultFormData);
    
    useEffect(() => {
        fetchCitas();
        fetchClientes();
        fetchMascotas();
        fetchDoctors();
    }, []);

    const fetchCitas = async () => { setLoading(true); setError(''); try { const data = await citaService.getAll(); setCitas(data); } catch (err) { setError('Error al cargar las citas'); console.error(err); } finally { setLoading(false); } };
    const fetchClientes = async () => { try { const data = await clientService.getAll(); setClients(data); } catch (err) { console.error(err); } };
    const fetchMascotas = async () => { try { const data = await mascotaService.getAll(); setPets(data); } catch (err) { console.error(err); } };
    const fetchDoctors = async () => { try { const data = await userList.getAll(); setDoctors(data.filter(user => user.rol === 'MEDICO')); } catch (err) { console.error(err); } };

    const createCita = async (citaData) => { setLoading(true); setError(''); try { await citaService.create({ ...citaData, id_cliente: parseInt(citaData.id_cliente), id_mascota: parseInt(citaData.id_mascota), id_usuario: parseInt(citaData.id_usuario) }); await fetchCitas(); return true; } catch (err) { setError('Error al registrar la cita'); throw err; } finally { setLoading(false); } };
    const updateCita = async (id_cita, citaData) => { setLoading(true); setError(''); try { await citaService.update(id_cita, { ...citaData, id_cliente: parseInt(citaData.id_cliente), id_mascota: parseInt(citaData.id_mascota), id_usuario: parseInt(citaData.id_usuario) }); await fetchCitas(); return true; } catch (err) { setError('Error al actualizar la cita'); throw err; } finally { setLoading(false); } };
    const deleteCita = async (id_cita) => { setLoading(true); setError(''); try { await citaService.remove(id_cita); await fetchCitas(); } catch (err) { setError('Error al eliminar la cita'); } finally { setLoading(false); } };

    const getClientName = (id_cliente) => { const client = clients.find(c => c.id_cliente === id_cliente); return client ? `${client.nombre} ${client.apellido}` : `ID: ${id_cliente}`; };
    const getPetName = (id_mascota) => { const pet = pets.find(p => p.id_mascota === id_mascota); return pet ? pet.nombre : `ID: ${id_mascota}`; };
    const getDoctorName = (id_usuario) => { const doctor = doctors.find(d => d.id_usuario === id_usuario); return doctor ? doctor.nombre : `ID: ${id_usuario}`; };
    const getPetsByClient = (id_cliente) => { const numericClientId = Number(id_cliente); return pets.filter(pet => pet.id_cliente === numericClientId); };

    const openCreateModal = () => { setIsEditing(false); setFormData(defaultFormData); setIsModalOpen(true); setError(''); };
    const openEditModal = (cita) => { setIsEditing(true); setFormData({ id_cita: cita.id_cita, fecha: cita.fecha, hora: cita.hora, motivo: cita.motivo, id_cliente: String(cita.id_cliente), id_mascota: String(cita.id_mascota), id_usuario: String(cita.id_usuario) }); setIsModalOpen(true); setError(''); };
    const closeModal = () => { setIsModalOpen(false); setError(''); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value, ...(name === 'id_cliente' && value !== prev.id_cliente ? { id_mascota: '' } : {}) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.id_cliente || !formData.id_mascota || !formData.id_usuario) { setError('Por favor completa todos los campos obligatorios'); return; }
        try { if (isEditing) { await updateCita(formData.id_cita, formData); } else { await createCita(formData); } closeModal(); } catch (err) {}
    };

    const eliminarCita = async (id_cita) => { if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) { await deleteCita(id_cita); } };

    const filteredCitas = citas.filter(cita => {
        const petName = getPetName(cita.id_mascota).toLowerCase();
        const clientName = getClientName(cita.id_cliente).toLowerCase();
        const doctorName = getDoctorName(cita.id_usuario).toLowerCase();
        const motivo = (cita.motivo || '').toLowerCase();
        return petName.includes(searchTerm.toLowerCase()) ||
               clientName.includes(searchTerm.toLowerCase()) ||
               doctorName.includes(searchTerm.toLowerCase()) ||
               motivo.includes(searchTerm.toLowerCase());
    });

    return (
        <AdminLayout>
            <div className="consultations-container">
                <div className="page-header">
                    <h1>REGISTRO DE <span>CITAS</span></h1>
                    <p className="subtitle">Gestión de citas médicas veterinarias.</p>
                </div>

                {error && !isModalOpen && (<div className="error-banner">⚠️ {error}</div>)}

                <div className="stock-controls">
                    <input type="text" placeholder="Buscar por mascota, motivo, cliente o médico..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={loading}/>
                    <button className="btn-add-stock" onClick={openCreateModal} disabled={loading}>+ Registrar Nueva Cita</button>
                </div>
                
                <div className="stock-table-container">
                    {loading && <div style={{textAlign: 'center', padding: '20px'}}>Cargando...</div>}
                    <table className="vet-table">
                        <thead>
                            <tr>
                                <th className="hidden-column">ID</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Mascota</th>
                                <th>Cliente</th>
                                <th>Médico</th>
                                <th>Motivo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCitas.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center">{loading ? 'Cargando...' : 'No hay citas registradas.'}</td>
                                </tr>
                            ) : (
                                filteredCitas.map(c => (
                                    <tr key={c.id_cita}>
                                        <td className="hidden-column">{c.id_cita}</td>
                                        <td>{c.fecha}</td>
                                        <td>{c.hora}</td>
                                        <td>{getPetName(c.id_mascota)}</td>
                                        <td>{getClientName(c.id_cliente)}</td>
                                        <td>{getDoctorName(c.id_usuario)}</td>
                                        <td>{c.motivo}</td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => openEditModal(c)} disabled={loading}>Editar</button>
                                            <button className="btn-action delete" onClick={() => eliminarCita(c.id_cita)} disabled={loading}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} title={isEditing ? "Editar Cita" : "Registrar Nueva Cita"} onClose={closeModal}>
                <form className="consultation-form" onSubmit={handleSubmit}>
                    {error && <div className="error-banner">{error}</div>}
                    <div className="form-group-row two-columns">
                        <div className="form-group">
                            <label htmlFor="fecha">Fecha:</label>
                            <input type="date" id="fecha" name="fecha" value={formData.fecha} onChange={handleChange} required disabled={loading}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="hora">Hora:</label>
                            <input type="time" id="hora" name="hora" value={formData.hora} onChange={handleChange} required disabled={loading}/>
                        </div>
                    </div>

                    <div className="form-group-row two-columns">
                        <div className="form-group">
                            <label htmlFor="id_cliente">Cliente: *</label>
                            <select id="id_cliente" name="id_cliente" value={formData.id_cliente} onChange={handleChange} required disabled={loading}>
                                <option value="">-- Seleccione Cliente --</option>
                                {clients.map((client, index) => (
                                    <option key={client.id_cliente || index} value={client.id_cliente}>
                                        {client.nombre} {client.apellido} {client.dni ? `- DNI: ${client.dni}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="id_mascota">Mascota: *</label>
                            <select id="id_mascota" name="id_mascota" value={formData.id_mascota} onChange={handleChange} required disabled={!formData.id_cliente || loading}>
                                <option value="">-- Seleccione Mascota --</option>
                                {getPetsByClient(formData.id_cliente).map(pet => (
                                    <option key={pet.id_mascota} value={pet.id_mascota}>{pet.nombre} ({pet.especie})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="id_usuario">Médico/Veterinario: *</label>
                        <select id="id_usuario" name="id_usuario" value={formData.id_usuario} onChange={handleChange} required disabled={loading}>
                            <option value="">-- Seleccione Médico --</option>
                            {doctors.map((doc, index) => (
                                <option key={doc.id_usuario || index} value={doc.id_usuario}>
                                    {doc.nombre} {doc.apellido || ''} {doc.email ? `(${doc.email})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="motivo">Motivo de la Cita: *</label>
                        <textarea id="motivo" name="motivo" value={formData.motivo} onChange={handleChange} required rows="4" placeholder="Describe el motivo de la consulta..." disabled={loading}></textarea>
                    </div>

                    <button type="submit" className="btn-submit-modal" disabled={loading}>
                        {loading ? 'Procesando...' : (isEditing ? "Guardar Cambios" : "Registrar Cita")}
                    </button>
                </form>
            </Modal>
        </AdminLayout>
    );
};

export default ScheduleAppointmentPage;
