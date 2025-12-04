import axios from "axios";

const API_MASCOTA_URL = "https://backend-vethope-production.up.railway.app/api/v1/mascotas";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ CRUD DE MASCOTAS
export const mascotaService = {
  // Listar todas las mascotas
  getAll: async () => {
    const res = await axios.get(API_MASCOTA_URL, { 
      headers: getAuthHeader() 
    });
    return res.data;
  },

  // Buscar mascota por ID
  getById: async (id_mascota) => {
    const res = await axios.get(`${API_MASCOTA_URL}/${id_mascota}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Listar mascotas por cliente
  getByCliente: async (id_cliente) => {
    const res = await axios.get(`${API_MASCOTA_URL}/cliente/${id_cliente}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Crear una nueva mascota
  create: async (mascotaData) => {
    const res = await axios.post(API_MASCOTA_URL, mascotaData, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Actualizar una mascota existente
  update: async (id_mascota, mascotaData) => {
    // Validar que el ID existe
    if (!id_mascota || id_mascota === undefined || id_mascota === null) {
      throw new Error('ID de mascota no válido');
    }
    
    const res = await axios.put(`${API_MASCOTA_URL}/${id_mascota}`, mascotaData, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Eliminar una mascota
  remove: async (id_mascota) => {
    // Validar que el ID existe
    if (!id_mascota || id_mascota === undefined || id_mascota === null) {
      throw new Error('ID de mascota no válido');
    }
    
    const res = await axios.delete(`${API_MASCOTA_URL}/${id_mascota}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
};

export default mascotaService;
