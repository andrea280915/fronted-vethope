import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import mascotaService from '../services/mascotaService';
import clientService from '../services/clienteService';
import mascota from '../Images/Fotografia.png';
import './RegisterPetPage.css';

const vetPetImage = mascota;

const RegisterPetPage = () => {
  const [mascotas, setMascotas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    id_mascota: null,
    nombre: '',
    especie: '',
    peso: '',
    raza: '',
    edad: '',
    id_cliente: '',
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchMascotas();
    fetchClientes();
  }, []);

  const fetchMascotas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await mascotaService.getAll();
      setMascotas(data);
    } catch (err) {
      const errorMsg = err.response?.status === 500 
        ? 'Error del servidor al cargar las mascotas' 
        : 'Error al cargar las mascotas';
      setError(errorMsg);
      console.error('Error al cargar mascotas:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const data = await clientService.getAll();
      setClientes(data);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  };

  const createMascota = async (mascotaData) => {
    setLoading(true);
    setError('');
    try {
      await mascotaService.create({
        nombre: mascotaData.nombre,
        especie: mascotaData.especie,
        peso: parseFloat(mascotaData.peso) || 0,
        raza: mascotaData.raza,
        edad: parseInt(mascotaData.edad) || 0,
        id_cliente: parseInt(mascotaData.id_cliente)
      });
      setMensaje('✅ Mascota registrada exitosamente.');
      await fetchMascotas();
      setTimeout(() => setMensaje(''), 2500);
    } catch (err) {
      const errorMsg = err.response?.status === 400 
        ? 'Datos inválidos o incompletos' 
        : 'Error al registrar la mascota';
      setError(errorMsg);
      setMensaje('⚠️ ' + errorMsg);
      console.error('Error al crear mascota:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMascota = async (id_mascota, mascotaData) => {
    setLoading(true);
    setError('');
    try {
      await mascotaService.update(id_mascota, {
        id_mascota: id_mascota,
        nombre: mascotaData.nombre,
        especie: mascotaData.especie,
        peso: parseFloat(mascotaData.peso) || 0,
        raza: mascotaData.raza,
        edad: parseInt(mascotaData.edad) || 0,
        id_cliente: parseInt(mascotaData.id_cliente)
      });
      setMensaje('✅ Mascota actualizada correctamente.');
      await fetchMascotas();
      setTimeout(() => setMensaje(''), 2500);
    } catch (err) {
      let errorMsg = 'Error al actualizar la mascota';
      if (err.response?.status === 404) {
        errorMsg = 'No se encontró la mascota a actualizar';
      } else if (err.response?.status === 400) {
        errorMsg = 'Datos inválidos en la solicitud';
      }
      setError(errorMsg);
      setMensaje('⚠️ ' + errorMsg);
      console.error('Error al actualizar mascota:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMascota = async (id_mascota) => {
    setLoading(true);
    setError('');
    try {
      await mascotaService.remove(id_mascota);
      setMensaje('🗑️ Mascota eliminada.');
      await fetchMascotas();
      setTimeout(() => setMensaje(''), 2000);
    } catch (err) {
      const errorMsg = err.response?.status === 404 
        ? 'No se encontró la mascota a eliminar' 
        : 'Error al eliminar la mascota';
      setError(errorMsg);
      setMensaje('⚠️ ' + errorMsg);
      console.error('Error al eliminar mascota:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.especie || !formData.id_cliente) {
      setMensaje('⚠️ Completa los campos obligatorios.');
      return;
    }
    try {
      if (modoEdicion) {
        await updateMascota(formData.id_mascota, formData);
        setModoEdicion(false);
      } else {
        await createMascota(formData);
      }
      setFormData({
        id_mascota: null,
        nombre: '',
        especie: '',
        peso: '',
        raza: '',
        edad: '',
        id_cliente: '',
      });
      setMostrarFormulario(false);
    } catch (err) {}
  };

  const handleEdit = (mascota) => {
    setModoEdicion(true);
    setFormData({
      id_mascota: mascota.id_mascota,
      nombre: mascota.nombre,
      especie: mascota.especie,
      peso: mascota.peso,
      raza: mascota.raza,
      edad: mascota.edad,
      id_cliente: mascota.id_cliente,
    });
    setMostrarFormulario(true);
    setMensaje('');
    setError('');
  };

  const handleDelete = async (id_mascota) => {
    if (window.confirm('¿Seguro que deseas eliminar esta mascota?')) {
      await deleteMascota(id_mascota);
    }
  };

  const handleCancel = () => {
    setFormData({
      id_mascota: null,
      nombre: '',
      especie: '',
      peso: '',
      raza: '',
      edad: '',
      id_cliente: '',
    });
    setMostrarFormulario(false);
    setModoEdicion(false);
    setError('');
  };

  const getClienteNombre = (id_cliente) => {
    const cliente = clientes.find(c => c.id_cliente === id_cliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Desconocido';
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <h1>GESTIÓN DE <span>MASCOTAS</span></h1>
        <p className="subtitle">Administra fácilmente las mascotas registradas en VetHope</p>
      </div>

      <div className="pet-management-container">

        {/* CABECERA DE ACCIONES */}
        <div className="pet-actions-header">
          <button 
            className="add-btn" 
            onClick={() => setMostrarFormulario(true)}
            disabled={loading}
          >
            ➕ Nueva Mascota
          </button>
        </div>

        {/* MENSAJES */}
        {mensaje && <div className="alert-message">{mensaje}</div>}
        {error && !mostrarFormulario && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        {/* FORMULARIO SUPERPUESTO */}
        {mostrarFormulario && (
          <div className="form-overlay">
            <h3>{modoEdicion ? 'Editar Mascota' : 'Registrar Nueva Mascota'}</h3>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required disabled={loading}/>
              </div>
              <div className="form-group">
                <label>Especie *</label>
                <input type="text" name="especie" value={formData.especie} onChange={handleChange} required disabled={loading}/>
              </div>
              <div className="form-group">
                <label>Peso (kg)</label>
                <input type="number" step="0.1" name="peso" value={formData.peso} onChange={handleChange} disabled={loading}/>
              </div>
              <div className="form-group">
                <label>Raza</label>
                <input type="text" name="raza" value={formData.raza} onChange={handleChange} disabled={loading}/>
              </div>
              <div className="form-group">
                <label>Edad (años)</label>
                <input type="number" name="edad" value={formData.edad} onChange={handleChange} disabled={loading}/>
              </div>
              <div className="form-group">
                <label>Dueño/Cliente *</label>
                <select name="id_cliente" value={formData.id_cliente} onChange={handleChange} required disabled={loading}>
                  <option value="">Selecciona un dueño</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id_cliente} value={cliente.id_cliente}>
                      {cliente.nombre} {cliente.apellido} - DNI: {cliente.dni}
                    </option>
                  ))}
                </select>
              </div>

              <div className="button-group" style={{ gridColumn: '1 / 3' }}>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Procesando...' : (modoEdicion ? 'Actualizar' : 'Guardar')}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel} disabled={loading}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TABLA DE MASCOTAS */}
        <div className="pet-table-container">
          <h3>📋 Lista de Mascotas</h3>
          {loading && <div style={{textAlign: 'center', padding: '20px'}}>Cargando...</div>}
          <table className="pet-table">
            <thead>
              <tr>
                <th className="hidden-column">ID</th>
                <th>Nombre</th>
                <th>Especie</th>
                <th>Peso (kg)</th>
                <th>Raza</th>
                <th>Edad</th>
                <th>Dueño</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mascotas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">{loading ? 'Cargando...' : 'No hay mascotas registradas.'}</td>
                </tr>
              ) : (
                mascotas.map(m => (
                  <tr key={m.id_mascota}>
                    <td className="hidden-column">{m.id_mascota}</td>
                    <td>{m.nombre}</td>
                    <td>{m.especie}</td>
                    <td>{m.peso}</td>
                    <td>{m.raza || 'N/A'}</td>
                    <td>{m.edad}</td>
                    <td>{getClienteNombre(m.id_cliente)}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(m)} disabled={loading}>✏️</button>
                      <button className="delete-btn" onClick={() => handleDelete(m.id_mascota)} disabled={loading}>🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Imagen decorativa */}
        <div className="decorative-image-area">
          <div className="image-circle-bg">
            <img src={vetPetImage} alt="Veterinaria con Mascota" className="vet-pet-image"/>
          </div>
        </div>
      </div>

      {/* ESTILOS ADICIONALES */}
      <style jsx>{`
        .hidden-column { display: none; }
        .form-overlay {
          position: absolute;
          top: 100px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          width: 95%;
          max-width: 800px;
          background: #fff;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
      `}</style>

    </AdminLayout>
  );
};

export default RegisterPetPage;
