import axios from 'axios';

const API_URL = "https://backend-vethope-production.up.railway.app/api/v1/detalle-ventas";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : { 'Content-Type': 'application/json' };
};


const detalleVentaService = {
  getAll: async () => {
    try {
      const res = await axios.get(API_URL, { headers: getAuthHeader() });
      return res.data;
    } catch (err) {
      console.error("Error en getAll detalle-ventas:", err);
      return [];
    }
  },
  getById: async (id) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
      return res.data;
    } catch (err) {
      console.error("Error en getById detalle-venta:", err);
      return null;
    }
  },
  create: async (data) => {
    try {
      const res = await axios.post(API_URL, data, { headers: getAuthHeader() });
      return res.data;
    } catch (err) {
      console.error("Error creando detalle-venta:", err);
      return null;
    }
  },
  update: async (id, data) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, data, { headers: getAuthHeader() });
      return res.data;
    } catch (err) {
      console.error("Error actualizando detalle-venta:", err);
      return null;
    }
  },
  delete: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
      return true;
    } catch (err) {
      console.error("Error eliminando detalle-venta:", err);
      return false;
    }
  },
};

export default detalleVentaService;
