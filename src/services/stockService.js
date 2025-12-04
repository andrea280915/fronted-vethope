import axios from "axios";
const API_STOCK_URL = "https://backend-vethope-production.up.railway.app/api/v1/productos";

// Función para obtener el token almacenado
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getAllStock = async () => {
  try {
    const response = await fetch(API_STOCK_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Error al obtener lista de stock");

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getStockById = async (id) => {
  try {
    const response = await fetch(`${API_STOCK_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Error al obtener producto");

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createStock = async (data) => {
  try {
    const response = await fetch(API_STOCK_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Error al registrar producto");

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateStock = async (id, data) => {
  try {
    const response = await fetch(`${API_STOCK_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Error al actualizar producto");

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteStock = async (id) => {
  try {
    const response = await fetch(`${API_STOCK_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Error al eliminar producto");

    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
