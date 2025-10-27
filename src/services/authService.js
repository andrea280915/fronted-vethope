// src/services/authService.js
import api from './api';

export const loginService = async (username, password) => {
  try {
    const response = await api.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    // Manejo de errores
    if (error.response) {
      throw new Error(error.response.data.message || 'Error en el inicio de sesión');
    } else {
      throw new Error('Error de conexión con el servidor');
    }
  }
};

