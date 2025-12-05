// src/pages/RegisterStock.js
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import './StockPage.css';
import stockService from '../services/stockService';

const RegisterStock = () => {
    const [stock, setStock] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [formData, setFormData] = useState({
        id: null,
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
    });

    // Cargar stock al iniciar la página
    useEffect(() => {
        cargarStock();
    }, []);

    const cargarStock = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const data = await stockService.getAllStock();
            setStock(Array.isArray(data) ? data : data.data ?? []);
        } catch (error) {
            console.error("Error cargando stock:", error);
            setErrorMsg("⚠ Error cargando productos. Verifica token o servidor.");
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------
    // MODAL
    // -----------------------------
    const openCreateModal = () => {
        setIsEditing(false);
        setFormData({ id: null, nombre: '', descripcion: '', precio: '', stock: '' });
        setIsModalOpen(true);
    };

    const openEditModal = async (item) => {
        setIsEditing(true);
        try {
            const data = await stockService.getStockById(item.id);
            setFormData({
                id: item.id,
                nombre: data.nombre,
                descripcion: data.descripcion,
                precio: data.precio,
                stock: data.stock
            });
            setIsModalOpen(true);
        } catch (err) {
            alert("Error cargando producto para editar.");
            console.error(err);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'precio' || name === 'stock' ? Number(value) : value
        }));
    };

    // -----------------------------
    // CRUD API
    // -----------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await stockService.updateStock(formData.id, formData);
            } else {
                await stockService.createStock(formData);
            }
            await cargarStock();
            closeModal();
        } catch (error) {
            alert("⚠ Error guardando cambios. Revisa consola.");
            console.error(error);
        }
    };

    const eliminarProducto = async (id) => {
        if (!window.confirm("¿Confirmas eliminar este producto?")) return;
        try {
            await stockService.deleteStock(id);
            await cargarStock();
        } catch (err) {
            alert("❌ No se pudo eliminar.");
            console.error(err);
        }
    };

    // -----------------------------
    // Modal Componente
    // -----------------------------
    const Modal = ({ isOpen, title, onClose, children }) => {
        if (!isOpen) return null;
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                    {children}
                </div>
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="page-header">
                <h1>REGISTRO DE <span>STOCK</span></h1>
                <p className="subtitle">Gestión de Productos y Medicamentos</p>
            </div>

            <div className="stock-controls">
                <input type="text" placeholder="Buscar producto..." className="search-input" />
                <button className="btn-add-stock" onClick={openCreateModal}>
                    + Agregar Nuevo Producto
                </button>
            </div>

            {loading && <p style={{textAlign:"center"}}>Cargando productos...</p>}
            {errorMsg && <p style={{color:"red", textAlign:"center"}}>{errorMsg}</p>}

            <div className="stock-table-container">
                <table className="vet-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th className="stock-count">Stock</th>
                            <th>Precio (S/)</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stock.length === 0 ? (
                            <tr><td colSpan="6" style={{textAlign:'center'}}>No hay productos registrados.</td></tr>
                        ) : stock.map(item => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.nombre}</td>
                                <td>{item.descripcion}</td>
                                <td className={`stock-count ${item.stock < 50 ? 'low-stock' : ''}`}>
                                    {item.stock}
                                </td>
                                <td>S/ {Number(item.precio).toFixed(2)}</td>
                                <td>
                                    <button className="btn-action edit" onClick={() => openEditModal(item)}>Editar</button>
                                    <button className="btn-action delete" onClick={() => eliminarProducto(item.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                title={isEditing ? "Editar Producto" : "Registrar Nuevo Producto"} 
                onClose={closeModal}
            >
                <form className="stock-form" onSubmit={handleSubmit}>
                    <label>Nombre:</label>
                    <input name="nombre" value={formData.nombre} onChange={handleChange} required />

                    <label>Descripción:</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} required />

                    <div className="form-row">
                        <div>
                            <label>Precio (S/):</label>
                            <input type="number" name="precio" value={formData.precio} onChange={handleChange} min="0" step="0.01" required />
                        </div>
                        <div>
                            <label>Stock:</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" required />
                        </div>
                    </div>

                    <button type="submit" className="btn-submit-modal">
                        {isEditing ? "Guardar Cambios" : "Registrar Producto"}
                    </button>
                </form>
            </Modal>
        </AdminLayout>
    );
};

export default RegisterStock;
