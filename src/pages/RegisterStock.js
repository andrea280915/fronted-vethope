import React, { useState, useEffect } from 'react';
import { createStock, updateStock, getStockById } from '../services/stockService';
import './StockPage.css';
import { useParams, useNavigate } from 'react-router-dom';

const RegisterStock = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    cantidad: '',
    fechaIngreso: '',
  });

  useEffect(() => {
    if (id) {
      getStockById(id)
        .then(stock => {
          setFormData({
            nombre: stock.nombre || '',
            categoria: stock.categoria || '',
            cantidad: stock.cantidad || '',
            fechaIngreso: stock.fechaIngreso ? stock.fechaIngreso.split("T")[0] : '',
          });
        })
        .catch(error => console.error('Error al cargar el stock:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (id) {
        await updateStock(id, formData);
        alert('Stock actualizado correctamente');
      } else {
        await createStock(formData);
        alert('Stock registrado correctamente');
      }

      navigate('/stock');

    } catch (error) {
      console.error(error);
      alert('Error al guardar los datos');
    }
  };

  return (
    <div className="register-container">
      <h2>{id ? 'Editar Stock' : 'Registrar Stock'}</h2>

      <form onSubmit={handleSubmit}>
        
        <label>Nombre</label>
        <input
          type="text"
          name="nombre"
          placeholder="Ingrese nombre"
          value={formData.nombre}
          onChange={handleChange}
        />

        <label>Categoría</label>
        <input
          type="text"
          name="categoria"
          placeholder="Ingrese categoría"
          value={formData.categoria}
          onChange={handleChange}
        />

        <label>Cantidad</label>
        <input
          type="number"
          name="cantidad"
          placeholder="Ingrese cantidad"
          value={formData.cantidad}
          onChange={handleChange}
        />

        <label>Fecha de Ingreso</label>
        <input
          type="date"
          name="fechaIngreso"
          value={formData.fechaIngreso}
          onChange={handleChange}
        />

        <button type="submit" className="btn-guardar">
          {id ? 'Actualizar' : 'Registrar'}
        </button>
      </form>
    </div>
  );
};

export default RegisterStock;
