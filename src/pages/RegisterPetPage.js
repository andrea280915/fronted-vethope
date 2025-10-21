import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import mascota from '../Images/Fotografia.png';
import './RegisterPetPage.css';

const vetPetImage = mascota;

const RegisterPetPage = () => {
  const [mascotas, setMascotas] = useState([
    { id: 1, nombre: 'Firu', especie: 'Perro', peso: 12, raza: 'Beagle', tamano: 'Mediano', edad: 3, dueno: 'Alexander Palacios' },
  ]);

  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    especie: '',
    peso: '',
    raza: '',
    tamano: '',
    edad: '',
    dueno: '',
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.especie || !formData.dueno) {
      setMensaje('⚠️ Completa los campos obligatorios.');
      return;
    }

    if (modoEdicion) {
      setMascotas(
        mascotas.map((m) =>
          m.id === formData.id ? { ...formData, id: m.id } : m
        )
      );
      setModoEdicion(false);
      setMensaje('✅ Mascota actualizada correctamente.');
    } else {
      setMascotas([...mascotas, { ...formData, id: Date.now() }]);
      setMensaje('✅ Mascota registrada exitosamente.');
    }

    setFormData({
      id: null,
      nombre: '',
      especie: '',
      peso: '',
      raza: '',
      tamano: '',
      edad: '',
      dueno: '',
    });

    setMostrarFormulario(false);
    setTimeout(() => setMensaje(''), 2500);
  };

  const handleEdit = (mascota) => {
    setModoEdicion(true);
    setFormData(mascota);
    setMostrarFormulario(true);
    setMensaje('');
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta mascota?')) {
      setMascotas(mascotas.filter((m) => m.id !== id));
      setMensaje('🗑️ Mascota eliminada.');
      setTimeout(() => setMensaje(''), 2000);
    }
  };

  const handleCancel = () => {
    setFormData({
      id: null,
      nombre: '',
      especie: '',
      peso: '',
      raza: '',
      tamano: '',
      edad: '',
      dueno: '',
    });
    setMostrarFormulario(false);
    setModoEdicion(false);
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
          <button className="add-btn" onClick={() => setMostrarFormulario(true)}>
            ➕ Nueva Mascota
          </button>
        </div>

        {/* MENSAJES */}
        {mensaje && <div className="alert-message">{mensaje}</div>}

        {/* FORMULARIO EMERGENTE */}
        {mostrarFormulario && (
          <div className="form-card">
            <h3>{modoEdicion ? 'Editar Mascota' : 'Registrar Nueva Mascota'}</h3>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej. Firu" required />
              </div>

              <div className="form-group">
                <label>Especie *</label>
                <input type="text" name="especie" value={formData.especie} onChange={handleChange} placeholder="Perro / Gato / Ave" required />
              </div>

              <div className="form-group">
                <label>Peso (kg)</label>
                <input type="number" name="peso" value={formData.peso} onChange={handleChange} placeholder="Ej. 12" />
              </div>

              <div className="form-group">
                <label>Raza</label>
                <input type="text" name="raza" value={formData.raza} onChange={handleChange} placeholder="Ej. Beagle" />
              </div>

              <div className="form-group">
                <label>Tamaño</label>
                <select name="tamano" value={formData.tamano} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  <option value="Pequeño">Pequeño</option>
                  <option value="Mediano">Mediano</option>
                  <option value="Grande">Grande</option>
                </select>
              </div>

              <div className="form-group">
                <label>Edad (años)</label>
                <input type="number" name="edad" value={formData.edad} onChange={handleChange} placeholder="Ej. 3" />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / 3' }}>
                <label>Dueño *</label>
                <select name="dueno" value={formData.dueno} onChange={handleChange} required>
                  <option value="">Selecciona un dueño</option>
                  <option value="Alexander Palacios">Alexander Palacios</option>
                  <option value="Micky Mouse">Micky Mouse</option>
                </select>
              </div>

              <div className="button-group">
                <button type="submit" className="submit-btn">
                  {modoEdicion ? 'Actualizar' : 'Guardar'}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LISTADO DE MASCOTAS */}
        <div className="pet-table-container">
          <h3>📋 Lista de Mascotas</h3>
          <table className="pet-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Especie</th>
                <th>Peso</th>
                <th>Raza</th>
                <th>Tamaño</th>
                <th>Edad</th>
                <th>Dueño</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mascotas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">No hay mascotas registradas.</td>
                </tr>
              ) : (
                mascotas.map((m) => (
                  <tr key={m.id}>
                    <td>{m.nombre}</td>
                    <td>{m.especie}</td>
                    <td>{m.peso}</td>
                    <td>{m.raza}</td>
                    <td>{m.tamano}</td>
                    <td>{m.edad}</td>
                    <td>{m.dueno}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(m)}>✏️</button>
                      <button className="delete-btn" onClick={() => handleDelete(m.id)}>🗑️</button>
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
            <img src={vetPetImage} alt="Veterinaria con Mascota" className="vet-pet-image" />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RegisterPetPage;
