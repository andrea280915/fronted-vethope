import React, { createContext, useContext } from 'react';
import axios from 'axios';

// ✅ URL base del backend (ajústala a tu entorno local o servidor)
const API_BASE_URL = "http://localhost:8080/api"; 

// Crear el contexto
const ApiContext = createContext();

// Hook personalizado para acceder fácilmente al contexto
export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {

  /* ===========================
     🐾  PRODUCTOS (CRUD)
  ============================ */
  const getProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/productos`);
      return res.data;
    } catch (err) {
      console.error("Error al obtener productos:", err);
      throw new Error("No se pudo cargar la lista de productos.");
    }
  };

  const createProduct = async (data) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/productos`, data);
      return res.data;
    } catch (err) {
      console.error("Error al crear producto:", err);
      throw new Error("No se pudo registrar el producto.");
    }
  };

  const updateProduct = async (id, data) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/productos/${id}`, data);
      return res.data;
    } catch (err) {
      console.error("Error al actualizar producto:", err);
      throw new Error("No se pudo actualizar el producto.");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/productos/${id}`);
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      throw new Error("No se pudo eliminar el producto.");
    }
  };


  /* ===========================
     🧍 CLIENTES
  ============================ */
  const getClients = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/clientes`);
      return res.data;
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      throw new Error("No se pudo obtener la lista de clientes.");
    }
  };

  const searchClients = async (query) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/clientes/buscar`, {
        params: { q: query }
      });
      return res.data;
    } catch (err) {
      console.error("Error al buscar clientes:", err);
      throw new Error("Error al realizar la búsqueda de clientes.");
    }
  };


  /* ===========================
     💰  VENTAS
  ============================ */
  const createSale = async (saleData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/ventas`, saleData);
      return res.data;
    } catch (err) {
      console.error("Error al registrar venta:", err);
      throw new Error("No se pudo registrar la venta.");
    }
  };


  /* ===========================
     🏷️  EXPORTACIÓN DE MÉTODOS
  ============================ */
  const value = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getClients,
    searchClients,
    createSale
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};
