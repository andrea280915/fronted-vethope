import axios from "axios";

const API_CLIENT_URL = "https://backend-vethope-production.up.railway.app/api/v1/clientes";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ CRUD DE CLIENTES
export const clientService = {
  // Listar todos los clientes
  getAll: async () => {
    const res = await axios.get(API_CLIENT_URL, { 
      headers: getAuthHeader() 
    });
    return res.data;
  },

  // Buscar cliente por DNI
  getByDni: async (dni) => {
    const res = await axios.get(`${API_CLIENT_URL}/${dni}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Crear un nuevo cliente
  create: async (clientData) => {
    const res = await axios.post(API_CLIENT_URL, clientData, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Actualizar un cliente existente
  update: async (id, clientData) => {
    // Validar que el ID existe
    if (!id || id === undefined || id === null) {
      throw new Error('ID de cliente no válido');
    }
    
    const res = await axios.put(`${API_CLIENT_URL}/${id}`, clientData, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Eliminar un cliente
  remove: async (id) => {
    // Validar que el ID existe
    if (!id || id === undefined || id === null) {
      throw new Error('ID de cliente no válido');
    }
    
    const res = await axios.delete(`${API_CLIENT_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
};

export default clientService;
