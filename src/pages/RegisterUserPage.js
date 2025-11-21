import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout/AdminLayout";
import { userService, userList } from "../services/userService";

const roles = [
  { value: "ADMIN", label: "Administrador" },
  { value: "MEDICO", label: "Médico Veterinario" },
  { value: "RECEPCIONISTA", label: "Asistente de Clínica" },
];

// Componente Modal Reutilizable
const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

const RegisterUserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userList.getAll();
        setUsers(data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const [formData, setFormData] = useState({
    id_usuario: null,
    username: "",
    nombre: "",
    apellido: "",
    correo: "",
    dni: "",
    telefono: "",
    password: "",
    rol: "",
  });

  // --- MANEJO DEL FORMULARIO Y MODAL ---
  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      id_usuario: null,
      username: "",
      nombre: "",
      apellido: "",
      correo: "",
      dni: "",
      telefono: "",
      password: "",
      rol: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsEditing(true);
    setFormData({
      id_usuario: user.id_usuario,
      username: user.username || "",
      nombre: user.nombre || "",
      apellido: user.apellido || "",
      correo: user.correo || "",
      dni: user.dni || "",
      telefono: user.telefono || "",
      password: "",
      rol: user.rol || "MEDICO",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setUserToDelete(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- FUNCIONES CRUD ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      username: formData.username,
      nombre: formData.nombre,
      apellido: formData.apellido,
      correo: formData.correo,
      dni: formData.dni,
      telefono: formData.telefono,
      password: formData.password,
      rol: formData.rol,
    };

    console.log("📦 JSON que se enviará al backend:", payload);

    try {
      if (isEditing) {
        // ← Cambiado de userService.update a userList.update
        await userList.update(formData.id_usuario, payload);
        console.log("✅ Usuario actualizado:", payload);
        // Actualizar estado local para reflejar cambios inmediatamente
        setUsers((prev) =>
          prev.map((u) =>
            u.id_usuario === formData.id_usuario ? { ...u, ...payload } : u
          )
        );
      } else {
        await userService.register(payload);
        console.log("✅ Usuario creado:", payload);
        // Refrescar lista de usuarios
        const data = await userList.getAll();
        setUsers(data);
      }

      closeModal();
    } catch (error) {
      console.error("❌ Error al guardar usuario:", error);
      alert(
        "Error al guardar el usuario: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const askForDelete = (id) => {
    setUserToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await userList.remove(userToDelete);
      setUsers(users.filter((u) => u.id_usuario !== userToDelete));
      console.log(`🗑️ Usuario con ID ${userToDelete} eliminado.`);
    } catch (error) {
      console.error("❌ Error al eliminar usuario:", error);
      alert(
        "Error al eliminar el usuario: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      closeConfirmModal();
    }
  };

  const getRoleLabel = (value) => {
    const role = roles.find((r) => r.value === value);
    return role ? role.label : "N/A";
  };

  const filteredUsers = users.filter((user) => {
    const fullSearch = `${user.nombre} ${user.apellido} ${user.dni} ${user.correo} ${getRoleLabel(user.rol)}`.toLowerCase();
    return fullSearch.includes(searchTerm.toLowerCase());
  });

  return (
    <AdminLayout>
      <div className="register-user-container">
        <div className="page-header">
          <h1>
            ADMINISTRACIÓN DE <span>USUARIOS</span>
          </h1>
          <p className="subtitle">
            Gestión de cuentas para Médicos, Asistentes y Administradores.
          </p>
        </div>

        <div className="stock-controls">
          <input
            type="text"
            placeholder="Buscar usuario por nombre o DNI..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-add-stock" onClick={openCreateModal}>
            + Crear Nuevo Usuario
          </button>
        </div>

        <div className="stock-table-container">
          <table className="vet-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>DNI</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id_usuario}>
                    <td>{user.id_usuario}</td>
                    <td>{user.nombre} {user.apellido}</td>
                    <td>{user.dni}</td>
                    <td>{user.correo}</td>
                    <td>{getRoleLabel(user.rol)}</td>
                    <td className="actions-cell">
                      <button onClick={() => openEditModal(user)}>Editar</button>
                      <button onClick={() => askForDelete(user.id_usuario)}>Eliminar</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No hay usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE CREACIÓN/EDICIÓN --- */}
      <Modal
        isOpen={isModalOpen}
        title={isEditing ? "Editar Usuario" : "Registrar Nuevo Usuario"}
        onClose={closeModal}
      >
        <form className="user-registration-form" onSubmit={handleSubmit}>
          <div className="form-group-row two-columns">
            <div className="form-group">
              <label htmlFor="nombre">Nombre:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="apellido">Apellido:</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group-row two-columns">
            <div className="form-group">
              <label htmlFor="dni">DNI:</label>
              <input
                type="text"
                id="dni"
                name="dni"
                value={formData.dni || ""}
                onChange={handleChange}
                maxLength="8"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="telefono">Teléfono:</label>
              <input
                type="text"
                id="telefono"
                name="telefono"
                value={formData.telefono || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="rol">Asignar Rol:</label>
              <select
                id="rol"
                name="rol"
                value={formData.rol || ""}
                onChange={handleChange}
                required
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="correo">Correo Electrónico (Login):</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Contraseña{" "}
              {isEditing ? "(Dejar vacío para no cambiar)" : "Temporal:"}:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              required={!isEditing}
              placeholder={isEditing ? "••••••••" : ""}
            />
          </div>

          <button type="submit" className="btn-submit-modal">
            {isEditing ? "Guardar Cambios" : "Crear Usuario"}
          </button>
        </form>
      </Modal>

      {/* --- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN --- */}
      <Modal
        isOpen={isConfirmModalOpen}
        title="Confirmar Eliminación"
        onClose={closeConfirmModal}
      >
        <div className="confirm-modal-content">
          <p>
            ¿Estás seguro de que deseas eliminar a este usuario?
            <br />
            **ID: {userToDelete}**
          </p>
          <p className="warning-text">
            Esta acción es irreversible y requiere la confirmación de un
            administrador.
          </p>
          <div className="confirm-buttons">
            <button className="btn-secondary" onClick={closeConfirmModal}>
              Cancelar
            </button>
            <button className="btn-danger" onClick={confirmDelete}>
              Sí, Eliminar Permanentemente
            </button>
          </div>
        </div>
      </Modal>

      {/* --- ESTILOS CSS INCLUIDOS EN EL ARCHIVO --- */}
      <style jsx>{`
        /* Variables de Color (Colores funcionales y neutros) */
        :root {
          --primary-color: #3b82f6; /* Azul funcional */
          --secondary-color: #60a5fa; /* Azul claro */
          --text-color: #1f2937; /* Gris oscuro */
          --bg-light: #f9fafb; /* Fondo muy claro */
          --danger-color: #ef4444; /* Rojo */
          --success-color: #10b981; /* Verde */
          --border-color: #e5e7eb; /* Borde gris claro */
        }

        .register-user-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 30px;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 15px;
        }
        .page-header h1 {
          font-size: 2.5rem;
          color: var(--primary-color);
          font-weight: 800;
        }
        .page-header span {
          color: var(--secondary-color);
        }
        .subtitle {
          color: #6b7280;
          font-size: 1rem;
        }

        /* Controles y Búsqueda */
        .stock-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          gap: 15px;
        }
        .search-input {
          flex-grow: 1;
          padding: 10px 15px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
          max-width: 400px;
        }
        .search-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        .btn-add-stock {
          background-color: var(--primary-color);
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.1s;
        }
        .btn-add-stock:hover {
          background-color: #2563eb;
        }

        /* Estilos de la Tabla */
        .stock-table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          overflow-x: auto;
        }
        .vet-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .vet-table th,
        .vet-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #f3f4f6;
        }
        .vet-table th {
          background-color: var(--bg-light);
          color: var(--text-color);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.85rem;
        }
        .vet-table tr:hover {
          background-color: #f5f5f5;
        }
        .vet-table tbody tr:last-child td {
          border-bottom: none;
        }

        /* Botones de Acción de la Tabla */
        .actions-cell {
          white-space: nowrap;
          min-width: 150px;
        }
        .btn-action {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          margin-right: 8px;
          transition: opacity 0.2s;
        }
        .btn-action.edit {
          background-color: var(--secondary-color);
          color: white;
        }
        .btn-action.edit:hover {
          background-color: #3b82f6;
        }
        .btn-action.delete {
          background-color: var(--danger-color);
          color: white;
        }
        .btn-action.delete:hover {
          background-color: #b91c1c;
        }

        /* Estilos del Modal (General) */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: fadeIn 0.3s;
        }
        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          max-width: 650px;
          width: 90%;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          position: relative;
          animation: slideUp 0.3s;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
        }
        .modal-header h2 {
          font-size: 1.5rem;
          color: var(--primary-color);
        }
        .modal-close-btn {
          background: none;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
          color: #9ca3af;
          transition: color 0.2s;
        }
        .modal-close-btn:hover {
          color: var(--text-color);
        }

        /* Estilos del Formulario en Modal */
        .user-registration-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group label {
          font-weight: 600;
          margin-bottom: 0.3rem;
          color: var(--text-color);
          font-size: 0.9rem;
        }
        .form-group input,
        .form-group select {
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          transition: border-color 0.2s;
        }
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary-color);
        }
        .form-group-row {
          display: flex;
          gap: 15px;
        }
        .form-group-row.two-columns > .form-group {
          flex: 1;
        }
        .btn-submit-modal {
          background-color: var(--success-color);
          color: white;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          margin-top: 15px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-submit-modal:hover {
          background-color: #059669;
        }

        /* Estilos del Modal de Confirmación */
        .confirm-modal-content {
          text-align: center;
          padding: 20px;
        }
        .confirm-modal-content p {
          font-size: 1.1rem;
          margin-bottom: 15px;
          color: var(--text-color);
        }
        .warning-text {
          color: var(--danger-color);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .confirm-buttons {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 25px;
        }
        .btn-secondary,
        .btn-danger {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-secondary {
          background-color: #9ca3af;
          color: white;
        }
        .btn-danger {
          background-color: var(--danger-color);
          color: white;
        }
        .btn-danger:hover {
          background-color: #b91c1c;
        }
        .btn-secondary:hover {
          background-color: #6b7280;
        }

        /* Media Queries para Responsiveness */
        @media (max-width: 768px) {
          .stock-controls {
            flex-direction: column;
            align-items: stretch;
          }
          .search-input {
            max-width: 100%;
          }
          .form-group-row.two-columns {
            flex-direction: column;
          }
          .vet-table th,
          .vet-table td {
            padding: 10px;
          }
          .vet-table th:nth-child(4),
          .vet-table td:nth-child(4) {
            display: none; /* Ocultar Correo en móvil para ahorrar espacio */
          }
          .actions-cell {
            min-width: 120px;
          }
        }
      `}</style>
    </AdminLayout>
  );
};

export default RegisterUserPage;
