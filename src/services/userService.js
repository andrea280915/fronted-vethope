import axios from "axios";

const API_USER_URL = "https://backend-vethope-production.up.railway.app/api/v1/usuarios";
const API_AUTH_URL = "https://backend-vethope-production.up.railway.app/api/auth";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ CRUD DE USUARIOS (solo ADMIN)
export const userList = {
  // Listar todos los usuarios
  getAll: async () => {
    const res = await axios.get(API_USER_URL, { headers: getAuthHeader() });
    return res.data;
  },

  // Editar usuario
  update: async (id_usuario, userData) => {
    const res = await axios.put(`${API_USER_URL}/${id_usuario}`, userData, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Eliminar usuario
  remove: async (id_usuario) => {
    const res = await axios.delete(`${API_USER_URL}/${id_usuario}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
};

// ✅ REGISTRO DE NUEVOS USUARIOS (usado desde el modal)
export const userService = {
  register: async (userData) => {
    const res = await axios.post(`${API_AUTH_URL}/register`, userData, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
};