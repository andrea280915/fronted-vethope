import axios from "axios";

const API_CITA_URL = "https://backend-vethope-production.up.railway.app/api/v1/citas";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Exportación correcta SIN mezcla default + named export
const citaService = {
  getAll: async () => axios.get(API_CITA_URL, { headers: getAuthHeader() }).then(res => res.data),

  getById: async (id) => axios.get(`${API_CITA_URL}/${id}`, { headers: getAuthHeader() }).then(res => res.data),

  create: async (data) => axios.post(API_CITA_URL, data, { headers: getAuthHeader() }).then(res => res.data),

  update: async (id, data) => axios.put(`${API_CITA_URL}/${id}`, data, { headers: getAuthHeader() }).then(res => res.data),

  remove: async (id) => axios.delete(`${API_CITA_URL}/${id}`, { headers: getAuthHeader() }).then(res => res.data)
};

export default citaService;
