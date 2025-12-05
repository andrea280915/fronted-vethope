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

    try {
      if (isEditing) {
        await userList.update(formData.id_usuario, payload);
        setUsers((prev) =>
          prev.map((u) =>
            u.id_usuario === formData.id_usuario ? { ...u, ...payload } : u
          )
        );
      } else {
        await userService.register(payload);
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
                <th className="hidden-column">ID</th>
                <th style={{ width: "220px" }}>Nombre Completo</th>
                <th style={{ width: "100px" }}>DNI</th>
                <th style={{ width: "250px" }}>Correo</th>
                <th style={{ width: "150px" }}>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id_usuario}>
                    <td className="hidden-column">{user.id_usuario}</td>
                    <td style={{ width: "220px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.nombre} {user.apellido}
                    </td>
                    <td style={{ width: "100px" }}>{user.dni}</td>
                    <td style={{ width: "250px", wordBreak: "break-word" }}>{user.correo}</td>
                    <td style={{ width: "150px" }}>{getRoleLabel(user.rol)}</td>
                    <td className="actions-cell">
                      <button className="btn-action edit" onClick={() => openEditModal(user)}>Editar</button>
                      <button className="btn-action delete" onClick={() => askForDelete(user.id_usuario)}>Eliminar</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: '20px' }}>
                    No hay usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREACIÓN/EDICIÓN */}
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

      {/* MODAL CONFIRMACIÓN ELIMINACIÓN */}
      <Modal
        isOpen={isConfirmModalOpen}
        title="Confirmar Eliminación"
        onClose={closeConfirmModal}
      >
        <div className="confirm-modal-content">
          <p>¿Estás seguro de que deseas eliminar a este usuario?</p>
          <p className="warning-text">
            Esta acción es irreversible y requiere la confirmación de un administrador.
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

      {/* CSS */}
      <style jsx>{`
        .hidden-column {
          display: none;
        }
        .vet-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          table-layout: fixed;
        }
        .vet-table th, .vet-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #f3f4f6;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .vet-table td.actions-cell {
          text-align: center;
        }
        /* Mantengo todos tus estilos anteriores tal cual */
      `}</style>
    </AdminLayout>
  );
};

export default RegisterUserPage;
