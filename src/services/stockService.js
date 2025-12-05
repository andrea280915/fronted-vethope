import axios from 'axios';

const API_URL = "https://backend-vethope-production.up.railway.app/api/v1/productos";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const stockService = {
  getAllStock: async () => {
    try {
      const res = await axios.get(API_URL, { headers: getAuthHeader() });
      return res.data;
    } catch (err) {
      console.error("Error en getAllStock:", err);
      throw new Error("Error al obtener lista de stock");
    }
  },

  getStockById: async (id_producto) => {
    try {
      const res = await axios.get(`${API_URL}/${id_producto}`, { headers: getAuthHeader() });
      return res.data;
    } catch (err) {
      console.error("Error en getStockById:", err);
      throw new Error("Error al obtener producto por ID");
    }
  },

  createStock: async (data) => {
    try {
      const res = await axios.post(API_URL, data, { headers: getAuthHeader() });
      return res.data;
    } catch (err) {
      console.error("Error en createStock:", err);
      throw new Error("Error al crear stock");
    }
  },

  updateStock: async (id_producto, data) => {
    try {
      const res = await axios.put(`${API_URL}/${id_producto}`, data, { headers: getAuthHeader() });
      return res.data;
    } catch (err) {
      console.error("Error en updateStock:", err);
      throw new Error("Error al actualizar stock");
    }
  },

  deleteStock: async (id_producto) => {
    try {
      const res = await axios.delete(`${API_URL}/${id_producto}`, { headers: getAuthHeader() });
      return res.data;
    } catch (err) {
      console.error("Error en deleteStock:", err);
      throw new Error("Error al eliminar stock");
    }
  }
};

export default stockService;
