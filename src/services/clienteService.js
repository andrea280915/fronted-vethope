import axios from "axios";

const API_CLIENT_URL = "https://backend-vethope-production.up.railway.app/api/v1/clientes";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ CRUD DE CLIENTES usando id_cliente
export const clientService = {
  // Listar todos los clientes
  getAll: async () => {
    const res = await axios.get(API_CLIENT_URL, { 
      headers: getAuthHeader() 
    });
    return res.data;
  },

  // Buscar cliente por ID (id_cliente)
  getById: async (id_cliente) => {
    if (!id_cliente) throw new Error('ID de cliente no válido');

    const res = await axios.get(`${API_CLIENT_URL}/${id_cliente}`, {
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
  update: async (id_cliente, clientData) => {
    if (!id_cliente) throw new Error('ID de cliente no válido');

    const res = await axios.put(`${API_CLIENT_URL}/${id_cliente}`, clientData, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Eliminar un cliente
  remove: async (id_cliente) => {
    if (!id_cliente) throw new Error('ID de cliente no válido');

    const res = await axios.delete(`${API_CLIENT_URL}/${id_cliente}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
};

export default clientService;
