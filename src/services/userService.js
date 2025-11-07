// src/service/userService.js
import axios from 'axios';

const API_URL = 'https://backend-vethope-production.up.railway.app/api/auth'; // Ajusta a tu ruta real del backend

// Si usas token JWT
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userService = {
  // Obtener todos los usuarios
  getAll: async () => {
    const res = await axios.get(`${API_URL}/listar`, { headers: getAuthHeader() });
    return res.data;
  },

  // Registrar un nuevo usuario
  create: async (userData) => {
    const res = await axios.post(`${API_URL}/register`, userData, { headers: getAuthHeader() });
    return res.data;
  },

  // Actualizar usuario
  update: async (userData) => {
    const res = await axios.put(`${API_URL}/editar/${userData.id}`, userData, { headers: getAuthHeader() });
    return res.data;
  },

  // Eliminar usuario
  remove: async (id) => {
    const res = await axios.delete(`${API_URL}/eliminar/${id}`, { headers: getAuthHeader() });
    return res.data;
  },
};
